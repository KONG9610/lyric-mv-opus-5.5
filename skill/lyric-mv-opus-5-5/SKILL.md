---
name: lyric-mv-opus-5-5
description: Make a hand-painted lyric music video (歌词MV / 手绘动画MV) from a song and its lyrics, with the p5.js + p5.brush kit this skill ships in. Use it whenever someone gives a song file, an .lrc or lyrics and wants a music video, lyric video, animated MV or 歌词视频 made, extended, revised or re-rendered, or asks for a new character, scene, storyboard (分镜) or a faster render for one. It covers the whole job in order: measure the tempo, read the lyrics, agree the cast (Clawd by default), storyboard, character sheets, fonts, stills, a parallel render sized to the machine, and re-rendering only what changed. Written for and tested with Claude Opus 5.5; other models are not recommended yet. 中文说明见同目录 SKILL.zh-CN.md。
---

# Lyric MV (hand-painted, for Claude Opus 5.5)

You are going to make a music video the slow, good way: understand the song, agree a story with the person, paint it in
code, look at your own frames, and render only when they have said yes. The film is drawn with p5.js and p5.brush:
flat washes, ink lines that boil, paper grain. Clawd is the lead unless the person wants someone else.

A Chinese version of this file is beside it (`SKILL.zh-CN.md`). Talk to the person, and write the storyboard and
brief, in the language they are using.

## Before anything: find the kit, and say what you can't do

**The kit** is the repository this skill ships in (it holds `render.mjs`, `ANIMATION_GUIDE.md`, `scripts/`). Find it, in
this order: the environment variable `LYRIC_MV_KIT`; the path written in `kit-path.txt` beside this file; a folder named
`lyric-mv-opus-5.5` near the working directory. If none, ask where it is, or offer to clone it. It needs Node.js, Chrome or
Edge, and ffmpeg; run `npm install` in it once.

**Read `ANIMATION_GUIDE.md` in the kit in full before you paint anything.** It is the craft: the medium, timing for a
viewer who sees it once, animation principles, the engine and Clawd's API. This skill adds what a song needs on top of
it and does not repeat it. Then read `references/pitfalls.md` here: every item in it cost a render or a round of
revisions on a real film.

**Tell the person these three things early**, because each one changes what they need to give you or check:

- You cannot hear the song. Tempo and beat positions are measured by a script; where a word falls inside a line is an
  estimate. They will be asked to check a short list of timings by ear.
- You cannot generate images. Every character is drawn in code from a description or a reference picture, so it will
  be like the reference, not identical, and they will see a model sheet before it is used.
- The kit's own rule is "no text on screen". A lyric video overrides it on purpose: lyrics are text. Say so once, so
  the choice is theirs.

## How much to confirm

Ask this once, at the start, and write the answer in the project's `BRIEF.md`. The default is all four gates:

1. the storyboard, before any scene code;
2. each new character's model sheet, before it is used in a scene;
3. stills (or a few seconds of clip), before a full render;
4. stills, before a partial re-render after a change.

If they say "use your judgement" (你自己看着办), run straight through and show only the finished film and the list of
estimated timings. Anything in between is fine: record exactly which gates are on.

Why gates at all: a full render of a three-minute song takes a quarter of an hour or more, and people change their
minds about story, cast and fonts when they see things. A still costs a second. Never start the full render to "see how
it looks".

## The work, in order

### 1. Intake

Needed: the audio file, and lyrics with times (an `.lrc`; plain lyrics will do, but then every line start is an
estimate too). Ask which part of the song to make (a minute or the whole thing: the whole thing is about three times
the work), the aspect (16:9, 1920×1080, is what the kit paints), and what it is for.

```bash
node scripts/new_project.mjs <name> --audio=<song> --lrc=<lyrics>   # from the kit root; add --cast=<pack> if one applies
cd projects/<name>
node ../../scripts/analyze_audio.mjs assets/song.mp3 --lrc=assets/lyrics.lrc
```

Every film is its own folder under `projects/`, with its own `studio.html`, `config.js`, `scenes/`, `assets/`, `out/`.
Run everything from inside it. `analyze_audio` prints the tempo and four candidates for the first downbeat; choose the
one that puts lyric lines on, or just before, bar lines, set `bpm` and `offset` in `config.js`, and put the choice on the
list for the person to check.

**Cast packs.** `casts/<pack>/` in the kit holds characters that are not part of the public kit (a band's own, a
client's mascot). If `casts/` has a pack whose `CAST.md` says it belongs to this artist or this person, load it
(`--cast=<pack>`) and tell them you did. Never copy a cast pack's characters into the public parts of the kit.

### 2. Read the lyrics, then say what you think the song is

Read all of it before proposing anything. Tell the person, in a few sentences: who is speaking to whom, what changes
between the first line and the last, and which lines carry the weight. Then a one-sentence story.

Look for lines that can become **things in the picture** rather than words on it: a lyric acted out is stronger than
the same lyric written twice, and a pun between a line and an image is what people remember. Ask whether they have
jokes, references or people they want in it; the best ideas on the first film came from the person, not the model.

### 3. Cast

Default lead: Clawd. Ask who else is in it and what they are to each other; let the story decide relationships.

- Bundled guests: `whale()`, `doubao()` and `wisp()` (small round passers-by) in `src/guests.js`. The first two are
  affectionate fan drawings of other AI products' mascots: use them when the story is about AI and the person wants
  them, and credit them.
- A new character needs a reference picture or a clear description. Draw it in code in the cast's own idiom (flat
  wash, ink outline, the same eye and mouth vocabulary), make it read the same options as `clawd()` so `feel()`,
  `emotions()` and `turn()` drive it, and render a model sheet: its views, a row of emotions, and **everyone together
  at their working sizes**. `src/guests.js` is the pattern for a simple character; a cast pack's code is the pattern
  for a full one with five views.
