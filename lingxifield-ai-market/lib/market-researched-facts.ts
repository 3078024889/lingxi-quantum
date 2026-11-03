/** Sourced publisher facts. Payment methods are capabilities, not a guarantee of local checkout. */
export type MarketResearchFact={payments?:string[];paymentSource?:string;extraPaymentSource?:string;price?:string;priceSource?:string;free?:string;freeSource?:string;region?:string;regionSource?:string;commercial?:string;commercialSource?:string;models?:string;modelsSource?:string};
export const RESEARCHED_FACTS:Readonly<Record<string,MarketResearchFact>>={
  "doubao": {
    "payments": [
      "支付宝（Android/Web/macOS）",
      "抖音支付（Android/Web/macOS）",
      "Apple App Store（iOS）"
    ],
    "paymentSource": "https://lf9-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/grace_legal/doubao_member_copywrite_for_ai.html",
    "price": "豆包 App 基础版免费；中国 App Store 内购订阅公示：标准版连续月付 ¥68、加强版 ¥200/月、专业版 ¥500/月（iOS 渠道价，不代表网页/Android 同价）。火山方舟模型 API 独立计费：doubao-seed-2.0-mini 输入 0–32K 每百万 Token ¥0.40、输出 ¥4.00；按区域、模型及上下文长度差异计费",
    "priceSource": "https://apps.apple.com/cn/app/id6459478672",
    "region": "中国大陆版 · 官方网页及 Android/iOS 提供服务；其他市场不与国内版混算",
    "regionSource": "https://www.doubao.com/legal/ey01",
    "models": "豆包包含中文对话、图片、文件和多模态功能；聊天模型与火山引擎豆包 API 服务独立计费",
    "modelsSource": "https://www.doubao.com/",
    "free": "豆包 App 基础版免费；付费等级与免费次数以各客户端说明为准。火山引擎的模型 API 免费额度与网页免费使用不通用",
    "freeSource": "https://apps.apple.com/cn/app/id6459478672",
    "commercial": "豆包可用于创作，但生成内容发布、版权、肖像/隐私及商标须遵守用户协议；不能把付费会员等同所有素材商用授权。",
    "commercialSource": "https://www.doubao.com/legal/terms"
  },
  "jimeng": {
    "payments": [
      "支付宝（网页版/安卓自动续费）",
      "微信支付（网页版/安卓自动续费）",
      "抖音支付（网页版/安卓自动续费）",
      "Apple App Store（iOS）"
    ],
    "paymentSource": "https://lf3-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/dreamina/b966ce40-d931-4397-8def-38fe5d03c729.html",
    "price": "基础 ¥79/月（单月购买，725 积分）；标准 ¥239/月（2210 积分）；高级 ¥649/月（6160 积分）",
    "priceSource": "https://jimeng.jianying.com/",
    "free": "每日登录有赠送积分；实际领取数量以账户页面为准",
    "freeSource": "https://jimeng.jianying.com/",
    "region": "中国版即梦 AI · 网页及移动端；不同国家产品入口与权益不能直接等同",
    "regionSource": "https://jimeng.jianying.com/",
    "models": "即梦提供 Seedance 视频生成模型、图片生成及首尾帧/图生视频创作；模型和积分按会员档位",
    "modelsSource": "https://jimeng.jianying.com/",
    "commercial": "即梦 Seedance 2.0 官方功能页说明：视频可用于商品展示、品牌广告等商业创作，须遵守服务协议并确保参考图、音乐、人物肖像、商标等素材已获得授权。平台源码、商标本身不因此获商用许可。",
    "commercialSource": "https://jimeng.jianying.com/tools/seedance-2-0"
  },
  "kling": {
    "payments": [
      "支付宝（可灵会员/接口资源包）",
      "微信支付（可灵会员/小额 API 资源包）",
      "Apple App Store（iOS 会员）"
    ],
    "paymentSource": "https://ppg.viviv.com/doodle/kLmGpQFM.html",
    "extraPaymentSource": "https://docs.qingque.cn/d/home/eZQCR1cjLJ5SqrV-AfCve0rYn",
    "price": "可灵 AI 网页会员 Standard/Pro/Premier/Ultra+ 等具体金额按地区及订阅页实时结账；独立 API 官方套餐示例：视频 Standard Package 1 为 $500/3,250 units（180 天有效）；Kling 4.0 视频 720P 无输入视频为 1 unit/s，1080P 为 1.5 units/s；另有 Kling 3.0 和 4K 档",
    "priceSource": "https://kling.ai/dev/pricing?packageFilter=flagship-180",
    "region": "可灵中国版与国际版入口/会员权益不同；本条为中国版官网资料",
    "regionSource": "https://ppg.viviv.com/doodle/kLmGpQFM.html",
    "models": "视频 API：Kling 4.0 720P/1080P、Kling 3.0 系列最高 4K（不同功能不同计费）；Image 3.0 支持 1K、2K 和 4K。网页会员标准版、专业版、高级版、企业版为另一权益体系",
    "modelsSource": "https://kling.ai/dev/pricing?packageFilter=flagship-180",
    "free": "可灵中国版免费账号可体验部分图片/视频功能；不同模型/时长/水印消耗的积分按账户与活动变化",
    "freeSource": "https://klingai.com/",
    "commercial": "可灵AI 创作内容使用须遵守用户服务协议；非会员或未经书面许可不得移除可灵品牌标识/水印，或应显著标明由AI生成；不得侵犯第三方权益。",
    "commercialSource": "https://ppg.viviv.com/doodle/oarzodFE.html"
  },
  "lovable": {
    "payments": [
      "Credit / debit card（地区结账条件适用）",
      "Apple Pay（适用地区）",
      "Google Pay（适用地区）",
      "Cash App Pay（适用地区）",
      "WeChat Pay（适用地区）",
      "Alipay（适用地区）",
      "iDEAL（适用地区）",
      "Amazon Pay（适用地区）",
      "Link（Stripe 快捷结账，适用地区）"
    ],
    "paymentSource": "https://stripe.com/customers/lovable",
    "price": "Pro 套餐起价 $25/月（以现行官网方案及地区结算为准）；官方按任务积分示例：修改按钮颜色 0.50 credits、删除页脚 0.90 credits、增加注册登录 1.20 credits、生成含 3 张图片的落地页 1.70 credits。示例不是固定收费，复杂度及套餐影响积分消耗；不能直接换算为美元/次。",
    "priceSource": "https://lovable.dev/pricing",
    "region": "Stripe 对 Lovable 的官方案例明确列出已启用信用卡、Apple Pay、Google Pay、Cash App Pay、微信支付、支付宝、iDEAL、Amazon Pay 和 Link；由结账系统按所在国家、货币与账户等条件动态显示，不能保证每个国家每种钱包都可用。Stripe 自身覆盖的全部支付方式也不能直接视为 Lovable 已开通。",
    "regionSource": "https://stripe.com/customers/lovable",
    "commercial": "用户通常拥有自己用 Lovable 建立的应用/网站及生成内容，但平台自身技术与第三方模型仍有独立权利",
    "commercialSource": "https://lovable.dev/terms",
    "models": "Lovable 以自然语言构建网站与应用；用户看到的构建引擎并非可固定选择的独立底座模型",
    "modelsSource": "https://lovable.dev/",
    "free": "Free 每天 5 个构建积分、每月最多 30 个；每月另赠 20 Cloud credits；内置应用 AI 另赠 4 积分",
    "freeSource": "https://lovable.dev/pricing"
  },
  "luma": {
    "payments": [
      "Credit / debit card",
      "Bank payments (web)",
      "Cash App Pay",
      "Apple App Store (iOS)"
    ],
    "paymentSource": "https://lumalabs.ai/learning-hub/payments-subscriptions",
    "price": "Plus $30/月或 $300/年；Pro $90/月或 $900/年；Ultra $300/月或 $3000/年；Team/Enterprise 询价；API 积分独立计费",
    "priceSource": "https://lumalabs.ai/pricing",
    "region": "官网提供网页订阅与 iOS 购买，具体地区/币种由官方结算和商店决定",
    "regionSource": "https://lumalabs.ai/learning-hub/payments-subscriptions",
    "commercial": "商用输出依付费套餐和具体产品条款；创作者须有输入素材的合法权益，第三方素材权利不自动取得",
    "commercialSource": "https://lumalabs.ai/legal/terms-of-service",
    "models": "Luma 现行视频模型 Ray3.2、图像模型 UNI-1.1；Luma App 集成创意智能体和多模型创作，API 另有 Build/Scale 计费体系",
    "modelsSource": "https://lumalabs.ai/llm-info",
    "free": "Luma 官方说明现行套餐均包含试用积分；具体试用数量及模型使用权限在官方 Plus、Pro、Ultra 方案中展示，不把已停用的 Dream Machine 免费政策当作当前权益",
    "freeSource": "https://lumalabs.ai/llm-info"
  },
  "langchain": {
    "payments": [
      "No payment required for open-source framework",
      "Hosted cloud service billed separately"
    ],
    "paymentSource": "https://www.langchain.com/pricing",
    "price": "LangChain 开源框架免费；LangSmith Developer $0/席位/月（每月含 5,000 基础追踪），Plus $39/席位/月，超额按用量计费",
    "priceSource": "https://www.langchain.com/pricing",
    "free": "框架免费；LangSmith Developer 1 个免费席位、每月 5,000 条基础追踪",
    "freeSource": "https://www.langchain.com/pricing",
    "region": "LangChain 本地 SDK 可自行安装；LangSmith 托管服务与地区另行区分",
    "regionSource": "https://www.langchain.com/pricing",
    "commercial": "LangChain 源码采用 MIT，可集成商业应用；模型供应商 API 与 LangSmith 服务需单独遵守条款",
    "commercialSource": "https://github.com/langchain-ai/langchain/blob/master/libs/langchain/LICENSE",
    "models": "LangChain 不是独立模型：框架连接 OpenAI、Anthropic、开源模型和检索工具构建应用与智能体",
    "modelsSource": "https://python.langchain.com/docs/integrations/"
  },
  "llamaindex": {
    "payments": [
      "No payment required for open-source framework",
      "Hosted cloud service billed separately"
    ],
    "paymentSource": "https://www.llamaindex.ai/pricing",
    "price": "LlamaIndex 开源框架免费；LlamaParse/LlamaCloud Free $0/月（10,000 credits），Starter $50/月（含 40,000 credits），Pro $500/月（含 400,000 credits）；额外用量依每项任务消耗 credits 计费；1,000 credits 标价 $1.25",
    "priceSource": "https://www.llamaindex.ai/pricing",
    "free": "云端 Free $0/月含 10,000 credits、100 用户与基础支持；开源框架另行免费安装，调用第三方模型/API 的费用另计",
    "freeSource": "https://www.llamaindex.ai/pricing",
    "region": "开源库可本地安装；LlamaCloud 托管服务按厂商规定地区使用",
    "regionSource": "https://github.com/run-llama/llama_index",
    "commercial": "核心开源库 MIT，允许商业使用、修改和发行；须保留许可及版权声明，模型服务另计",
    "commercialSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/LICENSE",
    "models": "LlamaIndex 不是模型：使用各家语言模型和嵌入模型构建文档解析、索引、RAG 和智能体",
    "modelsSource": "https://github.com/run-llama/llama_index"
  },
  "llamacpp": {
    "payments": [
      "No payment required for self-hosted software",
      "Hardware and cloud compute billed separately"
    ],
    "paymentSource": "https://github.com/ggml-org/llama.cpp",
    "price": "llama.cpp 开源软件免费；本地 GPU/CPU、模型文件、云端算力成本自理",
    "priceSource": "https://github.com/ggml-org/llama.cpp",
    "free": "本地推理完全可免费运行，前提是自行提供兼容模型与硬件",
    "freeSource": "https://github.com/ggml-org/llama.cpp",
    "region": "无需注册地区白名单；本地运行不依赖海外网页订阅，模型获取依其发行限制",
    "regionSource": "https://github.com/ggml-org/llama.cpp",
    "commercial": "llama.cpp 引擎 MIT，可用于商业部署；下载的具体大模型应按其独立许可证判断商用",
    "commercialSource": "https://github.com/ggml-org/llama.cpp",
    "models": "llama.cpp 不是固定模型：本地加载 GGUF 模型，支持 CPU/GPU 推理和模型量化部署",
    "modelsSource": "https://github.com/ggml-org/llama.cpp"
  },
  "dify": {
    "payments": [
      "Self-hosted Community Edition: no payment",
      "Dify Cloud subscription: checkout options vary by country"
    ],
    "paymentSource": "https://dify.ai/pricing",
    "price": "Community Edition 开源自托管免费；Dify Cloud Sandbox 免费（含 200 条消息额度）；Professional $59/工作空间/月（年付 $590/年），Team $159/工作空间/月（年付 $1,590/年），模型厂商 API 费用另计；Enterprise 单独报价",
    "priceSource": "https://dify.ai/pricing/dify-cloud",
    "free": "Cloud Sandbox 免费，含 200 条模型消息额度、1 名成员、5 个应用、50 个知识库文档和 50 MB 存储；本地 Community 版免费，依 Dify Open Source License 使用",
    "freeSource": "https://dify.ai/pricing/dify-cloud",
    "region": "自托管版可在自有服务器部署；云端服务涉及账号/地区和云计算费用",
    "regionSource": "https://github.com/langgenius/dify",
    "commercial": "可作为企业应用后端，但源码授权是加附加条件的 Apache 2.0：多租户服务需另购商业许可，前端 Logo/版权不可擅自去除",
    "commercialSource": "https://github.com/langgenius/dify/blob/main/LICENSE",
    "models": "Dify 工作流并非独立底座模型，可按任务连接外部 LLM、嵌入模型和工具，费用按供应商计算",
    "modelsSource": "https://github.com/langgenius/dify"
  },
  "n8n": {
    "payments": [
      "Self-hosted Community Edition: no payment",
      "n8n Cloud subscription: checkout options vary by country"
    ],
    "paymentSource": "https://n8n.io/pricing/",
    "price": "n8n 自托管社区版可免费使用；n8n Cloud Starter €20/月（按年计费，含 2,500 次执行）",
    "priceSource": "https://n8n.io/pricing/",
    "free": "自托管 Community 免费；Cloud 试用是另外的托管服务",
    "freeSource": "https://n8n.io/pricing/",
    "region": "自托管运行不需要 SaaS 地区许可；Cloud 账号及付款按官网条件",
    "regionSource": "https://n8n.io/pricing/",
    "models": "n8n 是工作流与 AI 智能体自动化平台，不是单一底座模型；可调用不同 AI 提供商",
    "modelsSource": "https://docs.n8n.io/",
    "commercial": "n8n 社区版按 Sustainable Use License 可免费用于公司内部工作流、为客户执行自动化并交付结果；若外部客户能自行编辑工作流、白标或经营托管自动化 SaaS，需商业许可。",
    "commercialSource": "https://support.n8n.io/article/can-i-use-your-license-for-my-use-case"
  },
  "comfyui": {
    "payments": [
      "Local ComfyUI: no payment",
      "Comfy Cloud subscription: checkout options vary by country"
    ],
    "paymentSource": "https://www.comfy.org/pricing",
    "price": "ComfyUI 本地开源软件免费；Comfy Cloud / 第三方节点另计",
    "priceSource": "https://support.comfy.org/articles/9806306061-about-comfy",
    "free": "本地工作流与节点界面免费运行，需显卡/模型；Partner Nodes 可能收费",
    "freeSource": "https://support.comfy.org/articles/9806306061-about-comfy",
    "region": "本地离线操作可自行安装；云端节点、模型下载地域和网络另看服务商",
    "regionSource": "https://github.com/Comfy-Org/ComfyUI",
    "commercial": "引擎 GPL-3.0 许可商业使用；若发行修改版需满足对应源代码/相同许可义务，模型/节点版权单独判断",
    "commercialSource": "https://github.com/Comfy-Org/ComfyUI/blob/master/LICENSE",
    "models": "ComfyUI 节点工作流并非固定模型；可安装第三方图片、视频、音频及 3D 模型，许可证另议",
    "modelsSource": "https://github.com/Comfy-Org/ComfyUI"
  },
  "automatic1111": {
    "payments": [
      "No payment required for self-hosted software",
      "GPU, hosting and model costs billed separately"
    ],
    "paymentSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "price": "Stable Diffusion WebUI 开源安装免费；运行 GPU/云算力和模型权重成本自理",
    "priceSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "free": "本地 WebUI 不按生成次数收费；第三方云端或外部模型可能付费",
    "freeSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "region": "本地部署工具，无官网会员购买地区要求；模型下载和服务出口规则另议",
    "regionSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "commercial": "WebUI 源码为 AGPL-3.0，商用可行但网络提供修改版可能触发源码披露义务；生成模型自身另有授权",
    "commercialSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/master/LICENSE.txt",
    "models": "Stable Diffusion WebUI 是模型加载和图像生成界面；底层 Stable Diffusion/扩展权重须自行安装与授权",
    "modelsSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui"
  },
  "fasterwhisper": {
    "payments": [
      "No payment required for self-hosted software",
      "CPU/GPU compute and hosting billed separately"
    ],
    "paymentSource": "https://github.com/SYSTRAN/faster-whisper",
    "price": "faster-whisper 本地开源软件免费；算力和下载模型成本另计",
    "priceSource": "https://github.com/SYSTRAN/faster-whisper",
    "free": "不按转录分钟收取软件使用费；CPU/GPU 资源由使用者承担",
    "freeSource": "https://github.com/SYSTRAN/faster-whisper",
    "region": "本地 Python 组件，无平台注册和会员付款地域要求",
    "regionSource": "https://github.com/SYSTRAN/faster-whisper",
    "commercial": "代码 MIT，可用于商业转录服务；须保留版权和许可，音频素材权利单独处理",
    "commercialSource": "https://github.com/SYSTRAN/faster-whisper/blob/master/LICENSE",
    "models": "基于 CTranslate2 的 Whisper 语音识别推理实现；具体可用模型由用户安装的 Whisper 权重决定",
    "modelsSource": "https://github.com/SYSTRAN/faster-whisper"
  },
  "openai-python": {
    "payments": [
      "SDK: no payment",
      "Credit / debit card (API billing)"
    ],
    "paymentSource": "https://help.openai.com/en/articles/7232916-why-was-my-credit-card-declined",
    "price": "OpenAI 官方 Python SDK 免费；实际模型 API 按调用量计费，不包含在 SDK 许可中",
    "priceSource": "https://github.com/openai/openai-python/blob/main/pyproject.toml",
    "free": "SDK 可免费安装和使用，API Token 用量另收费",
    "freeSource": "https://github.com/openai/openai-python",
    "region": "SDK 自身可安装；OpenAI API 仅在官方支持地区提供，需分开判断",
    "regionSource": "https://github.com/openai/openai-python",
    "commercial": "SDK 为 Apache-2.0，可嵌入商用软件；API 服务及模型输出遵守 OpenAI 具体条款",
    "commercialSource": "https://github.com/openai/openai-python/blob/main/pyproject.toml",
    "models": "OpenAI Python SDK 不是模型：接入 API 的模型须按其独立模型 ID、费率与权限计费",
    "modelsSource": "https://github.com/openai/openai-python"
  },
  "whisper": {
    "payments": [
      "Self-hosted Whisper: no payment",
      "Credit / debit card (OpenAI API billing)"
    ],
    "paymentSource": "https://github.com/openai/whisper",
    "extraPaymentSource": "https://help.openai.com/en/articles/7232916-why-was-my-credit-card-declined",
    "price": "Whisper 官方开源模型/推理代码免费；硬件与托管识别 API 另计",
    "priceSource": "https://github.com/openai/whisper",
    "free": "本地语音识别不收云端按分钟费用；自行提供计算资源",
    "freeSource": "https://github.com/openai/whisper",
    "region": "本地可安装使用；第三方托管识别平台的地区条件独立",
    "regionSource": "https://github.com/openai/whisper",
    "commercial": "Whisper 代码 MIT，可用于商业转录；音频、个人数据等权利及合规责任独立",
    "commercialSource": "https://github.com/openai/whisper/blob/main/pyproject.toml",
    "models": "Whisper 是 OpenAI 发布的开源自动语音识别模型，可在本地转录多语种音频",
    "modelsSource": "https://github.com/openai/whisper"
  },
  "vllm": {
    "payments": [
      "No payment required for self-hosted software",
      "GPU, hosting and model costs billed separately"
    ],
    "paymentSource": "https://github.com/vllm-project/vllm",
    "price": "vLLM 开源推理服务软件免费；GPU/云算力、模型授权与网络运营成本自行承担",
    "priceSource": "https://github.com/vllm-project/vllm",
    "free": "自行部署推理服务无需软件订阅费",
    "freeSource": "https://github.com/vllm-project/vllm",
    "region": "本地/自有云部署不依赖网页购买地区；模型来源和云厂商另有限制",
    "regionSource": "https://github.com/vllm-project/vllm",
    "commercial": "推理引擎 Apache-2.0，可用于商业部署，需遵循版权通知与第三方模型许可证",
    "commercialSource": "https://github.com/vllm-project/vllm/blob/main/pyproject.toml",
    "models": "vLLM 是开源 LLM 推理服务器，可部署兼容语言/多模态模型，性能与硬件和模型架构相关",
    "modelsSource": "https://github.com/vllm-project/vllm"
  },
  "transformers": {
    "payments": [
      "No payment required for open-source library",
      "Hosted inference and compute billed separately"
    ],
    "paymentSource": "https://github.com/huggingface/transformers",
    "price": "Transformers 开源框架免费；模型下载、推理 GPU、托管 Inference Providers 另计",
    "priceSource": "https://github.com/huggingface/transformers",
    "free": "本地安装调用库不收软件会员费；模型许可按模型卡独立判断",
    "freeSource": "https://github.com/huggingface/transformers",
    "region": "开源库本地运行；在线 Hub 和云推理受各自账户及地区规则约束",
    "regionSource": "https://github.com/huggingface/transformers",
    "commercial": "Transformers 代码 Apache-2.0 可商用；具体模型权重许可可能另有限制",
    "commercialSource": "https://github.com/huggingface/transformers",
    "models": "Transformers 是模型库，不是单一模型；可加载文本、图片、音频、视觉语言和语音模型",
    "modelsSource": "https://github.com/huggingface/transformers"
  },
  "openwebui": {
    "payments": [
      "No payment required for self-hosted software",
      "Model API and hosting billed separately"
    ],
    "paymentSource": "https://github.com/open-webui/open-webui",
    "price": "Open WebUI 自托管软件可自行安装；调用 OpenAI/Ollama 等模型的实际成本另计",
    "priceSource": "https://github.com/open-webui/open-webui",
    "free": "自托管软件可部署；集成的云模型 API/硬件成本另算",
    "freeSource": "https://github.com/open-webui/open-webui",
    "region": "自托管实例可在自有服务器部署；云模型 API 按供应商地区支持",
    "regionSource": "https://github.com/open-webui/open-webui",
    "commercial": "使用 Open WebUI 有商业用途条件；超过 50 个终端用户时不得擅自移除 Open WebUI 品牌，需许可或企业版",
    "commercialSource": "https://github.com/open-webui/open-webui/blob/main/LICENSE",
    "models": "Open WebUI 是开源 AI 对话界面，不是模型；可连接 Ollama 和 OpenAI 兼容 API",
    "modelsSource": "https://github.com/open-webui/open-webui"
  },
  "suno": {
    "payments": [
      "Credit / debit card",
      "Apple Pay (some regions)",
      "Google Pay (some regions)",
      "Cash App Pay (some regions)",
      "Stablecoin (some regions)",
      "Korean local cards",
      "UPI",
      "KakaoPay",
      "NaverPay",
      "Apple App Store (iOS)",
      "Google Play (Android)",
      "PayPal via App Store / Google Play (indirect only)"
    ],
    "paymentSource": "https://help.suno.com/en/articles/2421185",
    "extraPaymentSource": "https://help.suno.com/en/articles/2421185",
    "region": "Suno offers web, iOS and Android access. Official direct-checkout currencies: USD, AUD, BRL, CAD, EUR, GBP, IDR, INR, JPY, KRW, MXN, NOK, PLN, SEK, THB, TRY and UAH. CNY is not listed; app-store billing and available payment methods vary by country.",
    "regionSource": "https://help.suno.com/en/articles/2421185",
    "models": "Suno v6 is the flagship model and v6-wild is the experimental variant; both are available to Pro/Premier. v6-mini is available on all plans. Each generation can be up to 8 minutes. Paid plans support longer audio uploads and additional editing, stem and Studio workflows.",
    "modelsSource": "https://help.suno.com/en/articles/13924801",
    "price": "Free $0 with 50 daily credits; Pro $10 monthly or $96 annually ($8/month equivalent), 2,500 credits and 20 downloads per month; Premier $30 monthly or $288 annually ($24/month equivalent), 10,000 credits and 60 downloads per month. Paid download allowances reset on the billing date and unused downloads do not roll over.",
    "priceSource": "https://suno.com/pricing",
    "free": "Free $0, 50 credits daily, v6-mini access and no fixed monthly song-download allocation. Some accounts created before 2026-09-03 have up to 7 lifetime trial downloads; later accounts may occasionally receive trial downloads. Free outputs are non-commercial.",
    "freeSource": "https://help.suno.com/en/articles/13876865",
    "commercial": "Pro/Premier outputs created while subscribed and obtained through an eligible Suno download may be used commercially; these rights persist after cancellation. A later subscription does not automatically grant retroactive rights to free-period songs. Suno's Help Center describes a paid-download route for an original creator's own earlier song; third-party remixes remain non-commercial. Users must have rights to uploaded audio, lyrics, images and voice material.",
    "commercialSource": "https://suno.com/terms"
  },
  "perplexity": {
    "payments": [
      "信用卡/借记卡（订阅）",
      "Visa / Mastercard / Amex（企业订阅）"
    ],
    "paymentSource": "https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions",
    "region": "网页个人 Pro 与 Enterprise 付款政策不同，企业接受 Visa/Mastercard/Amex；各地区额外方式以结算页为准",
    "regionSource": "https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions",
    "commercial": "个人版服务条款许可个人非商业使用；企业版和 API 应按独立商业合同，不得直接将个人 Pro 等同企业商用授权",
    "commercialSource": "https://www.perplexity.ai/zh/hub/legal/terms-of-service",
    "models": "Perplexity 面向联网搜索与研究引用，内置模型和更高级能力随 Free/Pro/Enterprise 变化",
    "modelsSource": "https://www.perplexity.ai/",
    "price": "Perplexity Free $0/月；Pro $20/月或 $200/年；Max $200/月，企业收费方案单独计算",
    "priceSource": "https://www.perplexity.ai/zh/hub/pricing",
    "free": "免费搜索/聊天，基础模型和有出处的回答；高阶模型、研究次数及 Computer 积分按套餐",
    "freeSource": "https://www.perplexity.ai/zh/hub/pricing"
  },
  "qwen": {
    "payments": [
      "支付宝（阿里云百炼 API 账户充值）",
      "银联在线支付（阿里云百炼 API 账户）",
      "网银（阿里云百炼 API 账户）"
    ],
    "paymentSource": "https://help.aliyun.com/zh/model-studio/new-free-quota",
    "price": "千问聊天端基础体验与阿里云百炼 API 分开；API 费用独立计费。百炼中国北京地域 qwen3.5-397b-a17b 输入每百万 Token ¥1.2、输出 ¥7.2（0–128K 输入区间）；qwen3.5-35b-a3b 输入 ¥0.4、输出 ¥3.2；国际地域/缓存/Batch/长上下文价格另算",
    "priceSource": "https://help.aliyun.com/zh/model-studio/model-pricing",
    "region": "千问聊天服务和阿里云百炼 API 是不同入口；百炼提供北京、新加坡、香港、弗吉尼亚、法兰克福及东京区域，模型与价格随区域不同",
    "regionSource": "https://help.aliyun.com/zh/model-studio/what-is-model-studio",
    "models": "千问 Qwen3.5、Qwen3.7/3.8、Max、Omni、Long 等分别依模型、地域及上下文长度收费；价格示例仅限百炼华北2（北京）指定模型的 0–128K 输入区间",
    "modelsSource": "https://help.aliyun.com/zh/model-studio/model-pricing",
    "free": "千问聊天可以免费体验基础对话；阿里云百炼开发者 API 可能提供适用的新用户额度，商业模型另按 Token 计费",
    "freeSource": "https://help.aliyun.com/zh/model-studio/new-free-quota",
    "commercial": "千问聊天与阿里云百炼 Wan/千问 API 是不同服务。百炼可集成到业务应用，具体输出权利、模型版权、发布限制及地区责任以实际模型服务协议为准，不能把 API 商用权益自动延伸至聊天版。",
    "commercialSource": "https://help.aliyun.com/zh/model-studio/what-is-model-studio"
  },
  "deepseek": {
    "payments": [
      "支付宝（DeepSeek API 账户充值）",
      "微信支付（DeepSeek API 账户充值）"
    ],
    "paymentSource": "https://static.deepseek.com/faq/index.html?lang=zh",
    "region": "DeepSeek 聊天网页/应用与开发者 API 分开；API 充值需完成相应实名认证",
    "regionSource": "https://static.deepseek.com/faq/index.html?lang=zh",
    "models": "DeepSeek 网页对话与深度思考功能；API 提供具体模型 ID 与不同价格/上下文限制",
    "modelsSource": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing",
    "price": "DeepSeek API：deepseek-flash 高峰缓存未命中输入 ¥2/百万 Tokens、输出 ¥8/百万；闲时输入 ¥1、输出 ¥4；deepseek-v4-pro 高峰输入 ¥9/百万、输出 ¥27/百万；网页聊天与 API 分开",
    "priceSource": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/",
    "free": "DeepSeek 网页提供免费聊天体验；开发者 API 按模型用量计费，赠送额度及限流以账户规则为准",
    "freeSource": "https://chat.deepseek.com/",
    "commercial": "DeepSeek 用户协议第4.2条约定：在适用法律及协议范围内，输出可用于包括衍生产品开发在内的多种场景；对外发布须核验真实性并标注AI生成，输入和第三方权益由用户负责。",
    "commercialSource": "https://cdn.deepseek.com/policies/en-US/deepseek-terms-of-use.html"
  },
  "elevenlabs": {
    "payments": [
      "Credit / debit card",
      "Apple Pay",
      "Google Pay",
      "UPI（仅印度，订阅结算）",
      "Apple App Store（iOS）",
      "Google Play（Android）"
    ],
    "paymentSource": "https://elevenlabs.io/docs/overview/administration/billing",
    "price": "Free $0/月（10,000积分）；Starter $6/月（30,000）；Creator $22/月（121,000）；Pro $99/月（600,000）",
    "priceSource": "https://elevenlabs.io/pricing",
    "free": "免费版每月 10,000 共享积分；语音/转录/音效等功能共用余额",
    "freeSource": "https://elevenlabs.io/pricing",
    "region": "Web 支付支持主要银行卡和 Apple Pay/Google Pay；UPI 仅印度结算，移动应用商店另计",
    "regionSource": "https://elevenlabs.io/docs/overview/administration/billing",
    "commercial": "免费账户生成内容不附商用授权；付费订阅期间生成内容通常附商业使用许可，Beta 服务和第三方素材有特殊限制",
    "commercialSource": "https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform",
    "models": "ElevenLabs 提供文字转语音、多语种配音、声音克隆及音效模型；积分消耗依功能与模型",
    "modelsSource": "https://elevenlabs.io/pricing"
  },
  "anthropic-sdk-python": {
    "payments": [
      "SDK: no payment",
      "Credit / debit card (API billing)",
      "ACH bank transfer (eligible API monthly invoicing)",
      "PayPal / Venmo not accepted"
    ],
    "paymentSource": "https://support.anthropic.com/en/articles/9402418-why-was-my-card-declined",
    "price": "Anthropic Python SDK 免费安装；Claude API 按模型实际输入/输出 Tokens 及工具用量计费；与个人 Claude Pro 分开",
    "priceSource": "https://github.com/anthropics/anthropic-sdk-python",
    "free": "SDK 本地免费使用；API 新用户可能有试用额度，但正式 API 按用量结算",
    "freeSource": "https://platform.claude.com/docs/en/about-claude/pricing",
    "commercial": "官方 Python SDK 可商用，按代码版本许可履行版权通知；Claude API 受独立商业服务条款约束",
    "commercialSource": "https://github.com/anthropics/anthropic-sdk-python/blob/main/LICENSE",
    "region": "Python SDK 可自行安装；Claude API 调用仅限官网支持的国家/地区，需分开查询",
    "regionSource": "https://platform.claude.com/docs/en/api/supported-regions",
    "models": "官方 Python SDK，不是独立模型；通过 Claude API 调用账户可用的 Claude 模型",
    "modelsSource": "https://platform.claude.com/docs/en/about-claude/models/overview"
  },
  "chatgpt": {
    "payments": [
      "Credit / debit card (web checkout)",
      "Apple App Store (iOS)",
      "Google Play (Android)"
    ],
    "paymentSource": "https://help.openai.com/en/articles/7905739-chatgpt-ios-app-upgrading-to-a-paid-subscription",
    "extraPaymentSource": "https://help.openai.com/en/articles/20001043-how-do-i-avoid-being-charged-twice-if-i-subscribe-to-chatgpt-on-ios-android-and-the-web",
    "price": "ChatGPT Plus $20/月（月付），含对应 Codex 使用额度；独立 API Key 按 API 价格计费，不包含在 Plus 订阅中",
    "priceSource": "https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus",
    "free": "ChatGPT 有免费方案，Codex 本地等入口也有适用额度；Codex 云端任务需符合资格的套餐；用量随模型和任务变化",
    "freeSource": "https://openai.com/chatgpt/pricing/",
    "region": "ChatGPT 消费者访问国家和 OpenAI API 支持名单不同；官方国家名单按产品单独核对",
    "regionSource": "https://help.openai.com/en/articles/7947663-chatgpt-supported-countries",
    "models": "ChatGPT 可选择适用 GPT 模型；Codex 是运行在独立编程入口的开发代理，不是单一 GPT 模型，CLI、IDE、云端可用型号随账户变化",
    "modelsSource": "https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan",
    "commercial": "可按适用 OpenAI 使用条款使用输出；用户需拥有输入素材权利，输出可能不唯一，第三方内容权利不自动取得；ChatGPT 个人服务与 API/企业合同分别适用条款。",
    "commercialSource": "https://openai.com/policies/terms-of-use/"
  },
  "claude": {
    "payments": [
      "Credit / debit card (web and API billing)",
      "Apple App Store (iOS)",
      "Google Play (Android)",
      "ACH bank transfer (eligible API monthly invoicing)",
      "PayPal / Venmo not accepted"
    ],
    "paymentSource": "https://support.anthropic.com/en/articles/9402418-why-was-my-card-declined",
    "extraPaymentSource": "https://support.anthropic.com/en/articles/9266495-how-do-i-sign-up-for-claude-pro-on-the-claude-app-for-ios",
    "price": "Claude Free $0；Pro $20/月（月付），年付 $200/年；API 费用另计",
    "priceSource": "https://claude.com/pricing",
    "free": "Claude Free 可免费聊天、网络搜索、代码与文档；限制随使用量而变",
    "freeSource": "https://claude.com/pricing",
    "region": "Claude 网页与 API 需按官方支持国家分别判断；Pro 个人订阅和商业 API 不互含",
    "regionSource": "https://support.claude.com/en/articles/8114491-get-started-with-claude",
    "models": "Claude 网页/工作台提供 Claude 模型家族；模型是否可选取决于个人、团队和 API 套餐",
    "modelsSource": "https://claude.com/pricing",
    "commercial": "Claude Free/Pro/Max 适用消费者条款，Claude API 与企业服务适用商业条款；业务使用、输出权利与输入素材须按实际服务合同判断。",
    "commercialSource": "https://www.anthropic.com/legal"
  },
  "gemini": {
    "price": "Gemini 网页有免费功能；Google AI Pro US$19.99/月（美国/部分地区参考），Gemini API 另按 Token 计费",
    "priceSource": "https://one.google.com/about/plans?hl=en_US",
    "free": "Gemini 网页有免费访问级别；Gemini 开发者 API 有适用模型免费额度，调用量和地区另有约束",
    "freeSource": "https://ai.google.dev/gemini-api/docs/pricing",
    "payments": [
      "Google One / Google Play billing",
      "Payment options vary by country at checkout"
    ],
    "paymentSource": "https://support.google.com/googleone/answer/16476811?co=GENIE.Platform%3DAndroid&hl=en",
    "extraPaymentSource": "https://support.google.com/googleplay/answer/2651410",
    "region": "Gemini Web、Gemini API、Google One 订阅属于不同商品/计费和地区范围；不将 Google One 服务地区等同 Gemini 应用可用地区",
    "regionSource": "https://support.google.com/gemini/answer/13575153?hl=en",
    "models": "Gemini 消费者应用和开发者 API 可用模型不同；Google AI Pro 可访问更高等级 Gemini 模型及 Deep Research",
    "modelsSource": "https://one.google.com/about/plans?hl=en_US",
    "commercial": "Gemini 应用与 Gemini API 属不同产品条款；输出商业使用须符合 Google 服务及生成式 AI 禁止使用政策、输入素材权利，组织用户还受 Workspace/Cloud 合同约束。",
    "commercialSource": "https://policies.google.com/terms/generative-ai/use-policy?hl=en"
  },
  "grok": {
    "payments": [
      "Web checkout via Stripe",
      "Apple App Store (iOS)",
      "Google Play (Android)"
    ],
    "paymentSource": "https://help.x.com/en/using-x/subscriptions",
    "extraPaymentSource": "https://help.x.com/en/using-x/x-subscription",
    "price": "Grok Free $0/月；SuperGrok $30/月、SuperGrok Plus $100/月为官方公开参考；The X Subscription 的个人套餐另有定价",
    "priceSource": "https://x.ai/pricing",
    "free": "Grok 免费版可体验实时 X/网页检索和文字对话，消息/图片/视频额度按官方账号条件",
    "freeSource": "https://x.ai/pricing",
    "region": "Grok 网页 grok.com 和 X 内订阅与 xAI 开发者 API 分开购买、分开判断国家和支付",
    "regionSource": "https://docs.x.ai/grok/overview",
    "commercial": "按 Grok 消费者及 API 的适用合同判断业务用途；订阅不自动转让模型权重或第三方素材权利",
    "commercialSource": "https://x.ai/legal/terms-of-service",
    "models": "Grok 聊天、联网研究、图片及视频生成；具体模型与权益随 Free/SuperGrok/X Subscription 调整",
    "modelsSource": "https://docs.x.ai/grok/overview"
  },
  "midjourney": {
    "payments": [
      "Credit / debit card",
      "Apple Pay (some regions)",
      "Amazon Pay (some regions)",
      "Alipay (some regions)",
      "Google Pay (some regions)",
      "Link (some regions)",
      "PayPal not supported"
    ],
    "paymentSource": "https://docs.midjourney.com/hc/en-us/articles/27868831972365-Accepted-Payment-Methods",
    "price": "Basic $10/月（年付折合 $8/月）；Standard $30/月（年付 $24/月）；Pro $60/月（年付 $48/月）；Mega $120/月（年付 $96/月）",
    "priceSource": "https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans",
    "free": "Midjourney 官网与 Discord 当前均不提供免费试用；niji · journey 独立手机 App（iOS/Android）提供有限试用，不能等同 Midjourney 网页会员免费额度。",
    "freeSource": "https://docs.midjourney.com/hc/en-us/articles/27870399340173-Free-Trials",
    "region": "官网和 Discord 订阅相通，Stripe 结算仅美元；具体卡与钱包依结账国家而定",
    "regionSource": "https://docs.midjourney.com/hc/en-us/articles/27868831972365-Accepted-Payment-Methods",
    "models": "图像默认模型为 Midjourney V8.2（2026-07-24 启用），改善审美、个性化与图像细节，新增 Edit Model 替代 Omni Reference/Character Reference/Retexture；V8.1/V8.2 支持原生 HD 2048px 图像（需额外 GPU 时间）；视频生成额度与清晰度依套餐区别，不是通用模型 API 价格。",
    "modelsSource": "https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version",
    "commercial": "生成作品可按订阅条款商用；年营收超过 100 万美元的企业及其员工，企业商用须使用 Pro 或 Mega。放大他人作品不转移原作者权利。",
    "commercialSource": "https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service"
  },
  "ollama": {
    "payments": [
      "Local runtime: no payment",
      "Cloud plans and usage credits billed at checkout"
    ],
    "paymentSource": "https://ollama.com/pricing",
    "price": "Ollama 本地运行免费；云模型按百万 Tokens 用量计费；Pro $20/月、Max $100/月、Team $500/月，含不同额度云端积分",
    "priceSource": "https://ollama.com/pricing",
    "free": "本地模型运行不限制次数、无需会员；云端按量付费，计划含云端积分与并发限制",
    "freeSource": "https://ollama.com/pricing",
    "region": "本地软件可自行部署；Ollama 云端数据处理与在线模型服务可能涉及美国、欧洲、新加坡等区域",
    "regionSource": "https://ollama.com/pricing",
    "models": "Ollama 本地运行用户选择的开源模型；云端可按不同模型输入/缓存/输出 Tokens 价格付费",
    "modelsSource": "https://ollama.com/pricing",
    "commercial": "Ollama 软件本身采用 MIT 许可，可在保留版权与许可声明条件下用于商业软件；下载的具体模型权重、数据和第三方服务分别遵守自己的许可证。",
    "commercialSource": "https://github.com/ollama/ollama/blob/master/LICENSE"
  },
  "replit": {
    "price": "Replit Starter 免费；Core $20/月（月付），年付折合 $18/月（全年结算）；Pro $100/月（月付），年付折合 $90/月（全年结算）；Enterprise 询价。Core 年付方案含每月 $20 的高级模型用量额度、Pro 年付方案含每月 $100 额度；超出免费模式与订阅额度的实际消耗依官方计费规则，不把订阅费当作单次生成价格。",
    "priceSource": "https://replit.com/pricing",
    "free": "Starter 提供免费入门体验；Replit 官网将 Free Mode 与付费计划的 Agent/项目额度分开披露，免费模式不等于无限高级模型调用；具体免费项目、AI 任务与发布额度以官方当前 Starter 套餐说明为准。",
    "freeSource": "https://replit.com/pricing",
    "payments": [
      "Credit / debit card（Replit Web 订阅）",
      "Apple App Store（iOS Core 内购）",
      "Google Play（Android Core 内购）"
    ],
    "paymentSource": "https://docs.replit.com/references/platforms/mobile-app",
    "region": "Core 可发布项目于多地区，企业版有额外区域部署功能；支付币种和税费按结算页面",
    "regionSource": "https://replit.com/pricing",
    "commercial": "Replit Pro 面向专业商业项目，企业/组织另有商业协议；生成应用与模型工具需遵守平台服务及第三方许可",
    "commercialSource": "https://replit.com/terms-of-service",
    "models": "Replit Agent 提供 Lite / Economy / Power 构建模式；模型、自动浏览器测试与额度随套餐不同",
    "modelsSource": "https://docs.replit.com/replitai/assistant/"
  },
  "runway": {
    "payments": [
      "Credit / debit card",
      "Amazon Pay",
      "Apple Pay",
      "Google Pay",
      "Stripe Instant Bank Payments (US only)",
      "Alipay",
      "Cash App Pay",
      "WeChat Pay"
    ],
    "paymentSource": "https://help.runwayml.com/hc/en-us/articles/30657959470483-What-payment-methods-are-available",
    "price": "Runway Standard 年付折合 $12/月，年付一次结算；每月 625 积分；Pro 及 Unlimited 每月 2,250 积分；Gen-4.5 视频按 12 积分/秒",
    "priceSource": "https://runway.com/pricing",
    "free": "Free 账号一次性 125 积分（不每日重置）；Gen-4.5 在 Web 仅 Standard 或以上套餐可用",
    "freeSource": "https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work",
    "region": "Runway 网页与 App 订阅和具体模型地区规则分开；支付宝、微信等钱包是否出现依所选国家结算",
    "regionSource": "https://help.runwayml.com/hc/en-us/articles/30657959470483-What-payment-methods-are-available",
    "models": "Gen-4.5 提供文字/图片生成视频，网页 Standard 及以上可用，12 积分/秒，时长 2–10 秒",
    "modelsSource": "https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5",
    "commercial": "Runway 官方说明用户可将其生成内容用于广告、变现视频、社交平台和影视等商业场景，无需向 Runway 强制署名；上传的素材和第三方权利仍须合法。",
    "commercialSource": "https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights"
  }
};
export const MARKET_RESEARCH_CHECKED_AT='2026-10-31';
/** Product-specific first-party recheck dates; original historical observations keep their own date. */
export const MARKET_PRODUCT_REVIEWED_AT:Readonly<Partial<Record<string,string>>>={
 lovable:'2026-11-03',replit:'2026-11-02',midjourney:'2026-11-02'
};
export function marketProductReviewedAt(id:string){return MARKET_PRODUCT_REVIEWED_AT[id]||MARKET_RESEARCH_CHECKED_AT;}
export function researchedFact(id:string){return RESEARCHED_FACTS[id];}
