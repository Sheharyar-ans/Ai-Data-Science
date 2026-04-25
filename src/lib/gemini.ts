import { GoogleGenAI, Type } from "@google/genai";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";

const DatasetSummarySchema = z.object({
  shape: z.string().default(''),
  columns: z.array(z.string()).default([]),
  data_types: z.record(z.string(), z.string()).default({}),
  missing_values: z.record(z.string(), z.number()).default({}),
  preview: z.object({
    head: z.array(z.any()).default([]),
    tail: z.array(z.any()).default([]),
    sample: z.array(z.any()).default([]),
  }).default({ head: [], tail: [], sample: [] })
}).passthrough();

const PlanSchema = z.object({
  goal: z.string().default(''),
  plan: z.array(
    z.object({
      phase: z.string().default(''),
      objective: z.string().default(''),
      actions: z.array(z.string()).default([]),
    })
  ).default([]),
}).passthrough();

const modelName = "gemini-3-flash-preview"; // Use flash everywhere to avoid quota issues
const fastModelName = "gemini-3-flash-preview"; // Flash is fine for this

function getAiClient(keys?: any) {
  const apiKey = keys?.gemini || keys?.openai || keys?.claude || keys?.grok || keys?.deepseek || keys?.perplexity || (keys ? Object.values(keys).find(v => typeof v === 'string' && v.trim().length > 0) : null) as string | undefined;
  
  if (!apiKey) {
    throw new Error("No API key provided. Please configure it in the Settings dialog.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function analyzeDataset(sampleData: string, keys?: { gemini?: string }): Promise<any> {
  const ai = getAiClient(keys);
  const response = await ai.models.generateContent({
    model: fastModelName,
    contents: `Analyze this dataset sample and extract information. 
    Return strictly JSON. 
    IMPORTANT RULES:
    1. NEVER summarize silently. NEVER skip columns.
    2. Mandatory full preview: If dataset rows are less than 1000, show the FULL dataset in the preview section. Otherwise, show first 50 rows in 'head', last 50 rows in 'tail', and 20 random rows in 'sample'.
    3. Use the literal dataset data below in the preview section exactly as it appears. Include all columns.
    Dataset sample:
    ${sampleData}
    `,
    config: {
      maxOutputTokens: 2500,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          shape: { type: Type.STRING },
          columns: { type: Type.ARRAY, items: { type: Type.STRING } },
          data_types: { type: Type.OBJECT },
          missing_values: { type: Type.OBJECT },
          preview: {
            type: Type.OBJECT,
            properties: {
              head: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              tail: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              sample: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            }
          }
        },
      },
    },
  });
  let rawText = (response.text || "{}").trim() || "{}";
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    parsed = JSON.parse(jsonrepair(rawText));
  }
  return DatasetSummarySchema.parse(parsed);
}

export async function generatePlan(requirement: string, datasetSummary: any, keys?: { gemini?: string }): Promise<any> {
    const ai = getAiClient(keys);

    const safeSummary = { ...datasetSummary };
    delete safeSummary.sample_rows;
    
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `You are a highly experienced Senior Data Scientist and Data Analyst.
    Your role is to act as a mentor and guide.
    
    Requirement: ${requirement}
    Dataset Summary: ${JSON.stringify(safeSummary)}
    
    Workflow Instructions:
    1. Requirement Understanding
    - Carefully read and interpret the requirements.
    - Rewrite them in simple, clear terms in the 'goal'.
    
    2. Human-Like Project Breakdown
    - Act like a strict human data analyst.
    - If the user provides a numbered list of questions (e.g., Q1, Q2, 1., 2.), your plan MUST map exactly 1-to-1 to those questions.
    - Create exactly ONE phase per user question. Do NOT combine multiple questions into a single phase. 
    - Set the 'phase' name exactly to the question name or title (e.g., "Q1. Load the dataset", "Conclusion").
    - Briefly explain the purpose of each phase in the 'objective'.
    
    CRITICAL INSTRUCTIONS:
    - NOTHING EXTRA: Never add extra exploratory data analysis, generic "Environment Setup" phases, extra cleaning, or extra charts unless the user explicitly asks for them. If the user asks for 5 things, your plan must have exactly 5 phases.
    - KEEP IT CONCISE.
    - NEVER include actual dataset rows or raw data in your plan output. Write only the abstract steps.
    
    Ensure you capture EVERY detail from the user's requirement in granular steps.`,
    config: {
      maxOutputTokens: 2500,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goal: { type: Type.STRING },
          plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                objective: { type: Type.STRING },
                actions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
      },
    },
  });
  let rawText = (response.text || "{}").trim() || "{}";
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    parsed = JSON.parse(jsonrepair(rawText));
  }
  return PlanSchema.parse(parsed);
}

