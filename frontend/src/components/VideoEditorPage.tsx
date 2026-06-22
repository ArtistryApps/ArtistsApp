import { useState, useRef } from 'react';
import { videoService } from '@/services/video-service';
import './VideoEditorPage.css';

interface VideoEditorPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function VideoEditorPage({ onBack, onLogout }: VideoEditorPageProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!videoFile || !audioFile) return;
    setError(null);
    setResultUrl(null);
    setProcessing(true);
    try {
      const blob = await videoService.joinAudioVideo(videoFile, audioFile, removeAudio);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  const clearResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
  };

  const pickVideo = (file: File | undefined) => {
    if (!file) return;
    clearResult();
    setVideoFile(file);
  };

  const pickAudio = (file: File | undefined) => {
    if (!file) return;
    clearResult();
    setAudioFile(file);
  };

  const canSubmit = !!videoFile && !!audioFile && !processing;

  return (
    <div className="video-editor-page">
      <header className="video-editor-header">
        <div className="video-editor-brand">
          <span className="video-editor-icon">🎬</span>
          <span className="video-editor-title">Video Editor</span>
        </div>
        <div className="video-editor-header-actions">
          <button className="header-btn" onClick={onBack}>← Back</button>
          <button className="header-btn" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="video-editor-body">
        <div>
          <h1 className="video-editor-section-title">Join Audio & Video</h1>
          <p className="video-editor-section-sub">
            Upload a video and an audio file — the audio will be aligned and merged into the video.
          </p>
        </div>

        <div className="upload-grid">
          {/* Video upload */}
          <div
            className={`upload-zone ${videoFile ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('dragover');
              pickVideo(e.dataTransfer.files[0]);
            }}
            onClick={() => !videoFile && videoInputRef.current?.click()}
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => pickVideo(e.target.files?.[0])}
            />
            {videoFile && (
              <button
                className="upload-zone-clear"
                onClick={(e) => { e.stopPropagation(); setVideoFile(null); clearResult(); }}
                title="Remove"
              >×</button>
            )}
            <span className="upload-zone-icon">🎥</span>
            <span className="upload-zone-label">Video file</span>
            {videoFile
              ? <span className="upload-zone-filename">{videoFile.name}</span>
              : <span className="upload-zone-hint">Click or drag & drop<br />MP4, MOV, AVI…</span>
            }
          </div>

          {/* Audio upload */}
          <div
            className={`upload-zone ${audioFile ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('dragover');
              pickAudio(e.dataTransfer.files[0]);
            }}
            onClick={() => !audioFile && audioInputRef.current?.click()}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => pickAudio(e.target.files?.[0])}
            />
            {audioFile && (
              <button
                className="upload-zone-clear"
                onClick={(e) => { e.stopPropagation(); setAudioFile(null); clearResult(); }}
                title="Remove"
              >×</button>
            )}
            <span className="upload-zone-icon">🎵</span>
            <span className="upload-zone-label">Audio file</span>
            {audioFile
              ? <span className="upload-zone-filename">{audioFile.name}</span>
              : <span className="upload-zone-hint">Click or drag & drop<br />MP3, WAV, FLAC…</span>
            }
          </div>
        </div>

        <label className="options-row">
          <input
            type="checkbox"
            className="options-checkbox"
            checked={removeAudio}
            onChange={(e) => setRemoveAudio(e.target.checked)}
          />
          <span className="options-label">
            Remove original audio from video
            <span>Strip the existing audio track from the video before merging</span>
          </span>
        </label>

        <button
          className={`submit-btn ${processing ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {processing ? 'Processing…' : 'Merge Audio & Video'}
        </button>

        {processing && (
          <div className="status-box processing">
            <div className="spinner" />
            Processing your files — this may take a minute for large uploads…
          </div>
        )}

        {error && (
          <div className="status-box error">
            ⚠ {error}
          </div>
        )}

        {resultUrl && (
          <div className="result-box">
            <span className="result-title">✓ Done — your video is ready</span>
            <video className="result-video" src={resultUrl} controls />
            <a
              className="download-btn"
              href={resultUrl}
              download="merged-video.mp4"
            >
              Download MP4
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
