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
  avg_beats_per_chord_change: z.number(),
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
  'Section Analysis': Paginated(ChordRowSchema),
  'Chord Analysis': Paginated(SectionEntrySchema),
});
export type SongAnalytics = z.infer<typeof SongAnalyticsSchema>;

// --- Legacy schemas (kept for existing service code) ---

export const BeatSchema = z.object({
  beat_index: z.number(),
  bar_number: z.number(),
  beat_in_bar: z.number(),
  chord: z.string().optional(),
  chord_degree: z.string().optional(),
  chord_quality: z.string().optional(),
  is_new: z.boolean().default(false),
  section: z.string().optional(),
  section_repeat: z.number().default(1),
  bar_in_section: z.number().optional(),
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
  section_name: z.string(),
  section_repeat: z.number(),
  chords: z.array(z.string()),
  num_bars: z.number(),
  most_frequent_progression: z.array(z.string()),
  avg_beats_per_chord_change: z.number().optional(),
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
