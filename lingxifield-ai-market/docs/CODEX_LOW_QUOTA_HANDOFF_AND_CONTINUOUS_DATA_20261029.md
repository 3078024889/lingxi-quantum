# LINGXIFIELD：低 Codex 额度下的连续数据采集总交接
状态：设计和施工验收清单，不是已完成声明。仅 feature/ai-market-review-gate-20261029 开发分支；禁止直接合并 main、上线、操作支付或生产库。

## 工作划分
当前 Codex 额度不足：无需 Codex 进行重复代码编辑、零散测试或大量手动抓取。通过 ChatGPT 已连接 GitHub 工具继续开发。待额度恢复，Codex 只负责本地 D 盘集成测试、浏览器 E2E、异常修复和统一验收，使用一个总验收命令，不要反复新建工作区。
用户两张原图不变：总榜与厂商详情；参见 docs/ORIGINAL_TWO_SCREENS_PRODUCT_CONTRACT.md。
严禁重绘官方 Logo；未找到官方原图时先只用文字。

## 已证明的采集基线（2026-10-29 用户 PowerShell 日志）
models.dev 8908 条服务商/模型记录，233 个 provider；相同模型标识归组 3921；Hugging Face 模型 500，Spaces 500；统一产品候选 276。GitHub 15 候选只有 5 条资料，属于 partial；OpenRouter 无凭据而跳过。这些不是用户量、市场份额或全球独立产品数。

## 剩余目标：按优先级
P0 商业产品与公司身份：官方站点、规范域名、功能与用户问题、使用 URL、可下载平台、官网公司信息、实际产品状态。SDK、HF demo、商业 SaaS 必须分型，不得混作产品榜。
P0 真实套餐及使用条件：价格数字、币种、计费周期、年付约束、免费额度/恢复时间、信用卡/手机号、失败扣费、退款、商用许可、水印、视频时长/图像分辨率、地域限制。逐字段必须官方 URL + 采集时间 + 范围；未经审查保持 null，严禁推断与自动上线未经核验价格。先覆盖 50-100 个真实活跃商业产品，再扩充。
P1 官方更新与定时增量：优先使用官方 API、RSS/Atom、变更日志、sitemap、ETag/Last-Modified 条件抓取，遵守 robots/条款、限流与失败退避。变化先进入 staging，自动验证关键字段，再更新只读产品索引；记录新增/更新/下线/未变/失败。
P1 厂商竞品：只用证据明确的同领域产品作对比，计算真实已知价差与功能差异，不伪造质量分。独立展示数据来源和时间。
P1 SEO/GEO：公开趋势与可复现的指定地区、问句、模型版本、运行时间、次数、提及/引用事实记录，标注“本站样本”非全球公认排行。真实流量/下载/融资仅在有权限和可靠公开来源时展示。
P2 实际使用评价：遵守内容许可，附出处；不伪造用户评论总数或好差评。

## 采集和去重管线
1 discover candidates: 官网、厂商 API、合法开放目录、GitHub、HF。
2 canonicalize: 规范 URL（同一官方域名与路径分清），组织 ID / 产品 ID / 模型底层 ID / provider offer ID 分离。不要把不同供应商相同模型 ID 直接认作完全等价，也不要把商业产品与 SDK 合并。
3 verify alive: HTTP 状态、官网标识、更新日期、正式使用入口、服务迁移/停服信息；限流和网络故障不能直接标记为下线。
4 extract exact facts with source URL, collectedAt, confidence, unit, locale, billing period, raw hash; no evidence => null.
5 staging + diff: 追加源快照、逐字段比较、审核风险变更、接受已验证变更到页面只读索引、保存历史及回滚。
6 daily audit: source name, status, raw/retained/verified counts, created/updated/retired, error, last success, next retry, data age, coverage percent。
7 UI: 不替换两张基准图，不堆后台工程字段；用户看功能、实价、免费额度、使用入口和限制；厂商看有来源排名、竞品和改进建议。

## 已有源码入口
scripts/run-all-sources-and-audit.mjs 统一运行；
scripts/run-source-pipeline.mjs 各适配器及检查点；
scripts/build-unified-product-catalog.mjs 产品候选；
scripts/group-model-offers.mjs 模型分组；
app/api/v1/products/all/route.ts、app/api/v1/products/evidence/route.ts；
app/api/v1/models/groups/route.ts；
lib/reviewed-product-facts.ts 逐字段来源审核；
app/market-workbench.tsx 原始总榜/详情布局。
数据仅使用 AI_MARKET_SNAPSHOT_DIR，默认用户 D 盘现有目录 D:\30780\lingxi-market-data。

## 不允许宣称完成
除非真实运行且产生覆盖率报告。统一验收至少包含 node --test、TypeScript 检查、Next.js build、API smoke、本地 Playwright/浏览器操作、来源核验、错误场景、九语言和阿语 RTL、手机可读性。不得靠静态代码字符串检查冒充功能测试。
