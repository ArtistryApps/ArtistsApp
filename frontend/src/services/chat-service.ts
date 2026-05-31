import apiClient from '@/utils/api-client';

export const chatService = {
  async ask(prompt: string): Promise<string> {
    const res = await apiClient.post('/api/v1/music/songs/ai-analysis', { prompt });
    console.log(res.data)
    return res.data.analysis ?? '';
  },
};
