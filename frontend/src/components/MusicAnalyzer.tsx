/**
 * Music analyzer component
 * Demonstrates form handling with react-hook-form, setValue, trigger, getValues
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMusicAnalysis } from '@/hooks/useMusicAnalysis';
import { useFormHelpers } from '@/hooks/useForm';
import './MusicAnalyzer.css';

const AnalyzerSchema = z.object({
  songName: z.string().min(1, 'Song name is required'),
  artist: z.string().min(1, 'Artist name is required'),
  key: z.string().default('C'),
  bpm: z.coerce.number().positive().optional(),
});

type AnalyzerFormData = z.infer<typeof AnalyzerSchema>;

export const MusicAnalyzer: React.FC = () => {
  const { register, handleSubmit, setValue, trigger, getValues, formState: { errors } } = useForm<AnalyzerFormData>({
    resolver: zodResolver(AnalyzerSchema),
    defaultValues: {
      key: 'C',
    },
  });

  const { loading, error, data } = useMusicAnalysis();
  const { updateFieldValue } = useFormHelpers({ setValue, trigger, getValues });

  const onSubmit = async (formData: AnalyzerFormData) => {
    try {
      // Example: You would collect beats data elsewhere
      // For now, this demonstrates the form pattern
      console.log('Form submitted with:', formData);
      
      // In a real scenario, you'd prepare beats data
      // const result = await analyzeSong({
      //   song_data: {
      //     name: formData.songName,
      //     artist: formData.artist,
      //     key: formData.key,
      //     bpm: formData.bpm,
      //   },
      //   beats: [...],
      // });
    } catch (err) {
      console.error('Error analyzing song:', err);
    }
  };

  const handleKeyChange = async (newKey: string) => {
    // Demonstrates setValue + trigger pattern for custom dropdown
    await updateFieldValue('key', newKey);
  };

  return (
    <div className="music-analyzer">
      <h2>Music Analyzer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-group">
          <label htmlFor="songName">Song Name</label>
          <input
            id="songName"
            type="text"
            placeholder="Enter song name"
            {...register('songName')}
          />
          {errors.songName && <span className="error">{errors.songName.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            id="artist"
            type="text"
            placeholder="Enter artist name"
            {...register('artist')}
          />
          {errors.artist && <span className="error">{errors.artist.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="key">Musical Key</label>
          <select
            id="key"
            value={getValues('key')}
            onChange={(e) => handleKeyChange(e.target.value)}
          >
            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bpm">BPM (Optional)</label>
          <input
            id="bpm"
            type="number"
            placeholder="Enter BPM"
            {...register('bpm')}
          />
          {errors.bpm && <span className="error">{errors.bpm.message}</span>}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Analyzing...' : 'Analyze Song'}
        </button>
      </form>

      {error && <div className="error-message">{error.message}</div>}

      {data && (
        <div className="analysis-result">
          <h3>Analysis Results</h3>
          <div className="song-info">
            <p><strong>Song:</strong> {data.song.name}</p>
            <p><strong>Artist:</strong> {data.song.artist}</p>
            <p><strong>Key:</strong> {data.song.key}</p>
            {data.song.bpm && <p><strong>BPM:</strong> {data.song.bpm}</p>}
          </div>
          <div className="sections-info">
            <h4>Sections ({data.sections.length})</h4>
            {data.sections.map((section, idx) => (
              <div key={idx} className="section-card">
                <p><strong>{section.section}</strong></p>
                <p>Bars: {section.num_bars}</p>
                <p>Chords: {section.chords?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
