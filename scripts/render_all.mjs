// render_all.mjs: render every missing frame of the project in the current folder, in parallel, then encode.
//   node <kit>/scripts/render_all.mjs [--out=out/video.mp4] [--browsers=N] [--no-encode] [--audio=<file>]
//
// Why separate browsers: tabs in one browser share one GPU process and queue behind each other, so render.mjs's
// --workers stops helping after 2 or 3. Separate browser processes each get their own GPU process and scale until
// the CPU or the GPU is full. This script splits the missing frames into N stretches and gives each to its own
// render.mjs. It is safe to stop and run again: frames are written whole, and only missing ones are rendered.
// N is chosen from the machine (cores, free memory) unless --browsers is given; the speed it reached is saved in
// out/.render_profile.json and printed, so the next run (or a person) can pick a better N.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { cpus, freemem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, findChrome, launch, openStudio, frameName } from './browser.mjs';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..'), RENDER = resolve(KIT, 'render.mjs'), fps = 24, DIR = 'out/frames';
const chrome = findChrome(), out = args.out || 'out/video.mp4';

// the project's length and audio, from the page itself
const b0 = await launch(), p0 = await openStudio(b0);
const { dur, audio } = await p0.evaluate(() => ({ dur: DUR, audio: PROJECT.audio || '' }));
await b0.close();
const total = Math.ceil(dur * fps);
mkdirSync(DIR, { recursive: true });
const missing = () => { const m = []; for (let i = 0; i < total; i++) { const f = `${DIR}/${frameName(i)}`; if (!existsSync(f) || statSync(f).size < 1000) m.push(i); } return m; };

const profileFile = 'out/.render_profile.json', profile = existsSync(profileFile) ? JSON.parse(readFileSync(profileFile, 'utf8')) : {};
const auto = Math.max(1, Math.min(12, Math.round(cpus().length * .67), Math.floor(freemem() / 1.5e9)));
const N = +(args.browsers || profile.browsers || auto);
const run = (a) => new Promise(done => { const p = spawn(process.execPath, a, { stdio: ['ignore', 'ignore', 'inherit'] }); p.on('close', done); });

const t0 = Date.now(); let todo = missing(); const first = todo.length;
console.log(`${total} frames in the film, ${first} to render, ${N} browsers (${cpus().length} logical cores)`);
for (let pass = 1; pass <= 3 && todo.length; pass++) {
  const n = Math.min(N, Math.ceil(todo.length / 12)), jobs = [];
  for (let k = 0; k < n; k++) {
    const part = todo.slice(Math.floor(todo.length * k / n), Math.floor(todo.length * (k + 1) / n)); if (!part.length) continue;
    jobs.push(run([RENDER, '--frames', '--workers=2', `--range=${part[0] / fps}:${(part[part.length - 1] + 1) / fps}`, `--chrome=${chrome}`]));
  }
  await Promise.all(jobs);
  todo = missing();
  console.log(`pass ${pass}: ${todo.length} frames still missing`);
}
const secs = (Date.now() - t0) / 1000;
if (first) {
  const ms = Math.round(secs * 1000 / Math.max(1, first - todo.length));
  console.log(`rendered ${first - todo.length} frames in ${(secs / 60).toFixed(1)} min: ${ms} ms a frame`);
  if (first > 200) writeFileSync(profileFile, JSON.stringify({ browsers: N, msPerFrame: ms, cores: cpus().length, when: new Date().toISOString() }, null, 2));
}
if (todo.length) { console.error(`NOT ENCODED: ${todo.length} frames could not be rendered (first: ${todo[0]}). Run one frame by hand to see the error: node ${RENDER} --stills=${(todo[0] / fps).toFixed(3)}`); process.exit(1); }
if (readdirSync(DIR).filter(f => f.endsWith('.jpg')).length !== total) console.log(`note: ${DIR} holds frames beyond the film's length (${total}); the encoder reads them in order, so clear the folder if the film got shorter`);
if (!args['no-encode']) {
  const a = args.audio || audio;
  await run([RENDER, '--encode', `--out=${out}`, `--chrome=${chrome}`, ...(a ? [`--audio=${a}`] : [])]);
  console.log(existsSync(out) ? `wrote ${out} (${(statSync(out).size / 1e6).toFixed(0)} MB, ${total} frames, ${(total / fps).toFixed(2)} s)` : 'ENCODE FAILED: is ffmpeg on the PATH?');
}
