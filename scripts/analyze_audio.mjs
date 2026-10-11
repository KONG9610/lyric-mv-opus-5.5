// analyze_audio.mjs: the tempo and beat grid of a song, measured, because the model cannot hear it.
//   node <kit>/scripts/analyze_audio.mjs <audio file> [--lrc=<file.lrc>] [--envelope=33:41]
// Prints: BPM, the beat period, where the beats fall, the four places the first downbeat could be, and (with --lrc)
// each lyric line's start as a bar and beat for each of those four, so you can pick the downbeat that puts line starts
// on or just before bar lines. --envelope=a:b prints a loudness bar chart of the vocal band over that stretch, 10 a
// second: use it to guess where a word falls inside a line (an .lrc file only times the START of each line).
// These are measurements, not hearing. Put every timing that was estimated in the list the person checks by ear.
// Needs ffmpeg on the PATH.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { args, positional } from './browser.mjs';

const file = positional[0]; if (!file) { console.error('usage: analyze_audio.mjs <audio file> [--lrc=file] [--envelope=a:b]'); process.exit(1); }
const SR = 11025, dec = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 30 });
if (dec.status !== 0 || !dec.stdout.length) { console.error('ffmpeg could not decode it:', String(dec.stderr).slice(0, 300)); process.exit(1); }
const n = dec.stdout.length >> 1, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = dec.stdout.readInt16LE(i * 2) / 32768;
const length = n / SR;

// onset strength: the rise in log energy, 172 times a second
const HOP = 64, fr = SR / HOP, F = Math.floor(n / HOP) - 4, env = new Float32Array(F), on = new Float32Array(F);
for (let f = 0; f < F; f++) { let s = 0; for (let i = 0; i < HOP * 4; i++) { const v = x[f * HOP + i]; s += v * v; } env[f] = Math.log(1e-6 + s); }
for (let f = 1; f < F; f++) on[f] = Math.max(0, env[f] - env[f - 1]);

// the strongest repeat in the onsets is usually a bar or half a bar: halve it down to a beat (80–180 BPM)
let best = [0, -1];
for (let lag = Math.floor(.3 * fr); lag < 5 * fr; lag++) { let s = 0; for (let f = 0; f + lag < F; f++) s += on[f] * on[f + lag]; s /= F - lag; if (s > best[1]) best = [lag / fr, s]; }
let period = best[0]; while (period > .75) period /= 2; while (period < .333) period *= 2;
// refine the period and find the phase with a comb over the whole song
const comb = (per, ph) => { let s = 0, c = 0; for (let t = ph; t < length - 1; t += per) { const f = Math.round(t * fr); s += Math.max(on[f - 1] || 0, on[f] || 0, on[f + 1] || 0); c++; } return s / Math.sqrt(c); };
let top = [period, 0, -1];
for (let per = period * .98; per < period * 1.02; per += .0001) for (let ph = 0; ph < per; ph += .004) { const s = comb(per, ph); if (s > top[2]) top = [per, ph, s]; }
const [per, phase] = top, bpm = 60 / per;
console.log(`length      ${length.toFixed(2)} s`);
console.log(`tempo       ${bpm.toFixed(2)} BPM  (one beat ${per.toFixed(4)} s, one 4/4 bar ${(per * 4).toFixed(3)} s)`);
console.log(`beats at    ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => (phase + k * per).toFixed(2)).join('  ')} …`);
console.log(`if the song could be in half or double time, the other readings are ${(bpm / 2).toFixed(1)} and ${(bpm * 2).toFixed(1)} BPM`);

const lrc = args.lrc ? readFileSync(args.lrc, 'utf8').split(/\r?\n/).map(l => l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/)).filter(m => m && m[3].trim()).map(m => [+m[1] * 60 + +m[2], m[3].trim()]) : [];
console.log('\nfirst downbeat: one of these four (set it as `offset` in config.js; `bpm` is the tempo above)');
for (let k = 0; k < 4; k++) {
  const off = phase + k * per;
  // how many lyric lines start on a bar line, or as a pick-up in the beat before one
  const fit = lrc.filter(([t]) => { const b = ((t - off) / per % 4 + 4) % 4; return b < .35 || b > 3; }).length;
  console.log(`  offset ${off.toFixed(3)} s` + (lrc.length ? `   ${fit} of ${lrc.length} lyric lines start on or just before a bar line` : ''));
}
if (lrc.length) {
  console.log('\nlyric lines: start, then the bar and beat it falls on, counted from the FIRST candidate above (for the others, take 1, 2 or 3 beats off)');
  for (const [t, txt] of lrc) { const b = (t - phase) / per; console.log(`  ${t.toFixed(2).padStart(7)}  bar ${String(Math.floor(b / 4)).padStart(3)} beat ${((b % 4 + 4) % 4 + 1).toFixed(1)}  ${txt}`); }
}
if (args.envelope) {   // vocal band (about 500–3000 Hz), 0.1 s steps
  const [a, b] = String(args.envelope).split(':').map(Number), y = new Float32Array(n); let lp = 0, hp = 0, prev = 0;
  const aH = Math.exp(-2 * Math.PI * 500 / SR), aL = Math.exp(-2 * Math.PI * 3000 / SR);
  for (let i = 0; i < n; i++) { hp = aH * (hp + x[i] - prev); prev = x[i]; lp = lp * aL + hp * (1 - aL); y[i] = lp; }
  console.log(`\nvocal-band loudness ${a}–${b} s (dips are gaps between phrases; it cannot tell a voice from a guitar)`);
  for (let t = a; t < b; t += .1) { let e = 0; const i0 = Math.floor(t * SR), i1 = Math.floor((t + .1) * SR); for (let i = i0; i < i1; i++) e += y[i] * y[i]; console.log(t.toFixed(1).padStart(6), '#'.repeat(Math.max(0, Math.round((10 * Math.log10(1e-9 + e / (i1 - i0)) + 45) * 1.6)))); }
}
