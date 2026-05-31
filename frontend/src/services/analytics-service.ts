import apiClient from '@/utils/api-client';
import { SongAnalyticsSchema } from '@/schemas';
import type { SongAnalytics } from '@/schemas';

export const analyticsService = {
  async getSongAnalytics(songName: string): Promise<SongAnalytics> {
    const encoded = encodeURIComponent(songName);
    const url = `/api/v1/music/songs/${encoded}/analytics`;
    console.log("I'm here");
    const first = await apiClient.get(url);
    const initial = SongAnalyticsSchema.parse(first.data);
    
    console.log("I'm here 2");
    const maxTotal = Math.max(
      initial['Beat Analysis'].total,
      initial['Section Analysis'].total,
      initial['Chord Analysis'].total,
    );
    const currentLimit = initial['Beat Analysis'].limit;
    console.log("I'm here 3");

    if (maxTotal > currentLimit) {
      const full = await apiClient.get(`${url}?limit=${maxTotal}`);
      return SongAnalyticsSchema.parse(full.data);
    }

    return initial;
  },
};
