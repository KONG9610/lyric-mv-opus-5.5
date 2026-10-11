# Pitfalls

Each of these happened while making a full-length lyric video with this kit. Most cost a render or a round of revisions.
中文版：`pitfalls.zh-CN.md`

## Contents
1. Timing and the song
2. Story and continuity
3. Characters
4. Text and fonts
5. Engine and scene code
6. Rendering
7. Working with the person
8. The machine (Windows notes)

## 1. Timing and the song

- **You are deaf; measure, then ask.** `analyze_audio.mjs` gets the tempo right (it matched to 0.01 BPM). Its vote for
  the first downbeat is only a hint: on the test song the vote and the choice that looked right in the film differed.
  Pick one, lock every idle and cut to it, and ask the person whether the cast lands on the beat.
- **An `.lrc` times line starts only.** Anything finer was placed by you: backing vocals in brackets, words sung one
  to a beat ("海边 / 点起 / 烟火"), a word held at the end of a line, a list rattled off. Place them on the beat grid,
  use `--envelope` to find gaps, and list every one for the person to check.
- **Line ends are yours too.** End a subtitle before the next begins; a line that lingers under a new image reads as
  a mistake.
- **A gap in the lyrics is screen time for a read.** Instrumental bars are where a visual joke can land without
  competing with a line. Plan them; do not let them be dead air.

## 2. Story and continuity

- **Track where things are.** A prop set down in one shot stays there. Keep the "where things are" table in the
  storyboard and check each new shot against it.
- **A picture can be misread, and the misreading can be better.** A long shadow on the ground was read as a rocket
  landing; the rocket replaced the shadow. Show stills early enough that a misreading is cheap.
- **Nothing permanent on the lead's face or body.** A stamp on the forehead, then a tag on the arm, were both rejected:
  marks on a simple character make it "ugly" in every later shot. If the story needs the lead to carry something, find
  a way that leaves the silhouette clean (he swallowed the ticket, and took it out again when the story needed it).
- **Second chorus, same words.** Stage it against the first: the same road and obstacles, a changed character.
- **Bookends need the same treatment, not a similar one.** A big word laid over a busy picture did not rhyme with a
  big word alone on white. When two moments answer each other, match background, face, lettering and position, and
  change one thing.
- **Do not double a line.** A word lettered large should leave the subtitle for those seconds.

## 3. Characters

- **Draw in the cast's idiom.** A guest drawn with eyebrows, lashes and realistic proportions looked like it came
  from another film. Flat wash, one ink outline, the cast's eye and mouth vocabulary, a head that is most of the body.
- **Settle sizes on one sheet.** Guests and passers-by were enlarged after a full render. Put everyone side by side
  at working size before any scene uses them.
- **`emotions()` cross-fades through Clawd's colour.** For any other character, pass its colours in each key (see
  `whale.emotions` in `src/guests.js`), or it flashes orange for half a second at every mood change.
- **Arms.** Clawd's arms rest straight out; a character whose arms hang needs the kit's arm numbers remapped, or every
  emotion makes it stand like a scarecrow.
- **Hidden body parts.** A character behind a counter needs its eyes above the counter: compute where the eyes are,
  do not eyeball it.
- **A signature trait is not a mistake.** If a character is known for something odd (one guest always dribbles),
  keep it on by default.

## 4. Text and fonts

- **The kit's default font has no Chinese.** Bundle fonts with the glyphs you need, as local files, declared in
  `studio.html`. Never load a font from the network: a slow font server hung a render.
- **Let the person choose from a picture** of the film's own words (`font_sheet.mjs`). They will pick something you
  would not have.
- **One weight only? Fake bold carefully.** `write(..., { bold })` thickens strokes. Dense characters fill in fast:
  .06 suits two simple characters at 270 px, .035 was the limit for "不算虚拟". Render a test card of weights and ask.
- **Text ignores `push()` / `translate()`.** `write()` and `letter()` place text through the camera only. To move text
  with a panel that slides or shakes, add the offset to the text's own coordinates.
- **Text is composited last.** Call `flushLetters()` after a sign's words if a character or a wipe must pass in front.
- **Their own lettering beats a font.** Cut it out (`cutout.mjs`) and use `sticker()`. Dark handwriting on a dark
  picture needs relighting (`--relight`).
- **Keep titles clear of the set.** Hold the camera on open sky while a title is up; move to the set after.

## 5. Engine and scene code

- **Never name a variable `pop`, `push`, `scale`, `rotate`, `color`, `fill`…** p5 puts those on the global object; a
  local `const pop = …` breaks the next `pop()` with "pop is not a function".
- **`image.decode()` never settles in a background tab,** and the renderer's workers are tabs. Wait for `load` events
  (see the file `cutout.mjs` writes). The symptom is a worker timing out after 60 s while others render.
- **Light.** Use `glow()`; yellow painted over blue goes green. A "gold" tint on a blue character also goes green: tint
  it toward a warm white instead.
- **Fills cost, washes are nearly free.** A watercolour `fill` is the expensive mark. Big flat areas: `wash`.
- **Shapes much larger than the canvas** can lose their outline: pass `ink: null` and draw the edge yourself.
- **One function per set.** Paint a place once and call it from every shot there; put the camera and the cast in the
  shot. Export shared set pieces if a second scene file needs them.
- **Do not hang state on a character by hand in each shot.** If the lead wears something from shot 4 on, wrap the
  call once (`const lead = (x, y, u, o) => clawd(x, y, u, { ...o, hat: 'beanie' })`) and use the wrapper.

## 6. Rendering

- **More workers in one browser does not help.** Tabs share one GPU process: 3 workers and 6 workers both ran at about
  620 ms a frame. Separate browsers scale: 8 browsers reached about 230 ms a frame on a 6-core CPU with a mid-range GPU.
  `render_all.mjs` does this.
- **Renders are resumable, and stopping loses nothing.** A frame is a pure function of time and is written whole.
- **Check the count before you encode.** An interrupted render once produced a six-second "full film".
  `render_all.mjs` refuses to encode an incomplete set.
- **Stale frames.** If the film gets shorter, clear `out/frames`; the encoder reads every file there.
- **Re-render by shot, not by guess.** `rerender.mjs` compares bytes. It is exact for what it samples (every half
  second) and blind between samples: add `--range` for a brief change.
- **The demo file for the web is not the master.** The master is large (about 1.4 MB a second). Make a smaller copy
  for sharing; keep the master.

## 7. Working with the person

- **Ask first.** Several questions before building saved more time than any optimisation.
- **Offer choices as pictures:** fonts, weights, a character at three sizes. A choice in words gets "I'm not sure".
- **Say what you have not verified.** "I have not heard it" and "I checked stills, not motion" belong in every report.
- **Their ideas are the good ones.** In-jokes, people they want in it, a title they drew: make room.
- **Rights are theirs to judge, and you should say so once.** A song, a band's characters, another company's mascot:
  crediting is not permission. Do not lecture; do not pretend the question is not there.
- **Never render the full film without a yes** (unless they turned that gate off).

## 8. The machine (Windows notes)

- Chrome may not be installed; Edge is, and works. The kit finds either.
- PowerShell 5.1: `&&` does not exist; .NET file calls ignore the shell's current folder, so give absolute paths.
- Follow the person's habits for where things go (one user installs everything on `D:`).
- `git` may be missing. Ask before installing anything.
