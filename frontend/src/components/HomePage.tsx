import './HomePage.css';

type Page = 'analytics' | 'video' | 'stem';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function HomePage({ onNavigate, onLogout }: HomePageProps) {
  return (
    <div className="home-page">
      <button className="home-logout" onClick={onLogout}>
        Log out
      </button>

      <div className="home-header">
        <div className="home-logo">
          <span className="home-logo-icon">🎵</span>
        </div>
        <h1 className="home-title">Artist Studio</h1>
        <p className="home-subtitle">Select a tool to get started</p>
      </div>

      <div className="home-cards">
        <button
          className="feature-card"
          onClick={() => onNavigate('analytics')}
        >
          <div className="feature-icon-wrapper analytics">📊</div>
          <h2 className="feature-card-title">Song Analytics</h2>
          <p className="feature-card-desc">
            Analyze beats, chords, and sections. Get AI-powered insights and take notes on your tracks.
          </p>
          <span className="feature-card-badge available">Available</span>
        </button>

        <button
          className="feature-card"
          onClick={() => onNavigate('video')}
        >
          <div className="feature-icon-wrapper video">🎬</div>
          <h2 className="feature-card-title">Video Editing</h2>
          <p className="feature-card-desc">
            Merge an audio track with a video file, with optional removal of the original audio.
          </p>
          <span className="feature-card-badge available">Available</span>
        </button>

        <button
          className="feature-card coming-soon"
          disabled
        >
          <div className="feature-icon-wrapper stem">🎛️</div>
          <h2 className="feature-card-title">Stem Separation</h2>
          <p className="feature-card-desc">
            Isolate vocals, drums, bass, and instruments into individual stems for remixing.
          </p>
          <span className="feature-card-badge soon">Coming Soon</span>
        </button>
      </div>
    </div>
  );
}
