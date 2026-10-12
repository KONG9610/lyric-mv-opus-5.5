# 歌词 MV · Opus 5.5

给一首歌和它的歌词，由 Claude Opus 5.5 做出一支手绘风的歌词 MV：一套工具、一套流程、一个 skill。

[English](README.md)

把歌曲和 `.lrc` 交给 Claude。它会测出速度，读歌词，和你谈定故事与角色，写分镜，用代码把角色画出来，先给你看静帧，
最后渲染出带字幕的完整视频：平涂色块、会抖动的墨线、纸张纹理，所有动作都踩在拍子上。

> **模型。** 本项目为 **Claude Opus 5.5** 编写并在其上测试。演示视频使用 Opus 5.5、中等推理强度制作。
> 目前不推荐其他模型：这件事很依赖长程的故事规划，以及模型对自己渲染结果的检查。

## 演示

[`demo/`](demo/) 里有一支成片，3 分 17 秒：**ChiliChill乐团《混入人类计划》**，策划 KONG，动画 Claude Opus 5.5。
歌曲以及片中的两个乐队角色（Cu夏 和 YuH）属于 ChiliChill 乐团；这里仅作为演示并注明出处，它们**不**包含在本仓库中：
没有音频、没有歌词文件，也没有任何乐队角色的代码。详见 [`demo/README.md`](demo/README.md)。

### 第二种画风，第二支片子

[`demo/act.mp4`](demo/) 是 **ChiliChill乐团 / 三无Marblue《演》**（3 分 30 秒），用的是工具包的另一种画风：像素游戏画面，
歌词打在对话框里，用游戏界面讲故事。它把这首歌读成一个语言模型自己的历史，从一团像素一路变清晰到 Opus 5.5。

做法和第一支一样，只多了一件比画风更重要的事：**Claude 指挥了一个生图模型。** 它自己画不了图，于是由它写提示词，
人把提示词交给生图工具，Claude 再逐张读回结果，切成几档分辨率的精灵，用代码做成动画。全片大约二十张图，
每批只占用人几分钟，没有用到任何图生视频模型。方法写在
[`references/image-assets.md`](skill/lyric-mv-opus-5-5/references/image-assets.md)，
中文提示词模板在 [`image-assets.zh-CN.md`](skill/lyric-mv-opus-5-5/references/image-assets.zh-CN.md)。

## 需要什么

- [Claude Code](https://claude.com/claude-code)，使用 Claude Opus 5.5
- Node.js、ffmpeg，以及 Chrome 或 Edge
- 有独立显卡会快很多（画面是用 WebGL 画的）

```bash
npm install
node scripts/install_skill.mjs        # 把 skill 链接到 ~/.claude/skills，并告诉它工具包在哪
```

然后在 Claude Code 里说：*"给这首歌做一支歌词 MV"*，并附上音频和 `.lrc`。之后由 skill（`lyric-mv-opus-5-5`）接手，
每一个费时的步骤之前都会先问你。

没有歌也可以先验证安装：

```bash
cd projects/example
node ../../scripts/render_all.mjs --out=out/example.mp4      # 九秒的小片，大约半分钟
```

## 一支片子是怎么做出来的

| 步骤 | 做什么 | 你来确认 |
|---|---|---|
| 1 收料 | 拿到歌曲和歌词；测出速度和第一个强拍 | 做哪一段、做来干什么 |
| 2 读歌词 | Claude 说出它认为这首歌在讲什么，并给出一句话的故事 | 故事方向 |
| 3 定角色 | 默认主角是 Clawd；还有谁、彼此什么关系 | 角色名单 |
| 4 分镜 | 每个镜头，按小节对时；埋设与回收；每个道具在哪 | **通过才写代码** |
| 5 设定图、字体 | 新角色的设定图；把字体套在你自己的字上出对比图 | 造型和大小 |
| 6 制作 | 用代码画场景；Claude 自己看抽帧图检查 | — |
| 7 静帧 → 渲染 | 先看关键画面和几秒片段，再并行渲染（可断点续渲） | **通过才渲染整片** |
| 8 修改 | 只重渲发生变化的镜头 | 改动处的静帧 |

开工时由你决定要开几个确认点；说一句"你自己看着办"就全部关闭。

## 仓库里有什么

| 路径 | 内容 |
|---|---|
| [`skill/lyric-mv-opus-5-5/`](skill/lyric-mv-opus-5-5/) | skill 本体：流程（[`SKILL.zh-CN.md`](skill/lyric-mv-opus-5-5/SKILL.zh-CN.md)，英文版 `SKILL.md`）和踩坑清单 |
| [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md) | 手艺和引擎接口（来自原仓库），外加歌词 MV 一节 |
| [`src/`](src/) | 引擎和 Clawd，以及本项目新增的：`lyrics.js`（字幕、大字、贴图）、`guests.js`（鲸鱼、豆包、小圆球路人）、`props.js`、`emotions_extra.js` |
| [`src/pixel/`](src/pixel/) | 像素画风：`px.js`（精灵、像素字、面板、歌词对话框）、`pclawd.js`（任意分辨率的 Clawd 和图标）、`pguests.js` |
| [`scripts/`](scripts/) | `new_project` 新建项目（`--style=pixel`）· `analyze_audio` 测速度和强拍 · `font_sheet` 字体对比图 · `cutout` 抠出你自己写的字 · `pixelize` 把生成的图切成多档分辨率的精灵和背景 · `make_tap` 用耳朵给每个字打点 · `render_all` 并行渲染 · `rerender` 只重渲变化的部分 |
| [`templates/`](templates/) | 两种画风各自的起点：分镜、交接文档、场景骨架 |
| [`projects/example/`](projects/example/)、[`projects/example-pixel/`](projects/example-pixel/) | 一支九秒的手绘小片和一支八秒的像素小片 |
| [`casts/`](casts/) | 放私有角色包的地方（git 忽略） |
| [`assets/fonts/`](assets/fonts/) | 带中文和拉丁字符的开源字体 |

渲染速度参考（6 核台式机、中端显卡）：同时开八个浏览器约 230 毫秒一帧，三分钟的歌大约一刻钟渲染完；只改一个镜头一两分钟。

## 致谢与许可

- **基础工具包**：John Heibel 的 [Claude Animation Base](docs/UPSTREAM_README.md)（MIT），它本身基于 MV《I'm Upping My P(doom)》。
  引擎、Clawd 和 `ANIMATION_GUIDE.md` 都来自它。本仓库保留其许可。
- **绘制**：[p5.js](https://p5js.org) 和 [p5.brush](https://github.com/acamposuribe/p5.brush)。
- **字体**：站酷快乐体、站酷小薇体、马善政毛笔楷体、Caveat Brush（SIL 开源字体许可）和 Permanent Marker（Apache 2.0）。
  许可文本在 [`assets/fonts/`](assets/fonts/)。
- **Clawd** 是 Claude Code 的吉祥物。`src/guests.js` 里的**鲸鱼和豆包**是用本项目画风画的同人形象，原型是 DeepSeek 和豆包的吉祥物；
  与这两个产品没有关联，也未获其背书。如果你的片子不需要，删掉即可。
- **演示**：歌曲和乐队角色 © ChiliChill乐团；策划 KONG；动画 Claude Opus 5.5。
- 本仓库的代码：MIT（见 [`LICENSE`](LICENSE)）。你的歌、歌词和角色仍然是你的：`projects/` 和 `casts/` 正是为此被 git 忽略。
  注明出处不等于有权发布；发布使用了他人音乐或角色的片子之前，请先确认。
