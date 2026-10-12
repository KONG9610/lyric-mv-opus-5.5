# The pixel style

The kit's second look: a pixel-art game screen. Lyrics are typed into a dialogue box with a portrait and a name tag,
the sung character lights up gold, and the game's interface (panels, bars, cards, toasts) carries the story. Use it
when the song suits a game, a chat, a screen, or when the person points at a film that looks like one.

It shares nothing with the painted style except timing: plain Canvas 2D, smoothing off, a few milliseconds a frame.
A three-and-a-half-minute film renders in about two minutes on one browser, so `render.mjs --clip` is enough and
revisions are nearly free. Say so; it changes how freely the person will ask for changes.

```bash
node scripts/new_project.mjs <name> --style=pixel --audio=<song> --lrc=<lyrics>
```

`projects/example-pixel/` is an eight-second film that uses the pieces below.

## Engine: `src/pixel/px.js`

A shot is still `fn(t, lt, dur)`, registered with `shots()`, and still a pure function of `t`. Coordinates are frame
pixels (1920 × 1080). `X` is the 2D context.

| call | what it does |
|---|---|
| `box`, `frameBox`, `tiles`, `bricks` | flat rectangles and simple grounds |
| `pix(key, w, h, build)`, `spr(rows, palette)` | a cached sprite built cell by cell, or from strings |
| `blit(cv, x, y, s, o)` | draw a sprite at `s` screen pixels a cell; `foot`, `flip`, `rot`, `sy`, `alpha`, `crop` |
| `ptext(txt, x, y, s, col, o)`, `pw(txt, s)` | pixel text from a font's 12 px bitmaps, enlarged; `align`, `shadow`, `count`, `hot` |
| `panel`, `tag`, `bar`, `toast`, `codex`, `floatNum`, `banner` | the interface kit |
| `dialogue(t, line, who, o)` | the lyric box; with `o.times` it types each token when it is sung |
| `lit`, `shade`, `vignette`, `dust`, `scanlines` | light and atmosphere |

`src/pixel/pclawd.js` is Clawd as a sprite at any resolution (`pclawd(x, y, k, s, o)`: `k` cells a body unit) and the
icons; `pguests.js` the guest characters. Art from an image model comes in through `scripts/pixelize.mjs`
(see [`image-assets.md`](image-assets.md)).

## What that film learned

- **Resolution can mean something.** The lead went from an 8 × 14 smudge to a 288-cell figure as the model in the story
  grew, and the backdrops sharpened with it. Whatever the idea is, keep everything on screen at one pixel size at any
  moment; mixed densities look like a mistake.
- **Text that slides is unreadable.** Small type crossing the frame smears, at any frame rate, once the video is
  compressed. Move, stop, show the words, move again (`walkStop` in that film's `ending.js`).
- **Type on the syllable, not on the line.** An `.lrc` times line starts only. Get per-character times (a listening
  model, or the tapping page from `scripts/make_tap.mjs`), take the words from the `.lrc` and only the times from the
  listener, snap them to the beat grid, and check lines with the same melody against each other. Then hang every
  picture cue that answers a word on that word's time.
- **Look at the loudness of an instrumental stretch before staging it.** The last thirty seconds of that song were
  drawn as a quiet hold; fifteen of them were the loudest in the track.
- **Open on the conflict.** A museum piece nobody recognises is not a first shot for a feed. Four seconds of the
  film's whole argument, then the history.
- **A transition can be an object.** Every "Action" in the lyric became a clapperboard that shuts on the word and
  whose letterbox bars close one shot and open the next.
- **Check numbers at their largest.** A counter that fits at "×2" leaves its box at "×11". Right-align, and render the
  frame where the value peaks.
- **Layer effects last, in one file.** Shakes on hits, torn frames on seams and slow pushes were added by wrapping
  every registered shot (`fx.js` there), after the shots were approved, so they never had to be redone.
- **Facts on screen are checked, and worded as what they are.** "One of the first", "an analyst's estimate", a year
  rather than a day when the source is second-hand.
