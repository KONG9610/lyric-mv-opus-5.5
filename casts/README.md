# Cast packs · 角色包

Characters that are yours, or a client's, or a band's, and are **not** for the public kit, live here: one folder each.
Everything in `casts/` except this file is ignored by git.

不属于公开工具包的角色（你自己的、客户的、某个乐队的）放在这里，一个包一个文件夹。`casts/` 下除本文件外的内容都被 git 忽略。

```
casts/<pack>/
  cast.json        { "name": "...", "for": "who or what this pack is for", "scripts": ["a.js", "a_sheets.js"] }
  CAST.md          who the characters are, when to load the pack, how to call them, what must not be published
  *.js             the characters: functions that read the same options as clawd() (see src/guests.js for a small
                   one), each with its own `x.emotions(t, keys)` wrapper; optional model-sheet loops
  references/      the pictures they were drawn from, and rendered model sheets
```

Load a pack into a film with `node scripts/new_project.mjs <name> --cast=<pack>`, or add its scripts to the project's
`studio.html` at the `<!-- casts -->` marker by hand.

用 `node scripts/new_project.mjs <名字> --cast=<包名>` 把角色包加载进一支片子，或者手动把它的脚本加到项目 `studio.html`
里 `<!-- casts -->` 标记处。

A pack's scripts load after the engine and Clawd and before the scenes, so they may use everything in `src/` and may add
emotions to `EMO`. Scenes that use a pack's characters cannot be published without it: keep such projects private, or
publish the finished video only.
