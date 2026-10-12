// px.js: the kit's second style, a pixel-art game screen (an RPG / visual-novel look). Lyrics are typed into a dialogue
// box, the picture is chunky sprites in small rooms, and the game's interface (panels, bars, toasts, cards) tells the
// story. Nothing here uses p5 or p5.brush: it is plain Canvas 2D with smoothing off, so a frame costs a few ms.
//
// Load order in a project's studio.html: config.js, src/core.js (for W, H, BEAT and the timing helpers; its p5 setup()
// never runs because p5 is not loaded), src/timeline.js (shots(), LOOPS), then this file, then sprites and scenes.
// render.mjs, render_all.mjs and rerender.mjs work unchanged: this file provides window.renderAt / renderSheet / ready.
//
// A shot is fn(t, lt, dur) as in the painted style and must be a pure function of t. Coordinates are frame pixels
// (1920×1080). Sprites are small canvases, one cell a pixel, drawn enlarged with blit(); `s` is always the number of
// screen pixels per sprite cell, so the same character can be shown coarse (few cells, big s) or fine.
const PXC = {
  bg: '#0E0B1F', panel: '#17143A', panel2: '#272052', line: '#D6CFF5', lineDk: '#0A0818', gold: '#F2C14E', goldDk: '#7A5518',
  text: '#F6F3FF', dim: '#9A93C8', red: '#E8536F', green: '#5FD990', blue: '#62A8F2', clay: '#D97757', ink: '#2B2233',
};
let X = null, OUTC = null;
const PFONT = '"SimSun", "NSimSun", "MS Gothic", monospace';   // a project may name a bundled pixel font first (PX_FONT)

// ---------- rectangles ----------
function box(x, y, w, h, col, a = 1) {
  if (a <= 0 || w <= 0 || h <= 0) return;
  X.globalAlpha = a; X.fillStyle = col; X.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); X.globalAlpha = 1;
}
function frameBox(x, y, w, h, b, col, a = 1) { box(x, y, w, b, col, a); box(x, y + h - b, w, b, col, a); box(x, y + b, b, h - 2 * b, col, a); box(x + w - b, y + b, b, h - 2 * b, col, a); }

// ---------- sprites ----------
// pix(key, w, h, build): a cached w × h sprite. build(g) paints it with g.set / rect / ell / poly, then g.outline(col)
// wraps everything painted so far in a one-cell line. The key must name everything the picture depends on.
const _pix = new Map();
function pix(key, w, h, build) {
  let cv = _pix.get(key); if (cv) return cv;
  w = Math.ceil(w); h = Math.ceil(h);
  const cells = new Array(w * h).fill(null), inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const g = {
    w, h,
    set(x, y, c) { x = Math.round(x); y = Math.round(y); if (inb(x, y)) cells[y * w + x] = c; },
    get(x, y) { return inb(x, y) ? cells[y * w + x] : null; },
    rect(x, y, rw, rh, c) { x = Math.round(x); y = Math.round(y); rw = Math.max(1, Math.round(rw)); rh = Math.max(1, Math.round(rh)); for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) if (inb(x + i, y + j)) cells[(y + j) * w + x + i] = c; },
    ell(cx, cy, rx, ry, c) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) cells[y * w + x] = c; } },
    poly(P, c) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const px = x + .5, py = y + .5; let inside = false;
        for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; }
        if (inside) cells[y * w + x] = c;
      }
    },
    outline(c) {
      const add = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!cells[y * w + x] && (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1))) add.push(y * w + x);
      for (const i of add) cells[i] = c;
    },
  };
  build(g);
  cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (cells[y * w + x]) { c.fillStyle = cells[y * w + x]; c.fillRect(x, y, 1, 1); }
  _pix.set(key, cv); return cv;
}
// spr(rows, pal): a sprite from strings, one character a cell; pal maps characters to colours ('.' and ' ' are empty).
function spr(rows, pal) {
  return pix('spr|' + rows.join('/') + '|' + JSON.stringify(pal), rows[0].length, rows.length, g => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) g.set(x, y, pal[ch]); })));
}
// blit(cv, x, y, s, o): draw a sprite with its top-left at (x, y), s screen pixels a cell. o.foot: (x, y) is instead the
// middle of its bottom edge. o.flip, o.flipY, o.alpha, o.sy (vertical stretch about the bottom, for squash), o.rot,
// o.crop = [sx, sy, sw, sh] in cells.
function blit(cv, x, y, s, o = {}) {
  const [sx, sy, sw, sh] = o.crop || [0, 0, cv.width, cv.height], w = sw * s, h = sh * s * (o.sy ?? 1);
  if (o.foot) { x -= w / 2; y -= h; }
  X.save(); X.globalAlpha = o.alpha ?? 1; X.imageSmoothingEnabled = false;
  X.translate(Math.round(x + w / 2), Math.round(y + h)); if (o.rot) X.rotate(o.rot); X.scale(o.flip ? -1 : 1, o.flipY ? -1 : 1);
  X.drawImage(cv, sx, sy, sw, sh, -w / 2, o.flipY ? 0 : -h, w, h);
  X.restore();
}

