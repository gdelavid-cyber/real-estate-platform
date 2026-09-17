'use client';

import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          name,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      onAuthSuccess(data.user);
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setMode('login');
    setEmail('melissafh@johnlscott.com');
    setPassword('admin123');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(26,26,26,0.45)] backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md p-7 shadow-2xl"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(139,125,107,0.2)',
          borderRadius: 24,
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3
              className="font-display text-2xl font-bold"
              style={{ color: '#1A1A1A' }}
            >
              {mode === 'login' ? 'Welcome back' : 'Create agent account'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,26,0.55)' }}>
              {mode === 'login'
                ? 'Log in to access your workspace.'
                : 'Join as a real estate agent.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl cursor-pointer"
            style={{
              background: 'rgba(139,125,107,0.08)',
              color: 'rgba(26,26,26,0.55)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex items-center p-1 rounded-xl mb-5"
          style={{
            background: 'rgba(139,125,107,0.08)',
            border: '1px solid rgba(139,125,107,0.2)',
          }}
        >
          <button
            onClick={() => setMode('login')}
            className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            style={
              mode === 'login'
                ? { background: '#1A1A1A', color: '#FDFCF9' }
                : { color: 'rgba(26,26,26,0.55)' }
            }
          >
            <LogIn className="w-3.5 h-3.5" /> Log In
          </button>
          <button
            onClick={() => setMode('register')}
            className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            style={
              mode === 'register'
                ? { background: '#1A1A1A', color: '#FDFCF9' }
                : { color: 'rgba(26,26,26,0.55)' }
            }
          >
            <UserPlus className="w-3.5 h-3.5" /> Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label
                className="block text-[11px] uppercase mb-1.5"
                style={{ letterSpacing: '0.16em', color: 'rgba(26,26,26,0.4)' }}
              >
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Mitchell"
                className="landing-input w-full px-3.5 py-2.5 text-sm focus:outline-none"
                style={{
                  background: '#FDFCF9',
                  border: '1px solid rgba(139,125,107,0.2)',
                  borderRadius: 12,
                  color: '#1A1A1A',
                }}
              />
            </div>
          )}
          <div>
            <label
              className="block text-[11px] uppercase mb-1.5"
              style={{ letterSpacing: '0.16em', color: 'rgba(26,26,26,0.4)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brokerage.com"
              className="landing-input w-full px-3.5 py-2.5 text-sm focus:outline-none"
              style={{
                background: '#FDFCF9',
                border: '1px solid rgba(139,125,107,0.2)',
                borderRadius: 12,
                color: '#1A1A1A',
              }}
            />
          </div>
          <div>
            <label
              className="block text-[11px] uppercase mb-1.5"
              style={{ letterSpacing: '0.16em', color: 'rgba(26,26,26,0.4)' }}
            >
              Password {mode === 'register' && '(6+ characters)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="landing-input w-full px-3.5 py-2.5 text-sm focus:outline-none"
              style={{
                background: '#FDFCF9',
                border: '1px solid rgba(139,125,107,0.2)',
                borderRadius: 12,
                color: '#1A1A1A',
              }}
            />
          </div>

          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{
                color: '#8B7D6B',
                background: 'rgba(139,125,107,0.1)',
                border: '1px solid rgba(139,125,107,0.2)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: '#1A1A1A',
              color: '#FDFCF9',
              borderRadius: 12,
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={fillAdminDemo}
          className="mt-4 w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'rgba(139,125,107,0.08)',
            border: '1px solid rgba(139,125,107,0.2)',
            borderRadius: 12,
            color: 'rgba(26,26,26,0.65)',
          }}
        >
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
          Admin / Owner Login (Melissa Hatfield · melissafh@johnlscott.com)
        </button>
      </div>
    </div>
  );
}
