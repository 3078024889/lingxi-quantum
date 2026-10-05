# R8R2 — 免费智能池接入与环境变量

## 成熟平台提取的机制

没有复制第三方代码。采用成熟网关共通机制：

- LiteLLM：deployment 级 cooldown、429/5xx fallback、限制 fallback 次数。
- OpenRouter：OpenAI-compatible 入口与 free router。
- Cloudflare Workers AI / AI Gateway：统一入口、服务端 token、可拒绝 busy 请求。
- Groq：读取 429 / retry-after / rate-limit 头的思路。
- 用户前台不暴露模型名；供应链变化只改环境变量。

## 重要边界

免费 ≠ 永久 ≠ 允许拿开发者账号给公共 SaaS 无限转售。

只有满足下面任一条件才能把某个 `SASI_EXPERIENCE_*_ENABLED` 打开：

1. 当前条款明确允许你的商业 SaaS 场景；
2. 你的账户得到相应授权；
3. 该额度本来就是用户自己的连接额度。

否则保持 `false`。

## Vercel 配置

Settings → Environment Variables。每个变量加入 Production（需要时也加入 Preview）。
真实 Key 绝不放 `NEXT_PUBLIC_*`，也不要提交 GitHub。

### 全球池建议首批

OpenRouter:
- SASI_EXPERIENCE_OPENROUTER_ENABLED=true
- SASI_EXPERIENCE_OPENROUTER_API_KEY=...
- SASI_EXPERIENCE_OPENROUTER_MODEL=openrouter/free

Groq:
- SASI_EXPERIENCE_GROQ_ENABLED=true
- SASI_EXPERIENCE_GROQ_API_KEY=...
- SASI_EXPERIENCE_GROQ_MODEL=从 Groq 当前 Free Plan 中选择并写死到环境变量

Cerebras:
- SASI_EXPERIENCE_CEREBRAS_ENABLED=true
- SASI_EXPERIENCE_CEREBRAS_API_KEY=...
- SASI_EXPERIENCE_CEREBRAS_MODEL=使用当前账户实际可用的免费模型 ID

NVIDIA NIM:
- SASI_EXPERIENCE_NVIDIA_ENABLED=true
- SASI_EXPERIENCE_NVIDIA_API_KEY=...
- SASI_EXPERIENCE_NVIDIA_MODEL=当前 Free Endpoint 的模型 ID

Gemini:
- SASI_EXPERIENCE_GEMINI_ENABLED=true
- SASI_EXPERIENCE_GEMINI_API_KEY=...
- SASI_EXPERIENCE_GEMINI_MODEL=当前 Free Tier 实际允许的模型 ID

Cloudflare:
- SASI_EXPERIENCE_CLOUDFLARE_ENABLED=true
- SASI_EXPERIENCE_CLOUDFLARE_ACCOUNT_ID=...
- SASI_EXPERIENCE_CLOUDFLARE_API_TOKEN=...
- SASI_EXPERIENCE_CLOUDFLARE_MODEL=当前 Workers Free 可用模型 ID

### 中国大陆池

智谱 / 火山方舟 / 阿里百炼全部使用独立的体验池凭证，不复用用户 BYOK：

- SASI_EXPERIENCE_ZHIPU_*
- SASI_EXPERIENCE_VOLCENGINE_*
- SASI_EXPERIENCE_ALIYUN_*

具体模型 ID 不写死在代码中，因为免费政策与模型上下架会变。

## 为什么分成“平台体验凭证”和“用户连接凭证”

`SASI_EXPERIENCE_*`：
平台自己的体验供应链，只服务每日体验预算。

`sasi_provider_connections`：
用户自己的“连接我的智能服务”，费用和额度属于用户自己的供应商账号。

二者不能混用。
