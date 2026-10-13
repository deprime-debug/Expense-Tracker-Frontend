import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!username.trim() || !password) {
          throw new Error('Please enter username and password');
        }
        await login(username.trim(), password);
      } else {
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('All fields are required');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register(username.trim(), email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setUsername('demo_user');
    setEmail('demo@cacheflow.app');
    setPassword('demo123456');
    setError('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div className="modal-header">
          <h2 className="modal-title font-serif">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="modal-subtitle">
            {mode === 'login'
              ? 'Sign in to access your secure MySQL ledger'
              : 'Start your private personal expense tracker'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-username">
            {mode === 'login' ? 'Username or Email' : 'Username'}
          </label>
          <input
            id="auth-username"
            type="text"
            placeholder={mode === 'login' ? 'e.g. johndoe or user@email.com' : 'e.g. johndoe'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoFocus
          />

          {mode === 'register' && (
            <>
              <label htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </>
          )}

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-green"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In with JWT' : 'Create Account'}
          </button>

          <button
            type="button"
            className="demo-fill-btn"
            onClick={handleDemoFill}
          >
            ⚡ Autofill Demo Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
