// config.js: project settings.
//   duration: the video's length in seconds.
//   bpm:      the rhythm that bounces, dances and pulse() follow. Clawd always moves to some beat; if the video has music,
//             set this to the song's tempo, and set offset to the time in seconds of its first downbeat
//             (scripts/analyze_audio.mjs measures both).
//   audio:    the song, relative to the folder studio.html is in; --clip and --encode mux it in.
const PROJECT = { duration: 11, bpm: 120, offset: 0 };
