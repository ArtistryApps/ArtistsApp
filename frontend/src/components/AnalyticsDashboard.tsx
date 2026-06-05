import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { analyticsService } from '@/services/analytics-service';
import { authService } from '@/services/auth-service';
import { chatService } from '@/services/chat-service';
import { notesService } from '@/services/notes-service';
import { CreateNoteSchema } from '@/schemas';
import type { SongAnalytics, BeatEntry, SectionEntry, ChordRow, NoteEntry, CreateNote, NoteFilters } from '@/schemas';
import './AnalyticsDashboard.css';

type Tab = 'beat' | 'section' | 'chord' | 'notes';

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
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail ?? `Request failed with status ${axiosErr.response?.status}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
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
                  <span>{analytics['Section Analysis'].total} sections</span>
                  <span>{analytics['Chord Analysis'].total} chord rows</span>
                </div>
              </div>

              <div className="tabs">
                <button className={`tab ${activeTab === 'section' ? 'tab-active' : ''}`} onClick={() => setActiveTab('section')}>
                  Section Analysis
                  <span className="tab-count">{analytics['Section Analysis'].total}</span>
                </button>
                <button className={`tab ${activeTab === 'chord' ? 'tab-active' : ''}`} onClick={() => setActiveTab('chord')}>
                  Chord Grid
                  <span className="tab-count">{analytics['Chord Analysis'].total}</span>
                </button>
                <button className={`tab ${activeTab === 'beat' ? 'tab-active' : ''}`} onClick={() => setActiveTab('beat')}>
                  Beat Analysis
                  <span className="tab-count">{analytics['Beat Analysis'].total}</span>
                </button>
                <button className={`tab ${activeTab === 'notes' ? 'tab-active' : ''}`} onClick={() => setActiveTab('notes')}>
                  My Notes
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'section' && <SectionAnalysisPanel sections={analytics['Section Analysis'].data} />}
                {activeTab === 'chord' && <ChordAnalysisPanel rows={analytics['Chord Analysis'].data} />}
                {activeTab === 'beat' && <BeatAnalysisPanel beats={analytics['Beat Analysis'].data} />}
                {activeTab === 'notes' && <NotesTab />}
              </div>
            </section>

            <NotesForm loadedSong={loadedSong} />

            <section className="chat-section">
              <h3 className="chat-heading">Ask about this song</h3>

              {chatMessages.length > 0 && (
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`chat-message chat-message-${msg.role}`}>
                      <span className="chat-role">{msg.role === 'user' ? 'You' : '♪ Assistant'}</span>
                      {msg.role === 'assistant' ? (
                        <div className="chat-body markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="chat-body">{msg.content}</div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message chat-message-assistant">
                      <span className="chat-role">♪ Assistant</span>
                      <div className="chat-body chat-typing"><span /><span /><span /></div>
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                  disabled={chatLoading}
                />
                <button className="chat-send-btn" onClick={handleAsk} disabled={chatLoading || !chatInput.trim()}>
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

// --- Notes Form ---

const NotesForm: React.FC<{ loadedSong: string | null }> = ({ loadedSong }) => {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateNote>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: { song_name: loadedSong ?? '' },
  });

  const onSubmit = async (data: CreateNote) => {
    setServerError(null);
    setSuccess(false);
    try {
      await notesService.createNote(data);
      setSuccess(true);
      reset({ song_name: loadedSong ?? '' });
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setServerError(detail ?? 'Failed to save note.');
    }
  };

  return (
    <section className="notes-form-section">
      <h3 className="notes-form-heading">Save a Note</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="notes-form" noValidate>
        <div className="notes-form-row">
          <div className="notes-field">
            <label>Song Name</label>
            <input type="text" placeholder="Song name" {...register('song_name')} />
            {errors.song_name && <span className="notes-field-error">{errors.song_name.message}</span>}
          </div>
          <div className="notes-field">
            <label>Artist</label>
            <input type="text" placeholder="Artist" {...register('artist')} />
            {errors.artist && <span className="notes-field-error">{errors.artist.message}</span>}
          </div>
          <div className="notes-field">
            <label>Album</label>
            <input type="text" placeholder="Album" {...register('album')} />
            {errors.album && <span className="notes-field-error">{errors.album.message}</span>}
          </div>
          <div className="notes-field">
            <label>Genre</label>
            <input type="text" placeholder="Genre" {...register('genre')} />
            {errors.genre && <span className="notes-field-error">{errors.genre.message}</span>}
          </div>
        </div>
        <div className="notes-field notes-field-full">
          <label>Notes</label>
          <textarea rows={5} placeholder="Your analysis notes…" {...register('notes')} />
          {errors.notes && <span className="notes-field-error">{errors.notes.message}</span>}
        </div>
        {serverError && <div className="notes-server-error">{serverError}</div>}
        {success && <div className="notes-success">Note saved successfully.</div>}
        <button type="submit" disabled={isSubmitting} className="notes-submit-btn">
          {isSubmitting ? 'Saving…' : 'Save Note'}
        </button>
      </form>
    </section>
  );
};

// --- Notes Tab ---

const NotesTab: React.FC = () => {
  const [filters, setFilters] = useState<NoteFilters>({ genre: '', artist: '', album: '', name: '' });
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesService.getNotes(filters);
      setNotes(data);
      setFetched(true);
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(detail ?? 'Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof NoteFilters, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="notes-tab">
      <div className="notes-filters">
        <input className="notes-filter-input" placeholder="Song name" value={filters.name ?? ''} onChange={(e) => updateFilter('name', e.target.value)} />
        <input className="notes-filter-input" placeholder="Artist" value={filters.artist ?? ''} onChange={(e) => updateFilter('artist', e.target.value)} />
        <input className="notes-filter-input" placeholder="Album" value={filters.album ?? ''} onChange={(e) => updateFilter('album', e.target.value)} />
        <input className="notes-filter-input" placeholder="Genre" value={filters.genre ?? ''} onChange={(e) => updateFilter('genre', e.target.value)} />
        <button className="notes-filter-btn" onClick={fetchNotes} disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      {error && <div className="search-error">{error}</div>}

      {fetched && notes.length === 0 && !loading && (
        <p className="empty">No notes found.</p>
      )}

      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.song_note_id} className="note-card">
            <div className="note-card-header">
              <div className="note-song-info">
                <span className="note-song-name">{note.name}</span>
                <span className="note-artist">{note.artist}</span>
                {note.album && <span className="note-meta">{note.album}</span>}
                {note.genre && <span className="note-genre-chip">{note.genre}</span>}
              </div>
              <span className="note-id">#{note.song_note_id}</span>
            </div>
            <div className="note-body markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.cur_user_notes}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
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
          {s.section_repeat > 1 && <span className="section-repeat">×{s.section_repeat}</span>}
        </div>
        <div className="section-stat">
          <span className="stat-label">Bars</span>
          <span className="stat-value">{s.num_bars}</span>
        </div>
        <div className="section-stat">
          <span className="stat-label">Avg beats / chord</span>
          <span className="stat-value">{s.avg_beats_per_chord_change != null ? s.avg_beats_per_chord_change.toFixed(2) : '—'}</span>
        </div>
        {s.most_frequent_progression.length > 0 && (
          <div className="section-progression">
            <span className="stat-label">Common progression</span>
            <div className="progression-chips">
              {s.most_frequent_progression.map((deg, j) => <span key={j} className="chip">{deg}</span>)}
            </div>
          </div>
        )}
        {s.chords.length > 0 && (
          <div className="section-chords">
            <span className="stat-label">Chords</span>
            <div className="chord-list">
              {s.chords.map((c, j) => <span key={j} className="chord-chip">{c}</span>)}
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
          <th>Beat</th><th>Bar</th><th>Beat in Bar</th><th>Section</th>
          <th>Chord</th><th>Label</th><th>Degree</th><th>Quality</th><th>New</th>
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
