/**
 * Custom hook for music analysis operations
 */

import { useState, useCallback } from 'react';
import { musicService } from '@/services/music-service';
import type { SongAnalysis, SongAnalysisRequest } from '@/schemas';

export interface UseMusicAnalysisState {
  data: SongAnalysis | null;
  loading: boolean;
  error: Error | null;
}

export const useMusicAnalysis = () => {
  const [state, setState] = useState<UseMusicAnalysisState>({
    data: null,
    loading: false,
    error: null,
  });

  const analyzeSong = useCallback(async (request: SongAnalysisRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await musicService.analyzeSong(request);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const getSongAnalysis = useCallback(async (songId: number) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await musicService.getSongAnalysis(songId);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return {
    ...state,
    analyzeSong,
    getSongAnalysis,
  };
};
