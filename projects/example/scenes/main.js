// main.js: "Hello, Earth", a nine-second example with no song, to show a lyric video's moving parts and to test a
// fresh install end to end: a set piece, acted emotions, two guests, subtitles, a word lettered large, a speech
// bubble, a firework, transitions in, between and out. The four lines are ours; use them as you like.
//   node ../../scripts/render_all.mjs --out=out/example.mp4
(() => {
  const LINES = [[.9, 2.5, '你好，地球'], [2.9, 4.4, 'hello, hello', { size: 54 }], [6.2, 8.2, '今天天气真好']];
  const G = 860;

  function meadow(t) {
    boilSeed('sky'); paint(rectPts(-400, -400, W + 800, H + 800), { wash: '#C4E6F3', ink: null });
    glow(1540, 200, 260, '#FFF3C4', .7); boilSeed('sun'); paint(ellPts(1540, 200, 78, 78, 24, 1.5), { wash: '#FFE9A8', ink: PAL.ink, sw: .8 });
    boilSeed('hills'); paint(ellPts(520, 1010, 900, 300, 34, 2), { wash: '#A8D49A', fill: PAL.sap, fillOp: 60, tex: .6, ink: PAL.ink, sw: .9 });
    paint(rectPts(-400, G - 12, W + 800, 500, 3), { wash: '#84BF74', washOp: 255, ink: null });
    inkLine([[-300, G - 10], [W / 2, G - 16], [W + 300, G - 9]], 1, PAL.ink, 'ink', .5);
  }

  // A: Clawd turns up, and is greeted
  function hello(t, lt, dur) {
    camBegin(960 + 10 * Math.sin(lt * .8), 548, 1 + .012 * lt);
    meadow(t);
    const w = stroll(t, .2, 1.3, 300, 760, 24);
    whale(1500, 780, 20, { ...whale.emotions(t, [[0, 'neutral'], [1.5, 'happy']]), flip: true, spout: t > 3 ? Math.sin(seg(t, 3, 4) * Math.PI) : 0, boilKey: 'whale' });
    doubao(1180, G, 15, { ...emotions(t, [[0, 'neutral', { lookX: -.8 }], [1.5, 'cheer']]), boilKey: 'doubao' });
    clawd(w.x, G, 24, { ...moods(emotions(t, [[0, 'neutral'], [1.4, 'surprised', { lookX: .8 }], [2.1, 'happy', { lookX: .6 }]]), { dy: w.dy }), ...(t < 1.3 ? { view: 'side', walk: w.walk } : {}), boilKey: 'clawd' });
    if (t > 2.9) { boilSeed('say'); bubble(1250, 560, 300, 96, backOut(seg(t, 2.9, 3.1))); write('hello!', ...bubbleAt(1250, 560, 300, 96), 50, PAL.clayDk, { stroke: null, age: t - 3, rate: 16 }); }
    camEnd();
    boilSeed('transition'); flushLetters();
    if (lt < .8) flash(1 - ease(lt / .8), PAL.paper);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [PAL.indigo, PAL.violet]);
  }

  // B: night, one firework, one big word
  function night(t, lt, dur) {
    camBegin(960, 540 - 12 * lt, 1.03);
    boilSeed('sky'); paint(rectPts(-400, -400, W + 800, H + 800), { wash: PAL.night, ink: null });
    boilSeed('ground'); paint(rectPts(-400, G - 12, W + 800, 500, 3), { wash: '#3F5A66', washOp: 255, ink: null });
    const b = Math.max(firework(960, 300, 300, t - 5.3), firework(520, 360, 220, t - 6.1, '#FF8FB1'), firework(1420, 330, 240, t - 6.6, '#9AD8FF'));
    const lit = { tint: 'gold', tintK: .15 + .3 * b };
    doubao(1240, G, 15, { ...feel('awe', t, { lookY: -1 }), boilKey: 'doubao' });
    whale(1560, 780, 20, { ...feel('awe', t, { lookY: -1 }), flip: true, boilKey: 'whale' });
    clawd(760, G, 24, { ...emotions(t, [[4.6, 'neutral', { lookY: -.8 }], [5.4, 'awe', { lookY: -1 }], [7.4, 'firelit']]), ...lit, boilKey: 'clawd' });
    camEnd();
    if (t > 5.5 && t < 7.3) write('好', W / 2, 330, 250, PAL.cream, { age: t - 5.5, out: seg(t, 7, 7.3), screen: true, font: FONT_BIG, bold: .035 });
    boilSeed('transition'); flushLetters(); flash(.3 * (1 - b), PAL.night);
    if (lt < .3) brushWipe(.5 + lt / .6, [PAL.indigo, PAL.violet]);
    if (lt > dur - .7) iris(...toScreen(760, G - 96), lerp(1500, 0, ease(seg(lt, dur - .7, dur - .1))));
  }

  const sub = fn => (t, lt, dur) => { fn(t, lt, dur); CAM = null; subtitles(t, LINES); };
  shots([[0, hello], [4.6, night]].map(([t0, fn]) => [t0, sub(fn)]));
})();
