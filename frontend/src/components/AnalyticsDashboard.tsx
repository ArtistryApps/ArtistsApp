import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyticsService } from '@/services/analytics-service';
import { authService } from '@/services/auth-service';
import { chatService } from '@/services/chat-service';
import type { SongAnalytics, BeatEntry, SectionEntry, ChordRow } from '@/schemas';
import './AnalyticsDashboard.css';

type Tab = 'beat' | 'section' | 'chord';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSearch = async () => {
    const name = songInput.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    setAnalytics(null);
    setChatMessages([]);
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
    try { await authService.logout(); } finally { onLogout(); }
  };

  const handleAsk = async () => {
    const question = chatInput.trim();
    if (!question || !loadedSong) return;
    setChatInput('');
    setChatError(null);
    setChatMessages((prev) => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);
    try {
      const answer = await chatService.ask(question);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setChatError(detail ?? 'Failed to get a response. Try again.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-icon">♪</span>
          <span className="dashboard-title">Artists App</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
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
          <>
            <section className="results-section">
              <div className="results-title-row">
                <h3 className="results-title">{loadedSong}</h3>
                <div className="results-totals">
                  <span>{analytics['Beat Analysis'].total} beats</span>
                  <span>{analytics['Chord Analysis'].total} sections</span>
                  <span>{analytics['Section Analysis'].total} chord rows</span>
                </div>
              </div>

              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'chord' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('chord')}
                >
                  Section Analysis
                  <span className="tab-count">{analytics['Chord Analysis'].total}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'section' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('section')}
                >
                  Chord Grid
                  <span className="tab-count">{analytics['Section Analysis'].total}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'beat' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('beat')}
                >
                  Beat Analysis
                  <span className="tab-count">{analytics['Beat Analysis'].total}</span>
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'chord' && (
                  <SectionAnalysisPanel sections={analytics['Chord Analysis'].data} />
                )}
                {activeTab === 'section' && (
                  <ChordAnalysisPanel rows={analytics['Section Analysis'].data} />
                )}
                {activeTab === 'beat' && (
                  <BeatAnalysisPanel beats={analytics['Beat Analysis'].data} />
                )}
              </div>
            </section>

            <section className="chat-section">
              <h3 className="chat-heading">Ask about this song</h3>

              {chatMessages.length > 0 && (
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`chat-message chat-message-${msg.role}`}>
                      <span className="chat-role">
                        {msg.role === 'user' ? 'You' : '♪ Assistant'}
                      </span>
                      {msg.role === 'assistant' ? (
                        <div className="chat-body markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="chat-body">{msg.content}</div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message chat-message-assistant">
                      <span className="chat-role">♪ Assistant</span>
                      <div className="chat-body chat-typing">
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {chatError && <div className="chat-error">{chatError}</div>}

              <div className="chat-input-row">
                <textarea
                  className="chat-input"
                  placeholder="Ask anything about this song's chords, structure, progressions…"
                  value={chatInput}
                  rows={2}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  disabled={chatLoading}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleAsk}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? '…' : '↑'}
                </button>
              </div>
              <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
            </section>
          </>
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
          <span className="stat-value">{s.avg_beats_per_chord_change.toFixed(2)}</span>
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

// --- Chord Grid ---

const ChordAnalysisPanel: React.FC<{ rows: ChordRow[] }> = ({ rows }) => {
  if (rows.length === 0) return <p className="empty">No chord grid data available.</p>;
  const beatKeys = Object.keys(rows[0]).filter((k) => k !== 'section');
  return (
    <div className="chord-table-wrap">
      <table className="chord-table">
        <thead>
          <tr>
            <th className="chord-th chord-th-section">Section</th>
            {beatKeys.map((k) => <th key={k} className="chord-th">{k}</th>)}
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
            <td className="beat-section-cell">{b.section}{b.section_repeat > 1 ? ` (${b.section_repeat})` : ''}</td>
            <td className="beat-chord">{b.chord ?? '—'}</td>
            <td>{b.label || '—'}</td>
            <td className="beat-degree-cell">{b.chord_degree ?? '—'}</td>
            <td className="beat-quality-cell">{b.chord_quality ?? '—'}</td>
            <td>{b.is_new ? '✓' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
