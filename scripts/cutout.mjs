// cutout.mjs: lift someone's own artwork (a hand-lettered title, a logo they drew) off a flat background so it can go
// into the film with sticker() (src/lyrics.js).
//   node <kit>/scripts/cutout.mjs <image> --rows=w:h:x:y[,w:h:x:y…] [--relight=row:x0:y0:x1:y1] [--name=title] [--out=assets/title]
// --rows: one crop rectangle for each piece (a title that should arrive a line at a time is one row per line).
// --relight: dark strokes inside that rectangle of that row (1-based) are repainted cream, for black handwriting that
//            has to read on a dark picture.
// It writes <out>/<name>_N.png (transparent) and <out>/<name>_art.js, which defines <NAME>_ART as an array of loaded
// images and sets window.ART_READY so the first frame waits for them. Add that .js to studio.html before the scene.
// The background is whatever colour the crop's top-left pixel is; it is flood-filled in from the edges, so the same
// colour inside the artwork is kept unless it is enclosed background (the hole in an "o"), which is cleared as well.
// Only use artwork the person made or has the right to use. Needs ffmpeg on the PATH.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { args, positional } from './browser.mjs';

const img = positional[0]; if (!img || !args.rows) { console.error('usage: cutout.mjs <image> --rows=w:h:x:y[,…] [--relight=row:x0:y0:x1:y1] [--name=title] [--out=assets/title]'); process.exit(1); }
const out = args.out || 'assets/title', name = args.name || 'title', relit = args.relight ? String(args.relight).split(':').map(Number) : null;
mkdirSync(out, { recursive: true });
const urls = [];
String(args.rows).split(',').forEach((r, k) => {
  const [W, H, X, Y] = r.split(':').map(Number);
  const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', img, '-vf', `crop=${W}:${H}:${X}:${Y}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 30 }).stdout;
  if (raw.length !== W * H * 3) { console.error(`row ${k + 1}: ffmpeg gave ${raw.length} bytes, expected ${W * H * 3}. Is the crop inside the image?`); process.exit(1); }
  const bg = [raw[0], raw[1], raw[2]], dist = i => Math.abs(raw[i * 3] - bg[0]) + Math.abs(raw[i * 3 + 1] - bg[1]) + Math.abs(raw[i * 3 + 2] - bg[2]);
  const gone = new Uint8Array(W * H), stack = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; if (!gone[i] && dist(i) < 36) { gone[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); } for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) { const i = stack.pop(), x = i % W, y = (i - x) / W; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  const o = Buffer.alloc(W * H * 4), lit = relit && relit[0] === k + 1 ? relit.slice(1) : null;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; let a = gone[i] ? 0 : 255, [r, g, b] = [raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2]];
    if (a) { let near = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H || gone[yy * W + xx]) near++; } if (near) a = Math.max(60, Math.min(255, dist(i) * 2.2)); }
    if (a && dist(i) < 36) a = 0;
    if (a && lit && x >= lit[0] && x < lit[2] && y >= lit[1] && y < lit[3] && r + g + b < 380) { a = Math.min(a, Math.max(0, (bg[0] + bg[1] + bg[2] - (r + g + b)) / 2.2)); [r, g, b] = [255, 245, 226]; }
    o[i * 4] = r; o[i * 4 + 1] = g; o[i * 4 + 2] = b; o[i * 4 + 3] = a;
  }
  const png = `${out}/${name}_${k + 1}.png`;
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', png], { input: o });
  urls.push('data:image/png;base64,' + readFileSync(png).toString('base64'));
  console.log(`${png}  ${W}×${H}`);
});
const V = name.toUpperCase().replace(/\W/g, '_') + '_ART';
// load events, not decode(): decode() never settles in a background tab, and the renderer's workers are tabs
writeFileSync(`${out}/${name}_art.js`, `// ${name}: artwork cut out by scripts/cutout.mjs from ${img.replace(/\\/g, '/').split('/').pop()}. Use with sticker() (src/lyrics.js).\nconst ${V} = [\n${urls.map(u => `  '${u}',`).join('\n')}\n].map(src => { const im = new Image(); im.src = src; return im; });\nwindow.ART_READY = Promise.all([window.ART_READY, ...${V}.map(im => im.complete ? 1 : new Promise(done => { im.onload = im.onerror = done; }))]);\n`);
console.log(`${out}/${name}_art.js defines ${V} (${urls.length} image${urls.length > 1 ? 's' : ''})`);
