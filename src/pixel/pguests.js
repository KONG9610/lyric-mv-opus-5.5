// pguests.js: the kit's guest characters as pixel sprites (see src/guests.js for who they are: affectionate fan drawings
// of other AI products' mascots). pwhale(x, y, k, s, o) and pdoubao(x, y, k, s, o); (x, y) = the ground under them,
// k = cells a body unit, s = screen pixels a cell. o.eyes: normal | happy. o.flip, o.dy, o.alpha.
function whaleCv(k, o = {}) {
  return pix(['whale', k, o.eyes].join('|'), 13 * k + 2, 7 * k + 2, g => {
    const B = '#3F6FE0', L = '#9DB8F5', K = '#16204A', cx = 7.5 * k + 1, cy = 3.4 * k + 1;
    g.poly([[1, 1 + .6 * k], [3.4 * k, cy - .3 * k], [3.4 * k, cy + .9 * k], [1, 6 * k]], B);
    g.ell(cx, cy, 4.6 * k, 3 * k, B);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.get(x, y) === B && y > cy + 1.3 * k && x > cx - 3.4 * k) g.set(x, y, L);
    g.poly([[cx + .2 * k, cy + 1.2 * k], [cx + 2 * k, cy + 1.6 * k], [cx + 1.2 * k, cy + 3.4 * k]], '#2F58C2');
    if (o.eyes === 'happy') { g.rect(cx + 2.4 * k, cy - .8 * k, k, Math.max(1, k >> 1), K); g.rect(cx + 2.4 * k - Math.max(1, k >> 1), cy - .8 * k + Math.max(1, k >> 1), Math.max(1, k >> 1), Math.max(1, k >> 1), K); }
    else g.rect(cx + 2.6 * k, cy - 1 * k, Math.max(1, .7 * k), Math.max(1, .8 * k), K);
    g.rect(cx + 3.4 * k, cy + .7 * k, k, Math.max(1, k >> 1), K);
    g.outline(K);
  });
}
function doubaoCv(k, o = {}) {
  return pix(['doubao', k, o.eyes].join('|'), 10 * k + 2, 11 * k + 2, g => {
    const S = '#F8DCC8', Hh = '#7A5236', K = '#3A2620', cx = 5 * k + 1, th = Math.max(1, k >> 1);
    for (const sx of [-1, 1]) g.rect(cx + sx * 1.3 * k - .8 * k, 10 * k, 1.6 * k, k + 1, '#8A5A3C');
    g.ell(cx, 8.2 * k, 3 * k, 2.4 * k, '#FBF6EA');
    g.ell(cx, 4.2 * k + 1, 4.6 * k, 4 * k, Hh); g.ell(cx, 4.9 * k + 1, 3.9 * k, 3.3 * k, S);
    g.rect(cx - 3.6 * k, 6.9 * k, 7.2 * k, 1.3 * k, '#E03B30'); g.rect(cx - 2.6 * k, 8 * k, 1.3 * k, 1.8 * k, '#C92F26');
    for (const sx of [-1, 1]) {
      if (o.eyes === 'happy') { g.rect(cx + sx * 1.8 * k - k / 2, 4.6 * k, k, th, K); g.rect(cx + sx * 1.8 * k - k / 2 - th, 4.6 * k + th, th, th, K); g.rect(cx + sx * 1.8 * k + k / 2, 4.6 * k + th, th, th, K); }
      else g.rect(cx + sx * 1.8 * k - k / 2, 4.2 * k, k, k, K);
      g.rect(cx + sx * 2.7 * k - k / 2, 5.6 * k, k, th, '#F4A6A6');
    }
    g.rect(cx - th, 5.8 * k, 2 * th, th, '#D4504A');
    g.outline(K);
  });
}
const _pguest = (mk, hw) => (x, y, k, s, o = {}) => {
  if (!o.noShadow) { X.globalAlpha = .3 * (o.alpha ?? 1); X.fillStyle = '#000'; X.beginPath(); X.ellipse(x, y, hw * k * s, .8 * k * s, 0, 0, TAU); X.fill(); X.globalAlpha = 1; }
  blit(mk(k, o), x, y + (o.dy || 0) + s, s, { foot: true, flip: o.flip, alpha: o.alpha, sy: o.sy });
};
const pwhale = _pguest(whaleCv, 5), pdoubao = _pguest(doubaoCv, 3.4);
const guestFace = (mk, k = 3, o = {}) => (x, y, size) => { const cv = mk(k, o), s = Math.max(1, Math.floor(size * .92 / Math.max(cv.width, cv.height))); blit(cv, x - cv.width * s / 2, y - cv.height * s / 2, s); };
