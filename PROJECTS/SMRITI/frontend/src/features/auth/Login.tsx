import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import './auth.css';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await loginUser({ email, password });
    } catch (err) {
      // Errors are handled by the store state
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <h1 className="auth-title">KnowledgeOS</h1>
        <p className="auth-subtitle">Login to access your vault</p>

        {error && (
          <div className="auth-error animate-fade-in">
            <span>{error}</span>
            <button className="auth-error-close" onClick={clearError}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account?{' '}
          <button onClick={onNavigateToRegister}>Sign Up</button>
        </p>
      </div>
    </div>
  );
};
