# Lyric MV · Opus 5.5

Hand-painted lyric music videos, made by Claude Opus 5.5 from a song and its lyrics: a kit, a workflow and a skill.

[中文说明](README.zh-CN.md)

Give Claude a song and an `.lrc`. It measures the tempo, reads the lyrics, agrees a story and a cast with you, writes a
storyboard, draws the characters in code, shows you stills, and renders a full-length video with subtitles: flat
washes, boiling ink lines, paper grain, everything on the beat.

> **Model.** This is written for and tested with **Claude Opus 5.5**. The demo was made with Opus 5.5 at medium
> reasoning effort. Other models are not recommended yet: the work leans on long-range story planning and on the model
> reviewing its own frames.

## Demo

[`demo/`](demo/) holds one finished film, 3 min 17 s: **《混入人类计划》 by ChiliChill乐团**, planned by KONG and animated
by Claude Opus 5.5. The song, and the two band characters in it (Cu夏 and YuH), belong to ChiliChill; they are shown here
as a demonstration, with credit, and are **not** part of this repository: no audio, no lyrics file and none of the
band's character code is included. See [`demo/README.md`](demo/README.md).

## What you need

- [Claude Code](https://claude.com/claude-code) with Claude Opus 5.5
- Node.js, ffmpeg, and Chrome or Edge
- A dedicated GPU helps a lot (the paint is WebGL)

```bash
npm install
node scripts/install_skill.mjs        # links the skill into ~/.claude/skills and tells it where this kit is
```

Then, in Claude Code: *"Make a lyric MV for this song"*, with the audio and the `.lrc` attached. The skill
(`lyric-mv-opus-5-5`) takes it from there, and asks before every expensive step.

To check an install without a song:

```bash
cd projects/example
node ../../scripts/render_all.mjs --out=out/example.mp4      # nine seconds, about half a minute
```

## How a film gets made

| step | what happens | you confirm |
|---|---|---|
| 1 Intake | song + lyrics in; tempo and first downbeat measured | which part, what for |
| 2 Lyrics | Claude says what it thinks the song is about, and a one-line story | the direction |
| 3 Cast | Clawd leads by default; who else, and who they are to each other | the cast |
| 4 Storyboard | every shot, timed to bars; set-ups and pay-offs; where every prop is | **before any code** |
| 5 Sheets, fonts | model sheets for new characters; a picture of fonts on your own words | looks and sizes |
| 6 Build | scenes painted in code; Claude reviews its own contact sheets | — |
| 7 Stills → render | key frames and short clips first, then a parallel, resumable render | **before the full render** |
| 8 Changes | only the shots that changed are rendered again | stills of the change |

You choose at the start how many of those confirmations you want; "use your judgement" turns them all off.

## What is in the box

| path | what it is |
|---|---|
| [`skill/lyric-mv-opus-5-5/`](skill/lyric-mv-opus-5-5/) | The skill: the workflow (`SKILL.md`, [中文](skill/lyric-mv-opus-5-5/SKILL.zh-CN.md)) and the pitfalls list |
| [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md) | The craft and the engine's API (from the base kit), plus a section on lyric videos |
| [`src/`](src/) | The engine and Clawd, and what this kit adds: `lyrics.js` (subtitles, big words, stickers), `guests.js` (a whale, Doubao, small round passers-by), `props.js`, `emotions_extra.js` |
| [`scripts/`](scripts/) | `new_project` · `analyze_audio` (tempo, downbeat) · `font_sheet` · `cutout` (your own lettering) · `render_all` (parallel, resumable) · `rerender` (only what changed) |
| [`templates/project/`](templates/project/) | What a new film starts from: storyboard, brief, scene skeleton |
| [`projects/example/`](projects/example/) | A nine-second film that uses all of it |
| [`casts/`](casts/) | Where private character packs go (ignored by git) |
| [`assets/fonts/`](assets/fonts/) | Open-licence fonts with Chinese and Latin glyphs |

Rendering in numbers, on a 6-core desktop with a mid-range GPU: about 230 ms a frame with eight browsers, so a
three-minute song renders in roughly a quarter of an hour; changing one shot takes a minute or two.

## Credits and licences

- **Base kit**: [Claude Animation Base](docs/UPSTREAM_README.md) by John Heibel (MIT), itself based on the music video
  *I'm Upping My P(doom)*. The engine, Clawd and `ANIMATION_GUIDE.md` come from it. This repository keeps its licence.
- **Painting**: [p5.js](https://p5js.org) and [p5.brush](https://github.com/acamposuribe/p5.brush).
- **Fonts**: ZCOOL KuaiLe, ZCOOL XiaoWei, Ma Shan Zheng, Caveat Brush (SIL Open Font License) and Permanent Marker
  (Apache 2.0). Licence texts are in [`assets/fonts/`](assets/fonts/).
- **Clawd** is the Claude Code mascot. **The whale and Doubao** in `src/guests.js` are fan drawings, in this kit's
  style, of the DeepSeek and Doubao mascots; they are not affiliated with or endorsed by those products. Remove them
  if that is not what you want in your film.
- **Demo**: song and band characters © ChiliChill乐团; planned by KONG; animated by Claude Opus 5.5.
- Code in this repository: MIT (see [`LICENSE`](LICENSE)). Your songs, lyrics and characters stay yours: `projects/` and
  `casts/` are ignored by git for that reason. Crediting a song is not the same as having the right to publish it;
  check before you post a film that uses someone else's music or characters.
