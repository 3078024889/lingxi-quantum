# R16 Global Closure — 全球优势提取与当前真实缺口

## 已确认：九国语言是实做，不是口号

当前仓库核心语言集合：
- zh 中文
- en English
- ja 日本語
- ko 한국어
- fr Français
- de Deutsch
- es Español
- pt Português
- ar العربية

证据：
- `lib/lingxi-i18n.ts` 定义九语言 union 与九语言字典；
- Arabic 会把 `document.documentElement.dir` 切为 `rtl`；
- `lib/seo/global-seo.ts` 有九组 SEO locale；
- `components/KnowledgeWorkspace.tsx` 关键反馈与资料空间 copy 为九语言；
- `lib/sasi/connection-i18n.ts` 连接中心使用九参数 row；
- R8 i18n audit 与 GitHub CI 的 site-facts 测试均检查九语言。

但 R16 不把“有九语言框架”夸大成“所有未来新增字符串永远自动翻译”。
因此新增更严格的 R16 i18n gate，后续新用户界面必须进入同一语言合同。

## GitHub / Production Gate 当前发现的真实问题

### 1. Capability Genome 与公开工具目录漂移
GitHub Actions 实际失败：
`PUBLIC_TOOL_RECIPE_COUNT:110:PUBLIC:118`

缺少 8 个 recipe：
- regex-tester
- text-diff
- csv-json
- xml-formatter
- jwt-decoder
- url-parser
- case-converter
- number-base-converter

它们都是当前本地文本/开发者实用工具，因此 R16 补齐 `text.transform` + local-first recipe。
以后 `capability-genome.mjs` 会继续要求 public catalog 与 recipes 1:1。

### 2. Supabase Preview 被历史 SQL BOM 卡住
实际失败文件：
`supabase/migrations/20260910110000_cangxuan_sources_content.sql`

文件头是 UTF-8 BOM (`EF BB BF`)。
Supabase CLI/preview database 把 BOM 当成 SQL token，导致 statement 0 syntax error。

R16 不只修一个文件，而是：
- 扫描全部 `supabase/migrations/*.sql`
- 自动移除 UTF-8 BOM
- UTF-16 BOM 直接 fail closed
- 新增永久 migration encoding gate

### 3. Event Plane snapshot → SSE 仍有 replay amplification
R13 的客户端：
- snapshot 先取前 40 条；
- EventSource 又从 0 开始；
- seen-set 虽能去重，但长 run 会重复拉整条历史。

R16 改为：
- snapshot 返回最近 40 条事件；
- 返回 `lastEventId`；
- EventSource 从 `?after=lastEventId` 继续；
- snapshot 与实时流之间新产生的事件不会丢，因为游标从 snapshot max id 之后续接。

## 全球成熟产品继续提取

### ChatGPT Projects / Deep Research
2026 的优势不是“多页面”，而是一个项目上下文里持续加入来源、聊天、应用，并在研究中允许计划、进度、途中调整。
SASI 应吸收：
- one conversation / one composer
- source/context 作为可附加能力
- long run 进度可观察
- 用户可以中途纠偏
- 结果进入持续项目，而不是一次性回答

### Gemini Deep Research
Gemini 把 Search、Gmail、Drive、上传文件、NotebookLM 放进同一研究入口，并可编辑研究计划。
SASI 应吸收：
- source picker 是上下文层，不是产品模式层
- 用户说目标，系统决定任务路线
- 文件/资料库/网页/连接服务都从同一个 `+` 进入

### assistant-ui
assistant-ui 把 persisted threads、attachments、branches 作为聊天 runtime 的基础能力。
SASI 后续优势：
- Thread 需要 durable persistence
- edit/regenerate 不覆盖旧版本，而是形成 branch
- Artifact lineage 与 message branch 应互相关联

### AG-UI / CopilotKit
AG-UI 用 SSE 把 messages、state、tool calls、agent lifecycle 统一成事件流，并支持 shared state 双向同步。
SASI 当前 Event Plane 已走在同一路线上；下一步应把自定义 public event contract 收敛成更稳定的 versioned semantic contract。

### Temporal
2026 Worker Versioning 与 Priority/Fairness 已 GA。
SASI 已提取：
- workflow_version
- priority + aging
- lease
但仍缺：
- 真正生产 scheduler/worker loop
- backlog/lease/attempt SLO
- old workflow backlog=0 才能移除 handler
- worker version rollout/rollback evidence

## 仍未完成，不应冒充完成

1. Detached Worker 还没有默认接入 Knowledge 用户请求；
2. `SASI_WORKER_SECRET` 还需要在 Vercel Production 配置；
3. 还需要 scheduler/cron 定时触发 worker tick；
4. R11/R14/R15 migrations 需要实际数据库验证；
5. GitHub Production Gate 要在 R16 修复后重新通过；
6. Supabase Preview 要在 BOM 修复后重新通过；
7. 用户端 runId + snapshot + SSE + final result 的极简一体化 UI 尚未完成；
8. Website / Drama 尚未迁移到 detached durable worker；
9. 真正的 pause/resume/cancel/approval 仍未贯穿所有业务；
10. 还缺 production chaos / restart / duplicate-submit / network-disconnect 证据。
