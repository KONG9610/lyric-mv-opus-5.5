# Fonts

All are open-licence and redistributable; the licence texts are beside them. Fonts are loaded from here as local files
(declared in `studio.html`): a render never touches the network.

| file | family | licence | used for |
|---|---|---|---|
| ZCOOLKuaiLe-Regular.ttf | ZCOOL KuaiLe 站酷快乐体 | SIL OFL 1.1 | subtitles, name tags, credits (Chinese + Latin) |
| ZCOOLXiaoWei-Regular.ttf | ZCOOL XiaoWei 站酷小薇体 | SIL OFL 1.1 | big words (`FONT_BIG`) |
| CaveatBrush-Regular.ttf | Caveat Brush | SIL OFL 1.1 | hand-lettered foreign phrases (`FONT_LATIN`) |
| MaShanZheng-Regular.ttf | Ma Shan Zheng 马善政毛笔楷体 | SIL OFL 1.1 | an alternative for big words |
| PermanentMarker-Regular.ttf | Permanent Marker | Apache 2.0 | the base kit's label face (Latin only) |

All five come from the [Google Fonts repository](https://github.com/google/fonts). To add one, drop the file here (or in a
project's own `assets/fonts`), declare it with `@font-face` in `studio.html`, and compare with `scripts/font_sheet.mjs`.
