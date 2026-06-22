import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { HomePage } from '@/components/HomePage';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { VideoEditorPage } from '@/components/VideoEditorPage';

type Page = 'home' | 'analytics' | 'video' | 'stem';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const onUnauthorized = () => {
      setAuthenticated(false);
      setCurrentPage('home');
    };
    window.addEventListener('unauthorized', onUnauthorized);
    return () => window.removeEventListener('unauthorized', onUnauthorized);
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentPage('home');
  };

  if (!authenticated) {
    return <LoginPage onLoginSuccess={() => setAuthenticated(true)} />;
  }

  if (currentPage === 'analytics') {
    return (
      <AnalyticsDashboard
        onLogout={handleLogout}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'video') {
    return (
      <VideoEditorPage
        onBack={() => setCurrentPage('home')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <HomePage
      onNavigate={(page) => setCurrentPage(page)}
      onLogout={handleLogout}
    />
  );
}

export default App;
