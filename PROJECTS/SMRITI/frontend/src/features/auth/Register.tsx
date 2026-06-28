import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import './auth.css';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { registerUser, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    try {
      await registerUser({ email, password });
      onNavigateToLogin();
    } catch (err) {
      // Errors are handled by the store state
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <h1 className="auth-title">KnowledgeOS</h1>
        <p className="auth-subtitle">Create your secure profile</p>

        {(error || validationError) && (
          <div className="auth-error animate-fade-in">
            <span>{error || validationError}</span>
            <button className="auth-error-close" onClick={() => { clearError(); setValidationError(null); }}>&times;</button>
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
              onChange={(e) => { setEmail(e.target.value); clearError(); setValidationError(null); }}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); setValidationError(null); }}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(null); }}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Register'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin}>Log In</button>
        </p>
      </div>
    </div>
  );
};
