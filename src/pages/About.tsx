import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left font-mono">
      <Helmet>
        <title>About Data Engine | The AI Data Science Platform</title>
        <meta name="description" content="Learn about Data Engine, the leading automated AI data science platform that builds pipelines, dashboards, and notebook exports without coding." />
        <meta name="keywords" content="Data Science, AI Data Pipeline, Streamlit Generation, Python Execution, Automated Machine Learning, AutoML, Data Analytics" />
      </Helmet>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground mb-8 border-l-4 border-primary pl-4">About Data Engine</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Introduction to the Next Generation of Data Workflow</h2>
          <p className="mb-4">
            In an era where data is scaling faster than our capacity to analyze it, the Data Engine was created to solve a fundamental bottleneck: the distance between raw data and executable insight. We envisioned a system where a user could upload a dataset, write a simple goal, and immediately receive Python code, a Jupyter Notebook, and a deployed Streamlit dashboard.
          </p>
          <p className="mb-4">
            Our platform leverages state-of-the-art Large Language Models (LLMs) including Google Gemini, OpenAI, and Anthropic Claude, all routed through a secure, multiplexed API architecture. This removes the reliance on a single vendor and ensures the most capable model is always selected for the task at hand. By combining deterministic Python execution sandboxing with probabilistic AI generation, Data Engine acts as a tireless, senior data scientist that works automatically.
          </p>
          <p className="mb-4">
            Whether you are a startup needing quick insights from your early customer data or a large enterprise looking to automate tedious exploratory data analysis (EDA), Data Engine scales with you. It understands missing values, outliers, data types, and complex schemas out-of-the-box. There is no longer a need to spend hours configuring seaborn plots or writing boilerplate pandas operations; it is all handled seamlessly in the background.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Our Core Philosophy</h2>
          <p className="mb-4">
            Our guiding philosophy is "Executable First". Too many AI tools generate snippets of code that the user must then manually stitch together, debug, and configure. Data Engine is fundamentally different. Our generated pipelines are designed to run immediately. When the system outputs a Streamlit application, it is guaranteed to execute without syntax errors. We achieve this through rigorous self-healing loops and automated syntax validation.
          </p>
          <p className="mb-4">
            We believe that accessibility should not compromise power. The intuitive UI is built for business users, but the output artifacts—clean Python scripts and .ipynb files—are built for engineers. Everything generated is instantly exportable. We do not lock your logic inside our platform. Once the Engine provides the solution, you own the code.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">System Architecture</h2>
          <p className="mb-4">
            The underlying architecture is built on a distributed microservice pattern. The core UI is an edge-deployed React application optimized for rapid interaction and latency reduction. When a dataset is uploaded, the frontend securely extracts a statistical sub-sample to protect your privacy; only this metadata layer is sent to the LLMs. Your raw, 1-million row CSV never leaves your secure storage boundary without your explicit intent.
          </p>
          <p className="mb-4">
            Once the plan is synthesized, it flows through our Execution Engine. This engine sandboxes the code, runs trial imports, verifies data transformations, and catches exceptions. If an error is caught—for example, a type mismatch in pandas—the engine feeds the traceback directly back into the AI for a "self-healing" iteration. This loop repeats until the script executes successfully, ensuring high reliability for end-users.
          </p>
          <p className="mb-4">
            Finally, the dashboard compilation phase transforms the linear data scripts into fully interactive Streamlit applications. The code is structured using standard Python best practices: modular functions, strict typing annotations where applicable, and robust error handling. 
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Commitment to Security</h2>
          <p className="mb-4">
            Data security is our paramount concern. We utilize Firebase's rigorous Firestore security rules, ensuring zero-trust database access where users can only perform localized CRUD operations on their own data. Authenticaton goes through Google's hardened OAuth providers. We do not store your API keys in plaintext; they are securely locked within the database and only decrypted ephemerally for action execution.
          </p>
          <p className="mb-4">
            Our platform operates with SOC2 compliance mindsets, focusing on isolation of workloads, data anonymization in the AI transmission layer, and detailed audit logging of every pipeline generation cycle.
          </p>
          <p className="mb-4">
            With over thousands of hours dedicated to optimizing prompts, refining context windows, and building fail-safes, Data Engine stands as the most advanced, automated data science platform commercially available. Join the revolution in automated intelligence and accelerate your data discovery today.
          </p>
        </section>
      </div>
    </div>
  );
}
