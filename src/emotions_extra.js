// emotions_extra.js: eleven more emotions for EMO, found while making a full-length lyric video. Like the kit's own,
// each is a face and a way of moving on the beat; any character that reads feel() / emotions() can wear them.
//   performing: singing, groove, cheer        small moments: wink, deadpan, awe, firelit, breathe
//   story beats: reboot (shut down and waiting), amnesia (who am I?), wired (too much coffee)
// `tuft` and `tuftRot` are extra pose fields for characters that have a horn or crest; Clawd ignores them.
// Add your own the same way: Object.assign(EMO, { name: { eyes, mouth, emote, tint, take, body: t => ({...}) } }).
Object.assign(EMO, {
  singing:  { eyes: 'happy', mouth: 'open', emote: 'music', take: .5, body: t => { const b = _b(t); return { dy: -.8 * b.ab, sq: .06 * b.hit, rot: .05 * Math.sin(b.bp * Math.PI / 2), aL: .3 + .2 * b.s1, aR: 1.2 + .15 * b.s1, tuft: .3 * b.hit }; } },
  groove:   { eyes: 'closed', mouth: 'smile', emote: 'music', take: .3, body: t => { const b = _b(t); return { dy: -.5 * b.hit, sq: .08 * b.hit, rot: .05 * Math.sin(b.bp * Math.PI), lookY: .3, aL: -.2, aR: -.2, tuftRot: .2 * Math.sin(b.bp * Math.PI) }; } },
  cheer:    { eyes: 'happy', mouth: 'laugh', blush: .3, take: .9, body: t => { const b = _b(t); return { dy: -2 * b.ab, sq: .14 * b.hit, aL: 1.6 + .4 * b.s2, aR: 1.6 - .4 * b.s2, tuft: .6 }; } },
  wink:     { eyes: 'wink', mouth: 'smile', blush: .25, take: .4, body: t => { const b = _b(t); return { rot: .07, dy: -.2 * b.ab, aL: -.3, aR: .6, tuftRot: .25 }; } },
  deadpan:  { eyes: 'narrow', mouth: 'flat', take: .15, body: t => ({ sq: .02 * Math.sin(t * TAU * .25), aL: -.5, aR: -.5, tuft: -.25 }) },
  awe:      { eyes: 'shine', mouth: 'o', take: .6, body: t => { const br = Math.sin(t * TAU * .3); return { sq: -.07 + .02 * br, lookY: -.6, aL: .1 + .05 * br, aR: .1 - .05 * br, tuft: .5 }; } },
  firelit:  { eyes: 'shine', mouth: 'smile', tint: 'gold', tintK: .28, blush: .3, take: .2, body: t => { const br = Math.sin(t * TAU * .25); return { sq: .03 + .025 * br, lookY: -.2, aL: -.6, aR: -.6, tuft: .1 }; } },
  breathe:  { eyes: 'closed', mouth: 'o', take: .2, body: t => { const br = Math.sin(t * TAU * .42); return { sq: -.1 * br, dy: -.3 * Math.max(0, br), aL: -.5 + .25 * br, aR: -.5 + .25 * br, tuft: .3 * br }; } },
  reboot:   { eyes: 'closed', tint: 'pale', tintK: .3, emote: 'dots', take: 0, body: () => ({ aL: -.7, aR: -.7, tuft: -.6 }) },
  amnesia:  { eyes: 'blank', mouth: 'o', emote: '?', take: .5, body: t => { const s = Math.sin(t * TAU * .22); return { rot: .08 * s, lookX: s, aL: -.4, aR: .5 + .2 * s, tuftRot: -.3 * s }; } },
  wired:    { eyes: 'wide', mouth: 'teeth', emote: 'spark', take: 1.1, body: t => ({ dx: .25 * Math.sin(t * TAU * 16), dy: -.5 * Math.abs(Math.sin(t * TAU * 8)), sq: -.05, aL: .9 + .3 * Math.sin(t * TAU * 12), aR: .9 - .3 * Math.sin(t * TAU * 13), tuft: .8 }) },
});
