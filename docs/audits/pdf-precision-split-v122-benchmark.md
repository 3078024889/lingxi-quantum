# V122｜PDF 精准拆分：成熟平台对比与实测

日期：2026-11-02

## 全球平台对标与官方文档

- iLovePDF（https://www.ilovepdf.com/split_pdf）：提取选定页面、区间、按固定页数组拆分；用户可以合并所选区间为一个 PDF。
- PDFsam Basic（https://pdfsam.org/pdf-extract-pages/）：支持 `2,5-7,12-,last` 等页码表达式；支持单独的每个页面范围与合并输出；本地处理，不上传用户文件。
- PDF24（https://tools.pdf24.org/en/split-pdf）：每 N 页拆分、奇偶页处理和按指定位置拆分。PDF24 是服务器处理工具，不应错误声称完全本地执行。
- PDFsam Basic 是 AGPL 开源；本轮仅采用交互思想，所有源码由灵犀场重新实现，没有复制 PDFsam 代码。

## 用户体验

原先 PDF 拆分只会将每一页独立导出。用户只有指定页需求时，会产生大量不需要的文件。

本轮在 `/tools/split-pdf` 现有工作台加入四种清晰模式：

1. 每页一份：保留既有默认行为和原文件命名 `page-001`。
2. 指定页分别导出：如 `2,5-6,last`，只输出 2、5、6、末页四个独立 PDF。
3. 指定页合成一份：如 `1,3-4,last`，输出一份 PDF，仅包含所选页。
4. 每 N 页拆分：7 页文件按 3 页一组输出 3、3、1 页三份文件。

页码语法允许 `last` 和开区间 `7-`；去重且按原来的升序保留页面顺序。不允许 0、倒序区间、越界页码、非整数分组；遇到错误不生成误导性的文件。

## 架构与安全

- `lib/tools/shared/practical-doc-tools.ts`：不再反复读取输入，单次解析 PDF 并按用户模式调用 pdf-lib `copyPages`。
- `components/tools/ToolWorkbench.tsx`：仅 PDF split 展示对应控制，所有 UI 模式改变后清除旧结果，避免误下载上一步生成的文件。
- `lib/tools/pdf-split-copy.ts`：九语言模式、提示和错误内容。
- 保留 `ResultPanel` 导出额度、计费门禁、微信/文件分享流程。没有新增支付绕过、服务器上传、数据库写入。
- 输入 PDF 的文本、图片、矢量页面按原始 PDF 结构复制，不把整页渲染成截图；数字签名的有效性不保证在拆分后保留。

## 验收

`tests/final-closure/pdf-precision-split-v122.spec.ts` 自动生成 7 页不同尺寸的真实 PDF，逐一下载及用 pdf-lib 打开检查文件名、每份页数和页面尺寸。提取合并场景还用 PDF.js 二次读取每页文字；对非法页码/分组必须显示错误，下载按钮不得出现。

只有 exact SHA 的构建、桌面和手机浏览器、配额与导出门禁全部通过，才考虑合并与正式站发布。当前 PR 是候选，不能声称已经生产竣工。
