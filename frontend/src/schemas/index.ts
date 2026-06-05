import { z } from 'zod';

// --- Auth ---

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const SessionResponseSchema = z.object({
  session_token: z.string(),
  user_id: z.number(),
  email: z.string(),
});
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

// --- Analytics ---

export const BeatEntrySchema = z.object({
  beat: z.number(),
  bar: z.number(),
  bar_in_section: z.number(),
  beat_in_bar: z.number(),
  chord: z.string().nullable(),
  label: z.string(),
  is_new: z.boolean(),
  section: z.string(),
  section_repeat: z.number(),
  chord_degree: z.string().nullable(),
  chord_quality: z.string().nullable(),
});
export type BeatEntry = z.infer<typeof BeatEntrySchema>;

export const SectionEntrySchema = z.object({
  section: z.string(),
  section_repeat: z.number(),
  chords: z.array(z.string()),
  num_bars: z.number(),
  most_frequent_progression: z.array(z.string()),
  avg_beats_per_chord_change: z.number().nullable().optional(),
});
export type SectionEntry = z.infer<typeof SectionEntrySchema>;

export const ChordRowSchema = z.record(z.string(), z.string());
export type ChordRow = z.infer<typeof ChordRowSchema>;

const Paginated = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    total: z.number(),
    offset: z.number(),
    limit: z.number(),
    data: z.array(itemSchema),
  });

export const SongAnalyticsSchema = z.object({
  'Beat Analysis': Paginated(BeatEntrySchema),
  'Section Analysis': Paginated(SectionEntrySchema),
  'Chord Analysis': Paginated(ChordRowSchema),
});
export type SongAnalytics = z.infer<typeof SongAnalyticsSchema>;

// --- Notes ---

export const CreateNoteSchema = z.object({
  genre: z.string().min(1, 'Genre is required'),
  album: z.string().min(1, 'Album is required'),
  artist: z.string().min(1, 'Artist is required'),
  song_name: z.string().min(1, 'Song name is required'),
  notes: z.string().min(1, 'Notes are required'),
});
export type CreateNote = z.infer<typeof CreateNoteSchema>;

export const NoteEntrySchema = z.object({
  song_note_id: z.number(),
  user: z.number(),
  genre: z.string(),
  artist: z.string(),
  album: z.string(),
  name: z.string(),
  cur_user_notes: z.string(),
});
export type NoteEntry = z.infer<typeof NoteEntrySchema>;

export const NoteFiltersSchema = z.object({
  genre: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  name: z.string().optional(),
});
export type NoteFilters = z.infer<typeof NoteFiltersSchema>;

// --- Legacy schemas (kept for existing service code) ---

export const BeatSchema = z.object({
  bar: z.number(),
  bar_number: z.number(),
  beat: z.number(),
  beat_in_bar: z.number(),
  chord: z.string().optional(),
  chord_degree: z.string().optional(),
  chord_quality: z.string().optional(),
  is_new: z.boolean().default(false),
  label: z.string().optional(),
  section: z.number().optional(),
  section_repeat: z.number().default(1),
});
export type Beat = z.infer<typeof BeatSchema>;

export const SongSchema = z.object({
  id: z.number(),
  name: z.string(),
  artist: z.string(),
  key: z.string(),
  bpm: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Song = z.infer<typeof SongSchema>;

export const SectionSchema = z.object({
  id: z.number(),
  avg_beats_per_chord_change: z.number().optional(),
  chords: z.array(z.string()).optional(),
  most_frequent_progression: z.array(z.string()).optional(),
  num_bars: z.number().optional(),
  section: z.string(),
  section_repeat: z.number(),
});
export type Section = z.infer<typeof SectionSchema>;

export const SongAnalysisSchema = z.object({
  song: SongSchema,
  beats: z.array(BeatSchema),
  sections: z.array(SectionSchema),
});
export type SongAnalysis = z.infer<typeof SongAnalysisSchema>;

export const SongAnalysisRequestSchema = z.object({
  song_data: z.object({
    name: z.string(),
    artist: z.string(),
    key: z.string().default('C'),
    bpm: z.number().optional(),
  }),
  beats: z.array(BeatSchema),
});
export type SongAnalysisRequest = z.infer<typeof SongAnalysisRequestSchema>;

export const HealthCheckSchema = z.object({
  status: z.string(),
  service: z.string(),
});
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
