// font_sheet.mjs: one image comparing fonts on the film's own words, for the person to choose from.
//   node <kit>/scripts/font_sheet.mjs --text="重启|不算虚拟" [--latin="C'est la vie|Bon voyage"] [--bg=#1F2550] [--fg=#FFF5E2]
//        [--out=out/check/fonts.png]
// It shows every .ttf / .otf in the kit's assets/fonts and in ./assets/fonts (the project's own). A font that has no
// glyphs for a line falls back to a plain face in the picture: that is the sign it cannot set that text.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { args, launch } from './browser.mjs';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..'), out = args.out || 'out/check/fonts.png';
const dirs = [resolve(KIT, 'assets/fonts'), resolve('assets/fonts')].filter((d, i, a) => existsSync(d) && a.indexOf(d) === i);
const fonts = dirs.flatMap(d => readdirSync(d).filter(f => /\.(ttf|otf)$/i.test(f)).map(f => [f.replace(/[-_]?Regular\.(ttf|otf)$/i, '').replace(/\.(ttf|otf)$/i, ''), pathToFileURL(resolve(d, f)).href]));
const text = String(args.text || '歌词字幕 Lyrics').split('|'), latin = String(args.latin || '').split('|').filter(Boolean);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cols = Math.min(4, fonts.length), rows = Math.ceil(fonts.length / cols);
const html = `<!doctype html><meta charset="utf-8"><style>
${fonts.map(([n, u], i) => `@font-face{font-family:F${i};src:url("${u}")}`).join('\n')}
html,body{margin:0}body{width:1920px;min-height:1080px;background:${args.bg || '#1F2550'};color:${args.fg || '#FFF5E2'};display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));font-family:sans-serif}
div.c{padding:26px 16px;border-right:2px dashed #7778;border-bottom:2px dashed #7778;text-align:center;overflow:hidden}
h2{margin:0 0 18px;font:600 22px sans-serif;opacity:.75}p{margin:10px 0;white-space:nowrap;line-height:1.15}
</style>${fonts.map(([n], i) => `<div class="c"><h2>${i + 1}. ${esc(n)}</h2>${text.map((t, k) => `<p style="font-family:F${i},sans-serif;font-size:${k ? 64 : 110}px">${esc(t)}</p>`).join('')}${latin.map(t => `<p style="font-family:F${i},sans-serif;font-size:60px">${esc(t)}</p>`).join('')}</div>`).join('')}`;
mkdirSync(dirname(out), { recursive: true });
const page = resolve(dirname(out), 'fonts.html'); writeFileSync(page, html);
const browser = await launch(), tab = await browser.newPage();
await tab.setViewport({ width: 1920, height: Math.max(1080, rows * 520) });
await tab.goto(pathToFileURL(page).href, { waitUntil: 'load' }); await tab.evaluate(() => document.fonts.ready);
await tab.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`${out}: ${fonts.length} fonts — ${fonts.map(([n], i) => `${i + 1} ${n}`).join(', ')}`);
