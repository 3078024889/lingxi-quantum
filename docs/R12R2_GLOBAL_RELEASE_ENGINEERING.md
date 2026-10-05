# R12R2 — 全球成熟平台优势 + 发布工程防重复错误

## 这次真实故障

R12R1 的逻辑审计全部能通过，但生成 CSS 的 patch 使用了错误的转义层级：

- patch 写入的是字面 `\\n`
- 不是 CSS 文件里的真实换行
- Next/PostCSS 在最终 webpack build 才发现语法错误

所以这不是 Next.js 问题，而是我们的发布门禁缺少“修改文件在 full build 前先做语法预检”。

R12R2 做了两件事：
1. 修复已有 `app/globals.css` 中由 R12R1 写入的字面转义。
2. 从此所有 R12 相关 TS/TSX + CSS 在完整 Next build 前先走 changed-file preflight。

## 本轮继续提取的全球优势

### Inngest
- completed step 结果被持久化，后续只重试失败 step；
- side effect 仍必须有业务级稳定 idempotency key；
- temporary / permanent error 要明确分开；
- stable step ID 是 live run 能跨部署恢复的契约；
- 大文件不应该复制进 workflow state，只保存引用。

### DBOS
- interrupted workflow 从最后完成 step 恢复；
- 可以人工 resume；
- 可以从指定 step fork 一个新 workflow。
这非常适合 SASI 的“从网站 V2 / 某个镜头 / 某次研究步骤重新分支”。

### Trigger.dev
- durable checkpoint；
- human approval 等待期间不占持续计算；
- DEV / STAGING / PROD 分离；
- preview branch 隔离环境；
- atomic versioning，旧任务不会因为部署新版本被破坏。

### OpenAI Agents SDK
- session 在流式运行时先持久化用户输入，再追加模型输出；
- approval 可以中断 run，序列化 RunState，数小时后恢复原 run；
- tracing 覆盖 agent / turn / model / tool / handoff / guardrail；
- 对“请求是否已经被供应商接受”存在歧义时，应 fail closed，而不是无脑 replay。
这一点对 SASI 防止重复生成 / 重复付费尤其重要。

### Hatchet
- 开源 MIT；
- task / agent invocation 持久化；
- retries / replay / checkpoint / distributed workers 都是平台一等能力。
说明我们后面即使不购买某个商业 orchestrator，也能继续借鉴成熟的开源架构。

### Langfuse
- 生产 trace 与 offline dataset / experiment / online evaluation 是一个闭环。
说明“Build PASS”永远不等于“智能质量 PASS”。

## 新的发布原则

从 R12R2 起，每轮迭代按固定顺序：

1. 全球平台/开源方案检索，先找成熟模式与已知坑。
2. Target drift 检查。
3. Patch。
4. 修改文件语法/结构 preflight。
5. 行为契约 audit。
6. TypeScript / project audits。
7. Next production build。
8. 负向测试 / 幂等重跑。
9. 才允许 `READY_FOR_GIT_REVIEW=YES`。

不能再出现：
“前面十几个 PASS，最后 webpack 才第一次发现我们自己写坏了 CSS。”