// ---------- pixel text ----------
// Glyphs are drawn once at the font's native size n (12 px by default), cut to hard pixels, and enlarged s times.
const _gly = new Map();
function glyph(ch, col, n, font) {
  const key = ch + col + n + font; let g = _gly.get(key); if (g) return g;
  const c = document.createElement('canvas'); c.width = n * 2; c.height = n + 4;
  const x = c.getContext('2d', { willReadFrequently: true }); x.font = `${n}px ${font}`; x.textBaseline = 'top'; x.fillStyle = '#fff';
  const adv = Math.max(1, Math.round(x.measureText(ch).width)); x.fillText(ch, 0, 1);
  const id = x.getImageData(0, 0, c.width, c.height), d = id.data, rgb = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  for (let i = 0; i < d.length; i += 4) { const on = d[i + 3] >= 118; d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = on ? 255 : 0; }
  x.putImageData(id, 0, 0);
  g = { c, adv }; _gly.set(key, g); return g;
}
const pfont = o => o.font || window.PX_FONT || PFONT;
function pw(txt, s, o = {}) { const n = o.n || 12; let w = 0; for (const ch of txt) w += glyph(ch, '#ffffff', n, pfont(o)).adv * s; return w; }
// ptext(txt, x, y, s, col, o): text with its top-left at (x, y). o.align 'center' | 'right', o.shadow (a colour, drawn one
// font pixel down and right), o.n (native size), o.count (show only the first so many characters), o.alpha,
// o.hot = [index, colour, scale, end]: characters index..end-1 (one if end is left out) are drawn larger and in another
// colour (the syllable being sung).
function ptext(txt, x, y, s, col = PXC.text, o = {}) {
  const n = o.n || 12, font = pfont(o), chars = [...txt], total = pw(txt, s, o);
  if (o.align === 'center') x -= total / 2; else if (o.align === 'right') x -= total;
  X.save(); X.imageSmoothingEnabled = false; X.globalAlpha = o.alpha ?? 1;
  const put = (ch, c, px, py, k) => { const g = glyph(ch, c, n, font); X.drawImage(g.c, Math.round(px), Math.round(py), g.c.width * k, g.c.height * k); };
  let cx = x;
  chars.forEach((ch, i) => {
    const adv = glyph(ch, '#ffffff', n, font).adv * s;
    if (o.count == null || i < o.count) {
      const hot = o.hot && i >= o.hot[0] && i < (o.hot[3] ?? o.hot[0] + 1), k = hot ? s * o.hot[2] : s, c = hot ? o.hot[1] : col, px = hot ? cx - (k - s) * adv / s / 2 : cx, py = hot ? y - (k - s) * n * .8 : y;
      if (ch.trim()) { if (o.shadow) put(ch, o.shadow, px + k, py + k, k); put(ch, c, px, py, k); }
    }
    cx += adv;
  });
  X.restore(); return total;
}

