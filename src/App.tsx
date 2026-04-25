import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import { isFirebaseConfigured } from './lib/firebase';

const FirebaseSetup = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 pb-24 font-mono">
      <div className="w-full max-w-2xl bg-card border border-border p-8 rounded-sm">
        <h2 className="text-3xl font-black text-primary uppercase tracking-tighter mb-4">Connect Firebase Project</h2>
        <p className="text-sm opacity-80 mb-8 border-b border-border pb-4">
          The system requires a persistent data layer. Please configure Firebase.
        </p>
        
        <ol className="list-decimal list-inside space-y-6 text-sm opacity-90 marker:text-primary marker:font-bold">
          <li>
            Go to: <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">https://console.firebase.google.com/</a>
          </li>
          <li>Create a new project.</li>
          <li>
            Enable Authentication:
            <ul className="list-disc list-inside ml-6 mt-2 opacity-80">
              <li>Authentication → Sign-in method → Email/Password (Enable)</li>
              <li>Authentication → Sign-in method → Google (Enable)</li>
            </ul>
          </li>
          <li>
            Get your web config object and paste it below:
            <pre className="bg-muted p-4 rounded-sm mt-3 border border-border/50 text-[10px] overflow-x-auto">
{`{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "appId": "..."
}`}
            </pre>
          </li>
        </ol>

        <div className="mt-8 pt-6 border-t border-border">
          <label className="text-xs uppercase tracking-widest font-bold mb-2 block">Paste Config Here:</label>
          <textarea
            className="w-full h-32 bg-background border border-border rounded-sm p-4 text-xs font-mono text-muted-foreground focus:outline-none focus:border-primary focus:text-foreground"
            placeholder="Paste your JSON config object..."
            onChange={(e) => {
              if (e.target.value.includes('apiKey')) {
                alert("For the AI Studio preview, please open the code editor (</>) and paste your config directly into 'firebase-applet-config.json'.");
              }
            }}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col relative w-full pt-8 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetup />;
  }

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden bg-background text-foreground font-sans m-0 p-0">
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </div>
  );
}
