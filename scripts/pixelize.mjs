// pixelize.mjs: turn character art on a flat key colour into true pixel sprites at several resolutions, for the pixel
// style (src/pixel). The same drawing at 72, 144 and 288 cells tall is the same character getting sharper, which a
// generator cannot promise if it draws each size separately.
//
//   one figure:   node ../../scripts/pixelize.mjs gen/hero.png --name=hero --heights=72,144,288
//   a sheet:      node ../../scripts/pixelize.mjs gen/faces.png --grid=3x2 --names=calm,talk,smile,stun,sad,cold --prefix=hero_
//   a backdrop:   node ../../scripts/pixelize.mjs gen/stage.png --name=bg_stage --nokey --heights=180,360,720
//                 (the whole picture, nothing keyed out: 180 rows is a 6-pixel grid on a 1080 frame)
//   options:      --colors=16,28,48 (palette size for each height)   --key=FF00FF --sim=.3 (the background and how
//                 loosely to match it)   --edge=3A2018 (what the outline mixes toward)   --out=assets/hero.sprites.js
//                 --ref=481 (source pixels that count as full height: a figure that is shorter in the art, bowing
//                 or crouching, comes out shorter, so swapping poses does not make the character grow)
//
// For a sheet, --grid=COLSxROWS cuts it into equal cells, read left to right and top to bottom, and --names gives each
// cell's name ('-' skips one). Every figure is trimmed to its own outline, so draw them with blit(…, { foot: true }):
// the feet stay put when one drawing is swapped for another.
// The result is one .js file of data URLs: add it to studio.html before the scenes, then blit(PXART.hero[144], x, y, s).
// Needs ffmpeg on the PATH.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const pos = process.argv.slice(2).filter(a => !a.startsWith('--'));
const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const src = pos[0];
const [gc, gr] = String(args.grid || '1x1').split('x').map(Number), names = args.names ? String(args.names).split(',') : [args.name], prefix = args.prefix || '';
if (!src || !names[0]) { console.error('usage: pixelize.mjs <image> --name=<id> | --grid=3x2 --names=a,b,c,d,e,f   [--heights=72,144,288]'); process.exit(1); }
const heights = String(args.heights || '72,144,288').split(',').map(Number), colors = String(args.colors || heights.map((h, i) => 16 + i * 14).join(',')).split(',').map(Number);
const ref = +args.ref || 0, key = args.key || 'FF00FF', sim = args.sim || '.3', edge = args.edge || '3A2018', out = args.out || `assets/${prefix || names[0]}${prefix ? 'set' : ''}.sprites.js`;
const run = a => spawnSync(a[0], a.slice(1), { encoding: 'utf8' });
const ff = a => { const r = run(['ffmpeg', '-hide_banner', '-y', ...a]); if (r.status) { console.error(r.stderr); process.exit(1); } return r.stderr; };
const [iw, ih] = run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src]).stdout.trim().split(',').map(Number);
const cw = Math.floor(iw / gc), ch = Math.floor(ih / gr), tmp = mkdtempSync(join(tmpdir(), 'pixelize-')), sets = [];

if (args.nokey) {
  const parts = heights.map((h, i) => {
    const w = Math.round(iw * h / ih), f = join(tmp, `bg_${h}.png`);
    ff(['-i', src, '-filter_complex', `[0]scale=${w}:${h}:flags=area,format=rgb24,split[p1][p2];[p1]palettegen=max_colors=${colors[i] ?? 48}:reserve_transparent=0:stats_mode=single[pal];[p2][pal]paletteuse=dither=none`, '-frames:v', '1', f]);
    console.log(`${names[0]}: ${w} × ${h}, ${colors[i] ?? 48} colours`);
    return `${h}: 'data:image/png;base64,${readFileSync(f).toString('base64')}'`;
  });
  sets.push(`    ${JSON.stringify(prefix + names[0])}: { ${parts.join(', ')} }`);
}
names.forEach((nm, n) => {
  if (args.nokey || !nm || nm === '-' || n >= gc * gr) return;
  const cell = `crop=${cw}:${ch}:${(n % gc) * cw}:${Math.floor(n / gc) * ch}`, id = prefix + nm;
  // the figure's bounding box inside its cell, from the keyed alpha
  const m = ff(['-i', src, '-vf', `${cell},colorkey=0x${key}:${sim}:0,format=rgba,alphaextract,format=gray,bbox=min_val=128`, '-frames:v', '1', '-f', 'null', '-']).match(/x1:(\d+) x2:(\d+) y1:(\d+) y2:(\d+)/);
  if (!m) { console.error(`${id}: nothing found in its cell (is the background the key colour?)`); return; }
  const [x1, x2, y1, y2] = m.slice(1).map(Number), bw = x2 - x1 + 1, bh = y2 - y1 + 1, crop = `crop=${bw}:${bh}:${x1}:${y1}`, parts = [];
  heights.forEach((h, i) => {
    const hh = ref ? Math.max(1, Math.round(h * bh / ref)) : h, w = Math.max(1, Math.round(bw * hh / bh)), f = join(tmp, `${n}_${h}.png`);
    ff(['-i', src, '-f', 'lavfi', '-i', `color=0x${edge}:size=4x4`, '-filter_complex',
      `[0]${cell},colorkey=0x${key}:${sim}:0,format=rgba,split[k1][k2];` +
      `[k1]alphaextract,format=gray,${crop},scale=${w}:${hh}:flags=area,lut=y='if(gt(val,120),255,0)',format=gray[al];` +
      `[1][k2]scale2ref[bg][fg];[bg][fg]overlay=format=auto,${crop},scale=${w}:${hh}:flags=area,format=rgb24[rgb];` +
      `[rgb][al]alphamerge,split[p1][p2];[p1]palettegen=max_colors=${colors[i] ?? 24}:reserve_transparent=1:stats_mode=single[pal];[p2][pal]paletteuse=dither=none:alpha_threshold=128`,
      '-frames:v', '1', f]);
    parts.push(`${h}: 'data:image/png;base64,${readFileSync(f).toString('base64')}'`);
  });
  sets.push(`    ${JSON.stringify(id)}: { ${parts.join(', ')} }`);
  console.log(`${id}: ${bw} × ${bh} px in the source → ${heights.join(', ')} cells tall`);
});
rmSync(tmp, { recursive: true, force: true });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `// Pixel sprites made by scripts/pixelize.mjs from ${src.replace(/\\/g, '/').split('/').pop()}. PXART[name][height in cells] is an Image.
(() => {
  const all = {
${sets.join(',\n')}
  };
  window.PXART = window.PXART || {}; const waits = [window.ART_READY];
  for (const id in all) { const set = window.PXART[id] = {}; for (const h in all[id]) { const im = new Image(); waits.push(new Promise(ok => { im.onload = ok; im.onerror = ok; })); im.src = all[id][h]; set[h] = im; } }
  window.ART_READY = Promise.all(waits);
})();
`);
console.log('wrote ' + out);
