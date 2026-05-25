/**
 * Music API service - Handles all music-related API calls
 */

import axiosInstance from '@/utils/api-client';
import { SongAnalysisRequestSchema, SongAnalysisSchema } from '@/schemas';
import type { SongAnalysis, SongAnalysisRequest } from '@/schemas';

export const musicService = {
  /**
   * Analyze a song with beats
   */
  async analyzeSong(data: SongAnalysisRequest): Promise<SongAnalysis> {
    const validated = SongAnalysisRequestSchema.parse(data);
    const response = await axiosInstance.post('/music/analyze', validated);
    return SongAnalysisSchema.parse(response.data);
  },

  /**
   * Get song analysis by ID
   */
  async getSongAnalysis(songId: number): Promise<SongAnalysis> {
    const response = await axiosInstance.get(`/music/song/${songId}`);
    return SongAnalysisSchema.parse(response.data);
  },
};
