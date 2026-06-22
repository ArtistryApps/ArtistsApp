Now convos between the user and the AI are continuous. However I need 2 things:

* A form between the charts AND the AI convo for sending data to this endpoint over here:
POST api/v1/music/songs/notes
in which the data sent should be in this format:
```json
{
  "genre": "Alternative Rock",
  "album": "III",
  "artist": "Jeremy Elliot",
  "song_name": "I Believe In You",
  "notes": "Based on the chord analysis and mood:\n\n1. **Major Key Focus**: The E major key and predominant use of I-IV-V progressions suggest a bright and accessible sound.\n\n2. **Chord Variations**: Use of minor sevenths and some unconventional transitions, like E:maj/Ab and C#:min7, add sophistication.\n\n3. **Moderate Tempo**: The steady tempo implied by the chord change frequency fits well with genres emphasizing groove and melody.\n\nGiven these elements, the song could fit into genres like pop rock, indie pop, or contemporary country, where catchy melodies and a mix of major and minor chords are common."
}
```

* and another TAB for seeing the notes that was inputted by the user about the songs he's analysed.
    * GET api/v1/music/songs/notes
    * the params are the genre: str, artist: str, album: str, and name: str. 
    * all of them are OPTIONAL.
This is the data that'll typically be returned:
```json
[
  {
    "song_note_id": 1,
    "user": 3,
    "genre": "Alternative Rock",
    "artist": "Jeremy Elliot",
    "album": "III",
    "name": "I Believe In You",
    "cur_user_notes": "Based on the chord analysis and mood:\n\n1. **Major Key Focus**: The E major key and predominant use of I-IV-V progressions suggest a bright and accessible sound.\n\n2. **Chord Variations**: Use of minor sevenths and some unconventional transitions, like E:maj/Ab and C#:min7, add sophistication.\n\n3. **Moderate Tempo**: The steady tempo implied by the chord change frequency fits well with genres emphasizing groove and melody.\n\nGiven these elements, the song could fit into genres like pop rock, indie pop, or contemporary country, where catchy melodies and a mix of major and minor chords are common."
  }
]
```
