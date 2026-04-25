import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Database, Workflow, Download, LayoutDashboard, BrainCircuit } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-24 px-6 text-center w-full min-h-full">
      <div className="font-mono text-xs text-primary mb-6 tracking-[3px] uppercase underline underline-offset-4 decoration-primary/50">SYS_INIT_SEQUENCE</div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] max-w-4xl mb-8 border-l-4 border-primary pl-4 sm:pl-6">
        AI Data Scientist That Builds Your Projects <span className="text-primary block mt-2 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">Automatically.</span>
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-2xl mb-12 font-mono">
        Upload your dataset, define your goal, and let the Data Engine build your pipeline, generate Python execution code, Streamlit dashboards, and insights automatically.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link to="/auth" className="bg-primary text-black font-black uppercase tracking-widest px-10 py-5 rounded-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 w-full sm:w-auto">
          Start Processing <Activity className="w-5 h-5" />
        </Link>
        <Link to="/about" className="border border-border text-foreground font-bold uppercase tracking-widest px-10 py-5 rounded-sm hover:bg-muted transition-colors flex items-center justify-center gap-3 w-full sm:w-auto">
          View Documentation
        </Link>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 text-left">
         <div className="border border-border bg-card p-8 rounded-sm">
           <Database className="w-8 h-8 text-primary mb-4" />
           <h3 className="font-black uppercase tracking-widest text-lg mb-2">Automated EDA</h3>
           <p className="text-sm font-mono text-muted-foreground">Self-healing data loading and exploratory analysis. Automatic type inference and missing value handling.</p>
         </div>
         <div className="border border-border bg-card p-8 rounded-sm">
           <Workflow className="w-8 h-8 text-primary mb-4" />
           <h3 className="font-black uppercase tracking-widest text-lg mb-2">Python Execution</h3>
           <p className="text-sm font-mono text-muted-foreground">Generates production-ready Jupyter Notebooks and standard python scripts that are directly executable.</p>
         </div>
         <div className="border border-border bg-card p-8 rounded-sm">
           <LayoutDashboard className="w-8 h-8 text-primary mb-4" />
           <h3 className="font-black uppercase tracking-widest text-lg mb-2">Dashboard Generator</h3>
           <p className="text-sm font-mono text-muted-foreground">Zero-config Streamlit dashboard generation yielding instant data applications with multi-tier insights.</p>
         </div>
         <div className="border border-border bg-card p-8 rounded-sm">
           <BrainCircuit className="w-8 h-8 text-primary mb-4" />
           <h3 className="font-black uppercase tracking-widest text-lg mb-2">Multi-Model AI</h3>
           <p className="text-sm font-mono text-muted-foreground">Leverage Anthropic Claude, OpenAI, Google Gemini, Grok, or DeepSeek through secure API key multiplexing.</p>
         </div>
         <div className="border border-border bg-card p-8 rounded-sm">
           <Activity className="w-8 h-8 text-primary mb-4" />
           <h3 className="font-black uppercase tracking-widest text-lg mb-2">Real-time Telemetry</h3>
           <p className="text-sm font-mono text-muted-foreground">Monitor the execution phase with detailed execution logs and progress telemetry directly within the dashboard.</p>
         </div>
         <div className="border border-border bg-card p-8 rounded-sm">
           <Download className="w-8 h-8 text-primary mb-4" />
           <h3 className="font-black uppercase tracking-widest text-lg mb-2">System Export</h3>
           <p className="text-sm font-mono text-muted-foreground">One-click extraction of the completed pipeline code, dashboard UI, and generated analytics reports.</p>
         </div>
      </div>
      
      <div className="mt-8 border border-border rounded-sm w-full max-w-5xl bg-black overflow-hidden mb-24 shadow-[0_0_50px_-12px_rgba(0,255,102,0.15)] relative">
        <div className="border-b border-border bg-card p-4 flex gap-2 items-center">
          <div className="w-3 h-3 rounded-full bg-border"></div>
          <div className="w-3 h-3 rounded-full bg-border"></div>
          <div className="w-3 h-3 rounded-full bg-border"></div>
          <div className="ml-4 font-mono text-[9px] uppercase tracking-[2px] opacity-50">data_engine_terminal_01</div>
        </div>
        <div className="p-10 font-mono text-sm text-left text-muted-foreground md:text-base leading-relaxed">
          <p className="mb-2"><span className="text-primary">&gt;</span> Initialize DataEngine</p>
          <p className="mb-2"><span className="text-primary">&gt;</span> Loading Dataset "customer_churn.csv" ... <span className="text-primary">OK</span></p>
          <p className="mb-2"><span className="text-primary">&gt;</span> Generating AI Pipeline... <span className="text-primary">OK</span></p>
          <p className="mb-2"><span className="text-primary">&gt;</span> Compiling Streamlit Dashboard... <span className="text-primary">OK</span></p>
          <p className="text-foreground animate-pulse mt-4">&gt; Executing Random Forest Classifier... [98% accuracy] _</p>
        </div>
      </div>
    </div>
  );
}
