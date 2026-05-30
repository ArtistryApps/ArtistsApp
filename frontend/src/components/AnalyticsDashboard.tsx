import React, { useState } from 'react';
import { analyticsService } from '@/services/analytics-service';
import { authService } from '@/services/auth-service';
import type { SongAnalytics, BeatEntry, SectionEntry, ChordRow } from '@/schemas';
import './AnalyticsDashboard.css';

type Tab = 'beat' | 'section' | 'chord';

interface AnalyticsDashboardProps {
  onLogout: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onLogout }) => {
  const [songInput, setSongInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SongAnalytics | null>(null);
  const [loadedSong, setLoadedSong] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('section');

  const handleSearch = async () => {
    const name = songInput.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    setAnalytics(null);
    try {
      const data = await analyticsService.getSongAnalytics(name);
      setAnalytics(data);
      setLoadedSong(name);
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(detail ?? 'Failed to fetch song analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      onLogout();
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-icon">♪</span>
          <span className="dashboard-title">Artists App</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <main className="dashboard-main">
        <section className="search-section">
          <h2 className="search-heading">Song Analytics</h2>
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Enter song name…"
              value={songInput}
              onChange={(e) => setSongInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Loading…' : 'Analyze'}
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </section>

        {analytics && (
          <section className="results-section">
            <h3 className="results-title">{loadedSong}</h3>

            <div className="tabs">
              <button
                className={`tab ${activeTab === 'section' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('section')}
              >
                Section Analysis
                <span className="tab-count">{analytics['Section Analysis'].length}</span>
              </button>
              <button
                className={`tab ${activeTab === 'chord' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('chord')}
              >
                Chord Grid
                <span className="tab-count">{analytics['Chord Analysis'].length}</span>
              </button>
              <button
                className={`tab ${activeTab === 'beat' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('beat')}
              >
                Beat Analysis
                <span className="tab-count">{analytics['Beat Analysis'].length}</span>
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'section' && (
                <SectionAnalysisPanel sections={analytics['Section Analysis']} />
              )}
              {activeTab === 'chord' && (
                <ChordAnalysisPanel rows={analytics['Chord Analysis']} />
              )}
              {activeTab === 'beat' && (
                <BeatAnalysisPanel beats={analytics['Beat Analysis']} />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

// --- Section Analysis ---

const SectionAnalysisPanel: React.FC<{ sections: SectionEntry[] }> = ({ sections }) => (
  <div className="section-grid">
    {sections.map((s, i) => (
      <div key={i} className="section-card">
        <div className="section-card-header">
          <span className="section-name">{s.section}</span>
          {s.section_repeat > 1 && (
            <span className="section-repeat">×{s.section_repeat}</span>
          )}
        </div>
        <div className="section-stat">
          <span className="stat-label">Bars</span>
          <span className="stat-value">{s.num_bars}</span>
        </div>
        <div className="section-stat">
          <span className="stat-label">Avg beats / chord</span>
          <span className="stat-value">{s.avg_beats_per_chord_change.toFixed(1)}</span>
        </div>
        {s.most_frequent_progression.length > 0 && (
          <div className="section-progression">
            <span className="stat-label">Common progression</span>
            <div className="progression-chips">
              {s.most_frequent_progression.map((deg, j) => (
                <span key={j} className="chip">{deg}</span>
              ))}
            </div>
          </div>
        )}
        {s.chords.length > 0 && (
          <div className="section-chords">
            <span className="stat-label">Chords</span>
            <div className="chord-list">
              {s.chords.map((c, j) => (
                <span key={j} className="chord-chip">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// --- Chord Analysis ---

const ChordAnalysisPanel: React.FC<{ rows: ChordRow[] }> = ({ rows }) => {
  if (rows.length === 0) return <p className="empty">No chord data available.</p>;

  const beatKeys = Object.keys(rows[0]).filter((k) => k !== 'section');

  return (
    <div className="chord-table-wrap">
      <table className="chord-table">
        <thead>
          <tr>
            <th className="chord-th chord-th-section">Section</th>
            {beatKeys.map((k) => (
              <th key={k} className="chord-th">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'chord-tr-even' : 'chord-tr-odd'}>
              <td className="chord-td chord-td-section">{row['section']}</td>
              {beatKeys.map((k) => (
                <td key={k} className={`chord-td ${row[k] ? 'chord-td-filled' : 'chord-td-empty'}`}>
                  {row[k] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Beat Analysis ---

const BeatAnalysisPanel: React.FC<{ beats: BeatEntry[] }> = ({ beats }) => (
  <div className="beat-table-wrap">
    <table className="beat-table">
      <thead>
        <tr>
          <th>Beat</th>
          <th>Bar</th>
          <th>Beat in Bar</th>
          <th>Section</th>
          <th>Chord</th>
          <th>Label</th>
          <th>Degree</th>
          <th>Quality</th>
          <th>New</th>
        </tr>
      </thead>
      <tbody>
        {beats.map((b, i) => (
          <tr key={i} className={b.is_new ? 'beat-tr-new' : ''}>
            <td>{b.beat}</td>
            <td>{b.bar}</td>
            <td>{b.beat_in_bar}</td>
            <td>{b.section}{b.section_repeat > 1 ? ` (${b.section_repeat})` : ''}</td>
            <td className="beat-chord">{b.chord ?? '—'}</td>
            <td>{b.label || '—'}</td>
            <td>{b.chord_degree ?? '—'}</td>
            <td>{b.chord_quality ?? '—'}</td>
            <td>{b.is_new ? '✓' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
