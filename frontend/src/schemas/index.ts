/**
 * Zod schemas for API contracts
 * All API response models are defined here
 */

import { z } from 'zod';

// Beat schema
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

// Song schema
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

// Section schema
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

// Song Analysis response schema
export const SongAnalysisSchema = z.object({
  song: SongSchema,
  beats: z.array(BeatSchema),
  sections: z.array(SectionSchema),
});

export type SongAnalysis = z.infer<typeof SongAnalysisSchema>;

// Song Analysis request schema
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

// Health check response
export const HealthCheckSchema = z.object({
  status: z.string(),
  service: z.string(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;
