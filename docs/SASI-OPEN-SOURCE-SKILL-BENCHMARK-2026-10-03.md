# SASI 全球免费/开源能力基准与吸收方案（2026-10-03）

目标：不是把所有框架塞进生产，而是提取成熟项目已经验证过的架构优势，优先使用 LINGXIFIELD 现有 Next.js + Supabase/Postgres + BYOK 体系，避免依赖膨胀、许可风险和重复造轮子。

## 第一梯队：立即吸收架构思想

| 项目 | 许可证/开放性 | 优势 | LINGXIFIELD 吸收方式 |
|---|---|---|---|
| Agent Skills / agentskills.io | 开放标准；示例生态含 Apache-2.0 项目 | SKILL.md、按需发现、渐进式加载、技能可携带 | 原生建立 `skills/*/SKILL.md` + TS skill registry；不把全部技能提示词塞进每次上下文 |
| Haystack | Apache-2.0 | context engineering、pipeline、Agent hooks、SkillToolset、显式 retrieval/routing/memory | 吸收“显式管线 + progressive skill discovery + lifecycle hooks”，不引入 Python runtime |
| LangGraph / langgraphjs | MIT | stateful graph、checkpoint、可恢复长任务、显式状态转换 | 吸收 state machine/checkpoint 模型；与现有 SASI task state 融合 |
| LiteLLM | 核心 MIT，enterprise 目录另有许可 | 100+ 模型统一接口、路由、成本、guardrails | 不直接替换现有 BYOK；吸收统一 capability contract 和 provider-normalized error taxonomy |
| Semantic Router | MIT | 不用慢 LLM 做每次路由，向量/语义快速决策 | 先落地确定性/关键词/能力路由；后续可加 embedding router |
| MCP | 开放协议/官方参考实现 | tools/resources/prompts 的统一连接协议 | SASI connections 后端预留 MCP adapter；官方 reference server 仅作参考，不直接当生产服务 |
| OpenTelemetry | Apache-2.0 | traces/metrics/logs 统一可观测 | 吸收 trace/span/event 语义；先用现有 ops heartbeat + safe telemetry，后续再接 SDK |

## 第二梯队：文档、检索、研究

| 项目 | 优势 | 推荐 |
|---|---|---|
| Docling | PDF/Office/图片、版面/阅读顺序/表格、OCR、统一 document model | 高价值。作为未来 server-side document adapter，先 sandbox；当前浏览器解析保留 |
| Microsoft MarkItDown | 多格式快速转 Markdown、CLI/API 简洁 | 适合轻量 fallback；注意它以当前进程权限做 I/O，必须限制输入范围 |
| pgvector | Postgres 内 exact/ANN、cosine/L2/inner product，保留 ACID/JOIN/PITR | **优先**。LINGXIFIELD 已有 Supabase/Postgres，最小新增基础设施 |
| Qdrant | dense/sparse/multivector、payload filtering、hybrid search | 规模或混合检索超出 pgvector 后再评估；当前不增加第二数据库 |
| LlamaIndex | 数据/RAG/index/retrieval 抽象成熟 | 吸收 connector/index/retriever 分层；不急着引入 Python umbrella package |
| Crawl4AI | 网页 → LLM-ready Markdown、自托管、异步 crawler、MCP | 研究模式未来 server-side crawler 候选；必须做 SSRF/域名/大小/超时限制 |

## 第三梯队：浏览器与执行

| 项目 | 优势 | 推荐 |
|---|---|---|
| Playwright | 浏览器 E2E/自动化成熟 | 已在仓库使用，继续作为验证层 |
| Browser Use / open-browser-use | agent browser control / 已登录浏览器 | 只作为“无 API 且确需 UI”的 fallback，不让网站默认自主操作外部账户 |
| MCP Filesystem/Git/Fetch 等参考 servers | 工具边界示例清晰 | 只吸收 protocol/tool boundary 设计；官方明确提示 reference servers 不是 production-ready |

## 本轮真正落地

1. 新增 native Skill Kernel：
   - `lib/sasi/skills/types.ts`
   - `catalog.ts`
   - `router.ts`
   - `mode-adapters.ts`
2. 8 个 Agent-Skills 风格 `SKILL.md`，用于渐进式技能发现。
3. 五模式默认 skill plan：
   - 短剧：continuity + orchestration + multi-model routing + observability
   - 网站：website production + structured output + orchestration + routing
   - 书本/学习：document understanding + semantic retrieval + grounding
   - 科研：在 grounding 基础上增加 web research
4. 共用 `SasiComposerCore`：
   - `SasiUserMessage`
   - `SasiComposerSurface`
   - `SasiComposerTextarea`
   两套旧工作台开始共享真正的 composer primitives，减少 UI/行为漂移。
5. Knowledge 与 Website 请求携带 `skillIds`；服务端白名单校验并把经过压缩的 skill guidance 注入系统指令。
6. 不新增任何第三方 runtime dependency；本轮“吸收优势、不搬依赖”，降低构建/许可/安全试错。

## 后续优先级

P0：继续把文件 intake、message schema、result renderer、execution lifecycle 下沉到真正单一 `SasiComposerCore`。
P1：pgvector semantic retrieval + hybrid lexical fallback。
P1：server-side Docling/MarkItDown adapter sandbox。
P1：研究模式 Crawl4AI/MCP Fetch adapter，严格 SSRF/超时/体积/内容类型防线。
P2：OpenTelemetry-compatible spans。
P2：MCP tool adapter registry。
P3：只有在 Postgres 检索成为瓶颈时再评估 Qdrant。

## 参考

- https://github.com/agentskills/agentskills
- https://github.com/anthropics/skills
- https://github.com/deepset-ai/haystack
- https://github.com/langchain-ai/langgraph
- https://github.com/BerriAI/litellm
- https://github.com/aurelio-labs/semantic-router
- https://github.com/modelcontextprotocol/servers
- https://github.com/docling-project/docling
- https://github.com/microsoft/markitdown
- https://github.com/pgvector/pgvector
- https://github.com/qdrant/qdrant
- https://github.com/run-llama/llama_index
- https://github.com/unclecode/crawl4ai
- https://github.com/browser-use/browser-use
- https://github.com/open-telemetry/opentelemetry-js
