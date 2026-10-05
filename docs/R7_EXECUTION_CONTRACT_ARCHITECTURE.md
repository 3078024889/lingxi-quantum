# R7：从“所有工具必须进 Stage Graph”改为“所有工具必须有执行契约”

## 本轮真实根因

R6 不是发现 54 个工具“都坏了”，而是旧 `audit:tools:coverage` 的架构假设已经过时：

> GLOBAL_TOOL_CATALOG 中每个 slug 都必须出现于 `lib/tools/engine/stage-graph.ts`

这对早期统一引擎工具合理，但对后来新增的大量 **浏览器本地工具** 不合理。

例如：
- Regex / Text Diff / JWT / URL Parser：原生 JS 即可，不应该为了过审计伪造 engine graph。
- 视频倒放 / 循环 / 定格：可以直接复用 ffmpeg.wasm 浏览器执行。
- PDF 保护 / 解锁 / 权限 / inspect / attachments：可由 qpdf WASM / PDF browser workbench 执行。
- 图片格式/压缩：适合 Canvas/WASM/浏览器本地执行。

## 全球开源成熟模式提取

- qpdf：低层 PDF 结构变换，适合 encryption / permissions / linearization / inspection，不负责渲染和 OCR。
- ffmpeg.wasm：浏览器内视频/音频转码；重任务须注意内存、SharedArrayBuffer 与 cross-origin isolation。
- Squoosh：图片压缩/转换强调浏览器本地、隐私、WASM codec。
- Tesseract.js：浏览器 OCR。
- TypeScript AST / codemod：结构修改而不是脆弱字符串 patch。

## R7 新审计模型

每一个 GLOBAL_TOOL_CATALOG 工具必须满足一种 **Execution Contract**：

1. `engine-graph`：确实走统一 stage graph。
2. `browser-local`：真实 route + 可执行 UI + 浏览器执行证据。
3. `api-backed`：真实 route + API 调用证据。
4. `infrastructure`：临时邮箱/阅后即焚等独立基础设施。
5. `browser-or-route`：真实 route 且有执行 UI，但不强迫塞进统一 engine。

这比“每个 slug 都写一个假的 g(...)”更严格，也更真实。

输出：
`_local/tool-execution-contracts.json`

后续真实可用性仍需用 fixture / Playwright 验证输入→处理→导出，R7 不把静态证据冒充 E2E。
