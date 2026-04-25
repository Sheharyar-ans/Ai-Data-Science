// Ensure Recharts dependencies are loaded and other components
import { useState, useEffect } from 'react';
import { 
  analyzeDataset, 
  generatePlan, 
  executePlanStream, 
  generateNotebook, 
  generateDashboard, 
  generateInsights 
} from '../lib/gemini';
import { extractDatasetSample, previewDataset } from '../lib/dataset';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress, ProgressIndicator, ProgressTrack, ProgressValue } from '../components/ui/progress';
import { Bot, CheckCircle2, Loader2, Play, Download, Terminal, BarChart2, Settings, UserCircle, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';
// Recharts for simulated outputs
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, CartesianGrid } from 'recharts';

type PipelineStatus = 'idle' | 'analyzing' | 'planning' | 'coding' | 'notebooking' | 'dashboarding' | 'insighting' | 'completed' | 'error';

const SimulatedOutput = ({ step }: { step: any }) => {
  if (!step.output_type || step.output_type === 'none') {
    return null;
  }

  let data = [];
  try {
    if (step.output_data) data = JSON.parse(step.output_data);
  } catch (e) {
    // If parsing fails, treat as text
  }

  const getKeys = (d: any[]) => {
     if (!d || d.length === 0) return { x: 'name', y: 'value' };
     const keysList = Object.keys(d[0]).filter(k => k !== 'name' && k !== 'value' && k !== 'x' && k !== 'y');
     if (d[0].name !== undefined) return { x: 'name', y: d[0].value !== undefined ? 'value' : keysList[0] };
     if (d[0].x !== undefined) return { x: 'x', y: d[0].y !== undefined ? 'y' : keysList[0] };
     if (keysList.length >= 2) return { x: keysList[0], y: keysList[1] };
     if (keysList.length === 1) return { x: keysList[0], y: keysList[0] };
     return { x: 'name', y: 'value' };
  };
  const keys = getKeys(data);

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-sm p-4 text-xs font-mono text-black shadow-sm overflow-hidden">
      {step.output_text && step.output_text.trim() !== '' && (
        <pre className="text-gray-800 whitespace-pre-wrap mb-4 font-mono text-[11px] opacity-70">
          {step.output_text}
        </pre>
      )}
      
      {(!step.output_type || step.output_type === 'console') && !step.output_text && step.output_data && typeof step.output_data === 'string' && !Array.isArray(data) && (
        <pre className="text-gray-800 whitespace-pre-wrap">{step.output_data}</pre>
      )}
      
      {step.output_type === 'table' && Array.isArray(data) && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                {Object.keys(data[0]).map((k) => (
                  <th key={k} className="p-2 font-bold text-gray-700">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  {Object.values(row).map((val: any, j: number) => (
                    <td key={j} className="p-2 text-gray-800">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {['bar_chart', 'bar', 'histogram'].includes(step.output_type) && Array.isArray(data) && data.length > 0 && (
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={step.output_type === 'histogram' ? 0 : '10%'}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey={keys.x} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#000', borderRadius: '4px', fontSize: '12px'}} itemStyle={{color: '#000'}} cursor={{fill: '#f3f4f6'}}/>
              <Bar dataKey={keys.y} fill="#3b82f6" stroke={step.output_type === 'histogram' ? '#2563eb' : 'none'} strokeWidth={1} radius={step.output_type === 'histogram' ? 0 : [4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {['line_chart', 'line'].includes(step.output_type) && Array.isArray(data) && data.length > 0 && (
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey={keys.x} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#000', borderRadius: '4px', fontSize: '12px'}} itemStyle={{color: '#000'}}/>
              <Line type="monotone" dataKey={keys.y} stroke="#3b82f6" strokeWidth={2} dot={{r: 3, fill: '#3b82f6'}} activeDot={{r: 5}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {['scatter_chart', 'scatter'].includes(step.output_type) && Array.isArray(data) && data.length > 0 && (
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={keys.x} type="number" name={keys.x} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey={keys.y} type="number" name={keys.y} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#000', borderRadius: '4px', fontSize: '12px'}} itemStyle={{color: '#000'}}/>
              <Scatter name="Data" data={data} fill="#3b82f6" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const SettingsDialog = ({
  profileName,
  setProfileName,
  preferredProvider,
  setPreferredProvider,
  apiKeys,
  setApiKeys,
  saveApiKeys
}: any) => (
  <Dialog>
    <DialogTrigger className="border border-input bg-background hover:bg-accent hover:text-accent-foreground hidden md:flex uppercase tracking-widest text-[10px] font-bold h-8 px-3 rounded-md items-center justify-center">
      <Settings className="w-3 h-3 mr-2"/> Settings
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-sm">
      <DialogHeader>
        <DialogTitle className="uppercase tracking-widest text-sm font-black border-b border-border pb-4">
          Workspace Configuration
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex items-center"><UserCircle className="w-4 h-4 mr-2"/> Profile</h4>
          <div>
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Display Name</Label>
            <Input value={profileName} onChange={e => setProfileName(e.target.value)} className="mt-1 font-mono text-sm border-border rounded-sm bg-background" />
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold border-t border-border pt-4 flex items-center"><Terminal className="w-4 h-4 mr-2"/> LLM Engine setup</h4>
           <div>
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Active Engine</Label>
              <Select value={preferredProvider} onValueChange={setPreferredProvider}>
                <SelectTrigger className="mt-1 font-mono text-xs border-border bg-background">
                  <SelectValue placeholder="Select Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                  <SelectItem value="claude">Anthropic Claude</SelectItem>
                  <SelectItem value="grok">Grok</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="pt-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                {preferredProvider.charAt(0).toUpperCase() + preferredProvider.slice(1)} API Key
              </Label>
              <Input 
                type="password" 
                value={apiKeys[preferredProvider as keyof typeof apiKeys] || ''} 
                onChange={e => setApiKeys({...apiKeys, [preferredProvider]: e.target.value})} 
                placeholder={`Enter your ${preferredProvider} key to proceed`}
                className="mt-1 font-mono text-sm border-border rounded-sm bg-background block" 
              />
              <p className="text-[9px] text-muted-foreground font-mono mt-1">API Key is mandatory for execution.</p>
           </div>
        </div>
        <Button onClick={saveApiKeys} className="w-full rounded-sm font-bold uppercase tracking-widest text-xs bg-primary text-black hover:bg-primary/90 mt-4">
          Save Preferences
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [requirement, setRequirement] = useState('');
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorDetails, setErrorDetails] = useState<{title: string, message: string, solutions: string[], links?: {url: string, label: string}[]} | null>(null);

  // Setup phases
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState({ gemini: '', openai: '', claude: '', grok: '', deepseek: '', perplexity: '' });
  const [preferredProvider, setPreferredProvider] = useState('gemini');
  const [profileName, setProfileName] = useState('User');
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  // Artifacts
  const [datasetSummary, setDatasetSummary] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [executionSteps, setExecutionSteps] = useState<any[]>([]);
  const [notebook, setNotebook] = useState<any>(null);
  const [dashboardCode, setDashboardCode] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  
  const [filePreview, setFilePreview] = useState<{
    previewRows: any[];
    columns: { name: string; type: string; missing: number }[];
    totalRows: number;
  } | null>(null);
  const [isExpandedPreview, setIsExpandedPreview] = useState(false);

  // Notebook execution states
  const [executedCells, setExecutedCells] = useState<number[]>([]);
  const [executingCell, setExecutingCell] = useState<number | null>(null);

  const handleRunCell = (index: number) => {
    if (executingCell !== null) return;
    setExecutingCell(index);
    setTimeout(() => {
      setExecutedCells(prev => [...prev, index]);
      setExecutingCell(null);
    }, 1000 + Math.random() * 1500); 
  };

  const handleRunAll = async () => {
    if (executingCell !== null) return;
    for (let i = 0; i < executionSteps.length; i++) {
        setExecutingCell(i);
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        setExecutedCells(prev => {
          if (!prev.includes(i)) return [...prev, i];
          return prev;
        });
    }
    setExecutingCell(null);
  };

  useEffect(() => {
    const fetchApiKeysAndProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'apiKeys', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setApiKeys({ 
            gemini: data.gemini || '', 
            openai: data.openai || '', 
            claude: data.claude || '',
            grok: data.grok || '',
            deepseek: data.deepseek || '',
            perplexity: data.perplexity || ''
          });
          setPreferredProvider(data.preferredProvider || 'gemini');
          setProfileName(data.profileName || 'User');
          if (data.gemini || data.openai || data.claude || data.grok || data.deepseek || data.perplexity) {
            setHasApiKey(true);
          }
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
      setIsLoadingKeys(false);
    };
    fetchApiKeysAndProfile();
  }, [user]);

  const saveApiKeys = async () => {
    if(!user) return;
    try {
      await setDoc(doc(db, 'apiKeys', user.uid), {
        userId: user.uid,
        ...apiKeys,
        preferredProvider,
        profileName,
        updatedAt: Date.now()
      }, { merge: true });
      const values = Object.values(apiKeys);
      setHasApiKey(values.some(v => v.trim().length > 0));
    } catch(err) {
      handleFirestoreError(err, OperationType.WRITE, `apiKeys/${user.uid}`);
    }
  };

  const logExecution = async (stepName: string, statusInfo: string, msg: string) => {
    if(!user) return;
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        projectId: 'adhoc-project',
        step: stepName,
        message: msg,
        status: statusInfo,
        timestamp: Date.now()
      });
    } catch(err) {
      console.warn("Logging failed:", err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const targetFile = e.target.files[0];
      setFile(targetFile);
      try {
        const preview = await previewDataset(targetFile);
        setFilePreview(preview);
      } catch (err) {
        console.error("Failed to preview dataset", err);
      }
    }
  };

  const handleAiError = (engine: string, err: any) => {
    logExecution(engine.toLowerCase().replace(/\s+/g, '_'), 'fail', err.message);
    const msg = err.message || 'Unknown error occurred.';
    
    const details = {
      title: `${engine} Failure`,
      message: msg,
      solutions: [] as string[],
      links: [] as {url: string, label: string}[]
    };

    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('RATE_LIMIT')) {
      details.message = 'AI Rate Limit Exceeded (429) or Quota Reached.';
      details.solutions.push('Wait 1-2 minutes for the rate limit to reset before trying again.');
      details.solutions.push('Configure your own API Key in Settings to bypass shared platform quotas.');
      details.links.push({ label: 'Get a Gemini API Key', url: 'https://aistudio.google.com/app/apikey' });
    } else if (msg.includes('API_KEY_INVALID') || msg.includes('400') || msg.includes('API key') || msg.includes('invalid') || msg.includes('401') || msg.includes('Permission')) {
      details.message = 'Invalid API Key provided.';
      details.solutions.push('Please ensure you have entered a valid Google Gemini API Key.');
      details.solutions.push('Double-check for any typos or extra spaces in your configuration.');
      details.links.push({ label: 'Get a free Gemini API Key', url: 'https://aistudio.google.com/app/apikey' });
    } else if (msg.includes('JSON') || msg.includes('parse') || msg.includes('syntax')) {
      details.solutions.push('The AI returned malformed output. Try making your requirements more explicit.');
      details.solutions.push('Refresh the page and try again (a retry usually fixes hallucinations).');
    } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
      details.solutions.push('Check your internet connection.');
      details.solutions.push('Ensure no browser extensions or adblockers are blocking the API request.');
    } else {
       details.solutions.push('Try simplifying your prompt/requirement.');
       details.solutions.push('If the issue persists, the AI model may be temporarily unavailable.');
    }

    const error = new Error(msg);
    (error as any).details = details;
    throw error;
  };

  const runPipeline = async () => {
    if (!file || !requirement) return;
    
    // API KEY VALIDATION
    if (!apiKeys[preferredProvider as keyof typeof apiKeys]) {
      setErrorDetails({
        title: 'Authentication Required',
        message: `Please enter your ${preferredProvider} API key in Settings to proceed.`,
        solutions: ['Click the Settings gear icon in the top right to configure your API keys.'],
        links: []
      });
      return;
    }

    setErrorDetails(null);
    logExecution('pipeline_start', 'success', 'Pipeline initialization triggered');
    
    try {
      setStatus('analyzing');
      setProgress(10);
      const sample = await extractDatasetSample(file, 50);
      let summary;
      try {
        summary = await analyzeDataset(sample, apiKeys);
        
        // Force the summary to use the exact parsed sample rows so the LLM doesn't truncate columns
        try {
          const parsedSample = JSON.parse(sample);
          summary.preview = summary.preview || { head: [], tail: [], sample: [] };
          if (parsedSample.length < 1000) {
            summary.preview.head = parsedSample;
            summary.preview.tail = [];
            summary.preview.sample = [];
          } else {
            summary.preview.head = parsedSample.slice(0, 50);
            summary.preview.tail = parsedSample.slice(-50);
            summary.preview.sample = parsedSample.slice(50, 70); // Just a slice for 'sample' simulation
          }
          summary.shape = `${parsedSample.length} rows × ${Object.keys(parsedSample[0] || {}).length} columns`;
        } catch(e) {
          console.error("Failed to parse sample data for summary replacement");
        }
        
        summary.fileName = file.name;
        logExecution('analyzer', 'success', 'Dataset analysis completed successfully');
      } catch (err: any) {
        handleAiError('Data Extraction Engine', err);
      }
      setDatasetSummary(summary);
      setProgress(25);
      
      setStatus('planning');
      let generatedPlan;
      try {
        // Enforce exact requirements with updated strict prompt handling
        generatedPlan = await generatePlan(requirement, summary, apiKeys);
        logExecution('planner', 'success', 'AI Workflow plan generated successfully');
      } catch (err: any) {
        handleAiError('AI Planner Engine', err);
      }
      setPlan(generatedPlan);
      setProgress(40);
      
      setStatus('coding');
      let steps;
      try {
        steps = await executePlanStream(generatedPlan, summary, (partial) => {
          if (Array.isArray(partial) && partial.length > 0) {
            setExecutionSteps(partial);
          }
        }, apiKeys);
        logExecution('execution', 'success', 'Python execution code generation completed');
      } catch (err: any) {
        logExecution('execution', 'fail', err.message);
        console.warn("First execution attempt failed. Retrying with self-healing...", err);
        try {
            // Attempt smart retry
            logExecution('execution_retry', 'info', 'Attempting self-healing generation');
            steps = await executePlanStream(generatedPlan, summary, (partial) => {
              if (Array.isArray(partial) && partial.length > 0) {
                setExecutionSteps(partial);
              }
            }, apiKeys);
            logExecution('execution_retry', 'success', 'Python execution code generation completed on retry');
        } catch(retryErr: any) {
            handleAiError('Python Execution Engine', retryErr);
        }
      }
      setExecutionSteps(steps);
      setProgress(60);
      
      setStatus('notebooking');
      let nb;
      try {
        nb = await generateNotebook(steps, apiKeys);
        logExecution('notebook', 'success', 'Jupyter notebook converted');
      } catch (err: any) {
        handleAiError('Colab Notebook Generator', err);
      }
      setNotebook(nb);
      setProgress(80);
      
      setStatus('dashboarding');
      let dbCode;
      try {
        dbCode = await generateDashboard(steps, summary, apiKeys);
        logExecution('dashboard', 'success', 'Streamlit dashboard compiled');
      } catch (err: any) {
        handleAiError('Dashboard Generator', err);
      }
      setDashboardCode(dbCode);
      setProgress(90);

      setStatus('completed');
      logExecution('pipeline_complete', 'success', 'All AI engines processed fully');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      
      if (err.details) {
        setErrorDetails(err.details);
      } else {
        let msg = err.message || 'An unexpected fault occurred in the pipeline sequence.';
        const details = {
           title: 'Pipeline Error',
           message: msg,
           solutions: ['Refresh the page and try again.', 'Ensure your dataset is valid CSV/JSON.'],
           links: [] as {url: string, label: string}[]
        };

        if (msg.includes('429') || msg.includes('quota') || msg.includes('RATE_LIMIT')) {
           details.message = 'Rate Limit Exceeded (429) or Quota Reached.';
           details.solutions = [
              'Wait 1-2 minutes before trying again.',
              'Configure your own API Key in the Settings menu to bypass shared limits.'
           ];
           details.links = [{ label: 'Get a free Gemini API Key', url: 'https://aistudio.google.com/app/apikey' }];
        } else if (msg.includes('API_KEY_INVALID') || msg.includes('400') || msg.includes('API key') || msg.includes('invalid') || msg.includes('401') || msg.includes('Permission')) {
           details.message = 'Invalid API Key provided.';
           details.solutions = [
             'Please ensure you have entered a valid Google Gemini API Key.',
             'Double-check for any typos or extra spaces in your configuration.'
           ];
           details.links = [{ label: 'Get a free Gemini API Key', url: 'https://aistudio.google.com/app/apikey' }];
        }
        setErrorDetails(details);
      }
      logExecution('pipeline_error', 'fail', err.message);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPythonScript = () => {
    return executionSteps.map(s => `# ${s.step}\n# ${s.explanation}\n${s.code}`).join('\n\n');
  };

  if (isLoadingKeys) {
    return <div className="h-full w-full flex items-center justify-center text-primary uppercase text-xs tracking-widest font-mono"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Secure Connection...</div>;
  }

  if (status === 'idle') {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-start py-10 px-4 md:px-8 font-mono">
        <Helmet>
          <title>Dashboard Workspace | Data Engine</title>
        </Helmet>
        
        {errorDetails && (
          <div className="w-full max-w-4xl bg-destructive/5 text-foreground p-6 rounded-sm border-l-4 border-destructive mb-8">
            <h3 className="text-destructive font-bold uppercase tracking-widest mb-2 flex items-center">
              <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full inline-flex items-center justify-center mr-3 text-xs font-black">!</span>
              {errorDetails.title}
            </h3>
            <p className="text-sm font-mono opacity-90 mb-4 ml-8">{errorDetails.message}</p>
            {errorDetails.solutions.length > 0 && (
               <div className="ml-8 mb-4">
                 <p className="text-xs uppercase text-muted-foreground tracking-widest font-bold mb-2">Suggested Solutions:</p>
                 <ul className="list-disc list-inside text-xs font-mono space-y-1 opacity-80">
                   {errorDetails.solutions.map((sol, i) => <li key={i}>{sol}</li>)}
                 </ul>
               </div>
            )}
            {errorDetails.links && errorDetails.links.length > 0 && (
               <div className="ml-8 flex gap-4">
                 {errorDetails.links.map((link, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs rounded-sm uppercase tracking-widest" onClick={() => window.open(link.url, '_blank')}>
                      {link.label}
                    </Button>
                 ))}
               </div>
            )}
          </div>
        )}
        
        {/* Full header container avoiding absolute overlapping */}
        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-4">
             <Bot className="w-8 h-8 text-primary" />
             <div>
               <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-foreground">Initialize Project</h1>
               <p className="text-[10px] md:text-xs font-mono tracking-widest text-muted-foreground uppercase mt-2">Configure Data & Execution Objectives</p>
             </div>
          </div>
          <div>
            <SettingsDialog profileName={profileName} setProfileName={setProfileName} preferredProvider={preferredProvider} setPreferredProvider={setPreferredProvider} apiKeys={apiKeys} setApiKeys={setApiKeys} saveApiKeys={saveApiKeys} />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-4xl bg-card border border-border p-6 md:p-8 rounded-sm shadow-2xl relative">
          <div className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="file-upload" className="text-sm font-bold uppercase tracking-widest text-foreground block">
                1. Upload Training Data (CSV)
              </Label>
              <div className="border border-input p-1 rounded-sm bg-background">
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="bg-transparent border-0 file:text-primary file:bg-transparent file:border-0 file:font-bold file:uppercase file:cursor-pointer p-0 h-14 cursor-pointer" />
              </div>
              
              {filePreview && (
                <div className="bg-muted/30 border border-border rounded-sm p-4 text-xs font-mono mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-2 py-1 rounded-sm">Dataset Profiler Active</span>
                    <span className="opacity-50">Total Rows: {filePreview.totalRows}</span>
                  </div>
                  <div className={`overflow-auto border border-border/50 rounded-sm ${isExpandedPreview ? 'max-h-[600px] absolute z-50 bg-card top-0 left-0 right-0 p-6 shadow-2xl h-[80vh]' : 'max-h-64'}`}>
                    {isExpandedPreview && (
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="text-sm font-bold uppercase tracking-widest">Full Dataset Preview</h3>
                         <Button variant="outline" size="sm" onClick={() => setIsExpandedPreview(false)}>Close Full View</Button>
                       </div>
                    )}
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-border/50">
                          {(isExpandedPreview ? filePreview.columns : filePreview.columns.slice(0, 8)).map(col => (
                            <th key={col.name} className="py-2 px-3 tracking-tight font-bold">
                              <div>{col.name}</div>
                              <div className="text-[9px] text-muted-foreground uppercase opacity-70">
                                {col.type} {col.missing > 0 && `(${col.missing} null)`}
                              </div>
                            </th>
                          ))}
                          {!isExpandedPreview && filePreview.columns.length > 8 && <th className="py-2 px-3 italic opacity-50">...</th>}
                        </tr>
                      </thead>
                      <tbody className="opacity-80">
                        {(isExpandedPreview ? filePreview.previewRows : filePreview.previewRows.slice(0, 5)).map((row, i) => (
                           <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/50">
                               {(isExpandedPreview ? filePreview.columns : filePreview.columns.slice(0, 8)).map(col => (
                                 <td key={col.name} className="py-2 px-3 max-w-[200px] truncate">{row[col.name]}</td>
                               ))}
                               {!isExpandedPreview && filePreview.columns.length > 8 && <td className="py-2 px-3">...</td>}
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!isExpandedPreview && (
                    <Button variant="ghost" size="sm" className="w-full mt-4 border border-dashed border-border text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground" onClick={() => setIsExpandedPreview(true)}>
                      View Full Tabular Data
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <Label htmlFor="requirement" className="text-sm font-bold uppercase tracking-widest text-foreground block">
                2. Strict Task Definition
              </Label>
              <Textarea 
                id="requirement" 
                placeholder="Enter EXACT modeling tasks or goals. E.g., 'Predict churn using Random Forest and evaluate feature importance. Build a comprehensive dashboard for customer insights.' The AI will strictly follow these instructions."
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={8}
                className="bg-background border-border rounded-sm resize-y font-mono text-sm leading-relaxed p-4"
              />
            </div>
            
            <div className="pt-6">
              <Button 
                className="w-full bg-primary text-black font-black uppercase tracking-widest rounded-sm hover:bg-primary/90 h-16 text-[15px] shadow-[0_0_20px_-5px_rgba(0,255,102,0.4)] transition-all" 
                onClick={runPipeline} 
                disabled={!file || !requirement}
              >
                <Play className="w-5 h-5 mr-3 fill-current" /> EXECUTE WORKFLOW
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active execution / notebook view
  return (
    <div className="flex flex-col w-full bg-background font-mono">
      <Helmet>
        <title>Execution Environment | Data Engine</title>
      </Helmet>
      
      <div className="flex-none p-4 md:p-6 pb-0 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-6 gap-6">
          <div className="flex items-center gap-4">
             <Terminal className="w-6 h-6 text-primary" />
             <div>
               <h2 className="font-mono text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-widest">DATA_ENGINE_WORKSPACE</h2>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Authorized Profile: {profileName}</p>
             </div>
          </div>
          <div>
             <SettingsDialog profileName={profileName} setProfileName={setProfileName} preferredProvider={preferredProvider} setPreferredProvider={setPreferredProvider} apiKeys={apiKeys} setApiKeys={setApiKeys} saveApiKeys={saveApiKeys} />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Animated Progress Section */}
          <div className="w-full mb-8">
            <div className="flex justify-between text-[9px] font-mono uppercase tracking-[2px] mb-2 px-1 text-muted-foreground">
               <span>Ingestion & Planning</span>
               <span>{progress}%</span>
               <span>Artifact Packaging</span>
            </div>
            <Progress value={progress} className="h-1 rounded-none mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
              {[
                { key: 'analyzing', label: 'Profiling', t: 10 },
                { key: 'planning', label: 'Architecting', t: 25 },
                { key: 'coding', label: 'Execution', t: 40 },
                { key: 'notebooking', label: 'Notebook Env', t: 60 },
                { key: 'dashboarding', label: 'UI Generate', t: 80 },
                { key: 'completed', label: 'Deployment', t: 100 }
              ].map((s, i) => {
                const isPassed = progress >= s.t && status !== 'error';
                const isCurrent = status === s.key || (status !== 'completed' && status !== 'error' && progress < s.t && progress >= (i === 0 ? 0 : [10, 25, 40, 60, 80, 100][i-1]));
                return (
                  <div key={i} className={`p-2 border rounded-sm text-center text-[9px] font-mono uppercase tracking-widest transition-all duration-500 flex flex-col justify-center items-center h-12 ${isPassed ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-muted/10 border-transparent text-muted-foreground opacity-40'} ${isCurrent ? 'ring-1 ring-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] opacity-100 scale-105' : ''}`}>
                    {isCurrent && status !== 'completed' && <Loader2 className="w-3 h-3 animate-spin mb-1 text-primary" />}
                    {s.label}
                  </div>
                )
              })}
            </div>
          </div>
          
          <Tabs defaultValue="notebook" className="w-full flex-col">
            <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 mb-8 gap-6 justify-start w-full">
              <TabsTrigger value="notebook" className="uppercase tracking-widest text-xs font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
                Jupyter Notebook
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="uppercase tracking-widest text-xs font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3" disabled={!dashboardCode}>
                Streamlit Dashboard
              </TabsTrigger>
              <TabsTrigger value="export" className="uppercase tracking-widest text-xs font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3" disabled={status !== 'completed'}>
                Export Center
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notebook" className="m-0 space-y-6">
              {errorDetails && (
                <div className="w-full bg-destructive/5 text-foreground p-6 rounded-sm border-l-4 border-destructive mb-8">
                  <h3 className="text-destructive font-bold uppercase tracking-widest mb-2 flex items-center">
                    <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full inline-flex items-center justify-center mr-3 text-xs font-black">!</span>
                    {errorDetails.title}
                  </h3>
                  <p className="text-sm font-mono opacity-90 mb-4 ml-8">{errorDetails.message}</p>
                  {errorDetails.solutions.length > 0 && (
                     <div className="ml-8 mb-4">
                       <p className="text-xs uppercase text-muted-foreground tracking-widest font-bold mb-2">Suggested Solutions:</p>
                       <ul className="list-disc list-inside text-xs font-mono space-y-1 opacity-80">
                         {errorDetails.solutions.map((sol, i) => <li key={i}>{sol}</li>)}
                       </ul>
                     </div>
                  )}
                  {errorDetails.links && errorDetails.links.length > 0 && (
                     <div className="ml-8 flex gap-4">
                       {errorDetails.links.map((link, i) => (
                          <Button key={i} variant="outline" size="sm" className="text-xs rounded-sm uppercase tracking-widest" onClick={() => window.open(link.url, '_blank')}>
                            {link.label}
                          </Button>
                       ))}
                     </div>
                  )}
                </div>
              )}
              
              {/* Notebook Toolbar */}
              <div className="flex border-b border-border pb-4 mb-6 items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-2">
                  <Button onClick={handleRunAll} disabled={executingCell !== null || executionSteps.length === 0} className="bg-primary text-black font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 h-10 text-xs">
                    <Play className="w-4 h-4 mr-2" /> Run All
                  </Button>
                  <Button variant="outline" className="rounded-sm font-bold uppercase tracking-widest text-[10px]" onClick={() => downloadFile(JSON.stringify(notebook, null, 2), 'notebook.ipynb', 'application/json')}>
                    <Download className="w-4 h-4 mr-2" /> Download .ipynb
                  </Button>
                  <Button variant="outline" className="rounded-sm font-bold uppercase tracking-widest text-[10px]" onClick={() => downloadFile(getPythonScript(), 'pipeline.py', 'text/x-python')}>
                    <Terminal className="w-4 h-4 mr-2" /> Download .py
                  </Button>
                  <Button variant="outline" className="rounded-sm font-bold uppercase tracking-widest text-[10px]" onClick={() => downloadFile(dashboardCode, 'dashboard.py', 'text/x-python')}>
                    <BarChart2 className="w-4 h-4 mr-2" /> Streamlit App
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="dashboard"]')?.click()} variant="outline" className="rounded-sm text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-secondary/5 to-transparent border-secondary/20 hover:border-secondary/50">
                     Preview Streamlit APP
                  </Button>
                  <Button onClick={() => {
                        downloadFile(JSON.stringify(notebook, null, 2), 'notebook.ipynb', 'application/json');
                        setTimeout(() => window.open('https://colab.research.google.com/', '_blank'), 300);
                      }} variant="outline" className="rounded-sm text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary/5 to-transparent border-primary/20 hover:border-primary/50">
                    <ExternalLink className="w-4 h-4 mr-2" /> Open in Colab
                  </Button>
                </div>
              </div>

              {/* Colab-style cells */}
              {executionSteps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="font-mono text-[10px] text-muted-foreground pt-4 select-none w-12 text-right">
                    [{executedCells.includes(i) ? i + 1 : (executingCell === i ? '*' : ' ')}]
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="bg-card border border-border rounded-sm overflow-hidden flex flex-col group relative">
                      <div className="bg-muted px-4 py-2 border-b border-border font-mono text-xs text-foreground/80 flex justify-between items-center">
                        <span className="truncate"># {step.step}</span>
                        <div className="flex gap-2 items-center">
                           {executingCell === i ? (
                             <span className="text-primary text-[10px] uppercase font-bold animate-pulse flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running</span>
                           ) : (
                             <Button onClick={() => handleRunCell(i)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary rounded-sm opacity-50 group-hover:opacity-100 transition-opacity">
                                <Play className="w-3 h-3" />
                             </Button>
                           )}
                           {executedCells.includes(i) && <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />}
                        </div>
                      </div>
                      <div className="p-4 bg-background overflow-x-auto relative">
                         <SyntaxHighlighter language="python" style={vscDarkPlus} wrapLongLines={true} className="!text-[13px] !bg-transparent !p-0 !m-0 !font-mono">
                            {step.code}
                         </SyntaxHighlighter>
                      </div>
                    </div>
                    {/* Simulated Output inline */}
                    {executedCells.includes(i) && (
                      <SimulatedOutput step={step} />
                    )}
                  </div>
                </div>
              ))}
              
              {status !== 'completed' && status !== 'error' && (
                <div className="flex gap-4 opacity-50 animate-pulse">
                  <div className="font-mono text-[10px] text-primary pt-4 select-none w-12 text-right">
                    [*]
                  </div>
                  <div className="flex-1 h-32 bg-card border border-border rounded-sm flex items-center justify-center font-mono text-xs uppercase tracking-widest">
                    Executing next block...
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dashboard" className="m-0 h-full flex flex-col">
              {dashboardCode ? (
                <div className="space-y-4">
                  <div className="bg-card p-6 rounded-sm border border-border">
                    <h3 className="text-lg font-black uppercase mb-2 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Generated Streamlit Application</h3>
                    <p className="text-sm font-mono text-muted-foreground mb-6">Deploy this code to Streamlit Cloud or run locally using `streamlit run dashboard.py`</p>
                    <div className="bg-black font-mono text-[13px] p-6 text-[#d1d1d1] rounded-sm relative border-l-4 border-primary">
                      <SyntaxHighlighter language="python" style={vscDarkPlus} className="!font-mono !text-[13px] !bg-transparent !p-0 !m-0">
                        {dashboardCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="export" className="m-0">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="col-span-full md:col-span-2 lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-8 rounded-sm">
                    <h3 className="font-black uppercase tracking-widest mb-2 text-primary flex items-center"><ExternalLink className="w-5 h-5 mr-3"/> Google Colab Integration</h3>
                    <p className="text-[11px] font-mono opacity-80 mb-6">Google Colab requires notebooks to be uploaded manually. Click below to download your generated .ipynb and launch Colab. <strong className="text-primary font-bold">You must "Run All" cells in Colab to see your data outputs and charts.</strong></p>
                    <Button onClick={() => {
                        downloadFile(JSON.stringify(notebook, null, 2), 'notebook.ipynb', 'application/json');
                        setTimeout(() => window.open('https://colab.research.google.com/', '_blank'), 300);
                      }} className="w-full bg-primary text-black font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 h-10">
                      Download & Open Colab
                    </Button>
                 </div>

                 <div className="bg-card border border-border p-6 rounded-sm text-center flex flex-col justify-between">
                    <div>
                      <Download className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-bold uppercase tracking-widest mb-2 text-xs">Jupyter Notebook</h3>
                      <p className="text-[10px] font-mono text-muted-foreground mb-4">Executable .ipynb artifact.</p>
                    </div>
                    <Button variant="outline" className="w-full rounded-sm text-[10px] font-bold uppercase tracking-wider" onClick={() => downloadFile(JSON.stringify(notebook, null, 2), 'notebook.ipynb', 'application/json')}>
                      Export .ipynb
                    </Button>
                 </div>

                 <div className="bg-card border border-border p-6 rounded-sm text-center flex flex-col justify-between">
                    <div>
                      <Terminal className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-bold uppercase tracking-widest mb-2 text-xs">Python Script</h3>
                      <p className="text-[10px] font-mono text-muted-foreground mb-4">Consolidated .py raw script.</p>
                    </div>
                    <div className="space-y-2">
                       <Button variant="outline" className="w-full rounded-sm text-[10px] font-bold uppercase tracking-wider" onClick={() => downloadFile(getPythonScript(), 'pipeline.py', 'text/x-python')}>
                         Export .py
                       </Button>
                       <Button variant="ghost" className="w-full rounded-sm text-[10px] font-bold uppercase tracking-wider border border-dashed border-border" onClick={() => navigator.clipboard.writeText(getPythonScript())}>
                         Copy to Clipboard
                       </Button>
                    </div>
                 </div>
                 
                 <div className="bg-card border border-border p-6 rounded-sm text-center flex flex-col justify-between">
                    <div>
                      <BarChart2 className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-bold uppercase tracking-widest mb-2 text-xs">Streamlit UI</h3>
                      <p className="text-[10px] font-mono text-muted-foreground mb-4">Ready to deploy dashboard.</p>
                    </div>
                    <Button variant="outline" className="w-full rounded-sm text-[10px] font-bold uppercase tracking-wider" onClick={() => downloadFile(dashboardCode, 'dashboard.py', 'text/x-python')}>
                      Export Dashboard
                    </Button>
                 </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
