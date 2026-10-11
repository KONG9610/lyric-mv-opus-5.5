// lyrics.js: hand-lettered text for songs with words on screen. The guide's "no text" rule is the default; a lyric video
// is the exception the person asks for. Text is set in ZCOOL KuaiLe (assets/fonts, declared in studio.html), which has
// Chinese and Latin glyphs, and each character pops in on its own and boils a little, so the words feel written.
//   write(txt, x, y, size, colour, o)   one line, centred on (x, y). Inside camBegin() it sits in the world; pass
//                                       screen: true to pin it to the frame. o.age (seconds since it started) reveals
//                                       it a character at a time at o.rate characters a second; o.out (0..1) fades it;
//                                       o.font is a font stack (FONT_BIG for the big Chinese words, FONT_LATIN for the
//                                       hand-lettered foreign phrases: a change of voice from the subtitles);
//                                       o.stroke is the outline colour (null for none); o.align: 'left' starts at x;
//                                       o.bold (about .03 to .08) thickens every stroke, for faces with one weight.
//   subtitles(t, lines)                 the lyric line for time t at the bottom of the frame. lines = [[start, end,
//                                       text, { size, y, colour }], ...] in seconds. Call it last, outside any camera.
//   parseLRC(text)                      [[seconds, text], ...] from an .lrc file's "[mm:ss.xxx]words" lines.
//   sticker(img, x, y, w, o)            a piece of someone's own artwork (a loaded Image), w wide and centred on (x, y) in
//                                       frame pixels, composited with the lettering. o.pop (0..1, with overshoot), o.rot,
//                                       o.alpha. Embed the image as a data URL and set window.ART_READY to its decode()
//                                       promise, so the first frame waits for it and file:// previews don't taint the canvas.
// Text is composited after the paint (see flushLetters in core.js): call flushLetters() after a painted sign's words
// if something has to pass in front of it.
const LYRIC_FONT = '"ZCOOL KuaiLe", "Permanent Marker", sans-serif';
// Display faces, all declared in studio.html from assets/fonts. Swap the first name in each to restyle every big word.
const FONT_BIG = '"ZCOOL XiaoWei", ' + LYRIC_FONT, FONT_LATIN = '"Caveat Brush", ' + LYRIC_FONT;
window.FONTS_READY = Promise.all([LYRIC_FONT, FONT_BIG, FONT_LATIN].map(f => document.fonts.load('80px ' + f, '重启Aa')));
const _measure = document.createElement('canvas').getContext('2d');
function textWidths(txt, size, font = LYRIC_FONT) { _measure.font = `${size}px ${font}`; return [...txt].map(c => _measure.measureText(c).width); }
function write(txt, x, y, size, colour, o = {}) {
  const font = o.font || LYRIC_FONT, ws = textWidths(txt, size, font), total = ws.reduce((a, b) => a + b, 0), age = o.age ?? 99, rate = o.rate ?? 24, out = clamp(o.out ?? 0);
  let cx = o.align === 'left' ? x : x - total / 2;
  [...txt].forEach((ch, i) => {
    const a = age - i / rate, w = ws[i];
    if (a > 0 && ch.trim()) {
      const at = [cx + w / 2, y + (hash(i * 5.3 + BOILN * 1.7) - .5) * size * .03 - out * size * .2], outline = o.stroke === undefined ? PAL.ink : o.stroke;
      const L = { font: `${size}px ${font}`, ink: false, pop: a * 8, rot: (o.rot || 0) + (hash(i * 3.1 + BOILN * 2.3) - .5) * .05, alpha: (1 - out) * (o.alpha ?? 1), screen: o.screen };
      if (!o.bold) letter(ch, ...at, size, colour, { ...L, stroke: outline });
      else {   // the outline first, wide enough to show round the thickened strokes, then the strokes themselves
        if (outline) letter(ch, ...at, size, colour, { ...L, stroke: outline, strokeW: .12 + o.bold });
        letter(ch, ...at, size, colour, { ...L, stroke: colour, strokeW: o.bold });
      }
    }
    cx += w;
  });
  return total;
}
function subtitles(t, lines) {
  for (const [a, b, txt, o = {}] of lines) if (t >= a && t < b + .25)
    write(txt, W / 2, o.y ?? 972, o.size ?? 64, o.colour || PAL.cream, { age: t - a, out: seg(t, b, b + .25), screen: true, rate: o.rate });
}
function parseLRC(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) { const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/); if (m && m[3].trim()) out.push([+m[1] * 60 + +m[2], m[3].trim()]); }
  return out;
}
function sticker(img, x, y, w, o = {}) { LETTERS.push({ img, x, y, w, h: w * img.naturalHeight / img.naturalWidth, pop: o.pop, rot: o.rot, alpha: o.alpha }); }
