import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Github, Twitter, Linkedin, Activity, BrainCircuit, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto font-mono text-xs text-muted-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link to="/" className="text-xl font-black tracking-tighter hover:text-primary transition-colors text-foreground flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            DATA ENGINE.
          </Link>
          <p className="leading-relaxed">
            The automated Data Science workflow tool. Bring your dataset, and we bring you fully executable AI pipelines, analytics, and deployed dashboards.
          </p>
          <div className="flex gap-4 pt-4">
            <a href="#" className="hover:text-primary transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-foreground mb-4 uppercase tracking-widest text-[10px]">Product</h4>
          <ul className="space-y-3">
            <li><Link to="/about" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Integrations</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard UI</Link></li>
            <li><Link to="/auth" className="hover:text-primary transition-colors">Login Workspace</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-foreground mb-4 uppercase tracking-widest text-[10px]">Resources</h4>
          <ul className="space-y-3">
            <li><Link to="/about" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">API Reference</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">Status & Uptime</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        <div>
           <h4 className="font-bold text-foreground mb-4 uppercase tracking-widest text-[10px]">Legal</h4>
           <ul className="space-y-3">
             <li><Link to="/about" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
             <li><Link to="/about" className="hover:text-primary transition-colors">Terms of Service</Link></li>
             <li><Link to="/about" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
             <li><Link to="/about" className="hover:text-primary transition-colors">GDPR Compliance</Link></li>
           </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          &copy; {new Date().getFullYear()} Data Engine AI Inc. All rights reserved.
        </div>
        <div className="flex gap-6 text-[10px] tracking-widest uppercase font-bold">
           <span>Status: <span className="text-primary inline-flex items-center"><Activity className="w-3 h-3 mr-1" /> ONLINE</span></span>
           <span>Model: <span className="text-primary inline-flex items-center"><BrainCircuit className="w-3 h-3 mr-1" /> MULTI</span></span>
        </div>
      </div>
    </footer>
  );
};
