import apiClient from '@/utils/api-client';
import type { CreateNote, NoteEntry, NoteFilters } from '@/schemas';

export const notesService = {
  async createNote(data: CreateNote): Promise<void> {
    await apiClient.post('/api/v1/music/songs/notes', data);
  },

  async getNotes(filters?: NoteFilters): Promise<NoteEntry[]> {
    const params = filters
      ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null))
      : {};
    const res = await apiClient.get('/api/v1/music/songs/notes', { params });
    return res.data;
  },
};
