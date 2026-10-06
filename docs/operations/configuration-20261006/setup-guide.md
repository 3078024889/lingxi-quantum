# 灵犀场：完整配置与 API 开通指南

2026-10-06。你已完成现有环境配置，不需要重填。变量总表见 [variables.csv](variables.csv)，机器可读引用见 [variables.json](variables.json)，名称模板见 [all-variable-names.env](all-variable-names.env)。总表包含别名、可选功能与平台自动变量，不代表全部必填。**名称模板用于核对，不要将空值模板整体导入生产并覆盖已有密钥。**

## 本次新增

| 功能 | 变量 | 操作 |
| --- | --- | --- |
| 带来源的网络研究 | `SASI_RESEARCH_TAVILY_ENABLED`、`SASI_RESEARCH_TAVILY_API_KEY` | 开通 Tavily 后填密钥、启用；不开通时页面会提示无法联网检索，不编造搜索结果。 |
| Mistral 体验候选 | `SASI_EXPERIENCE_MISTRAL_ENABLED/API_KEY/MODEL/BASE_URL/PRIORITY/DAILY_SHARE` | 本次补齐模板，实际变量是逐项完整名称，见总表；已有配置保留。 |
| Fireworks 体验候选 | `SASI_EXPERIENCE_FIREWORKS_ENABLED/API_KEY/MODEL/BASE_URL/PRIORITY/DAILY_SHARE` | 同上。体验额度、商业使用条件与价格以当前账户为准。 |
| 自定义兼容服务 | 无新增平台环境变量 | 登录网站的“连接我的智能服务”，选择通用智能服务，填服务地址、模型名、密钥，保存并检查。 |

## 放在哪里

