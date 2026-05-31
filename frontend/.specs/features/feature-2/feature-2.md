I want you to apply these 2 changes:

1. I want you to apply a correction to the analytics-service.ts
- The new format that's being returned is the following one:

```json 
{
  "Beat Analysis": {
    "total": 390,
    "offset": 0,
    "limit": 10,
    "data": [
      {
        "beat": 0,
        "bar": 0,
        "bar_in_section": 0,
        "beat_in_bar": 1,
        "chord": null,
        "label": "",
        "is_new": true,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": null
      },
      {
        "beat": 1,
        "bar": 0,
        "bar_in_section": 0,
        "beat_in_bar": 2,
        "chord": null,
        "label": "",
        "is_new": true,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": null
      },
      {
        "beat": 2,
        "bar": 0,
        "bar_in_section": 0,
        "beat_in_bar": 3,
        "chord": "N",
        "label": "𝄽",
        "is_new": true,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": ""
      },
      {
        "beat": 3,
        "bar": 0,
        "bar_in_section": 0,
        "beat_in_bar": 4,
        "chord": "N",
        "label": "𝄽",
        "is_new": false,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": ""
      },
      {
        "beat": 4,
        "bar": 1,
        "bar_in_section": 1,
        "beat_in_bar": 1,
        "chord": "N",
        "label": "𝄽",
        "is_new": false,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": ""
      },
      {
        "beat": 5,
        "bar": 1,
        "bar_in_section": 1,
        "beat_in_bar": 2,
        "chord": "N",
        "label": "𝄽",
        "is_new": false,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": ""
      },
      {
        "beat": 6,
        "bar": 1,
        "bar_in_section": 1,
        "beat_in_bar": 3,
        "chord": "N",
        "label": "𝄽",
        "is_new": false,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": ""
      },
      {
        "beat": 7,
        "bar": 1,
        "bar_in_section": 1,
        "beat_in_bar": 4,
        "chord": "N",
        "label": "𝄽",
        "is_new": false,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": null,
        "chord_quality": ""
      },
      {
        "beat": 8,
        "bar": 2,
        "bar_in_section": 2,
        "beat_in_bar": 1,
        "chord": "E:5",
        "label": "Mi⁵",
        "is_new": true,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": "I",
        "chord_quality": "5"
      },
      {
        "beat": 9,
        "bar": 2,
        "bar_in_section": 2,
        "beat_in_bar": 2,
        "chord": "E:5",
        "label": "Mi⁵",
        "is_new": false,
        "section": "intro",
        "section_repeat": 1,
        "chord_degree": "I",
        "chord_quality": "5"
      }
    ]
  },
  "Section Analysis": {
    "total": 25,
    "offset": 0,
    "limit": 10,
    "data": [
      {
        "section": "intro (1)",
        "beat 1": "",
        "beat 2": "",
        "beat 3": "N",
        "beat 4": "N",
        "beat 5": "N",
        "beat 6": "N",
        "beat 7": "N",
        "beat 8": "N",
        "beat 9": "E:5",
        "beat 10": "E:5",
        "beat 11": "E:5",
        "beat 12": "E:maj",
        "beat 13": "E:maj",
        "beat 14": "E:maj",
        "beat 15": "E:maj",
        "beat 16": "E:maj"
      },
      {
        "section": "intro (2)",
        "beat 1": "E:maj",
        "beat 2": "E:maj",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "E:maj",
        "beat 10": "E:maj",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "intro (3)",
        "beat 1": "C#:min7",
        "beat 2": "C#:min",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "F#:min7",
        "beat 10": "F#:min7",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "verse (1)",
        "beat 1": "E:maj",
        "beat 2": "E:maj",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "E:maj",
        "beat 10": "E:maj",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "verse (2)",
        "beat 1": "C#:min7",
        "beat 2": "C#:min7",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "F#:min7",
        "beat 10": "F#:min7",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "verse (3)",
        "beat 1": "C#:min7",
        "beat 2": "C#:min7",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "C#:min7",
        "beat 10": "C#:min7",
        "beat 11": "B:maj",
        "beat 12": "A:maj",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "verse (4)",
        "beat 1": "C#:min7",
        "beat 2": "C#:min7",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "F#:min7",
        "beat 10": "F#:min7",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "chorus (1)",
        "beat 1": "E:maj",
        "beat 2": "E:maj",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "E:maj",
        "beat 10": "E:maj",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "chorus (2)",
        "beat 1": "C#:min7",
        "beat 2": "C#:min7",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "F#:min7",
        "beat 10": "F#:min7",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      },
      {
        "section": "verse (5)",
        "beat 1": "E:maj",
        "beat 2": "E:maj",
        "beat 3": "B:maj",
        "beat 4": "B:maj",
        "beat 5": "A:maj",
        "beat 6": "A:maj",
        "beat 7": "A:maj",
        "beat 8": "A:maj",
        "beat 9": "E:maj",
        "beat 10": "E:maj",
        "beat 11": "E:maj/Ab",
        "beat 12": "E:maj/Ab",
        "beat 13": "A:maj",
        "beat 14": "A:maj",
        "beat 15": "A:maj",
        "beat 16": "A:maj"
      }
    ]
  },
  "Chord Analysis": {
    "total": 6,
    "offset": 0,
    "limit": 10,
    "data": [
      {
        "section": "intro",
        "section_repeat": 1,
        "chords": [
          "E:5",
          "E:maj",
          "B:maj",
          "A:maj",
          "E:maj/Ab",
          "C#:min7",
          "C#:min",
          "F#:min7"
        ],
        "num_bars": 12,
        "most_frequent_progression": [
          "N",
          "I",
          "I",
          "V"
        ],
        "avg_beats_per_chord_change": 2.75
      },
      {
        "section": "verse",
        "section_repeat": 1,
        "chords": [
          "E:maj",
          "B:maj",
          "A:maj",
          "E:maj/Ab",
          "C#:min7",
          "F#:min7"
        ],
        "num_bars": 16,
        "most_frequent_progression": [
          "IV",
          "VI",
          "V",
          "IV"
        ],
        "avg_beats_per_chord_change": 2.608695652173913
      },
      {
        "section": "chorus",
        "section_repeat": 1,
        "chords": [
          "E:maj",
          "B:maj",
          "A:maj",
          "E:maj/Ab",
          "C#:min7",
          "F#:min7"
        ],
        "num_bars": 8,
        "most_frequent_progression": [
          "I",
          "V",
          "IV",
          "I"
        ],
        "avg_beats_per_chord_change": 2.5454545454545454
      },
      {
        "section": "verse",
        "section_repeat": 2,
        "chords": [
          "E:maj",
          "B:maj",
          "A:maj",
          "E:maj/Ab",
          "C#:min7",
          "F#:min7",
          "G#:min"
        ],
        "num_bars": 16,
        "most_frequent_progression": [
          "IV",
          "VI",
          "V",
          "IV"
        ],
        "avg_beats_per_chord_change": 2.5652173913043477
      },
      {
        "section": "chorus",
        "section_repeat": 2,
        "chords": [
          "E:maj",
          "B:maj",
          "A:maj",
          "E:maj/Ab",
          "C#:min7",
          "F#:min",
          "G#:min",
          "G#:maj",
          "C#:min"
        ],
        "num_bars": 27,
        "most_frequent_progression": [
          "I",
          "IV",
          "VI",
          "V"
        ],
        "avg_beats_per_chord_change": 2.967741935483871
      },
      {
        "section": "outro",
        "section_repeat": 1,
        "chords": [
          "E:maj",
          "B:maj",
          "A:maj",
          "C#:min",
          "F#:min7",
          "E:min"
        ],
        "num_bars": 19,
        "most_frequent_progression": [
          "I",
          "V",
          "IV",
          "I"
        ],
        "avg_beats_per_chord_change": 3.3181818181818183
      }
    ]
  }
}

```
---

I want you to take this new format into account and adjust so that the whole data will be available on the page. Lookup the total and see if the limit on it is too small, if it is, then widen it up on the next call (with the same song name because it'll be stored on the database) so the whole thing will be returned

---

- Second, I want you to add an option for the user to add a prompt on the bottom of the page (regardless of what active tab the user has). Then an LLM model will return a message in markdown responding to whatever question the user made about the song and I want you to render it properly.

