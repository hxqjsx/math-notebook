# 数学奇妙笔记本 · 动态画廊

让书中的数学图案动起来，让图案背后的生成过程看得见。

本项目由胡小群制作，包含 12 章、174 个图案页面。支持章节选择、播放与暂停、进度拖动、公式及参数展示，可在电脑和手机浏览。

本公开仓库从 **v24（2026-11-14）** 开始，仅包含这一版本的源码及必要构建资产，不包含此前的 Git 历史、历史快照、书籍 PDF 或交接资料。

在线体验：https://hxqjsx.github.io/math-notebook/

源码分享：https://github.com/hxqjsx/math-notebook

下载：仓库页面 Code → Download ZIP，或克隆仓库。

## 本地构建

需要 Python 3.10+；检查另外需要 Node.js 20+。无需安装 npm 包。

```sh
python3 scripts/build.py
python3 scripts/check.py --skip-build
```

构建生成 `dist/index.html`、书籍及老师二维码页面，并保留单文件离线构建能力。网站部署只发布 `dist/`。

## 代码结构

- `math-gallery/src/`：数学公式、绘图引擎、页面交互与样式。
- `math-gallery/revise_semantics.py`：实际构建器。
- `assets/build-base-v7.html`：当前构建依赖的固定模板资产，其名称不代表发布旧版本。
- `project.json`：当前版本及输出文件名。
- `scripts/`：构建与检查入口。

## 反馈

欢迎通过 Issues 提供改进建议。图案问题请注明原书页码、图案名称、设备与浏览器、预期结果和实际结果。

## 来源与授权

原书作者为蒂姆·查蒂尔、埃米·兰维尔，译者署名为“胡小群讲数学团队 译”。页面保留原有署名，动态制作：胡小群。本项目不代表出版社或原书作者的官方软件。

本项目自有程序代码采用 [MIT 许可证](LICENSE)。原书文字、图案、书影、logo、二维码及第三方库和字体不因代码开源而重新授权，分别遵循其权利人的授权条件。
