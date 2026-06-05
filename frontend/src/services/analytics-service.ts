import apiClient from '@/utils/api-client';
import type { SongAnalytics } from '@/schemas';

export const analyticsService = {
  async getSongAnalytics(songName: string): Promise<SongAnalytics> {
    const encoded = encodeURIComponent(songName);
    const url = `/api/v1/music/songs/${encoded}/analytics`;

    const first = await apiClient.get<SongAnalytics>(url);
    const initial = first.data;

    const maxTotal = Math.max(
      initial['Beat Analysis'].total,
      initial['Section Analysis'].total,
      initial['Chord Analysis'].total,
    );
    const currentLimit = initial['Beat Analysis'].limit;

    if (maxTotal > currentLimit) {
      try {
        const full = await apiClient.get<SongAnalytics>(`${url}?limit=${maxTotal}`);
        return full.data;
      } catch {
        return initial;
      }
    }

    return initial;
  },
};
