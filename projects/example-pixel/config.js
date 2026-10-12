// config.js: this film's settings. Measure bpm and offset with scripts/analyze_audio.mjs; do not guess them.
//   duration: length in seconds.   bpm: the song's tempo.   offset: the time of its first downbeat, in seconds.
//   audio:    the song file, relative to this folder (assets/…). It is muxed in when the film is encoded.
const PROJECT = { duration: 8, bpm: 120, offset: 0 };
