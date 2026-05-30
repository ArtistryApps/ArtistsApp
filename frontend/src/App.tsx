import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const onUnauthorized = () => setAuthenticated(false);
    window.addEventListener('unauthorized', onUnauthorized);
    return () => window.removeEventListener('unauthorized', onUnauthorized);
  }, []);

  if (authenticated === null) {
    return (
      <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
    );
  }

  if (!authenticated) {
    return (
      <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
    );
  }

  return (
    <AnalyticsDashboard onLogout={() => setAuthenticated(false)} />
  );
}

export default App;
