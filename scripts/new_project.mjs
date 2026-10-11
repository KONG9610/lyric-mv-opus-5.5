// new_project.mjs: start a film. One folder for each song, so songs never share settings, frames or assets.
//   node scripts/new_project.mjs <name> [--audio=<song file>] [--lrc=<lyrics.lrc>] [--cast=<pack>[,<pack>]]
// It makes projects/<name>/ from templates/project: studio.html, config.js, scenes/main.js, STORYBOARD.md, BRIEF.md.
// --audio and --lrc are copied into its assets/ (the song stays out of git: projects/ is ignored).
// --cast adds the scripts of casts/<pack>/ (see casts/README.md) to its studio.html.
// Then work inside that folder: every render and script reads ./studio.html and writes ./out.
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, positional } from './browser.mjs';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..'), name = positional[0];
if (!name || /[\\/:*?"<>|]/.test(name)) { console.error('usage: new_project.mjs <name> [--audio=file] [--lrc=file] [--cast=pack]'); process.exit(1); }
const dir = resolve(KIT, 'projects', name);
if (existsSync(dir)) { console.error(`${dir} already exists`); process.exit(1); }
cpSync(resolve(KIT, 'templates/project'), dir, { recursive: true });
mkdirSync(resolve(dir, 'assets'), { recursive: true });
const fill = f => writeFileSync(resolve(dir, f), readFileSync(resolve(dir, f), 'utf8').replaceAll('{{NAME}}', name).replaceAll('{{DATE}}', new Date().toISOString().slice(0, 10)));
['studio.html', 'scenes/main.js', 'STORYBOARD.md', 'BRIEF.md'].forEach(fill);

if (args.audio) { const to = 'assets/song' + extname(args.audio).toLowerCase(); copyFileSync(args.audio, resolve(dir, to)); const c = resolve(dir, 'config.js'); writeFileSync(c, readFileSync(c, 'utf8').replace('offset: 0 }', `offset: 0, audio: '${to}' }`)); console.log(`song → ${to} (set in config.js)`); }
if (args.lrc) { copyFileSync(args.lrc, resolve(dir, 'assets/lyrics.lrc')); console.log('lyrics → assets/lyrics.lrc'); }
for (const pack of String(args.cast || '').split(',').filter(Boolean)) {
  const j = resolve(KIT, 'casts', pack, 'cast.json');
  if (!existsSync(j)) { console.error(`no cast pack at casts/${pack} (it needs a cast.json)`); continue; }
  const tags = JSON.parse(readFileSync(j, 'utf8')).scripts.map(s => `<script src="../../casts/${pack}/${s}"></script>`).join('\n');
  const h = resolve(dir, 'studio.html'); writeFileSync(h, readFileSync(h, 'utf8').replace('<!-- casts -->', tags + '\n<!-- casts -->'));
  console.log(`cast pack ${pack}: ${basename(j)} read, scripts added to studio.html`);
}
console.log(`\nprojects/${name} is ready. Next, from inside it:\n  node ../../scripts/analyze_audio.mjs assets/song.* --lrc=assets/lyrics.lrc     the tempo and the first downbeat\n  node ../../render.mjs --sheet=0,1,2 --out=out/check/sheet.jpg                   look at frames\n  node ../../scripts/render_all.mjs --out=out/${name}.mp4                         the whole film`);