- Real brands' mascots and real people's likenesses are the person's call and responsibility; say so plainly, once.

### 4. Storyboard (gate 1)

Fill in the project's `STORYBOARD.md` (the template is already there). What it has beyond the guide's format, and why:

- **Set-ups and pay-offs**, as a table. A long film holds together by returning to things.
- **Where things are**: every prop and character that persists, shot by shot. Check each new shot against it. (On the
  first film a suitcase was left on a counter in shot 1 and "opened" on a beach in shot 9.)
- **Words on screen**: which lines are subtitles, which few words are lettered large, which become pictures.
- **Estimated timings**: every time that did not come straight from the `.lrc`.
- A repeated chorus has the same words twice: plan the second one against the first (same place, different outcome),
  never the same pictures again.
- Cut on bar lines. A bar is `240 / bpm` seconds.

Present the story in a few lines and the open decisions as a short numbered list. Revise until they approve.

### 5. Character sheets and fonts (gate 2)

- Sheets: as in step 3. Sizes get revised late if you skip the "everyone together" sheet.
- Fonts: `node ../../scripts/font_sheet.mjs --text="<the film's big words>" --latin="<any foreign phrases>"` makes one
  picture of every bundled font on the film's own words. Let them choose. Subtitles in one face; the few big words in
  another, so the film has two voices; a third for foreign phrases if there are any. Put a font of their own in the
  project's `assets/fonts/` and declare it in the project's `studio.html`. Fonts are always local files.
- If they hand you their own lettering (a title they drew), cut it out with `scripts/cutout.mjs` and place it with
  `sticker()`. It usually beats any font.

### 6. Build, and look

Write `scenes/*.js` shot by shot, following the guide's review loop. What matters most:

- Paint each background once as a function and reuse it; give every character a `boilKey`; put the lyric lines in one
  `LINES` table and draw them with `subtitles()` after every shot.
- Check your own work with contact sheets (`node ../../render.mjs --sheet=…`), strips for motion, crops for faces. You
  cannot see motion by reading code.
- Characters other than Clawd need their own `emotions` wrapper (`whale.emotions`, a cast pack's `x.emotions`): the
  kit's `emotions()` cross-fades through Clawd's colour.

### 7. Stills, then the render (gate 3)

Show the person a sheet of the key moments, and a few seconds of clip for anything where timing is the point
(`node ../../render.mjs --clip --range=27.6:31.6 --out=out/check/x.mp4`). List what changed and what you already know is
weak. Wait for a clear yes.

```bash
node ../../scripts/render_all.mjs --out=out/<name>_v1.mp4
```

It sizes itself to the machine: it starts several **separate browsers** (not more workers in one browser, which queue
behind a single GPU process), each rendering its own stretch; it is resumable; it encodes only when every frame exists;
it prints the speed it reached and remembers it. If the person says the GPU or CPU is idle, raise `--browsers`; if the
machine is struggling, lower it.

After it finishes: confirm the frame count and duration it printed, pull a few frames out of the finished file and
look at them, and only then send it, with the estimated-timings list.

### 8. Changes (gate 4)

Small changes are cheap, so say so: nobody should fear asking.

```bash
node ../../scripts/rerender.mjs --dry                 # which shots changed? (nothing is touched)
node ../../scripts/rerender.mjs --out=out/<name>_v2.mp4
```

It re-renders a sample of every shot, compares each frame with the one on disk byte for byte, and re-renders only
the shots that differ, then encodes. For an edit shorter than half a second inside a long shot, pass
`--range=a:b` as well. Changing something shared (a character's drawing, the subtitle style) changes every shot it is
in; tell the person the size of the re-render before you start.

Show stills of the change first unless that gate is off. Keep every version of the film (`_v1`, `_v2`…); never
overwrite the one they last approved.

### 9. Close out

Update `BRIEF.md`: decisions, versions, anything still unchecked, and what went wrong that should not go wrong again.
If a new session picks this film up, the brief and the storyboard are all it has.

## Reporting

Say what is true: what you rendered and looked at, what you only estimated, what you know is weak, how long it took.
"Rendered, 4745 frames, I checked six of them; I have not heard it" is a good report. Do not call a render finished
until the frame count and the duration match the song.

## Reference

- `references/pitfalls.md`: the specific failures, with their causes and fixes. Read it once before starting.
- In the kit: `ANIMATION_GUIDE.md` (craft and API), `src/lyrics.js` (text), `src/guests.js`, `src/props.js`,
  `src/emotions_extra.js`, `templates/project/` (storyboard and brief templates), `casts/README.md` (cast pack format),
  `projects/example/` (a nine-second film that uses all of it).
