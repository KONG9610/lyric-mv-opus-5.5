// guests.js: guest characters that visit the band's videos, painted with the same tools.
//   doubao(x, y, u, o)  a round-faced girl with a brown bob, a red scarf and a white jumper, seen from the front. (x, y) is
//                       the ground between her feet; she is 12u wide and 14u tall, most of it head. Options as for clawd(): dx, dy, sq, rot,
//                       flip, aL, aR, eyes, mouth, lookX / lookY, blush, emote, armL / armR, plus drool 0..1.
//   wisp(x, y, r, o)    a passer-by with no name: a small round cousin of Clawd, r in radius, centred on (x, y): slit eyes,
//                       two stub legs, two arm nubs. o.col, o.flip, o.seed, o.float (false stops its bob), o.hold(r).
//   whale(x, y, u, o)   a round blue whale, seen from the side, facing right. It floats: (x, y) is the point under its
//                       belly, about 1.6u below it. It is 9u long and 6u tall (11u long with the tail).
// It reads the same pose and face options as clawd(), so feel() and emotions() drive it:
//   pose:   dx, dy, sq, rot, flip.  float: false stops its idle bob.  shadow: true paints a ground shadow.
//   face:   eyes (any Clawd eye name), mouth, lookX / lookY, seed.
//   fins:   fin (the near fin's angle: about -.6 hangs, 1.3 is raised), fin2 (the far fin; hidden unless set). Left
//           unset they follow aR / aL, so an emotion's arms become fins.  hold(u, sw) draws a prop at the near fin's tip.
//   extras: col (body colour), spout 0..1 (a happy blow), stamped (the red mark on its head), emote + emoteK + emoteAge.
// For acted changes use whale.emotions(t, keys, o, col) instead of emotions(), which would cross-fade through Clawd's clay.
function whale(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = part => boilSeed(`whale ${id} ${part}`);
  const col = o.col || '#4D6BFE', dk = mixCol(col, PAL.ink, .3), lt = mixCol(col, '#FFFFFF', .6);
  const sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .05, P = pts => pts.map(([a, b]) => [a * u + jit(J), b * u + jit(J)]);
  x += (o.dx || 0) * u;
  const dy = (o.dy || 0) * u + (o.float === false ? 0 : Math.sin(T * 2.2 + (o.seed || 0) * 2) * .25 * u);
  rs('shadow'); if (o.shadow) paint(ellPts(x, y + u * .15, 4.4 * u, .8 * u, 20), { fill: PAL.ink, fillOp: 80, bleed: .25, tex: .3, border: .1, ink: null });
  push(); translate(x, y + dy); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (1 + sq * .6), 1 - sq);
  const fin = (a, far) => {
    rs('fin' + far);
    const px = far ? 2.3 : .9, py = far ? -3.6 : -3.1, tx = px + Math.cos(a) * 2.7, ty = py - Math.sin(a) * 2.7;
    paint(ribbon([[px * u, py * u], [(px + tx) / 2 * u, ((py + ty) / 2 + .35) * u], [tx * u, ty * u]], 1.7 * u, .8 * u), { wash: far ? dk : col, washOp: 255, ink: PAL.ink, sw: sw * .8 });
    if (!far && o.hold) { push(); translate(tx * u, ty * u); o.hold(u, sw); pop(); }
  };
  const near = o.fin ?? (o.aR != null ? -.9 + 1.2 * o.aR : -.6), far = o.fin2 ?? (o.aL != null && o.aL > .7 ? -.9 + 1.2 * o.aL : null);
  // tail, wagging
  rs('tail'); push(); translate(-4.1 * u, -4.4 * u); rotate(.25 * Math.sin(T * 5 + (o.seed || 0)));
  paint(P([[.6, -.7], [-1.6, -1.2], [-3.3, -3], [-2.7, -.9], [-3.5, .9], [-1.6, .2], [.6, .8]]), { wash: col, washOp: 255, ink: PAL.ink, sw: sw * .9, curv: .35 });
  pop();
  if (far != null) fin(far, true);
  rs('body');
  const body = P([[4.6, -4.3], [3.7, -6.5], [.8, -7.6], [-2.4, -7], [-4.5, -4.8], [-3.5, -2.5], [0, -1.6], [3.3, -2.2]]);
  paint(body, { wash: col, washOp: 255, ink: null, curv: .6 });
  paint(ellPts(.9 * u, -2.7 * u, 2.9 * u, .85 * u, 16, J), { wash: lt, washOp: 235, ink: null });
  paint(ellPts(-1 * u, -6 * u, 2 * u, .8 * u, 14, J, -.2), { fill: lt, fillOp: 90, bleed: .2, tex: .8, border: .8, ink: null });
  paint(body, { ink: PAL.ink, sw, curv: .6 });
  // face
  rs('eye'); push(); translate(2.9 * u, -5.2 * u);
  const e = Array.isArray(o.eyes) ? o.eyes[1] : o.eyes === 'wink' ? 'happy' : o.eyes || 'normal', lx = (o.lookX || 0) * u * .25, ly = (o.lookY || 0) * u * .22;
  if (clamp(o.squint || 0) > .8 || (['normal', 'look', 'wide', 'dot'].includes(e) && ((T * .9 + (o.seed || 0) * 1.7) % 3.3) < .12)) inkLine([[-.5 * u, 0], [.5 * u, 0]], sw, PAL.ink, 'ink', 0);
  else if (['normal', 'look', 'dot'].includes(e)) paint(ellPts(lx, ly, .4 * u, .44 * u, 12), { wash: PAL.ink, ink: null });
  else if (e === 'wide') { paint(ellPts(lx, ly, .6 * u, .66 * u, 12), { wash: PAL.ink, ink: null }); paint(ellPts(lx - .18 * u, ly - .22 * u, .18 * u, .2 * u, 8), { wash: PAL.cream, ink: null }); }
  else if (e === 'narrow') inkLine([[-.6 * u, 0], [.6 * u, 0]], sw * 1.5, PAL.ink, 'ink', 0);
  else if (e === 'shades') paint(rrPts(-.95 * u, -.6 * u, 1.9 * u, 1.2 * u, .4 * u), { wash: '#2A2740', ink: PAL.ink, sw: sw * .8 });
  else eye(e, 1, u * .5, o, sw);
  pop();
  rs('mouth');
  const m = o.mouth, mx = 3.95 * u, my = -3.45 * u;
  if (['O', 'open', 'laugh', 'wail', 'yawn', 'grin', 'o'].includes(m)) paint(ellPts(mx - .2 * u, my, .5 * u, (m === 'o' ? .35 : .6) * u, 12), { wash: '#4A1F2A', ink: PAL.ink, sw: sw * .5 });
  else if (['flat', 'wobble', 'frown', 'teeth', 'pout'].includes(m)) inkLine([[mx - .9 * u, my + (m === 'frown' ? .15 : 0) * u], [mx - .2 * u, my - (m === 'frown' ? .1 : 0) * u], [mx + .3 * u, my + (m === 'frown' ? .2 : 0) * u]], sw * .8, PAL.ink, 'ink', .5);
  else inkLine([[mx - .9 * u, my - .15 * u], [mx - .3 * u, my + .3 * u], [mx + .35 * u, my - .1 * u]], sw * .8, PAL.ink, 'ink', .6);
  if (o.blush) paint(ellPts(2.2 * u, -3.9 * u, .7 * u, .36 * u, 12), { fill: PAL.rose, fillOp: 170 * clamp(o.blush === true ? 1 : o.blush), bleed: .2, ink: null });
  if (o.stamped) { rs('stamp'); paint(ellPts(.9 * u, -6.5 * u, .8 * u, .8 * u, 14), { ink: '#E23E36', sw: sw * .8 }); paint(starPts(.9 * u, -6.5 * u, .5 * u, .45, 5), { wash: '#E23E36', ink: null }); }
  fin(near, false);
  if (o.spout > .02) {   // a blow: three arcs of water and their drops
    rs('spout'); const k = clamp(o.spout);
    for (const s of [-1, 0, 1]) { const h = (2.2 + (s ? 0 : .8)) * k * (1 + .1 * Math.sin(T * 12 + s)); inkLine([[.2 * u, -7.6 * u], [(.2 + s * .5) * u, (-7.6 - h * .7) * u], [(.2 + s * 1.5) * u, (-7.6 - h) * u]], sw * 1.1, PAL.sky, 'ink', .6); paint(ellPts((.2 + s * 1.7) * u, (-7.5 - h) * u, .28 * u, .36 * u, 8), { wash: PAL.sky, ink: PAL.ink, sw: sw * .4 }); }
  }
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * (EMOTE_TOP.includes(o.emote) ? 0 : 5) * u, y + dy - (EMOTE_TOP.includes(o.emote) ? 10 : 8.4) * u, u * .9, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
}
whale.emotions = (t, keys, o, col = '#4D6BFE') => emotions(t, keys.map(([a, n, ov]) => [a, n, { col, dk: mixCol(col, PAL.ink, .3), lt: mixCol(col, '#FFFFFF', .6), ...ov }]), o);

