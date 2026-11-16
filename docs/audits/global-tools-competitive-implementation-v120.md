# LINGXIFIELD 全球成熟工具对标 → 独立工程落地｜V120

日期：2026-11-02

## 事实来源与许可证门禁

| 上游产品 | 官方仓库或文档 | 可参考的真实能力 | 当前许可情况 | 对灵犀场的处理 |
| --- | --- | --- | --- | --- |
| Squoosh | https://github.com/GoogleChromeLabs/squoosh | 完全本地图片编码、压缩前后对比 | Apache-2.0；具体子组件/编解码器仍需单独核查 | **独立编写**通用 React 视觉对比组件，不复制其库或编解码器 |
| Stirling PDF | https://github.com/Stirling-Tools/Stirling-PDF 、 https://docs.stirlingpdf.com/Tools/ | 一站式工具切换、页面编辑器、自动化工作流 | 公开说明为 open-core，代码/功能可能不同授权 | 仅学习交互；不在未经检查的情况下复制或部署其服务器代码 |
| PDF Arranger | https://github.com/pdfarranger/pdfarranger | 页缩略图、拖动编排、拆分/旋转/合并 | GPL-3.0 | 仅对比交互设计，使用现有 pdf-lib 独立实现 |
| PDFsam Basic | https://github.com/torakiki/pdfsam | PDF 页面拆合与旋转 | AGPL-3.0（现行版本声明） | 暂不集成原代码，防止许可边界混淆 |

以上信息来自项目官方公开仓库/文档；随上游版本变化需要复核。

## 本轮发现的灵犀场体验差距

- 用户能够保存图片处理结果，却难以在同一页面迅速比较处理前后质量差异。
- 批量转换结果独立下载可用，但缺少一个低成本、无需登录、无需服务端上传的逐项预览。
- 压缩后文件可能反而增大，必须展示**带符号的真实文件大小变化**，不得一律声称“节省”。

## 已编写的实现

- `components/tools/ImageBeforeAfter.tsx`：统一原图/结果双层预览、0–100 比较滑杆、逐图翻页、输入/输出大小和带符号变化比例。
- `components/tools/ImageConvertWorkbench.tsx`：在图片转换完成后调用通用对比。
- `components/tools/ToolWorkbench.tsx`：在图片压缩结果中调用相同组件。
- 浏览器端使用 `URL.createObjectURL`，切换或卸载时 `URL.revokeObjectURL` 回收对象 URL。保留已有真实导出，不另外上传素材，也不产生第二份处理费用。
- 九语言按钮、标签和移动端滑动输入采用原生 range。
- `tests/final-closure/image-before-after-v120.spec.ts`：实际生成 PNG/JPEG、转换和压缩、拖动滑杆、批量下一张、文件保存及解码验证。

## 合格标准与限制

成功意味着**准确的预览对比 + 独立解码输出 + 按原有支付/免费额度逻辑下载**。不以 UI 显示图片代替文件验收。
本 PR 目前仅为提交/CI 候选，只有完整来源 SHA 的 GitHub 构建、真实 Chrome 桌面和手机模拟 E2E 均通过后，才可评估合并。物理手机、微信内置浏览器和生产支付需另行验收。

下一轮：PDF 页面缩略图与可拖动重排；优先检查 `merge-pdf` 现有重排逻辑和 PDF 页操作的保存回读证据，独立实现并保留可用的 GPL/AGPL 许可边界。
