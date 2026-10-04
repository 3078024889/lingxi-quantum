# V66 全球长尾扫描：PDF / 媒体 / 开发者

日期：2026-10-04

## Round 1 — PDF
成熟 PDF 工具站把 Halve PDF pages、Pages per sheet、Search PDFs、Bookmark PDF、Extract images、Rasterize、Remove metadata 等作为独立入口。
V66 选择当前引擎能真实完成且不虚标的：
- PDF 页面拆半
- PDF 全文搜索

未冒充：
- PDF Bookmark 编辑（pdf-lib 没有现成 outlines 高层 API）
- 嵌入图片无损提取（当前不把“页面渲染为图片”冒充 embedded-image extraction）

## Round 2 — Video
成熟在线工具把 Reverse、Loop、Stop Motion、Mute、Speed 拆分为独立搜索入口。
V66 复用生产 FFmpeg WASM：
- Reverse video
- Loop video
- Stop-motion video
- Boomerang option

## Round 3 — Audio
成熟音视频平台把 noise removal / voice enhancement / loudness normalization 作为独立任务。
V66 使用 FFmpeg 本地：
- high-pass / low-pass
- afftdn（若核心支持）
- dynamic normalization
- loudnorm
并提供兼容回退，不宣称生成式 AI 修复。

## Round 4 — Developer
高意图开发者长尾包含 timestamp、JWT、UUID/ULID、Cron、JSON/XML/YAML 等。
V66 先补 Cron 5-field parser + next runs。
不冒充 Quartz 6/7-field 支持。

## Round 5 — 国际格式与小众需求
DJVU、XPS/OXPS、MOBI/AZW3、RAW/TIFF/TGA 等继续保留在缺口池。
只有当浏览器/现有依赖有可靠解析路径时再上线，避免“只有按钮没有真实转换”。
