# R8R3 免费 / 开放权重文本模型池补充

截至 2026-10-05，适合继续关注的免费或低门槛文本推理来源：

## 主池候选
- OpenRouter `openrouter/free`：会在当期免费模型中路由。
- Groq Free Plan：当前包含 GPT-OSS 120B / 20B、Qwen 等，有 RPD/TPD 限额。
- Cerebras Free：当前有免费开发层，适合 GPT-OSS / Qwen 等开放模型。
- NVIDIA NIM Free Endpoint：当前有 GLM-5.3、GLM-5.3-Flash、Nemotron、Gemma、GPT-OSS 等。
- Cloudflare Workers AI：有每日免费 Neurons，具体模型需按 Free 账户当前可用目录选择。
- Mistral Free mode：官方允许创建 API key 并使用计划包含的月度用量；实际额度从账户 Limits 读取。
- Gemini Free Tier：不是开源模型池本身，但可作为免费体验候选。

## 低优先级 / 只用于测试
- Fireworks：新账户当前只有一次性 $1 free credits，不是每日循环免费池。
- Hugging Face Inference Providers：Free 用户当前每月约 $0.10 credits，额度太小，不适合作为 SASI 主体验池。
- GitHub Models：2026-07-30 已退休，不能继续作为候选。

## 模型与推理服务要分开
开放权重模型 ≠ 免费 API。
例如 GPT-OSS、Gemma、Qwen、GLM Flash 等可以开放权重/可下载，但真正在线推理仍由 Groq、NVIDIA、Cloudflare、Cerebras 等提供算力，免费额度取决于推理服务商。

## 启用原则
所有环境变量默认 `false`。只有确认：
- 当前账户可用；
- 当前免费/赠送额度存在；
- 商业 SaaS 使用条款允许；
才启用。
