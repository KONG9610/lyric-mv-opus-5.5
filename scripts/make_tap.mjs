// make_tap.mjs: writes a one-page tapping tool for a project, so the person can time every sung character by ear.
// An .lrc file times only the start of each line; nothing in this kit can hear where the words inside a line fall.
//
//   node ../../scripts/make_tap.mjs [--lrc=assets/lyrics.lrc] [--audio=assets/song.mp3] [--out=tap.html] [--name=<project>]
//
// The person opens the page in a browser, plays the song and presses Space once for each character as it is sung (a
// Latin word is one press). The page saves <name>_timings.json; turn it into assets/timings.js with
//   node ../../scripts/make_tap.mjs --import=<path to the json>
// and dialogue() in src/pixel/px.js types each line by them (TIMINGS = [{ start, text, times }, …]). tokensOf() below is the one rule for splitting a line.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
// one token a CJK character or digit, one a run of Latin letters; spaces and punctuation belong to no token
export const tokensOf = txt => txt.match(/[A-Za-z']+|[0-9]|[㐀-鿿豈-﫿]/g) || [];

if (args.import) {
  const d = JSON.parse(readFileSync(args.import, 'utf8')), out = args.out || 'assets/timings.js';
  const rows = d.lines.map(l => `  { start: ${l.start.toFixed(3)}, text: ${JSON.stringify(l.text)}, times: [${l.times.map(x => x == null ? 'null' : (+x).toFixed(3)).join(', ')}] },`);
  writeFileSync(out, `// timings.js: when each token of each lyric line is sung (see tokensOf in scripts/make_tap.mjs for what a token is).\n// One entry a line of the .lrc that has words; null = no time for that token.\nconst TIMINGS = [\n${rows.join('\n')}\n];\n`);
  const done = d.lines.filter(l => l.times.length && l.times.every(x => x != null)).length;
  console.log(`wrote ${out}: ${done} of ${d.lines.length} lines fully tapped`);
  process.exit(0);
}

const lrc = readFileSync(args.lrc || 'assets/lyrics.lrc', 'utf8'), lines = [];
for (const row of lrc.split(/\r?\n/)) { const m = row.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/); if (m && m[3].trim()) lines.push({ start: +m[1] * 60 + +m[2], text: m[3].trim() }); }
const audio = pathToFileURL(resolve(args.audio || 'assets/song.mp3')).href, name = args.name || basename(resolve('.')), out = args.out || 'tap.html';

writeFileSync(out, `<!doctype html>
<html lang="zh"><head><meta charset="utf-8"><title>${name} · 歌词打点</title>
<style>
  body { margin: 0; background: #14112e; color: #f4f1ff; font: 16px/1.5 "Microsoft YaHei", system-ui, sans-serif; }
  main { max-width: 1100px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 20px; margin: 0 0 6px; color: #f2c14e; } p { margin: 4px 0; color: #b9b4d6; }
  kbd { background: #2e2760; border: 1px solid #6a63a8; border-radius: 4px; padding: 1px 7px; color: #fff; }
  #now { margin: 18px 0; padding: 26px 20px; background: #1f1a44; border: 2px solid #d6cff5; min-height: 96px; text-align: center; font-size: 52px; letter-spacing: 4px; }
  #now span { color: #6a63a8; transition: color .05s; } #now span.on { color: #fff; } #now span.hot { color: #f2c14e; }
  #bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 10px 0; }
  button, select { background: #2e2760; color: #fff; border: 1px solid #6a63a8; border-radius: 4px; padding: 6px 12px; font: inherit; cursor: pointer; }
  button.go { background: #7a5518; border-color: #f2c14e; }
  audio { width: 100%; margin-top: 8px; }
  #list { margin-top: 16px; max-height: 44vh; overflow: auto; border: 1px solid #3a3378; }
  #list div { padding: 4px 12px; cursor: pointer; display: flex; gap: 12px; } #list div:hover { background: #241e4a; }
  #list div.cur { background: #3a3070; } #list .t { color: #8c86b8; width: 64px; flex: none; } #list .ok { color: #5fd990; width: 60px; flex: none; }
</style></head><body><main>
<h1>${name} · 歌词打点</h1>
<p>放歌，每唱出一个字就按一下 <kbd>空格</kbd>（英文一个单词按一下，数字一个按一下）。一行敲完会自动跳到下一行。</p>
<p><kbd>Enter</kbd> 播放 / 暂停　<kbd>R</kbd> 重敲当前行（退回到这一行前 3 秒）　<kbd>Backspace</kbd> 撤销上一下　点下面任意一行可以跳到那里重敲。</p>
<p>敲完按"回放检查"：字会按你敲的时间亮起来，对不上的行再重敲。满意后按"保存"，把下载的文件名告诉 Claude。进度会自动存在这个浏览器里。</p>
<div id="bar">
  <button id="play" class="go">播放 / 暂停</button>
  <label>速度 <select id="rate"><option>1</option><option>0.75</option><option>0.5</option></select></label>
  <button id="redo">重敲当前行</button><button id="check">回放检查（从当前行）</button><button id="save" class="go">保存</button><button id="wipe">全部清空</button>
  <span id="stat"></span>
</div>
<div id="now"></div>
<audio id="au" src="${audio}" controls preload="auto"></audio>
<div id="list"></div>
</main><script>
const NAME = ${JSON.stringify(name)}, LINES = ${JSON.stringify(lines)};
const tokensOf = txt => txt.match(/[A-Za-z']+|[0-9]|[\\u3400-\\u9fff\\uf900-\\ufaff]/g) || [];
const au = document.getElementById('au'), now = document.getElementById('now'), list = document.getElementById('list'), stat = document.getElementById('stat');
LINES.forEach(l => { l.tokens = tokensOf(l.text); l.times = l.tokens.map(() => null); });
try { const s = JSON.parse(localStorage.getItem('tap_' + NAME) || 'null'); if (s) s.forEach((t, i) => { if (LINES[i] && t.length === LINES[i].times.length) LINES[i].times = t; }); } catch (e) {}
let cur = Math.max(0, LINES.findIndex(l => l.times.includes(null))), checking = false;
const keep = () => { try { localStorage.setItem('tap_' + NAME, JSON.stringify(LINES.map(l => l.times))); } catch (e) {} };
const fmt = s => Math.floor(s / 60) + ':' + (s % 60).toFixed(1).padStart(4, '0');
function drawList() {
  list.innerHTML = ''; LINES.forEach((l, i) => { const d = document.createElement('div'), done = l.times.filter(x => x != null).length; d.className = i === cur ? 'cur' : '';
    d.innerHTML = '<span class="t">' + fmt(l.start) + '</span><span class="ok">' + (done === l.times.length ? '✓' : done ? done + '/' + l.times.length : '') + '</span><span>' + l.text + '</span>';
    d.onclick = () => go(i, true); list.appendChild(d); });
  const c = list.children[cur]; if (c) c.scrollIntoView({ block: 'nearest' });
  stat.textContent = LINES.filter(l => !l.times.includes(null)).length + ' / ' + LINES.length + ' 行已敲';
}
function drawNow() {
  const l = LINES[cur], t = au.currentTime; now.innerHTML = '';
  l.tokens.forEach((k, i) => { const s = document.createElement('span'), tt = l.times[i]; s.textContent = k + (/[A-Za-z]/.test(k) ? ' ' : '');
    if (checking) { if (tt != null && t >= tt) s.className = (l.times[i + 1] == null || t < l.times[i + 1]) ? 'hot' : 'on'; } else if (tt != null) s.className = 'on';
    now.appendChild(s); });
}
function go(i, clear) { cur = i; checking = false; if (clear) { LINES[i].times = LINES[i].times.map(() => null); keep(); } au.currentTime = Math.max(0, LINES[i].start - 3); drawList(); drawNow(); au.play(); }
function tap() {
  if (checking || au.paused) return; const l = LINES[cur], i = l.times.indexOf(null); if (i < 0) return;
  l.times[i] = +au.currentTime.toFixed(3); keep();
  if (i === l.times.length - 1 && cur < LINES.length - 1) { cur++; drawList(); } drawNow();
}
function undo() { let l = LINES[cur], n = l.times.filter(x => x != null).length; if (!n && cur > 0) { cur--; l = LINES[cur]; n = l.times.length; } if (n) { l.times[n - 1] = null; keep(); drawList(); drawNow(); } }
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) tap(); }
  else if (e.code === 'Enter') { e.preventDefault(); au.paused ? au.play() : au.pause(); }
  else if (e.code === 'KeyR') go(cur, true);
  else if (e.code === 'Backspace') { e.preventDefault(); undo(); }
});
document.getElementById('play').onclick = () => au.paused ? au.play() : au.pause();
document.getElementById('rate').onchange = e => au.playbackRate = +e.target.value;
document.getElementById('redo').onclick = () => go(cur, true);
document.getElementById('check').onclick = () => { checking = true; au.currentTime = Math.max(0, LINES[cur].start - 2); au.play(); };
document.getElementById('wipe').onclick = () => { if (confirm('清空所有已敲的时间？')) { LINES.forEach(l => l.times = l.times.map(() => null)); keep(); cur = 0; drawList(); drawNow(); } };
document.getElementById('save').onclick = () => {
  const blob = new Blob([JSON.stringify({ name: NAME, lines: LINES.map(l => ({ start: l.start, text: l.text, tokens: l.tokens, times: l.times })) }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = NAME + '_timings.json'; a.click();
};
(function loop() { if (checking) { const t = au.currentTime; let i = cur; while (i < LINES.length - 1 && LINES[i + 1].times[0] != null && t >= LINES[i + 1].times[0] - .3) i++; if (i !== cur) { cur = i; drawList(); } drawNow(); } requestAnimationFrame(loop); })();
drawList(); drawNow();
</script></body></html>
`);
console.log(`wrote ${out}: ${lines.length} lines, ${lines.reduce((n, l) => n + tokensOf(l.text).length, 0)} taps`);
