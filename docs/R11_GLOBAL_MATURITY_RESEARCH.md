# R11 全球持续智能系统研究与成熟条件

## 本轮核查的平台/框架
- LiteLLM：weighted/rate-limit-aware/latency/cost routing、cooldown、session affinity、bounded fallbacks。
- OpenRouter：provider routing、可靠性/延迟/吞吐指标、透明 fallback。
- Cloudflare AI Gateway：retry、fallback、timeouts、rate limiting、analytics、cache。
- Kong AI Gateway：consistent hashing、lowest usage、lowest latency、semantic routing、priority failover、passive circuit breaker。
- Temporal：Durable Execution；崩溃、网络失败、人类等待后从原位置恢复。
- OpenAI Agents SDK：agents、handoffs、guardrails、tracing；trace 覆盖 model/tool/handoff/guardrail。
- Anthropic：long-running agents 要靠 compaction、structured memory、sub-agents，以及跨 context window 留下清晰工件。
- Google ADK：session/event/state 持久化、持久 sandbox、eval/observability 集成。
- Agno：session state、memory、knowledge、teams、reasoning、fallback models。
- Langfuse：open-source tracing + online/offline eval + datasets + production quality monitoring。
- Microsoft Semantic Kernel：concurrent/sequential/handoff/group-chat/magentic orchestration（其中 Agent Orchestration 仍是 experimental）。

## 为什么 R10 还不能直接宣称“成熟”
R10 已解决“单次请求和一段会话的可靠路由”，但成熟持续智能系统还必须同时满足：

1. **Durable Execution**
   服务进程崩溃、部署重启、网络断开后，任务从检查点继续，不让用户重来。

2. **Idempotency**
   用户双击、Webhook 重放、浏览器重试不能重复生成、重复扣费、重复执行工具。

3. **Long-horizon context**
   不能无限把聊天历史塞给模型。必须把“目标、决策、约束、TODO、工件”结构化保存，再按需恢复。

4. **Outcome Verification**
   “模型返回 200”不等于任务成功。网站要能构建，代码要能测试，资料问答要能引用证据，导出文件要可打开。

5. **Tracing + Evals**
   每次 run 必须能解释：用了什么模型/工具、哪一步失败、延迟多少、质量多少。发布前离线 eval，线上持续 eval。

6. **Security boundary**
   工具调用、文件、外部网页、MCP 内容都可能携带提示词注入。高风险动作必须有确定性规则和授权边界。

7. **Human control**
   长任务需要暂停、继续、取消、审批和回滚，而不是只能“重新发送”。

8. **Production SLO / chaos / burn-in**
   没有真实生产故障演练和稳定期，就只能说“架构已具备成熟条件”，不能诚实地宣称生产成熟。

## R11 已补的部分
- 持久 run journal
- 原子 idempotency key
- checkpoint
- 成功结果 replay
- structured context compaction
- deterministic outcome verifier
- trace spans
- maturity claim gate：只有 offline eval、online SLO、chaos、安全、burn-in 全通过才允许对外称“成熟”

## 下一阶段
R12 应把这些基础设施真正接进网站/短剧/书本/科研的长任务状态机，并加入：
- pause / resume / cancel
- human approval
- tool output schema validation
- project artifact lineage
- offline golden dataset + online quality scores
- chaos tests：Provider 全挂、DB 短断、进程重启、重复请求、超时恢复
- 真正 streaming 后采集 TTFT / throughput