Vercel → 项目 → Settings → Environment Variables → 选择 Production。保存后重新部署，变量不会自动进入已经发布的旧版本。[Vercel 环境变量说明](https://vercel.com/docs/environment-variables)。`.cn` 如果使用独立阿里云进程，需要在那个进程的服务器环境中同步必需配置并重启，不能只改 Vercel。密钥只放服务器；`NEXT_PUBLIC_` 值会进入浏览器。

## 基础账户、数据库与文件

1. [Supabase 控制台](https://supabase.com/dashboard)：进入已有项目，从 Connect/API 设置取项目 URL、浏览器 anon key 与服务器 service role key，对应 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。保持现有项目和数据，按仓库迁移记录核对数据库，不重建生产库。[密钥说明](https://supabase.com/docs/guides/api/api-keys)。
2. `NEXT_PUBLIC_SITE_URL=https://lingxifield.com`。第二域名 `lingxifield.cn` 继续走现有双域名配置；正式页面使用各语言 canonical/hreflang，账户、余额、任务页不收录。
3. `SASI_BYOK_ENCRYPTION_KEY` 必须是 32 字节随机值的 Base64。它用于已有用户密钥解密；**保留现有值**。新安装可用 `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` 本地生成，不能随意轮换已经保存连接的生产密钥。`CRON_SECRET`、`SASI_WORKER_SECRET`、`SASI_QUOTE_SECRET` 也使用独立随机值，前后端服务共享时必须一致。
4. [Cloudflare R2](https://developers.cloudflare.com/r2/get-started/s3/)：登录 Cloudflare → R2 → 建私有存储桶 → API Tokens → 仅授予所需桶读写权限。填 `R2_ACCOUNT_ID`、`R2_ENDPOINT`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_SASI_ARTIFACTS`、`R2_BUCKET_PRIVATE_BURN`。按实际启用功能建桶，上传 CORS 允许两个正式域名。[令牌步骤](https://developers.cloudflare.com/r2/api/tokens/)。

## 模型体验池：按需选用

常规每个服务填 `SASI_EXPERIENCE_<服务>_ENABLED=true`、`API_KEY`、`MODEL`；`BASE_URL`、`PRIORITY` 有默认值。模型必须填账户实际可用的模型 ID，不能把订阅聊天产品的名字当 API 权限。未开通的服务保持 `false`。`DAILY_SHARE` 是站内分配权重，不增加供应商额度；`TASKS` 可限制到 `chat,knowledge,research,website,drama`。网站和短剧脚本优先使用体验池，视频生成仍需单独报价确认。

| 服务 / 变量名称中的服务段 | 官方开通入口与步骤 |
| --- | --- |
| OpenRouter / `OPENROUTER` | [官方快速开始](https://openrouter.ai/docs/quickstart)：注册 → Keys 创建密钥 → 查看模型列表/免费路由权限，模型可用 `openrouter/free`。免费路由有速率与账户限制。 |
| Groq / `GROQ` | [控制台 Keys](https://console.groq.com/keys)；[快速开始](https://console.groq.com/docs/quickstart)：注册 → 新建 Key → 从当前模型列表选模型。 |
| Cerebras / `CEREBRAS` | [官方示例与开通说明](https://github.com/Cerebras/inference-examples/blob/main/getting-started/README.md)：登录官方 Cloud 平台 → API Keys → 创建 → 选账户支持的模型。 |
| NVIDIA / `NVIDIA` | [官方 Build](https://build.nvidia.com/)：登录 → 打开所需模型 → Get API Key/查看调用示例 → 复制实际模型 ID 和 API 地址；模型 API 权限与账户试用额度需核对。 |
| Gemini / `GEMINI` | [官方密钥说明](https://ai.google.dev/gemini-api/docs/api-key)：登录 AI Studio → 建或导入项目 → API Keys → 创建受限密钥 → 从模型页选模型。 |
| Mistral / `MISTRAL` | [官方首个请求](https://docs.mistral.ai/getting-started/quickstarts/developer/first-api-request)：注册 Studio → API Keys → 创建 → 选择当前套餐支持的模型。模板示例 `mistral-small-latest`。 |
| Fireworks / `FIREWORKS` | [官方 Serverless 入门](https://docs.fireworks.ai/getting-started/quickstart)：注册 → 创建 API Key → 选 Serverless 模型 → 复制完整模型 ID。试用额度不是永久免费。 |
| Cloudflare / `CLOUDFLARE` | [Workers AI REST 入门](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)：取 Account ID → 创建含 Workers AI 权限的 API Token → 从 Models 选模型。此服务用 `ACCOUNT_ID`、`API_TOKEN`，不使用常规 `API_KEY/BASE_URL`。[价格与免费额度](https://developers.cloudflare.com/workers-ai/platform/pricing/)。 |
| 智谱 / `ZHIPU` | [官方开放平台](https://open.bigmodel.cn/)：注册实名认证 → API Keys → 选实际可用模型。 |
| 火山方舟 / `VOLCENGINE` | [官方 API Key 指南](https://docs.volcengine.com/docs/ark/api-key?lang=zh)：登录方舟 → API Key 管理 → 创建 → 开通所需推理模型，复制模型/接入点 ID。 |
| 阿里百炼 / `ALIYUN` | [官方获取 API Key](https://help.aliyun.com/zh/model-studio/get-api-key/)：登录百炼 → 选择业务空间和地域 → API Key → 创建 → 开通模型。地域必须与 API 地址对应。 |

## 用户自己连接模型

这类连接通过网站账户保存，服务器加密存储，不需要把每个用户的 Key 加到 Vercel。支持 OpenAI、xAI、Anthropic、Gemini、DeepSeek、OpenRouter、火山、百炼、Luma，以及自定义 OpenAI 兼容服务。

- [xAI 官方快速开始](https://docs.x.ai/developers/quickstart)：控制台注册、开通 API 余额、创建 Key；聊天订阅与 API 账户不同。
- [Anthropic 官方账户说明](https://support.anthropic.com/en/articles/8114521-how-can-i-access-the-anthropic-api)：进入官方开发控制台，配置 API 账户与 Key。
- [DeepSeek 官方文档](https://api-docs.deepseek.com/)：登录平台，创建 API Key、查看实际模型。
- [Luma 官方视频文档](https://docs.lumalabs.ai/ue/docs/video-generation)：登录开发平台创建 Key；是否能在本网站用于特定生成，以已经接通的能力为准。连接已保存不代表全部生成能力都能用。
- OpenAI 使用官方 API 平台的 Key；创建步骤按 [官方 Quickstart](https://platform.openai.com/docs/quickstart) 操作，账户必须具有相应模型权限。
- 通用兼容服务填 HTTPS 服务地址、实际模型 ID 和 Key；不接受本机、私网或云元数据地址。[LiteLLM 兼容接口说明](https://docs.litellm.ai/docs/providers/openai_compatible)。

## 网络研究

[Tavily 官方快速开始](https://docs.tavily.com/documentation/quickstart)：注册控制台 → API Keys → 创建 → 填 `SASI_RESEARCH_TAVILY_API_KEY` → `SASI_RESEARCH_TAVILY_ENABLED=true` → 重部署。在 SASI 科研中勾选网络研究再提问。使用 basic search，最多五条来源；不会自动改用更贵的深度搜索。搜索消耗运营账户额度，应在控制台设置预算。站内还有账户/IP 次数限制。[请求参数说明](https://docs.tavily.com/documentation/api-reference/endpoint/search)。

## 邮件、运营与退款

1. [Resend 域名验证](https://resend.com/docs/dashboard/domains/introduction)：注册 → Domains 添加发信域名 → 在 DNS 填提供的记录 → 验证 → API Keys 创建发信 Key。填 `RESEND_API_KEY`；按现有代码配置 `LINGXIFIELD_MONEY_FROM_EMAIL`、支持邮箱相关变量及管理员列表。资金提醒与管理员登录使用你指定的 `business@lingxifield.com`，已设好的保持。
2. 临时邮箱单独配置 `TEMP_MAIL_DOMAIN`、`TEMP_MAIL_INGEST_SECRET`、`TEMP_MAIL_SESSION_SECRET` 与接收转发服务；不是仅填普通发信 Key 就能收信。入站 webhook 用签名 secret，路径与部署代码一致。
3. [微信支付商户平台](https://pay.weixin.qq.com/)：已有商户 → API 安全 → 核对商户号、AppID、API v3 Key、商户私钥、证书序列号、微信平台公钥/ID → 配置支付/退款回调。对应完整 `WECHAT_*` 表。退款需要商户退款资金，网站用户余额不等于微信商户可退款资金。
4. [支付宝开放平台](https://open.alipay.com/module/webApp)：建/使用网页应用 → 签约支付产品 → 配置 RSA2 应用私钥、支付宝公钥 → 填 `ALIPAY_APP_ID/PRIVATE_KEY/PUBLIC_KEY` 等已有配置。退款资金与渠道限制按商户账户检查。
5. [PayPal 官方集成](https://developer.paypal.com/studio/checkout/standard/integrate)：开发控制台 Apps & Credentials → 正式 Live 应用 → 取 Client ID、Secret → 填 `PAYPAL_CLIENT_ID/CLIENT_SECRET/ENV/WEBHOOK_ID`；[Webhook 说明](https://developer.paypal.com/payment-methods/webhooks/)。正式和 Sandbox 不能混用。
6. `USD_BALANCE_TOPUP_ENABLED`、支付 enabled 标志、`SASI_REFUND_FLOW_TESTED` 按已验收的实际渠道保留，不能仅为显示按钮强行打开。定时对账用 `CRON_SECRET`/`MONEY_RECONCILE_SECRET` 与部署 cron 配合。

## 文档转换、音视频与两 GB 服务器

文档转换可按当前路由配置托管 ConvertAPI 或仓库的文档网关。[ConvertAPI 入门](https://www.convertapi.com/doc)。不要为已选方案把所有别名同时填不同值；总表中的代码引用能看到哪个名称被读取。自建方案使用 `infra/document-converter` 的 Gotenberg/Caddy 配置，公网只暴露签名网关，内部转换服务不直接开放。两 GB 机器保持单个转换任务、文件上限与超时，不部署大模型权重或本地视频扩散。

音视频 AI 的 `LINGXIFIELD_MEDIA_AI_BASE_URL/KEY` 与 TRANSCRIBE/TRANSLATE/TTS 模型要来自真正支持相应 API 的服务；只支持聊天的地址不能冒充语音生成。OCR、本地文件处理、轻量 WebAssembly 功能按工具能力表使用；外部 GPU 生成保持任务状态查询、失败可恢复和明确价格确认。对象存储、队列、worker 的独立进程还需实际部署，添加环境变量本身不会创建服务器服务。

## 验收顺序

本次已经补齐生产连接字段、体验额度及持续任务相关数据库迁移，并回读权限。实际远程版本与源码文件映射见相邻审计目录的 `database-release.json`；不要盲目重新推送旧迁移。后续在已注入服务器配置的环境运行 `node scripts/release/check-sasi-production-foundation.mjs` 检查表/字段与服务端权限；脚本使用 limit=0，不返回用户记录。没有配置时会明确失败，不输出假通过。

数据库/登录 → 文件存储 → 一个可用体验模型 → 网站预览与 ZIP → 资料问答 → 一条真实联网来源 → 已保存连接验证 → 支付、退款、邮件和资金看板。模型生成用测试账户与预算确认；不要在无人确认时消耗真实付费 Key。服务器部署、账户余额和第三方审批必须以实际控制台结果验收，不能从静态代码推断已开通。

完整变量表包含所有当前扫描到的命名引用。某个服务不启用时，其密钥不需要注册；运营预算、健康参数等只影响代码策略，不能替代供应商授权或产生永久免费额度。