// ---------- light and atmosphere ----------
function lit(x, y, r, col = '#FFD27A', a = .5) {
  if (a <= 0) return;
  const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = a; X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.restore();
}
function shade(a, col = '#000') { box(0, 0, W, H, col, a); }
function vignette(a = .55) {
  const g = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(4,2,14,${a})`);
  X.fillStyle = g; X.fillRect(0, 0, W, H);
}
// slow drifting motes, the same every time for the same t
function dust(t, n = 46, col = '#CFC8F2') {
  for (let i = 0; i < n; i++) {
    const sp = .25 + hash(i * 3.1) * .6, x = (hash(i * 1.7) * W + t * 14 * sp) % W, y = H - ((hash(i * 2.9) * H + t * 22 * sp) % H), sz = hash(i * 5.3) < .3 ? 6 : 3;
    box(x, y, sz, sz, col, .06 + .16 * (.5 + .5 * Math.sin(t * (1 + hash(i)) + i)));
  }
}
function scanlines(a = .12) { for (let y = 0; y < H; y += 6) box(0, y + 3, W, 3, '#000', a); }
// checkerboard floor / brick wall, tile size in screen pixels
function tiles(x, y, w, h, sz, c1, c2) { box(x, y, w, h, c1); for (let j = 0; j * sz < h; j++) for (let i = (j % 2); i * sz < w; i += 2) box(x + i * sz, y + j * sz, Math.min(sz, w - i * sz), Math.min(sz, h - j * sz), c2); }
function bricks(x, y, w, h, bw, bh, c1, c2) {
  box(x, y, w, h, c1);
  for (let j = 0; j * bh < h; j++) { box(x, y + j * bh, w, 3, c2); for (let i = 0; i * bw < w + bw; i++) box(x + i * bw - (j % 2 ? bw / 2 : 0), y + j * bh, 3, Math.min(bh, h - j * bh), c2); }
}

// ---------- interface ----------
// panel: the window every piece of interface sits in. o.line (border colour), o.b (border unit), o.fill / o.fill2.
function panel(x, y, w, h, o = {}) {
  const b = o.b || 4, a = o.alpha ?? 1;
  x = Math.round(x); y = Math.round(y);
  box(x + 2 * b, y + 2 * b, w, h, '#000', .35 * a);
  box(x + b, y, w - 2 * b, h, o.line || PXC.line, a); box(x, y + b, w, h - 2 * b, o.line || PXC.line, a);     // notched corners
  box(x + b, y + b, w - 2 * b, h - 2 * b, PXC.lineDk, a);
  const g = X.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, o.fill2 || PXC.panel2); g.addColorStop(1, o.fill || PXC.panel);
  X.globalAlpha = a; X.fillStyle = g; X.fillRect(x + 2 * b, y + 2 * b, w - 4 * b, h - 4 * b); X.globalAlpha = 1;
  frameBox(x + 2 * b, y + 2 * b, w - 4 * b, h - 4 * b, Math.max(2, b / 2), o.line2 || '#4A4188', a);
}
function tag(x, y, txt, o = {}) {
  const s = o.s || 3, w = pw(txt, s) + 36, h = 12 * s + 20;
  panel(x, y, w, h, { b: 3, line: o.line || PXC.gold, line2: PXC.goldDk, fill: '#1E1A14', fill2: '#2E2618', alpha: o.alpha });
  ptext(txt, x + 18, y + 9, s, o.col || '#FFE9B0', { alpha: o.alpha }); return w;
}
function bar(x, y, w, h, k, col, o = {}) {
  box(x - 3, y - 3, w + 6, h + 6, o.line || PXC.line); box(x, y, w, h, '#120F28'); box(x, y, w * clamp(k), h, col);
  box(x, y, w * clamp(k), Math.max(2, h / 4), '#FFFFFF', .25);
}
// The dialogue box that carries the lyrics. line = [start, end, text, who]; who = { name, face(x, y, size) }.
// Characters are typed across the first part of the line; the newest one is gold and larger, as if being sung.
const DLG = { x: 150, y: 800, w: 1620, h: 214 };
function dialogue(t, line, who, o = {}) {
  const { x, y, w, h } = DLG, a = o.alpha ?? 1;
  panel(x, y, w, h, { alpha: a });
  panel(x + 26, y + 26, 162, 162, { b: 3, fill: '#0F0C24', fill2: '#1C1740', alpha: a });
  if (who && who.face) who.face(x + 26 + 81, y + 26 + 81, 150, t);
  if (who && who.name) tag(x + 214, y - 34, who.name, { alpha: a });
  if (!line) return;
  const [t0, t1, txt] = line, chars = [...txt], typeEnd = t0 + (t1 - t0) * (o.typeK ?? .78), s = o.s || 4;
  let k = seg(t, t0, typeEnd), n = Math.min(chars.length, Math.floor(k * chars.length) + 1), hot = k < 1 ? [n - 1, PXC.gold, 1.5] : null;
  if (o.times) {     // heard, not guessed: one time a token (see tokensOf in scripts/make_tap.mjs)
    const re = /[A-Za-z']+|[0-9]|[\u3400-\u9fff\uf900-\ufaff]/g, toks = []; let m, pos = 0;
    while ((m = re.exec(txt))) { const i0 = [...txt.slice(0, m.index)].length; toks.push([i0, i0 + [...m[0]].length]); }
    let last = -1; toks.forEach((_, i) => { if (o.times[i] != null && t >= o.times[i]) last = i; });
    const lastT = last >= 0 ? o.times[last] : t0, held = last === toks.length - 1 ? .45 : 9;
    n = last < 0 ? 0 : last === toks.length - 1 ? chars.length : toks[last][1]; k = last === toks.length - 1 && t > lastT + held ? 1 : 0;
    hot = last >= 0 && t < lastT + held ? [toks[last][0], PXC.gold, 1.5, toks[last][1]] : null;
  }
  ptext(txt, x + 226, y + 78, s, PXC.text, { count: n, hot, shadow: '#0A0818', alpha: a });
  if (k >= 1 && Math.floor(t * 3) % 2) blit(spr(['#####', '.###.', '..#..'], { '#': PXC.line }), x + w - 70, y + h - 50, 5);
}
// A system message (top right in the reference film): a small title and one line.
function toast(x, y, w, title, body, o = {}) {
  panel(x, y, w, 104, { b: 3, line: o.line || PXC.gold, line2: PXC.goldDk, alpha: o.alpha });
  ptext(title, x + 22, y + 16, 2, o.titleCol || PXC.dim, { alpha: o.alpha }); ptext(body, x + 22, y + 48, 3, PXC.text, { alpha: o.alpha, count: o.count });
}
// An encyclopedia card ("图鉴"): a term, a year, one sentence (one or two lines). age = seconds since it appeared; it
// slides in from the right, holds, and leaves after `life`.
function codex(age, term, year, lines, o = {}) {
  const life = o.life ?? 4.2; if (age < 0 || age > life) return;
  const w = o.w || 640, h = 96 + 44 * lines.length, x = W - w - 50 + 700 * (1 - easeOut(seg(age, 0, .35))) + 700 * easeIn(seg(age, life - .3, life)), y = o.y ?? 44;
  panel(x, y, w, h, { b: 3, line: PXC.gold, line2: PXC.goldDk, fill: '#141126', fill2: '#221C44' });
  ptext('图鉴解锁', x + 24, y + 16, 2, PXC.gold);
  if (year) ptext(year, x + w - 24, y + 16, 2, PXC.dim, { align: 'right' });
  ptext(term, x + 24, y + 44, 3, '#FFE9B0', { shadow: '#0A0818' });
  lines.forEach((l, i) => ptext(l, x + 24, y + 92 + i * 40, 2.5, PXC.text));
  if (age < .5) box(x, y, w, h, '#FFF6D0', .5 * (1 - age / .5));
}
// A number that floats up from (x, y), like damage in a game. age in seconds.
function floatNum(age, txt, x, y, col, s = 5) { if (age < 0 || age > 1.2) return; ptext(txt, x, y - 90 * easeOut(age / 1.2), s, col, { align: 'center', shadow: '#0A0818', alpha: 1 - seg(age, .8, 1.2) }); }
// A slanted banner with rays and one big word (the reference film's cut-in). k 0..1 opens it.
function banner(k, y, h, txt, o = {}) {
  if (k <= 0) return;
  const c1 = o.c1 || '#F2B63C', c2 = o.c2 || '#F7D36A', hh = h * easeOut(k);
  X.save(); X.translate(W / 2, y); X.rotate(-.1); box(-1200, -hh / 2 - 12, 2400, hh + 24, '#1A1230'); box(-1200, -hh / 2, 2400, hh, c1);
  X.beginPath(); X.rect(-1200, -hh / 2, 2400, hh); X.clip();
  for (let i = 0; i < 28; i++) { X.fillStyle = c2; X.globalAlpha = .55; X.beginPath(); const a0 = i / 28 * TAU + (o.spin || 0), a1 = a0 + TAU / 56; X.moveTo(o.cx ?? 300, 0); X.lineTo((o.cx ?? 300) + Math.cos(a0) * 2600, Math.sin(a0) * 2600); X.lineTo((o.cx ?? 300) + Math.cos(a1) * 2600, Math.sin(a1) * 2600); X.fill(); }
  X.globalAlpha = 1;
  if (k > .5 && txt) { const s = o.s || 16, w = pw(txt, s); for (const [dx, dy] of [[-s, 0], [s, 0], [0, -s], [0, s], [s, s], [-s, -s], [s, -s], [-s, s]]) ptext(txt, (o.tx ?? -420) - w / 2 + dx, -6 * s + dy, s, '#241433'); ptext(txt, (o.tx ?? -420) - w / 2, -6 * s, s, '#FFFFFF'); }
  X.restore();
}

// ---------- frame ----------
function pxFrame(t) {
  T = t; X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.imageSmoothingEnabled = false;
  X.fillStyle = PXC.bg; X.fillRect(0, 0, W, H);
  if (window.LOOP) window.LOOP(t);
  else if (SHOTS.length) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR; SHOTS[i][1](t, t - t0, end - t0); }
}
window.renderAt = async (t, type = 'image/png', q = .92) => { pxFrame(t); return OUTC.toDataURL(type, q); };
window.renderSheet = async (times, cols = 3, w = 640, crop = null) => {
  const [cx, cy, cw, ch] = crop || [0, 0, W, H], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); pxFrame(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(OUTC, cx, cy, cw, ch, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 84, 24); c.fillStyle = '#fff'; c.font = '15px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 17);
  }
  return { url: sc.toDataURL('image/jpeg', .9), ms };
};
window.gpuInfo = () => 'Canvas 2D (pixel style)';
window.addEventListener('load', async () => {
  OUTC = document.getElementById('out'); X = OUTC.getContext('2d');
  if (window.FONTS_READY) await window.FONTS_READY;
  if (window.ART_READY) await window.ART_READY;
  window.ready = true;
  if (!location.search.includes('render')) devUI();
});
