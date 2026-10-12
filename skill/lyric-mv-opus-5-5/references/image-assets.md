# Working with an image model

You cannot draw a picture, but you can direct something that can. On the second film made with this kit every piece
of art richer than a few rectangles came from an image generator that the person ran, to prompts you wrote, and was
cut into sprites by a script here. It cost a few minutes of the person's time per batch and changed what the film
could be. Treat it as part of the craft, not as a fallback.

中文版（给对方看的提示词模板）：[`image-assets.zh-CN.md`](image-assets.zh-CN.md)

## Who does what

| you | the image model | the person |
|---|---|---|
| decide what art the film needs and when | draws stills | runs the generator, or lets you call it |
| write the prompts, as a numbered batch | | glances at the results |
| read every result, judge it, cut it up | | says which ones they do not like |
| do all motion, timing, layout, text | | |

Stills only. Nothing here needs an image-to-video model: a walk is two or three drawn frames, a mouth is two, a
change of mood is a swap between two cells of one sheet, and everything else (camera, break-up, light, type) is code.

Ask how images get made on this machine before you plan around it. The usual answers: the person pastes your prompts
into a chat with a generator and tells you when the files are in a folder; or there is a command-line generator you
may call yourself. Either way, agree one folder, and name every file in the prompt.

## When to ask for art, and when to draw it in code

- **Ask** for anything with a face that has to act, anything with cloth, hair or light, and any place the film returns
  to. A background the lead stands on for a minute is worth one image.
- **Draw in code** the interface, icons, anything that must change every frame (bars, counters, type), and anything
  deliberately crude.
- Do not mix levels of finish by accident. A generated character on a code-drawn checkerboard looks pasted in. Either
  give the world the same treatment, or make the difference mean something (on that film, the early world was crude
  because the model in the story was).

## The method: one standard picture, then sheets

A generator remembers nothing between images. The only thing that holds a character together is the reference picture
attached to each request.

1. **Standard picture.** One figure, front view, plain pose, on a flat key colour. Iterate on this one until it is
   right; everything later inherits it.
2. **Line-up**, if there is more than one character: all of them in one image, feet on one line, with their relative
   heights stated in words. Attach it to every later request. (Two characters generated separately came out as if by
   two artists, one a head taller; one line-up fixed it for good.)
3. **Sheets.** One image holding a grid of the same character: 3 × 2 expressions with the body unchanged, or 3 × 2
   poses. Six cells from one generation match each other far better than six generations, closely enough to swap
   between as animation. Ask for "cell 2 is exactly cell 1 with the mouth open" and you have a mouth; "with the eyes
   closed" and you have a blink.
4. **Backgrounds** separately, with no characters, and with the part of the frame that must stay empty named in the
   prompt (where the lead stands, where the interface goes).

To put a new character into an existing style, attach two references and say what each is for: "A decides only how it
is drawn (line weight, proportions, how limbs and eyes are done); B decides only who it is (colours, features). Do
not copy B's proportions."

## Writing the prompt

Open the conversation with the rules that apply to every image, once:

- call the image tool directly, one image per description, do not rewrite the description;
- the style in concrete terms (for pixel art: hard edges, no anti-aliasing, no gradients, flat fills, a dark outline);
- characters on pure `#FF00FF`; no text, letters, numbers, watermark, border, shadow, ground, effect marks;
- where to save, under the name in square brackets; reply with the path only.

Then one block per image: `[filename.png]`, the aspect ratio, and the picture in plain sentences. For a sheet, say the
grid, that cells are the same size and do not touch, that the figures are the same size with their feet on one line,
and then number the cells row by row. Say what must not change ("only the face differs") as plainly as what must.

Write prompts in the language the person will paste them in. Keep each one self-contained: they will be pasted one
at a time.

## Reading what comes back

Open every image. Check: is the background one flat colour; are the cells the same size and separate; is anything
written on it; do face, clothes and colours match the standard picture; are the relative sizes what you asked for.

Small misalignments are yours to fix in code (align on the feet). Ask for a regeneration only when the drawing itself
is wrong, and tell the person the one sentence to send back: "cell 4's dress is the wrong colour; keep the other five
and regenerate the sheet."

## Cutting it up: `scripts/pixelize.mjs`

```bash
node ../../scripts/pixelize.mjs gen/hero.png --name=hero --heights=72,144,288
node ../../scripts/pixelize.mjs gen/faces.png --grid=3x2 --names=calm,talk,smile,stun,sad,cold --prefix=hero_ --ref=481
node ../../scripts/pixelize.mjs gen/stage.png --name=bg_stage --nokey --heights=180,360,720
```

It keys out the background, trims each figure, reduces it to true pixels at each height with a small palette, and
writes one `.js` of data URLs; `blit(PXART.hero_calm[144], x, y, s, { foot: true })` draws it.

- **Several heights from one drawing** are the same character getting sharper. That is a storytelling device a
  generator cannot give you by drawing each size itself.
- `--ref` is the source height that counts as full size, so a bowing or crouching figure comes out shorter instead of
  being stretched to match.
- Give palettes 24 colours or more. At 8, a small accent (a yellow horn, a red mouth) is merged into its neighbour.
- Keep a backdrop at the same pixel size as the figures standing on it: 180 rows of background for a 72-cell figure
  shown at 432 px, and so on.

## What to tell the person

- What you are asking for and what each image is for, as a short table. They are spending their time; let them see why.
- That a design based on someone else's character, a band's mascot or a product's logo is theirs to judge, once.
- Art of characters that are not theirs to publish goes in a cast pack (`casts/`), and so do the sprites cut from it.
