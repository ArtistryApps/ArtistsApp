3 Things now:

- I want you to add another collection to the same database you've been using on mongo to store the user id, the song name, AND the response ID of the conversation, so that the user can talk to the AI continuously instead of only once. The response_id is now made available after asking the ai to analyse the song as an instance variable of the class MusicAnalyticsAssistant of the MusicReader internally managed library.

- Whenever the user makes another call to the the endpoint tha TALKS to MusicAnalyticsAssistant, it should be queried to know the latest response_id, if THERE IS such response_id, then it uses it, otherwise it doesn`t (obviously). In the end the current cache with User Id Song Name and Response ID WILL BE OVERRIDDEN. The document will only ever be removed once the user either logs out or his session ends, THEN the document should ALWAYS be removed from the database, otherwise an unecessary chain of responses will be constantly used.

- Now I want you to add a new endpoint for sending song data to Supabase.
- The user should Include the song's genre as of his research, the song ALBUM, the song ARTIST, the song NAME, AND his user notes about the song. It's quite like a form. All the database tables regarding each and every one of these factors should THEN be updated, including the last time checked.

- There should be *an* option (endpoint) for the user to filter songs, and it'll return a table whose model looks like this:

```
Songs:
    song_note_id
    user
    genre
    artist
    album
    name    
    cur_user_notes
```



