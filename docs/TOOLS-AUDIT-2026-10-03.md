# 实用工具与 PDF 支付审计 — 2026-10-03

## 上午工作恢复
时间均为北京时间。证据来自 Git、日志和远端状态。
- 07:36:06 提交 `61c8d93`：标题虽提及 SASI，实际 138 个变更文件包含 PDF 支付返回、草稿恢复、已付款结果重复下载、分享栏以及工具测试 V45–V49。这是用户所说的 09:00 前工作。
- 06:50 的 `_local/paid-delivery-browser.log`：38 通过、2 失败，涉及 PDF 页码输入和中文分享弹窗。
- 06:55 的 `_local/paid-delivery-build-final.log`：支付 checkout 类型检查失败；之后已修正。本轮固定版本重新验证上述流程通过。
- 并行工作提交 `137dedc`（13:56:54）已包含本轮主要修复。GitHub 生产门禁成功，Vercel 13:59:46 部署成功。
- [生产门禁](https://github.com/3078024889/lingxi-quantum/actions/runs/37101465355)；[部署记录](https://vercel.com/celestial9/lingxi-quantum/Q9rsuFLGsB5ZtC6ie6GndNbVxn3E)。

## 本轮修复
1. PDF 打开支付前，等待当前文件、页码范围、盖章和编辑草稿保存完成，避免最后一次编辑未保存就离开页面。
2. 存储失败时保留可编辑文件，显示九语言错误，并阻止创建付款报价；自动保存失败也有反馈。
3. 加载新 PDF 清除旧输出、待下载结果和印章状态。
4. 非正整数支付数量禁用付款按钮；修正陈旧审计断言，将付费流程审计加入生产门禁。
5. 管理、付款、阅后即焚私密路径隐藏公共分享入口。切换语言保持分享弹窗打开并更新公开链接。
6. PDF 编辑器和签名工具的标题、介绍支持九语言；签名工具明确视觉签章的能力边界。
7. 补齐草稿自动保存的语言依赖，避免错误反馈沿用旧语言。

核心文件：`PdfEditorWorkbench.tsx`、`PaidExportButton.tsx`、`ToolShareRail.tsx`、`delivery-copy.ts`、两款 PDF 页面、`paid-tool-safety.spec.ts` 和生产门禁脚本。没有新增第三方依赖。

## 验证
为避免并发构建替换 .next，独立 worktree `tmp/tools-audit-worktree` 基于 `e6c5ad4` 加本轮 12 个文件，使用独立构建及端口 3107。

| 检查 | 结果 | 范围 |
| --- | --- | --- |
| 生产构建 | 通过，803 个静态页面 | 编译、类型与静态生成；保留已有 lint 提示 |
| 源码生产门禁 | 通过 | 65 个工具和 18 个付费工具的既有审计 |
| 桌面与手机浏览器 | 186/186 通过，5.7 分钟 | 65 个公开工具路由、九语言入口、PDF 页码/导出、付款返回恢复、分享及新增保存失败保护 |
| 手机视觉检查 | 通过 | 英文 PDF 页面标题、说明、上传控件显示正常 |

结果：`tmp/tools-audit-worktree/test-results/tools-audit-20261003/results.json`。
截图：`tmp/pdf-tool-mobile-final.png`。

付款状态和报价使用模拟接口，没有真实扣款。数据库凭证未配置，测试日志出现 SUPABASE_PUBLIC_CONFIG_MISSING。真实支付回调、退款到账、云文档转换与外部媒体供应商仍需验证。路由渲染通过不能证明每款工具的全部功能与九语言内容都完成。独立快照未包含并行工作的全部最新资金中心变更，远端 CI 是另一项证据。

## 全球成熟方案与可用优势
官方资料与上游代码研究如下；复用遵循仓库 license-firewall。

| 方案 | 优势 | 采用状态与下一步 |
| --- | --- | --- |
| [PDF.js](https://mozilla.github.io/pdf.js/getting_started/) / [源码](https://github.com/mozilla/pdf.js) | 浏览器 PDF 渲染、文档预览 | 已有依赖；补充大文件、密码 PDF 和预览错误反馈验证 |
| [pdf-lib](https://github.com/Hopding/pdf-lib) | PDF 页结构与内容修改 | 已有依赖；后续用表单、链接、字体和长文档样本检查保真 |
| [Uppy Tus](https://uppy.io/docs/tus/) / [文件恢复设计](https://uppy.io/blog/2017/07/golden-retriever/) | 可恢复上传及文件状态恢复 | 本轮加强 IndexedDB 支付前保存；断点上传为后续任务，未新增 Uppy |
| [PayPal 请求](https://developer.paypal.com/api/rest/requests/) | 幂等请求减少重复执行支付操作 | 后续验证真实沙箱支付、重试和退款的固定操作 ID |
| [Google 多语言页面规范](https://developers.google.com/search/docs/specialty/international/localized-versions) | hreflang 帮助匹配语言版本 | 已测九语言入口并修复两款 PDF 文案；逐工具补查引用及内容完整性 |
| [web.dev INP](https://web.dev/articles/inp) | 衡量真实交互响应 | 后续测手机上传、预览和导出；尚无全球用户实测性能数据 |
| [LibreChat](https://github.com/LibreChat-AI/LibreChat) | 多模型交互与文件功能组织 | 供 AI 产品设计参考，未移植代码 |
| [Dify](https://github.com/langgenius/dify) | 工作流、知识检索与可观测性 | 借鉴能力组织；使用源码前核对附加许可条件，未整库引入 |

现有 PDF 压缩页面已说明面向扫描/图片 PDF，会栅格化文本和矢量内容。保留可搜索文本、表单、链接的压缩可作为后续增强。

## 后续按用户价值推进
- 补齐真实支付沙箱、生产回调证据和数据库/转换服务配置核验。
- 每款工具选择正常、边界、大文件样本，验证实际输出、恢复和移动体验，逐项补齐翻译与无障碍使用。
- 建设九语言用途落地页、公开分享和相关工具入口；私密结果不进入公共引流。衡量搜索曝光、开始任务、成功输出与支付完成转化。
- 大文件加入可取消进度、断点恢复和明确限制；以当地网络和设备实测判断全球可用性。
