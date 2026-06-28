import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import './styles/global.css';

const App: React.FC = () => {
  const { isAuthenticated, user, initializeAuth, logoutUser, loading } = useAuthStore();
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isAuthenticated) {
    if (view === 'register') {
      return <Register onNavigateToLogin={() => setView('login')} />;
    }
    return <Login onNavigateToRegister={() => setView('register')} />;
  }

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              KnowledgeOS Workspace
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Your secure decentralized second brain
            </p>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid var(--border-color)' }} />

        <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>User Session Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <p>
              <strong style={{ color: 'var(--text-secondary)' }}>Account ID:</strong>{' '}
              <span style={{ fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                {user?.id || 'Loading...'}
              </span>
            </p>
            <p>
              <strong style={{ color: 'var(--text-secondary)' }}>Email Address:</strong> {user?.email}
            </p>
            {user?.first_name && (
              <p>
                <strong style={{ color: 'var(--text-secondary)' }}>First Name:</strong> {user.first_name}
              </p>
            )}
            {user?.last_name && (
              <p>
                <strong style={{ color: 'var(--text-secondary)' }}>Last Name:</strong> {user.last_name}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="auth-button"
          disabled={loading}
          style={{ width: 'fit-content', padding: '10px 24px', marginTop: '0', background: 'var(--accent-danger)' }}
        >
          {loading ? <span className="spinner"></span> : 'Logout Securely'}
        </button>
      </div>
    </div>
  );
};

export default App;