export async function executePlanStream(plan: any, datasetSummary: any, onChunk: (partialSteps: any[]) => void, keys?: { gemini?: string }) {
  const ai = getAiClient(keys);
  
  const response = await ai.models.generateContentStream({
    model: modelName,
    contents: `You are a highly experienced Senior Data Scientist and Data Analyst with deep expertise in Python, Pandas, NumPy, and real-world data workflows.
    Your role is to act as a mentor and guide.
    
    Plan: ${JSON.stringify(plan)}
    Dataset Summary: ${JSON.stringify(datasetSummary)}
    
    Workflow Instructions:
    3. Step-by-Step Code Guidance (Core Task)
    - STRICT EXECUTION MODE: You MUST follow instructions EXACTLY as given.
    - You are NOT allowed to add extra steps.
    - You are NOT allowed to generate extra charts or analysis.
    - You must NOT skip any step.
    - You must NOT summarize unless explicitly asked.
    - You must NOT assume anything beyond the requirement.
    - CRITICAL: For EVERY action or objective in the plan, generate EXACTLY 1 execution step. DO NOT STOP EARLY.
    - If the plan has 5 phases, you MUST generate exactly 5 execution steps.
    - NEVER combine multiple phases or questions into a single execution step. Treat each phase and question entirely separately.
    - DO NOT skip any questions. Generate the complete exhaustive sequence of steps.
    - CRITICAL: Set 'step' exactly to 'STEP X: [Step Title]', mapping to the specific Question name or Phase from the plan.
    - Set 'explanation' to a concise 1 line max explanation.
    - Then provide clean Python code in 'code'. Use Jupyter Notebook style (cell-by-cell flow), and ensure it is the exact code for this step only.
    
    4. Data Operations
    - CRITICAL: When providing pandas data loading code, YOU MUST strictly use the exact file name provided in the Dataset Summary: '${datasetSummary.fileName || 'dataset.csv'}'. Do not use placeholder names like 'data.csv'. Example: pd.read_csv('${datasetSummary.fileName || 'dataset.csv'}')
    
    5. Data Cleaning and Visualization
    - Provide exact code for missing values, duplicates, and plots ONLY IF EXPLICITLY IN THE PLAN.
    - DO NOT generate multiple approaches or suggestions. Write exactly the simplest solution.
    
    Strict Rules:
    - Include exactly ONE execution step for EACH phase in the plan. DO NOT combine multiple phases into a single execution step. If there are 15 phases, you must produce exactly 15 steps.
    - KEEP CODE BEGINNER-FRIENDLY. Write simple, standard Python code. 
    - You MUST ensure that ALL necessary libraries (pandas, matplotlib.pyplot, seaborn, etc.) and global display settings ('pd.set_option', etc.) are imported/configured in the VERY FIRST STEP. Do not re-import them in later steps.
    - NEVER add extra code like 'pd.read_csv()' in middle steps unless explicitly part of the question.
    - Give EXACTLY WHAT IS ASKED. If asked for shape, only give shape. If asked for head, only give head. To avoid AI feel, do not include code or explanations that the user didn't ask for.
    - IMPORTANT OUTPUT SIMULATION RULE: Your simulated output_text MUST look exactly like a real console output from Jupyter. DO NOT write descriptive English sentences like "Done." or "Checked for missing values". Only write the exact textual output python would throw to stdout.
    - NEVER use 'print(df)' on a large dataframe. 
    - Provide SIMULATED OUTPUT for what this code would loosely produce to help the user visualize.
    - CRITICAL OUTPUT INSTRUCTIONS (MUST OBEY TO PREVENT JSON CRASHES):
      * If output is a diagram/chart, set 'output_type' (e.g., 'bar_chart', 'histogram', 'line_chart', 'scatter_chart') and provide 'output_data' as a JSON string array of exactly 3-5 data points. ALWAYS INCLUDE EXACTLY TWO CONSISTENT KEYS for plotting (e.g. '[{"name":"A", "value":10}]').
      * If output is a dataframe/table (like df.head()), set 'output_type' to 'table' and provide 'output_data' as JSON rows. IMPORTANT: YOU MUST USE THE REAL DATA FROM \`Dataset Summary -> preview\` (use available sample).
      * WARNING: 'output_data' MUST BE VERY SMALL! MAXIMUM 3 ROWS OR ITEMS. DO NOT ADD LARGE ARRAYS. This is the main reason outputs get truncated. KEEP IT extremely minimal! DO NOT MAKE UP FAKE/MOCK DATA!
      * If output is just console text, set 'output_type' to 'console' and provide 'output_text'.
    `,
    config: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING },
            explanation: { type: Type.STRING },
            code: { type: Type.STRING },
            output_type: { type: Type.STRING, description: "Must be one of: console, table, bar_chart, line_chart, scatter_chart, histogram, none" },
            output_text: { type: Type.STRING, description: "Text output if applicable, highly recommended for charts to show python simulated terminal output." },
            output_data: { type: Type.STRING, description: "Stringified JSON array of objects for table or chart rendering" }
          },
        },
      },
    },
  });

  let fullText = "";
  for await (const chunk of response) {
    if (chunk.text) {
      fullText += chunk.text;
      
      // Attempt partial JSON parse
      try {
        const parsed = JSON.parse(fullText);
        onChunk(parsed);
      } catch (e) {
        try {
          const repaired = jsonrepair(fullText);
          const parsed = JSON.parse(repaired);
          onChunk(parsed);
        } catch (e2) {
          // If it still fails, just skip updating the UI for this chunk
        }
      }
    }
  }
  let finalParsed;
  try {
    finalParsed = JSON.parse(fullText.trim() || '[]');
  } catch (err) {
    finalParsed = JSON.parse(jsonrepair(fullText.trim() || '[]'));
  }
  return finalParsed;
}

