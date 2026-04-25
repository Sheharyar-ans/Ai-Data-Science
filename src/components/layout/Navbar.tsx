import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-border text-xs tracking-widest uppercase font-bold sticky top-0 bg-background z-50">
      <Link to="/" className="text-xl font-black tracking-tighter hover:text-primary transition-colors">DATA<br className="hidden md:block"/>ENGINE.</Link>
      
      <div className="hidden md:flex items-center gap-8 text-muted-foreground">
        <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
        <Link to="/services" className="hover:text-foreground transition-colors">Services</Link>
        <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</Link>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">Logout</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link to="/auth" className="bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:opacity-90 transition-opacity">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};
