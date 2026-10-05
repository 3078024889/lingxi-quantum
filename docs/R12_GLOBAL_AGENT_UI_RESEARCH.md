# R12 全球 Agent UI / 持续对话研究与灵犀场提取

## 本轮继续核查
- CopilotKit / AG-UI：前端与 Agent 的 shared state 双向同步，状态可以流式呈现到 UI；会话可持久化和恢复。
- assistant-ui：thread/message 持久化采用消息树而非单纯平铺列表，支持编辑、重生成、迟到的 tool result 和 thread 恢复。
- OpenAI Agents SDK：session、handoff、guardrails、HITL、trace 是少量核心原语，避免业务层各自实现一套 Agent runtime。
- Agno：明确区分 user_id、session_id、run_id；session history 与 user memory 分开；workflow session 保存输入、输出、step result、state、status。
- Inngest：durable step 结果持久化；后续 step 失败只重试失败 step；side effect 必须拥有稳定 idempotency key。
- DBOS：TypeScript durable workflow 可在 executor crash/restart 后从最后完成 step 恢复；还支持 durable sleep 和 debounce。
- Hatchet：开源 MIT durable workflow，任务/agent invocation 持久化，支持 retries、replay、checkpoint。
- Google ADK / Anthropic / LangGraph 类长期 Agent：共同方向是 session state、长期上下文压缩、interrupt/resume、artifact/workspace，而不是一个无限增长的 chat history。

## 对 SASI 的直接结论

### 1. “一个 SASI”必须有一个 canonical thread
drama / website / book / learning / research 只是任务模式，不应该各自拥有互不相干的人格和聊天历史。

R12 建立：
- `SasiUnifiedTurn`
- `SasiUnifiedConversationProvider`
- mode-independent turn state machine
- thread / message persistence schema

### 2. 用户消息是确定性 UI，不等模型
成熟聊天系统不会等 AI 回答成功才把用户消息放到历史里。

R12 强制：
- 输入框文字蓝色；
- 点击发送后立刻出现蓝色用户消息；
- Provider 在后台失败、切换、重试，都不能让已发送消息消失。

### 3. Thread、Run、Project 必须分层
- Thread：人在说什么。
- Run：SASI 这一次实际执行。
- Project：网站、短剧、书本等长期工件。
这三个 ID 不能混成一个。

### 4. 消息要能承载后到结果
assistant-ui 的消息树设计值得吸收：后来的 tool result / approval / artifact 不能破坏已有对话。
R12 数据结构预留 `parent_id`、`run_id`、`project_id`、`artifact_refs`。

## 下一轮要继续的难点
R13 不再只是 UI：
- 把 website/drama 当前的局部 state 正式迁到 canonical thread；
- projectId / runId 自动绑定 turn；
- artifact lineage；
- pause / resume / cancel；
- human approval；
- streaming event protocol；
- 真正 TTFT / throughput；
- conversation persistence API；
- 跨设备恢复。
