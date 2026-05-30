import apiClient from '@/utils/api-client';
import { SongAnalyticsSchema } from '@/schemas';
import type { SongAnalytics } from '@/schemas';

export const analyticsService = {
  async getSongAnalytics(songName: string): Promise<SongAnalytics> {
    const response = await apiClient.get(`/api/v1/music/songs/${encodeURIComponent(songName)}/analytics`);
    return SongAnalyticsSchema.parse(response.data);
  },
};
