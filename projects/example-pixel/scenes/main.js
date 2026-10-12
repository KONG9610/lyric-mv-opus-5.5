// main.js: an eight-second film in the pixel style, with nothing but what the kit draws itself: Clawd as a sprite at
// three resolutions, the dialogue box typing a line, a panel that pops in, a reward bar, a card, a banner.
// The engine is src/pixel/px.js; skill/lyric-mv-opus-5-5/references/pixel-style.md says what is in it.
(() => {
  // ---------- the words: [start, end, text, who] ----------
  const LINES = [[.6, 2.3, '一开始 我只有几个像素', 'c'], [2.6, 4.6, '后来 我学会了微笑', 'c'], [5.4, 7.4, '这样你会喜欢我吗', 'c']];
  const lvK = t => t < 2.5 ? 1 : t < 4.9 ? 2 : 4;     // Clawd's resolution: cells to a body unit
  const WHO = { c: t => ({ name: 'Clawd', face: clawdFace(lvK(t), lvK(t) >= 2 ? { mouth: 'smile' } : {}) }) };
  function lyric(t) { const line = LINES.find(([a, b]) => t >= a && t < b + .12); dialogue(t, line, WHO.c(t)); }
  // makes what is drawn next pop in: call it between X.save() and X.restore()
  const popIn = (age, cx, cy) => { const k = age <= 0 ? 0 : age >= .16 ? 1 : .55 + .45 * backOut(age / .16); X.translate(cx, cy); X.scale(k, k); X.translate(-cx, -cy); };

  function room(t) {
    box(0, 0, W, H, '#0B1820'); box(0, 440, W, 400, '#0E2029');
    for (let x = 0; x <= W; x += 120) box(x, 440, 3, 400, '#4FD6D0', .16);
    for (let y = 440; y < 840; y += 120) box(0, y, W, 3, '#4FD6D0', .16);
    box(0, 432, W, 8, '#2A6F78'); lit(960, 600, 620, '#CFF6FF', .12 + .05 * pulse(t, 4));
  }
  function film(t, lt) {
    room(t);
    const k = lvK(t), grew = [2.5, 4.9].find(g => t >= g && t < g + .6);
    pclawd(960, 720, k, 28 / k, k === 1 ? { dy: -8 * pulse(t, 5) } : { mouth: 'smile', eyes: t > 5.9 ? 'happy' : 'normal', blush: k === 4, dy: -8 * pulse(t, 5), aR: t > 5.9 ? .7 : 0 });
    if (grew != null) { lit(960, 580, 520, '#FFE2A0', .7 * (1 - (t - grew) / .6)); floatNum(t - grew, 'LEVEL UP', 960, 380, PXC.gold, 6); }
    // interface: a name plate, a bar that fills as thumbs arrive, one card of the encyclopedia
    panel(40, 36, 440, 108, { b: 3 }); clawdFace(k, k >= 2 ? { mouth: 'smile' } : {})(98, 90, 92);
    ptext('Clawd', 160, 54, 3, PXC.text); ptext('Lv.' + (k === 4 ? 3 : k), 454, 54, 3, PXC.gold, { align: 'right' }); ptext(k === 1 ? '还没读过书' : '越来越清晰', 160, 100, 2, PXC.dim);
    const thumbs = [5.9, 6.3, 6.7, 7.1], got = thumbs.filter(x => t > x + .5).length;
    if (t > 5.2) {
      X.save(); popIn(t - 5.2, 740, 71);
      panel(500, 36, 480, 70, { b: 3 }); ptext('奖励', 522, 56, 2.5, PXC.dim); bar(606, 60, 180, 20, got / 4, PXC.gold); blit(ICON.thumb('#FFD86B'), 806, 46, 4); ptext('×' + got, 954, 54, 3, PXC.text, { align: 'right' });
      X.restore();
      thumbs.forEach((x, i) => {
        const a = (t - x) / .5; if (a > 0 && a < 1) { const [px, py] = arcPt([300 + i * 420, 860], [830, 70], 200, easeIn(a)); blit(ICON.thumb('#FFD86B'), px - 22, py - 22, 5); }
        floatNum(t - x - .5, '+1', 900, 150, PXC.gold, 5);
      });
    }
    codex(t - 2.9, '分辨率', '', ['同一个角色，', '格子越细，看得越清'], { life: 2.2 });
    dust(t); vignette(.55);
    const b = Math.min(seg(t, 4.9, 5.15), 1 - seg(t, 5.25, 5.45)); if (b > 0) banner(b, 430, 460, '微笑', { spin: t * .3, s: 18, tx: -380 });
    if (lt < .3) shade(1 - lt / .3, '#07051A'); if (t > 7.6) shade(seg(t, 7.6, 8), '#07051A');
    lyric(t);
  }
  shots([[0, film]]);
})();
