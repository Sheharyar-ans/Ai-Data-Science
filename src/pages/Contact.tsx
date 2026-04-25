import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-left font-mono w-full">
      <Helmet>
        <title>Contact Us | Data Engine Support</title>
        <meta name="description" content="Contact the Data Engine team. We're here to support your AI data science queries." />
      </Helmet>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground mb-12 border-l-4 border-primary pl-4">Contact System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12 text-muted-foreground">
          <p className="text-lg">
            Whether you are exploring deployment for an enterprise stack or experiencing issues with your dashboard generation pipeline, our engineering team is here to help.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="border border-border p-6 rounded-sm bg-card">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-foreground mb-2">Email Support</h3>
              <p className="text-xs">support@dataengine.io</p>
            </div>
            
            <div className="border border-border p-6 rounded-sm bg-card">
              <MessageSquare className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-foreground mb-2">Live Chat</h3>
              <p className="text-xs">Available Mon-Fri, 9am - 5pm EST in the dashboard.</p>
            </div>
            
            <div className="border border-border p-6 rounded-sm bg-card sm:col-span-2">
              <MapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-foreground mb-2">Headquarters</h3>
              <p className="text-xs">100 AI Avenue, Innovation District, San Francisco, CA 94107</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-8 rounded-sm">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-6">Send a Transmission</h2>
          
          {submitted ? (
            <div className="bg-primary/20 border border-primary text-primary p-6 rounded-sm text-center font-bold">
              Message transmitted successfully. Acknowledgment pending.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">Name</Label>
                <Input required className="bg-background border-border rounded-sm font-mono text-sm" placeholder="John Doe" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">Email Address</Label>
                <Input type="email" required className="bg-background border-border rounded-sm font-mono text-sm" placeholder="john@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">Inquiry Type</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono">
                  <option>Technical Support</option>
                  <option>Billing</option>
                  <option>Enterprise Deployment</option>
                  <option>General Feedback</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">Payload (Message)</Label>
                <Textarea required placeholder="Enter details..." rows={5} className="bg-background border-border rounded-sm font-mono text-sm resize-none" />
              </div>

              <Button type="submit" className="w-full font-bold uppercase tracking-widest rounded-sm bg-primary text-black hover:bg-primary/90 h-10">
                Execute Send
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
