# LINGXIFIELD V125｜主站工具统一大包发布和竣工门禁

**编制日期：2026-11-02**  
**代码目标**：主站现有工具的实际可用性、文件真实保存、手机操作和九语言；不同时修改独立的 SASI 模型服务、全球 AI Market 的商户支付/订单或生产数据库。  
**发布候选 PR**：https://github.com/3078024889/lingxi-quantum/pull/104  
**目标分支**：`main`；**目标 Vercel 项目**：`lingxi-quantum`（`prj_R2HMsUOG4DL0AK3kaHmOrcTpBT9f`）；**非独立 AI Market review 项目**。

## 0. “竣工”的精确定义

- **代码完成**：有真正新增/修改源码，源代码和静态合约检查通过。
- **功能通过**：Playwright 在桌面、手机模拟浏览器完成真实上传、处理、保存、二次解析，不仅是页面响应成功。
- **集成通过**：所有新旧功能在**同一 SHA** 上通过完整生产门禁和工具交付门禁。单个 PR 单独通过，不等于 V125 合并后通过。
- **部署成功**：GitHub `main` SHA、Vercel 正式生产部署 `githubCommitSha`、可打开的主站 URL 必须一致。Vercel `READY` 不是功能验收证明。
- **真实商用**：另外验证真实用户身份、订单签名回调、付款确认、对账、退款、监管合规及权限边界。**本次不执行真实付款。**
- **全站竣工**：尚需要覆盖主站 124 工具其余未完成的真实使用测试、SASI 生成和聊天、厂商认领审核/排名支付、九语言 SEO/GEO 实测。**V125 不得标注全站 100% 竣工。**

## 1. 全球成熟平台对标 → 本轮真实能力

| 参考平台/官方来源 | 真实优势 | 独立工程落点 |
| --- | --- | --- |
| Squoosh, https://github.com/GoogleChromeLabs/squoosh | 图片处理前后质量比较和本地转换 | V120 图片滑杆、批量逐张预览、文件体积正负变化 |
| Stirling PDF, https://docs.stirlingpdf.com/ | PDF 多工具整合、可视化页面操作 | V121 在原有合并/拆分中加入页缩略图、拖动、旋转/复制/删除、撤销/重做 |
| PDF Arranger, https://github.com/pdfarranger/pdfarranger | 页面可视化重排 | React + pdf-lib 独立实现；**不复制 GPL-3.0 代码** |
| PDFsam, https://pdfsam.org/pdf-extract-pages/ | 分组与指定页提取 | V122 `1,3-5,7-,last` 页码、每 N 页分组、保留矢量文档 |
| Adobe Acrobat, https://helpx.adobe.com/acrobat/web/edit-pdfs/edit-text-images-and-objects/editing-pdfs-overview.html | 原文文字与图像直观调整 | V116/V123 可视覆盖编辑、签名/图片缩放和 HiDPI 预览 |
| Mozilla PDF.js, https://mozilla.github.io/pdf.js/ | 文字提取、浏览器原生阅读 | V124 不上传的文本搜索/跳页、扫描件 OCR 提示 |

## 2. 真实修改与合包覆盖

| 类别 | 涉及版本 | 代码/行为 |
| --- | --- | --- |
| 文本/文件工具 | V118 | CSV 多行引号/BOM、时间戳空输入、同名文件比较、20 个真实浏览器情景 |
| PDF/QR | V119 | 真实合并/拆分、QR 读取，下载后独立解析 |
| 图片 | V120 | 原图/结果对比，批量切换，实际字节差价而非虚构压缩比例 |
| PDF 页面 | V121 | 拖动排序、移动端移页、旋转、复制、删除、撤销/重做；完整 PDF 页面复制 |
| PDF 精准拆分 | V122 | 指定页、提取合并、按 N 分组、九语言提示与无效参数拒绝 |
| PDF 编辑器 | V116/V123 | 双击原文字可视替换、图片和手写签名的移动/缩放、撤销/重做、预览和下载闭环 |
| PDF 搜索 | V124 | 浏览器本地文字查找、匹配页导航、扫描件 OCR 提示 |
| PDF 图片互通 | V125 | 修复图片→PDF 原尺寸模式下边距无效、选项/顺序改变时旧下载结果未失效；新增 PNG→JPG→PDF→JPG 真实工具串联测试 |

