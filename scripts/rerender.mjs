// rerender.mjs: after an edit, find the shots whose picture changed, re-render only those, and encode again.
//   node <kit>/scripts/rerender.mjs [--step=0.5] [--range=a:b,c:d] [--dry] [--out=out/video.mp4] [--browsers=N]
//
// How it knows: a frame is a pure function of time, and the same code renders the same bytes (check a machine with
// determinism_check.mjs). So it renders a sample of frames (every --step seconds of every shot, and each shot's first
// and last frame) and compares each with the file already in out/frames. A shot with any sample that differs, or any
// frame missing, is cleared and rendered again whole. Everything else is reused.
// What it can miss: a change shorter than --step in the middle of a shot whose samples all still match (one blink, a
// word that pops for a quarter of a second). When you know where you edited, add --range=a:b (seconds) to force it,
// or lower --step. --dry prints what it would do and touches nothing.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, launch, openStudio, frameJpeg, frameName } from './browser.mjs';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..'), fps = 24, DIR = 'out/frames', step = +(args.step || .5);
const sha = b => createHash('sha1').update(b).digest('hex');

const probe = await launch(), page0 = await openStudio(probe);
const { dur, starts } = await page0.evaluate(() => ({ dur: DUR, starts: SHOTS.map(s => s[0]) }));
await probe.close();
const total = Math.ceil(dur * fps), bounds = [...new Set([0, ...starts.map(s => Math.ceil(s * fps - 1e-6)), total])].sort((a, b) => a - b);   // a shot owns the frames from its start time on
const shots = bounds.slice(0, -1).map((a, i) => ({ a, b: bounds[i + 1], dirty: false, why: '' }));
for (const s of shots) {   // which frames stand for this shot
  const set = new Set([s.a, s.b - 1]); for (let i = s.a; i < s.b; i += Math.max(1, Math.round(step * fps))) set.add(i);
  s.samples = [...set].sort((x, y) => x - y);
}
// forced ranges
for (const r of String(args.range || '').split(',').filter(Boolean)) {
  const [a, b] = r.split(':').map(Number);
  for (const s of shots) if (s.b / fps > a && s.a / fps < b) { s.dirty = true; s.why = `--range=${r}`; }
}
// sample in a few browsers at once; stop looking at a shot as soon as it is known to have changed
const K = Math.min(4, shots.length), queue = shots.filter(s => !s.dirty);
await Promise.all(Array.from({ length: K }, async () => {
  const browser = await launch(), page = await openStudio(browser);
  for (let s; (s = queue.shift());) for (const i of s.samples) {
    const f = `${DIR}/${frameName(i)}`;
    if (!existsSync(f)) { s.dirty = true; s.why = `frame ${i} missing`; break; }
    if (sha(await frameJpeg(page, i / fps)) !== sha(readFileSync(f))) { s.dirty = true; s.why = `changed at ${(i / fps).toFixed(2)} s`; break; }
  }
  await browser.close();
}));

const dirty = shots.filter(s => s.dirty), n = dirty.reduce((k, s) => k + s.b - s.a, 0);
for (const s of shots) console.log(`${(s.a / fps).toFixed(2).padStart(7)} – ${(s.b / fps).toFixed(2).padStart(7)} s  ${s.dirty ? 'RE-RENDER  (' + s.why + ')' : 'unchanged'}`);
console.log(`${dirty.length} of ${shots.length} shots, ${n} of ${total} frames to render again`);
if (args.dry || !n) process.exit(0);
for (const s of dirty) for (let i = s.a; i < s.b; i++) { const f = `${DIR}/${frameName(i)}`; if (existsSync(f)) unlinkSync(f); }
const pass = ['out', 'browsers', 'audio', 'chrome'].filter(k => args[k]).map(k => `--${k}=${args[k]}`);
spawn(process.execPath, [resolve(KIT, 'scripts/render_all.mjs'), ...pass], { stdio: 'inherit' }).on('close', c => process.exit(c));
