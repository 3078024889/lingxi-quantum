# V124｜全球可用 PDF 编辑平台对比与本地全文查找

日期：2026-11-02

## 一手开源项目与能力证据

| 项目 | 地址 | 已公开能力及许可 | 灵犀场构建决策 |
| --- | --- | --- | --- |
| Folio | https://github.com/doktorigi/folio | 基于 PDF.js / pdf-lib 的本地编辑器；页面缩略图、直接原文覆盖编辑、全文查找、搜索结果定位。各文件的许可须按仓库实际内容核对 | 利用灵犀场已安装 PDF.js，实现**独立** React 搜索组件与跳页，不复制上游代码 |
| Mozilla PDF.js | https://mozilla.github.io/pdf.js/getting_started/ | Browser PDF 显示层及 textContent 读取能力 | 对用户选择的 PDF 浏览器本地逐页调用 `getTextContent` |
| react-rnd | https://github.com/bokuweb/react-rnd | MIT 许可拖拽与缩放库 | 当前手势已在用户代码中实现，先修验收失败；不引入重复拖拽依赖 |
| Moveable | https://github.com/daybrush/moveable | MIT 许可，拖动/旋转/缩放/吸附/多元素，库较大 | 作为下一轮手势/对齐参考；避免未验证直接更换编辑器交互核心 |

## 本轮实际构建

- `components/tools/PdfTextFind.tsx`：新增本机全文关键词查找，NFKC 正规化、不区分大小写；逐页流式读取文本，带上下文摘要、点击结果进入对应页；支持九语言文案。
- 为保护设备性能，每次最多读取前 300 页；结果只显示前 100 页，避免在移动端渲染过多 DOM；UI 必须如实标注搜索范围。
- 如果 PDF 不含可提取文字，明确提示可选择 PDF OCR，不假称扫描文字已被全文检索。
- 对源文件变更和卸载做检索版本号失效处理；读取完成后清理 PDF.js 对象，用户原始 PDF 不通过搜索传到服务器。
- 组件直接接入现有 `PdfEditorWorkbench`，未修改导出计费流程。
- 新增 2 组 Playwright 真实 PDF 浏览器测试：在 3 页文档查找跨页关键词、点击跳页、没有匹配时如实提示；空文本扫描样本提示 OCR。桌面和手机各运行一次。

## 原有编辑器跟踪

- V116 原有手势用 pointer capture 和 React 异步布局更新。修复手柄捕获并加大移动端触摸区域；将失败的断言改成等待真实宽度变化的 `expect.poll`，仍要求比缩放前宽度增加 8px，**不降低合格标准**。
- V123 实际上传 PDF、原文字视觉编辑、插入图片、隔离付款模拟、下载 PDF 并由 pdf-lib/PDF.js 重新读取的桌面/手机测试，在上次 CI 均已通过。
- 视觉覆盖原文不会从底层 PDF 删除文字，不能当作隐私脱敏。请使用有严格验证的真脱敏工具。

门禁：PR SHA 的生产构建、真实浏览器测试、移动端测试完整通过且被合并/部署后才算上线；本次不写生产数据库，不开通真实付款。