**安全边界**：PDF 编辑器里“覆盖原文字或原图片”可能仍在源 PDF 内保留底层内容；不等于永久删除，也不保证数字签名继续有效。机密脱敏应使用独立真实删除并核验的工具。

## 3. 交付硬门禁（必须按序）

1. `node scripts/audit/release-v125-contract.mjs`，验证 124 工具目录存在、11 组真实文件测试挂入 CI、九语言两模块、导出支付门禁和共享组件均未丢失，生成 `test-results/release-v125-contract.json`。该检查**仅验证源码契约，不能冒充浏览器测试或上线成功**。
2. `.github/workflows/tool-delivery-quota.yml`：隔离安全/支付合约；生产构建；两类 Playwright 浏览器运行 11 组测试；真实下载后重开。保存失败日志和 artifact。
3. `.github/workflows/production-gate.yml`：`ci:baseline`、`ci:source`、完整生产构建、完整桌面和手机 Playwright，必须对同一 SHA 通过。
4. GitHub PR 检查全部 green，无合并冲突，检查最近 `main` 与 release 分支的差异。**如果任意检查仍在 queued/running、失败或取消，不许合并。**
5. Vercel 同一个已验证 SHA 的**预览部署**，在真实浏览器实际测试至少 PDF 编辑、页面整理、指定页拆分、PNG/JPG/图片转 PDF、QR、CSV/XLSX、下载/分享、中文/英文、手机窄屏。
6. 合并到 `main` 后，正式生产部署应指向合并后的 `main` SHA；另行核对响应、文件真实保存、付费确认不绕过、日志与回滚方案。
7. 如果用户访问主站存在不同托管域名或阿里云反向代理，应分别验收映射和缓存，不能仅检查 Vercel 部署 URL。

## 4. 现存真实阻断（不能将其写成已解决）

- **Vercel Hobby 配额**：2026-11-02 创建候选预览时收到 HTTP 402 `api-deployments-free-per-day`，不能在当前配额下验证预览与正式 SHA。不得反复触发绕配额；需待配额恢复或由账户所有者调整套餐。
- **全目录 124 工具**：过去 V118 的新实测场景 20 项；其余还有历史片段或未充分验证的功能。新增 PDF/图片情景不自动证明全部功能都通过。
- **SASI 与 AI Market**：独立业务的安全生成、聊天模型、厂商账户认领/审核、推广订单、支付宝/微信/PayPal 真实资金链，以及 SEO/GEO 正式可观测数据，不属于这次工具代码包的全闭环验收。
- 视觉覆盖不等于真正安全脱敏；复杂签字 PDF、含密码 PDF、OCR 和第三方受限文档需要另行专门验收。

## 5. 发布与回滚原则

- 保留现有生产部署 ID/SHA，记录发布前链接和验证摘要。
- 不允许用单个分支的 CI 绿灯推断合包可上线。
- **先预览，再合并**；不能预览时维持 PR draft，不推送生产域名。
- 一旦真实用户关键功能失败，回滚到此前可核实的生产 deployment；不要自动删除生产用户文件、订单、账本或执行数据库破坏操作。
- 对用户展示“已通过的模块＋已验收的动作＋仍需验证的部分”，不写“全站无 BUG”“100%竣工”。

## 6. 验收后的证据交付

- GitHub release PR 精确 head SHA、两套 Actions run URL 与测试统计。
- 真实浏览器桌面/手机截图或 Playwright trace（安全脱敏，不含真实客户文件）。
- 主站 Vercel deployment ID、环境、commit SHA、实际可访问 URL 与检查结果。
- 124 工具操作覆盖 CSV，清楚列出已验证、历史样本、不完整情景，后续持续补齐。
