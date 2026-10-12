// pclawd.js: Clawd as a pixel sprite, and the small icons the interface uses.
//
// pclawd(x, y, k, s, o): (x, y) is the ground point between the feet. k is how many cells one body unit gets, so it is
// the sprite's RESOLUTION: k = 1 is a 14 × 8 smudge, k = 2 is 28 × 16, k = 4 is 56 × 32. s is screen pixels a cell.
// Keep k × s about constant and Clawd stays the same size on screen while its pixels get finer.
//   o.eyes:  normal | happy | closed | wide | dot      o.mouth: null | smile | grin | flat | o | wob   (k ≥ 2)
//   o.aL / o.aR: arm angle, -1 (down) .. 0 (out) .. 1 (up).   o.kneel: legs folded away.   o.look: eyes shifted, in units.
//   o.blush, o.tear (k ≥ 2).  o.col / o.dk / o.lt: body colours.  o.dy (screen px), o.sy (squash), o.flip, o.alpha, o.rot.
function clawdCv(k, o = {}) {
  const u = k, p = k >= 2 ? 1 : 0, up = Math.max(0, o.aL || 0, o.aR || 0), armUp = Math.ceil(2 * u * up), th = Math.max(1, u >> 1);
  const key = ['clawd', k, o.eyes, o.mouth, o.aL, o.aR, o.kneel, o.look, o.blush, o.tear, o.col, o.dk, o.lt].join('|');
  return pix(key, 14 * u + 2 * p, 8 * u + 2 * p + armUp, g => {
    const C = o.col || '#D97757', D = o.dk || '#A84D33', L = o.lt || '#F2A283', K = '#2B2233', bx = p + 2 * u, top = p + armUp + (o.kneel ? 2 * u : 0);
    for (const [sgn, a] of [[-1, o.aL || 0], [1, o.aR || 0]]) for (let i = 0; i < 2 * u; i++) g.rect(sgn < 0 ? bx - 1 - i : bx + 10 * u + i, top + 3 * u - Math.round(i * a), 1, u, i >= 2 * u - th && k >= 2 ? D : C);
    if (!o.kneel) for (const lx of [1, 3, 6, 8]) g.rect(bx + lx * u, top + 6 * u, u, 2 * u, D);
    g.rect(bx, top, 10 * u, 6 * u, C);
    if (k >= 2) { g.rect(bx, top, 10 * u, th, L); g.rect(bx, top + 6 * u - th, 10 * u, th, D); }
    const lk = Math.round((o.look || 0) * u);
    for (const ex of [2, 7]) {
      const x0 = bx + ex * u + lk, y0 = top + u, e = k >= 2 ? o.eyes || 'normal' : 'normal';
      if (e === 'happy') for (let i = 0; i < 2 * u; i++) g.rect(x0 - (u >> 1) + i, y0 + th + Math.round(Math.abs(i - (2 * u - 1) / 2) * .8), 1, th, K);
      else if (e === 'closed') g.rect(x0 - (u >> 1), y0 + u, 2 * u, th, K);
      else if (e === 'wide') { g.rect(x0 - th, y0 - th, u + 2 * th, 2 * u + 2 * th, '#FFFFFF'); g.rect(x0, y0, u, 2 * u, K); }
      else if (e === 'dot') g.rect(x0, y0 + th, u, u, K);
      else g.rect(x0, y0, u, 2 * u, K);
      if (o.blush && k >= 2) g.rect(bx + (ex === 2 ? .4 : 8.6) * u, top + 3 * u + th, u, th, '#F08A8A');
    }
    if (k >= 6) {     // the finest sprite: a glint in each eye, a dithered shadow, a soft highlight
      if ((o.eyes || 'normal') === 'normal') for (const ex of [2, 7]) g.rect(bx + ex * u + lk + 1, top + u + 1, th >> 1, th >> 1, '#FFFFFF');
      for (let y = 0; y < u; y++) for (let x = 0; x < 10 * u; x++) if ((x + y) % 2 === 0) g.set(bx + x, top + 6 * u - th - 1 - y, D);
      for (let y = 0; y < th; y++) for (let x = 0; x < 10 * u; x++) if ((x + y) % 2 === 0) g.set(bx + x, top + th + y, L);
    }
    if (o.tear && k >= 2) { g.rect(bx + 2 * u + lk, top + 3 * u + th, th, u + th, '#8AD2FF'); g.rect(bx + 7 * u + lk + u - th, top + 3 * u + th, th, u, '#8AD2FF'); }
    if (k >= 2 && o.mouth) {
      const mx = bx + 5 * u, my = top + 4 * u;
      if (o.mouth === 'smile') { g.rect(mx - u, my, 2 * u, th, K); g.rect(mx - u - th, my - th, th, th, K); g.rect(mx + u, my - th, th, th, K); }
      else if (o.mouth === 'grin') { g.rect(mx - u - th, my - th, 2 * u + 2 * th, u + th, K); g.rect(mx - u, my + th, 2 * u, th, '#E27A92'); g.rect(mx - u, my - th, 2 * u, th, '#FFFFFF'); }
      else if (o.mouth === 'flat') g.rect(mx - u, my, 2 * u, th, K);
      else if (o.mouth === 'o') g.rect(mx - th, my - th, 2 * th, 2 * th, K);
      else if (o.mouth === 'wob') for (let i = 0; i < 2 * u; i += th) g.rect(mx - u + i, my + ((i / th) % 2 ? th : 0), th, th, K);
    }
    if (p) g.outline('#4A1F1A');
  });
}
function pclawd(x, y, k, s, o = {}) {
  const cv = clawdCv(k, o);
  if (!o.noShadow) { X.globalAlpha = .3 * (o.alpha ?? 1); X.fillStyle = '#000'; X.beginPath(); X.ellipse(x, y + s * .5, 6.2 * k * s, 1 * k * s, 0, 0, TAU); X.fill(); X.globalAlpha = 1; }
  blit(cv, x, y + (o.dy || 0) + (k >= 2 ? s : 0), s, { foot: true, flip: o.flip, alpha: o.alpha, sy: o.sy, rot: o.rot });
}
// Clawd's face for the dialogue box's portrait frame
const clawdFace = (k, o = {}) => (x, y, size) => {
  const cv = clawdCv(k, { ...o, aL: 0, aR: 0 }), p = k >= 2 ? 1 : 0, cw = 12 * k + 2 * p, s = Math.max(1, Math.floor(size * .94 / cw));
  blit(cv, x - cw * s / 2, y - cv.height * s / 2, s, { crop: [k, 0, cw, cv.height] });
};

