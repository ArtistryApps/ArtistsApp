the github agent made a simple boilerplate here just establishing the project structure. Now what you gotta know is that there is a simple interface I'll want for this frontend. It'll be calling the api on port 8080, and it'll be obtaining data in this format:

{
  "Beat Analysis": [
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
      "chord": null,
      "label": "",
      "is_new": true,
      "section": "intro",
      "section_repeat": 1,
      "chord_degree": null,
      "chord_quality": null
    },
    {
      "beat": 3,
      "bar": 0,
      "bar_in_section": 0,
      "beat_in_bar": 4,
      "chord": "N",
      "label": "𝄽",
      "is_new": true,
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


this is one of the keys
another:

  "Section Analysis": [
    {
      "section": "intro",
      "section_repeat": 1,
      "chords": [],
      "num_bars": 2,
      "most_frequent_progression": [
        "N"
      ],
      "avg_beats_per_chord_change": 1
    },


another:

   },
    {
      "section": "outro",
      "section_repeat": 1,
      "chords": [
        "C:maj",
        "E:min7",
        "F:maj",
        "A:min",
        "G:maj"
      ],
      "num_bars": 19,
      "most_frequent_progression": [
        "I",
        "III",
        "IV",
        "VI"
      ],
      "avg_beats_per_chord_change": 10.714285714285714
    }
  ],
  "Chord Analysis": [
    {
      "section": "intro (1)",
      "beat 1": "",
      "beat 2": "",
      "beat 3": "",
      "beat 4": "N",
      "beat 5": "N",
      "beat 6": "N",
      "beat 7": "N",
      "beat 8": "N",
      "beat 9": "C:maj",
      "beat 10": "C:maj",
      "beat 11": "C:maj",
      "beat 12": "C:maj",
      "beat 13": "C:maj",
      "beat 14": "C:maj",
      "beat 15": "C:maj",
      "beat 16": "C:maj"
    },
    {
      "section": "verse (1)",
      "beat 1": "C:maj",
      "beat 2": "C:maj",
      "beat 3": "C:maj",
      "beat 4": "C:maj",
      "beat 5": "C:maj",
      "beat 6": "C:maj",
      "beat 7": "C:maj",
      "beat 8": "C:maj",
      "beat 9": "F:maj",
      "beat 10": "F:maj",
      "beat 11": "F:maj",
      "beat 12": "F:maj",
      "beat 13": "F:maj",
      "beat 14": "F:maj",
      "beat 15": "F:maj",
      "beat 16": "F:maj"
    },
    {
      "section": "verse (2)",


this is the api you can check out its endpoints http://localhost:8080
Initially, you need a login first page where the user inserts his username and password. When he clicks on login your session is started and all other non-login related endpoints can now be called. The first endpoint you'll need is this one:

http://localhost:8080/api/v1/music/songs/{song_name}/analytics

once you call it you'll be able to call any other endpoints. But I want you initially to take that returned value I sent you and give me a proper web page for it
