import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-sm">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase mb-3 tracking-tighter">{isLogin ? 'Access System' : 'Initialize User'}</h2>
        <p className="text-xs tracking-widest text-muted-foreground uppercase mb-8">
          {isLogin ? 'Enter credentials to continue' : 'Create new authentication profile'}
        </p>

        {error && <div className="bg-destructive/10 text-destructive text-xs border border-destructive p-3 mb-6 rounded-sm uppercase font-bold tracking-wider">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-bold">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-transparent border-border rounded-sm font-mono text-sm"
              required 
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-bold">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-transparent border-border rounded-sm font-mono text-sm"
              required 
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-bold">Confirm Password</label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-transparent border-border rounded-sm font-mono text-sm"
                required 
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-primary text-black hover:bg-primary/90 rounded-sm font-black uppercase tracking-widest mt-6">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-border flex-1"></div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">OR</div>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <Button onClick={signInWithGoogle} variant="outline" className="w-full rounded-sm bg-transparent border-border hover:bg-muted font-bold uppercase text-xs tracking-widest">
          Continue with Google OAuth
        </Button>

        <div className="mt-8 text-center text-xs tracking-widest uppercase font-bold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Request New Account Setup' : 'Return to Login System'}
        </div>
      </div>
    </div>
  );
}
