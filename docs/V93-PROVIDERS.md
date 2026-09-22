# V9.3 Provider Router

Routing:
- light: Zhipu GLM-5.3-Flash -> DeepSeek Flash -> Volcengine
- standard: DeepSeek Flash -> Zhipu -> Volcengine
- high: Volcengine Doubao-Seed-Evolving -> DeepSeek -> Zhipu

Important:
- Fallback is automatic when a provider errors.
- Billing now settles against the provider that actually answered.
- Reservation is based on the most expensive configured fallback, preventing a cheap-first / expensive-fallback loss.
- DeepSeek defaults use conservative peak RMB pricing: input 2 / M, output 8 / M, cache hit 0.04 / M.
- Zhipu defaults to provider cost 0 only while your account is using its current free/granted quota. As soon as BigModel shows a paid tariff for your account, set:
  ZHIPU_INPUT_RMB_PER_M
  ZHIPU_OUTPUT_RMB_PER_M
  ZHIPU_CACHED_RMB_PER_M
  No code change is required.

Production test after deploy (login required):
- /api/ai/provider-test?tier=light
- /api/ai/provider-test?tier=standard
- /api/ai/provider-test?tier=high

Expected first providers:
light -> zhipu / glm-5.3-flash
standard -> deepseek / deepseek-flash
high -> volcengine / doubao-seed-evolving

Do not expose provider API keys in the browser or chat.