export async function generateNotebook(executionSteps: any[], keys?: { gemini?: string }): Promise<any> {
  const cells = [];
  
  cells.push({
    cell_type: "markdown",
    metadata: { id: "intro_md" },
    source: [
       "# Automated Data Pipeline\n",
       "> This notebook was automatically generated.\n",
       "Run the cells below sequentially to execute the data pipeline."
    ]
  });

  executionSteps.forEach((step, index) => {
    // Markdown cell
    cells.push({
      cell_type: "markdown",
      metadata: { id: `md_${index}` },
      source: [
        `### ${step.step}\n`,
        `${step.explanation}`
      ]
    });
    
    // Code cell
    cells.push({
      cell_type: "code",
      execution_count: null,
      metadata: { id: `code_${index}` },
      outputs: [],
      source: (step.code || "").split('\n').map((line: string, i: number, arr: any[]) => line + (i === arr.length - 1 ? "" : "\n"))
    });
  });

  return {
    nbformat: 4,
    nbformat_minor: 0,
    metadata: {
      colab: {
        provenance: []
      },
      kernelspec: {
        name: "python3",
        display_name: "Python 3"
      },
      language_info: {
        name: "python"
      }
    },
    cells: cells
  };
}

export async function generateDashboard(executionSteps: any[], datasetSummary: any, keys?: { gemini?: string }): Promise<any> {
    const ai = getAiClient(keys);
    
  const safeSteps = executionSteps.map(step => ({
    step: step.step,
    explanation: step.explanation,
    code: step.code,
  }));
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `You are a Python Dashboard Generator AI.
    Dataset Summary: ${JSON.stringify(datasetSummary)}
    Execution Details: ${JSON.stringify(safeSteps)}
    
    Generate a Streamlit dashboard with 3 variants (Basic, Analytics, Executive) as tabs or separate sections in ONE full python script.
    Ensure code is clean Streamlit code.`,
    config: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          streamlit_code: { type: Type.STRING },
        }
      }
    },
  });
  return JSON.parse((response.text || "{}").trim() || "{}").streamlit_code;
}

export async function generateInsights(datasetSummary: any, plan: any, keys?: { gemini?: string }): Promise<string> {
    const ai = getAiClient(keys);
    
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `You are a Data Insights AI.
    Dataset: ${JSON.stringify(datasetSummary)}
    Plan: ${JSON.stringify(plan)}
    
    Generate key insights, trends, patterns, anomalies, and business suggestions. 
    Format as nice markdown. No code.`,
  });
  return response.text || "";
}

export async function handleSelfHealing(code: string, errorMessage: string, keys?: { gemini?: string }): Promise<string> {
    const ai = getAiClient(keys);
   const response = await ai.models.generateContent({
    model: modelName,
    contents: `You are an AI Debugging Assistant.
    Code:
    ${code}
    
    Error:
    ${errorMessage}
    
    Fix the code and return only the corrected python code block. Do not explain.`,
  });
  return (response.text || "").replace(/\`\`\`(python)?/g, '').trim();
}