function doubao(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = part => boilSeed(`doubao ${id} ${part}`);
  const SKIN = '#F9DCC8', HAIR = '#553A2C', RED = '#D9342B', sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .05;
  const P = pts => pts.map(([a, b]) => [a * u + jit(J), b * u + jit(J)]);
  x += (o.dx || 0) * u; const dy = (o.dy || 0) * u;
  rs('shadow'); if (!o.noShadow) paint(ellPts(x, y + u * .15, 4.6 * u, .85 * u, 20), { fill: PAL.ink, fillOp: 85, bleed: .25, tex: .3, border: .1, ink: null });
  push(); translate(x, y + dy); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (1 + sq * .6), 1 - sq);
  // short round arms, like the band's
  const arm = (s, a0, hook) => {
    rs('arm' + s);
    const a = -1.2 + 1.3 * (a0 ?? .2), px = s * 2.9, py = -3.9, tx = px + s * Math.cos(a) * 2.5, ty = py - Math.sin(a) * 2.5;
    paint(ribbon([[px * u, py * u], [(px + tx) / 2 * u, (py + ty) / 2 * u], [tx * u, ty * u]], 1.8 * u, 1.7 * u), { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: sw * .85 });
    if (hook) { push(); translate(tx * u, ty * u); if (s < 0) scale(-1, 1); hook(u, sw); pop(); }
  };
  rs('legs'); for (const s of [-1, 1]) paint(rrPts((s * 1.6 - 1) * u, -1.7 * u, 2 * u, 1.7 * u, .6 * u, J), { wash: '#7A5544', washOp: 255, ink: PAL.ink, sw: sw * .8 });
  // the bob, behind everything: one round cap cut straight across at the jaw
  rs('hair'); paint(ellPts(0, -9.2 * u, 6.1 * u, 5 * u, 32, J).map(([a, b]) => [a, Math.min(b, -5.5 * u)]), { wash: HAIR, washOp: 255, ink: PAL.ink, sw });
  arm(-1, o.aL, o.armL);
  rs('body'); paint(rrPts(-3.4 * u, -5 * u, 6.8 * u, 3.9 * u, 1.7 * u, J), { wash: PAL.cream, washOp: 255, fill: PAL.sky, fillOp: 30, tex: .5, ink: PAL.ink, sw });
  arm(1, o.aR, o.armR);
  // one big soft face, widest at the cheeks
  rs('face'); const face = P([[0, -12.9], [3.3, -12.3], [4.9, -9.8], [5.15, -7.3], [3.7, -5.1], [0, -4.5], [-3.7, -5.1], [-5.15, -7.3], [-4.9, -9.8], [-3.3, -12.3]]);
  paint(face, { wash: SKIN, washOp: 255, ink: null, curv: .55 });
  for (const s of [-1, 1]) paint(ellPts(s * 3.3 * u, -6.9 * u, 1.15 * u, .7 * u, 12), { fill: PAL.rose, fillOp: 110 + 70 * clamp(o.blush === true ? 1 : o.blush || 0), bleed: .25, ink: null });
  paint(face, { ink: PAL.ink, sw, curv: .55 });
  rs('fringe');   // a side parting, one sweep each way
  paint(P([[1.5, -13.7], [-2.8, -13.6], [-5.6, -10.8], [-5.6, -7.6], [-4.3, -10.2], [-1.4, -11.9], [1.5, -12.2]]), { wash: HAIR, washOp: 255, ink: PAL.ink, sw: sw * .9, curv: .4 });
  paint(P([[1.5, -13.7], [3.8, -13.1], [5.6, -10.6], [5.6, -7.8], [4.5, -10.4], [1.5, -12.2]]), { wash: HAIR, washOp: 255, ink: PAL.ink, sw: sw * .9, curv: .4 });
  rs('eyes');   // round dark eyes, a size up from the band's dots
  const kinds = Array.isArray(o.eyes) ? o.eyes : o.eyes === 'wink' ? ['happy', 'normal'] : [o.eyes || 'normal', o.eyes || 'normal'], lx = (o.lookX || 0) * u * .3, ly = (o.lookY || 0) * u * .25;
  for (const s of [-1, 1]) {
    const e = kinds[s < 0 ? 0 : 1];
    push(); translate(s * 2.2 * u, -8.5 * u);
    if (clamp(o.squint || 0) > .8 || (['normal', 'look', 'wide', 'dot'].includes(e) && ((T * .9 + (o.seed || 0) * 1.7) % 3.3) < .12)) inkLine([[-.7 * u, 0], [.7 * u, 0]], sw, PAL.ink, 'ink', 0);
    else if (['normal', 'look', 'dot', 'wide', 'shine'].includes(e)) { const k = e === 'wide' || e === 'shine' ? 1.25 : 1; paint(ellPts(lx, ly, .68 * u * k, .76 * u * k, 14), { wash: PAL.ink, ink: null }); paint(ellPts(lx - .22 * u, ly - .26 * u, .22 * u * k, .24 * u * k, 8), { wash: PAL.cream, ink: null }); }
    else if (e === 'narrow') inkLine([[-.7 * u, 0], [.7 * u, 0]], sw * 1.5, PAL.ink, 'ink', 0);
    else eye(e, s, u * .62, o, sw);
    pop();
  }
  rs('mouth');
  const m = o.mouth, big = ['O', 'open', 'laugh', 'wail', 'yawn'].includes(m);
  if (['smile', 'cat', 'smirk', 'grin'].includes(m)) inkLine([[-.7 * u, -6.5 * u], [0, -6.05 * u], [.7 * u, -6.5 * u]], sw * .85, PAL.ink, 'ink', .6);
  else if (['flat', 'wobble', 'frown', 'teeth'].includes(m)) inkLine([[-.55 * u, -6.25 * u], [.55 * u, -6.25 * u]], sw * .85, PAL.ink, 'ink', .3);
  else paint(ellPts(0, -6.3 * u, (big ? .75 : .45) * u, (big ? .7 : .34) * u, 12), { wash: '#B24A52', washOp: 255, ink: PAL.ink, sw: sw * .55 });
  const drool = o.drool ?? .7;   // she always dribbles a little: it's who she is
  if (drool > .02) { rs('drool'); const k = clamp(drool), len = 3 * k * (1 + .06 * Math.sin(T * 5)); paint(ribbon([[.32 * u, -6.15 * u], [.46 * u, (-6.15 + len * .5) * u], [.56 * u, (-6.15 + len) * u]], .14 * u, .34 * u), { wash: '#DDF0FA', washOp: 225, ink: PAL.ink, sw: sw * .35 }); }
  rs('scarf');   // the scarf, last, tucked under the chin
  paint(P([[-2.8, -4.3], [-1, -4.3], [-.8, -1.6], [-3, -1.6]]), { wash: RED, washOp: 255, ink: PAL.ink, sw: sw * .8 });
  for (let i = 0; i < 4; i++) inkLine([[(-2.8 + i * .6) * u, -1.6 * u], [(-2.85 + i * .6) * u, -1.05 * u]], sw * .6, RED, 'ink', 0);
  paint(rrPts(-4.1 * u, -5.5 * u, 8.2 * u, 1.7 * u, .85 * u, J), { wash: RED, washOp: 255, fill: '#A82520', fillOp: 60, tex: .6, ink: PAL.ink, sw });
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * (EMOTE_TOP.includes(o.emote) ? 0 : 6) * u, y + dy - (EMOTE_TOP.includes(o.emote) ? 16 : 13) * u, u * .9, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
}
// A passer-by with no name: Clawd's shape gone round. Flat wash, ink outline, slit eyes, like him.
function wisp(x, y, r, o = {}) {
  const col = o.col || PAL.clay, dk = mixCol(col, PAL.ink, .3), dir = o.flip ? -1 : 1, sw = clamp(r / 20, .4, 1.3);
  y += o.float === false ? 0 : Math.sin(T * 2.4 + (o.seed || 0) * 2.1) * r * .2;
  boilSeed('wisp' + (o.boilKey ?? o.seed ?? Math.round(x)));
  for (const s of [-.42, .42]) paint(rectPts(x + s * r - r * .15, y + r * .68, r * .3, r * .52, r * .02), { wash: dk, washOp: 255, ink: PAL.ink, sw: sw * .8 });
  for (const s of [-1, 1]) paint(rectPts(x + s * r * .92 - (s < 0 ? r * .34 : 0), y - r * .02 + s * dir * r * .06, r * .34, r * .26, r * .02), { wash: col, washOp: 255, ink: PAL.ink, sw: sw * .8 });
  paint(ellPts(x, y, r, r * .93, 20, r * .03), { wash: col, washOp: 255, ink: null });
  paint(ellPts(x, y + r * .5, r * .78, r * .3, 12, r * .02), { fill: dk, fillOp: 110, bleed: .05, tex: .7, border: .5, ink: null });
  paint(ellPts(x, y, r, r * .93, 20, r * .03), { ink: PAL.ink, sw });
  for (const s of [-1, 1]) paint(rectPts(x + s * r * .36 + dir * r * .1 - r * .09, y - r * .38, r * .18, r * .44, r * .01), { wash: PAL.ink, ink: null });
  if (o.hold) { push(); translate(x - dir * r * 1.1, y + r * .1); o.hold(r); pop(); }
}
