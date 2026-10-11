// determinism_check.mjs: does this machine render the same frame to the same bytes twice? rerender.mjs relies on it.
//   node <kit>/scripts/determinism_check.mjs [--t=12.5]          (run in a project folder)
// Prints "identical" or how different the two renders are. If out/frames has that frame, it is compared as well.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { args, launch, openStudio, frameJpeg, frameName } from './browser.mjs';

const sha = b => createHash('sha1').update(b).digest('hex');
const t = +(args.t ?? 1), fps = 24, i = Math.round(t * fps);
const browser = await launch();
const a = await frameJpeg(await openStudio(browser), i / fps);
const b = await frameJpeg(await openStudio(browser), i / fps);   // a second page, as a parallel worker would be
console.log(`two renders of t=${(i / fps).toFixed(3)}: ${sha(a) === sha(b) ? 'identical' : `DIFFERENT (${a.length} vs ${b.length} bytes)`}`);
const f = `out/frames/${frameName(i)}`;
if (existsSync(f)) console.log(`against ${f}: ${sha(readFileSync(f)) === sha(a) ? 'identical' : 'DIFFERENT'}`);
await browser.close();
