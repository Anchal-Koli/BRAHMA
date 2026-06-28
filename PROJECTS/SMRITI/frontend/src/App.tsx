import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { WorkspaceShell } from './components/layout/WorkspaceShell';
import './styles/global.css';

const App: React.FC = () => {
  const { isAuthenticated, initializeAuth } = useAuthStore();
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

  // Render the core workspace application shell when authenticated
  return <WorkspaceShell />;
};

export default App;