// ---------- icons ----------
const ICON = {
  thumb: c => spr(['....kk.....', '...kwwk....', '...kwwk....', '..kwwk.....', '.kkwwkkkkk.', 'kakwwwwwwwk', 'kakwwwwwwk.', 'kakwwwwwwwk', 'kakwwwwwwk.', 'kakwwwwwk..', '.kkkkkkk...'], { k: '#1B1430', w: c, a: mixCol(c, '#000000', .3) }),
  heart: c => spr(['.kk...kk.', 'kwwk.kwwk', 'kwwwkwwwk', 'kwwwwwwwk', '.kwwwwwk.', '..kwwwk..', '...kwk...', '....k....'], { k: '#1B1430', w: c }),
  lock: () => spr(['..kkkkk..', '.kgggggk.', '.kgk.kgk.', '.kgk.kgk.', 'kkkkkkkkk', 'kyyyyyyyk', 'kyyykyyyk', 'kyyykyyyk', 'kyyyyyyyk', 'kkkkkkkkk'], { k: '#1B1430', g: '#B9B4D6', y: '#F2C14E' }),
  book: () => spr(['.kkkkkkkkkk.', 'krrrrrrrrrrk', 'krwwwwwwwwrk', 'krwkkkkkkwrk', 'krwwwwwwwwrk', 'krwkkkkwwwrk', 'krwwwwwwwwrk', 'krrrrrrrrrrk', 'kppppppppppk', '.kkkkkkkkkk.'], { k: '#1B1430', r: '#B8473E', w: '#F6EEDA', p: '#EADFC4' }),
  clap: () => spr(['kkkkkkkkkkkkk', 'kwkkwkkwkkwkk', 'kkwkkwkkwkkwk', 'kkkkkkkkkkkkk', 'kdddddddddddk', 'kdwwwdwwwwwdk', 'kdddddddddddk', 'kdwwwwwdwwwdk', 'kdddddddddddk', 'kkkkkkkkkkkkk'], { k: '#12101E', w: '#F4F1FF', d: '#2A2740' }),
  star: c => spr(['...k...', '..kwk..', 'kkkwkkk', 'kwwwwwk', '.kwwwk.', 'kwwkwwk', 'kkk.kkk'], { k: '#1B1430', w: c }),
  cursor: () => spr(['k......', 'kk.....', 'kwk....', 'kwwk...', 'kwwwk..', 'kwwwwk.', 'kwwkkkk', 'kkwk...', '..kwk..', '..kk...'], { k: '#12101E', w: '#FFFFFF' }),
  gear: () => spr(['..k.k.k..', '.kgkgkgk.', 'kgggggggk', '.kggkggk.', 'kggk.kggk', '.kggkggk.', 'kgggggggk', '.kgkgkgk.', '..k.k.k..'], { k: '#12101E', g: '#B9B4D6' }),
};
