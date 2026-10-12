// main.js: {{NAME}}, in the pixel style. Storyboard: ../STORYBOARD.md. Write that first and have it approved.
// Times are film time (t) in seconds; lt is time since the shot began. A frame is a pure function of t.
// The engine is src/pixel/px.js; skill/lyric-mv-opus-5-5/references/pixel-style.md says what is in it.
(() => {
  // ---------- the words: [start, end, text, who]. Starts come from the .lrc; ends are yours. ----------
  const LINES = [
    // [1.2, 3.4, '第一句歌词', 'c'],
  ];
  const WHO = { c: () => ({ name: 'Clawd', face: clawdFace(4, { mouth: 'smile' }) }) };
  function lyric(t) {
    const line = LINES.find(([a, b]) => t >= a && t < b + .12);
    // with assets/timings.js loaded, pass { times: … } so each character is typed when it is sung
    dialogue(t, line, WHO[line ? line[3] : 'c'](t));
  }

  // ---------- sets: draw each place once, as a function ----------
  function room() { box(0, 0, W, H, '#14112E'); tiles(0, 440, W, 400, 60, '#1B1740', '#211C4C'); box(0, 432, W, 8, '#2C2660'); }

  // ---------- shots ----------
  function opening(t, lt, dur) {
    room();
    pclawd(960, 720, 4, 7, { mouth: 'smile', dy: -8 * pulse(t, 5) });     // everything moves on the beat
    if (lt < .3) shade(1 - lt / .3, '#07051A');
    dust(t); vignette(.55);
    lyric(t);
  }
  shots([[0, opening]]);
})();
