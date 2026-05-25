/**
 * Main App component
 */

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { MusicAnalyzer } from '@/components/MusicAnalyzer';
import { healthService } from '@/services/health-service';
import './App.css';

function App() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthService.checkHealth();
        setIsHealthy(true);
        setError(null);
      } catch (err) {
        setIsHealthy(false);
        setError('Failed to connect to API');
      }
    };

    checkHealth();
  }, []);

  return (
    <Layout>
      <div className="app">
        {error && <div className="connection-error">{error}</div>}
        {isHealthy === false && (
          <div className="warning">⚠️ API connection failed. Some features may not work.</div>
        )}
        <MusicAnalyzer />
      </div>
    </Layout>
  );
}

export default App;
