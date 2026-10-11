// main.js: {{NAME}}. Storyboard: ../STORYBOARD.md. Write that first and have it approved; this file is a skeleton.
// Times are film time (t) in seconds; lt is time since the shot began. A frame is a pure function of t.
(() => {
  // ---------- the words ----------
  // One entry a lyric line: [start, end, text, { size, y, colour }]. Starts come from the .lrc; ends are yours to set
  // (a line leaves before the next arrives). A word that is lettered on its own in the picture is left out of here.
  const LINES = [
    // [1.2, 3.4, '第一句歌词'],
  ];

  // ---------- set pieces: paint each background once, as a function, and reuse it across shots ----------
  function meadow(t) {
    boilSeed('sky'); paint(rectPts(-400, -400, W + 800, H + 800), { wash: '#C4E6F3', ink: null });   // oversized: cameras move
    boilSeed('ground'); paint(rectPts(-400, 860, W + 800, 500, 3), { wash: '#84BF74', washOp: 255, ink: null });
    inkLine([[-300, 862], [W / 2, 856], [W + 300, 863]], 1, PAL.ink, 'ink', .5);
  }

  // ---------- shots ----------
  function opening(t, lt, dur) {
    camBegin(960 + 12 * Math.sin(lt * .7), 540, 1 + .015 * lt);          // the camera is never dead
    meadow(t);
    const mood = emotions(t, [[0, 'neutral'], [1.2, 'surprised'], [1.8, 'happy']]);   // acted changes, never swapped faces
    clawd(960, 860, 26, { ...mood, boilKey: 'clawd' });                 // boilKey: a stable id for anyone who comes and goes
    camEnd();
    boilSeed('transition');
    if (lt < 1) flash(1 - ease(lt), PAL.paper);                           // in from paper
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);                 // out: the next shot finishes the wipe
  }

  // every shot gets the subtitles on top; CAM is cleared so they sit in frame space
  const sub = fn => (t, lt, dur) => { fn(t, lt, dur); CAM = null; subtitles(t, LINES); };
  shots([[0, opening]].map(([t0, fn]) => [t0, sub(fn)]));
})();
