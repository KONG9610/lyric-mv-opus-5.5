// props.js: a few props that a lyric video keeps needing. All are pure functions of the time you pass them.
//   bubble(ax, ay, w, h, grow, dir)   a speech bubble whose tail tip is at (ax, ay); the box rises from it to the right
//                                     (dir 1) or the left (dir -1). grow 0..1 scales it from the tail. Put its words at
//                                     bubbleAt(ax, ay, w, h, dir) with write().
//   nameTag(txt, x, y, t, t0, life)   a small paper label that pops in at t0 by a character and puts itself away.
//   firework(x, y, R, age, col, n)    one burst, `age` seconds after it goes off; returns its brightness 0..1 so the
//                                     scene can light the cast (tint) and lift the darkness (flash) with it.
//   moods(a, b)                       merge a mood and a pose that share fields: dy, sq, rot and dx add up instead of
//                                     one replacing the other. clawd(x, y, u, moods(emotions(t, keys), jump(t, 1, 1.4)))
const moods = (m, p) => ({ ...m, ...p, dy: (m.dy || 0) + (p.dy || 0), sq: (m.sq || 0) + (p.sq || 0), rot: (m.rot || 0) + (p.rot || 0), dx: (m.dx || 0) + (p.dx || 0) });

function bubble(ax, ay, w, h, grow = 1, dir = 1) {
  if (grow < .03) return;
  push(); translate(ax, ay); scale(grow * dir, grow);
  paint([[0, 0], [44, -44], [92, -40]], { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: 1.1 });
  paint(rrPts(16, -36 - h, w, h, 30, 2), { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: 1.2 });
  paint(rectPts(46, -44, 42, 12), { wash: PAL.cream, washOp: 255, ink: null });   // hides the outline where the tail joins
  pop();
}
const bubbleAt = (ax, ay, w, h, dir = 1) => [ax + dir * (16 + w / 2), ay - 36 - h / 2];

function nameTag(txt, x, y, t, t0, life = 1.3) {
  const a = t - t0; if (a < 0 || a > life + .2) return;
  const k = backOut(seg(a, 0, .22)) * (1 - easeIn(seg(a, life, life + .2))), w = textWidths(txt, 52).reduce((p, q) => p + q, 0) + 58; if (k < .03) return;
  boilSeed('tag' + t0);
  push(); translate(x, y); rotate(-.04); scale(k); paint(rrPts(-w / 2, -41, w, 82, 22, 1.5), { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: 1.1 }); pop();
  write(txt, x, y, 52 * k, PAL.clayDk, { stroke: null, rot: -.04 });
}

function firework(x, y, R, age, col = '#FFC766', n = 16) {
  if (age < 0 || age > 1.7) return 0;
  const k = easeOut(seg(age, 0, .55)), fade = 1 - seg(age, .7, 1.7), drop = 70 * age * age;
  glow(x, y, R * (1 + .6 * k) * fade, col, .9 * fade);
  for (let i = 0; i < n; i++) {
    boilSeed('fw' + Math.round(x + y) + i);
    const a = i / n * TAU + hash(x + i) * .25, r0 = R * k * .3, r1 = R * k * (.82 + .18 * hash(i + x)), ex = x + Math.cos(a) * r1, ey = y + Math.sin(a) * r1 + drop;
    inkLine([[x + Math.cos(a) * r0, y + Math.sin(a) * r0 + drop * .3], [ex, ey]], 1.5 * fade + .3, i % 2 ? PAL.cream : col, 'ink', 0);
    if (fade > .25) paint(ellPts(ex, ey, 6 * fade, 6 * fade, 6), { wash: PAL.cream, ink: null });
  }
  return fade * k;
}
