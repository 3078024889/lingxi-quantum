# R9R1 全球成熟 AI Gateway 优势提取

这次只提取机制，不复制闭源代码。

## 借鉴并已经纳入灵犀场的部分

### LiteLLM
- deployment 级 cooldown，而不是整组下线
- weighted / rate-limit aware / latency aware 路由
- retries 与 fallbacks 分层
- bounded max fallbacks
- 同一请求中排除刚失败的 deployment

### OpenRouter
- 路由依据 latency / throughput / reliability
- provider fallback 默认透明
- provider 参数能力过滤
- 用户不需要知道最终落到哪一个底层 provider
- 对话 UI 更重视 TTFT；长输出更重视 throughput

### Portkey
- circuit breaker
- retry / fallback / timeout 集中在 gateway
- 条件路由
- 请求级 trace 与错误聚类
- canary 测试新模型

### Cloudflare AI Gateway
- retry + fallback
- rate limiting
- analytics / logging
- caching
- custom providers
- 统一入口控制多家服务

## R9R1 具体新增

1. 旧 R8R2 审计不再要求字面出现 `AbortSignal.timeout`。
   R9 当前用的是 `AbortController + setTimeout + abort()`，同样是硬超时，而且可控性更强。

2. 路由器读取 Provider 的 `Retry-After` / rate-limit reset 信息。
   如果供应商明确告诉我们 37 秒后恢复，就冷却 37 秒，而不是机械固定 120 秒。

3. 仍保留：
   - weighted water-filling
   - 成功率
   - 延迟 EWMA
   - 任务匹配
   - Provider cooldown
   - 失败不扣体验额度
   - 最多 5 个 provider 尝试
   - 免费池失败后自动转用户自己的智能服务
   - 资料问答最终还有 deterministic grounded fallback

## 暂不采用

### 大规模 hedged requests
同时请求两家确实能降低尾延迟，但会双倍消耗免费额度，不适合当前灵犀场。

### 对所有回答做公共缓存
可能造成隐私和上下文串线。后续只考虑：
- 明确公开内容；
- 同一用户、同一请求 hash；
- 很短 TTL；
- 不包含私人文件内容。

### 静默全量 shadow traffic
对评测很好，但会额外消耗免费池。后续只对极少比例新模型 canary。

## 下一阶段最值得做

- 首 token 延迟（TTFT）与 tokens/sec 分开计分；
- 按会话做“软亲和”，保持回答风格稳定，但失败时立即解除；
- 精确读取各供应商剩余额度（仅供应商 API 明确支持时）；
- 同一用户重复提交的短时 request coalescing，避免双击浪费额度；
- 新模型先 1% canary，再自动提升权重。
