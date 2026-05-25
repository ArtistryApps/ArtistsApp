/**
 * Type definitions for the application
 */

export type Beat = {
  beat_index: number;
  bar_number: number;
  beat_in_bar: number;
  chord?: string;
  chord_degree?: string;
  chord_quality?: string;
  is_new: boolean;
  section?: string;
  section_repeat?: number;
  bar_in_section?: number;
};

export type Song = {
  id: number;
  name: string;
  artist: string;
  key: string;
  bpm?: number;
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: number;
  section_name: string;
  section_repeat: number;
  chords: string[];
  num_bars: number;
  most_frequent_progression: string[];
  avg_beats_per_chord_change?: number;
};

export type SongAnalysis = {
  song: Song;
  beats: Beat[];
  sections: Section[];
};
