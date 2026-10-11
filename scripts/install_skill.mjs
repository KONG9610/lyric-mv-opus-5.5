// install_skill.mjs: make the skill in this kit available to Claude Code, without copying it.
//   node scripts/install_skill.mjs [--dir=<skills folder>]          default: ~/.claude/skills
// It links <skills folder>/lyric-mv-opus-5-5 to this kit's skill/lyric-mv-opus-5-5 (a junction on Windows, a symlink
// elsewhere), so the skill stays in the kit and updates with it, and writes kit-path.txt beside SKILL.md so the skill
// knows where the kit is. Run it again after moving the kit.
import { existsSync, lstatSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args } from './browser.mjs';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..'), NAME = 'lyric-mv-opus-5-5';
const from = resolve(KIT, 'skill', NAME), dir = resolve(args.dir || resolve(homedir(), '.claude/skills')), to = resolve(dir, NAME);
writeFileSync(resolve(from, 'kit-path.txt'), KIT + '\n');
mkdirSync(dir, { recursive: true });
if (existsSync(to) || lstatSync(to, { throwIfNoEntry: false })) {
  if (!lstatSync(to).isSymbolicLink()) { console.error(`${to} exists and is a real folder, not a link. Move it away first; nothing was changed.`); process.exit(1); }
  rmSync(to);   // an old link: replace it
}
symlinkSync(from, to, process.platform === 'win32' ? 'junction' : 'dir');
console.log(`skill linked: ${to} → ${from}\nkit path recorded: ${KIT}\nStart a new Claude Code session; the skill is "${NAME}".`);
