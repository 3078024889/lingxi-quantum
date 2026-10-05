# R10 SASI Continuity Router

## 从成熟平台继续提取的优势

### 1. 会话软亲和
OpenRouter/LiteLLM 类系统的核心不是每次都重新随机。对话应尽量继续走上一次健康线路，减少模型风格漂移。
R10 将最近成功 Provider 与 session 绑定 30 分钟；如果健康异常、进入 cooldown 或 circuit breaker，则立即解除影响。

### 2. Circuit Breaker
如果某条线路今天已有至少 4 次观测且失败率 >= 50%，临时不再选它。
这避免每个新用户都去“再撞一次”同一坏 Provider。

### 3. Stable Canary
新 Provider / 新模型不能直接 100% 放量。
使用稳定 hash，将同一个用户/会话稳定地落在 canary bucket，避免每次请求来回抖动。
当前环境变量 `SASI_EXPERIENCE_CANARY_PERCENT` 默认 100；新供应链测试时降低。

### 4. Duplicate Request Coalescing
用户双击、浏览器重试、弱网重复提交时，同一实例内 12 秒内完全相同请求共享同一个 Promise/结果，不重复消耗免费额度。

### 5. 不伪造 TTFT
成熟平台会分别看 TTFT 和 throughput。但当前灵犀场体验池仍是非流式请求，不能把总 latency 冒充 TTFT。
R10 不造假。下一步如果统一升级流式协议，再记录真正 first-token time 与 tokens/sec。

## 与 Argon 的启发结合

Gemini 4 Argon 最值得提取的不是“量子”标签，而是长流程执行：
- 复杂任务允许持续多步；
- 代码/研究/企业工作流按任务选择专长模型；
- 大任务保持上下文和项目连续性；
- 模型失败是内部恢复，不是用户重新开始。

R10 因此把“会话连续性”正式放到路由层，而不是只做请求级 fallback。
