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
    "price": "豆包专业版按网页或 App 订阅购买；各套餐实时金额以官方购买页为准",
    "priceSource": "https://lf9-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/grace_legal/doubao_member_copywrite_for_ai.html",
    "region": "中国大陆版 · 官方网页及 Android/iOS 提供服务；其他市场不与国内版混算",
    "regionSource": "https://www.doubao.com/legal/ey01",
    "models": "豆包包含中文对话、图片、文件和多模态功能；聊天模型与火山引擎豆包 API 服务独立计费",
    "modelsSource": "https://www.doubao.com/",
    "free": "豆包网页有免费对话与部分创作能力；专业会员功能和使用次数由账号会员权益决定",
    "freeSource": "https://www.doubao.com/",
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
    "commercial": "即梦AI 视频/图片可按官方服务协议和会员规则创作与传播，用户须持有输入素材版权；具体商用、水印、第三方授权按所用会员/模型规则核对。",
    "commercialSource": "https://jimeng.jianying.com/"
  },
  "kling": {
    "payments": [
      "支付宝（可灵会员/接口资源包）",
      "微信支付（可灵会员/小额 API 资源包）",
      "Apple App Store（iOS 会员）"
    ],
    "paymentSource": "https://ppg.viviv.com/doodle/kLmGpQFM.html",
    "extraPaymentSource": "https://docs.qingque.cn/d/home/eZQCR1cjLJ5SqrV-AfCve0rYn",
    "price": "会员套餐按网页权益表；API 视频/图片资源包独立计费，购买页显示金额",
    "priceSource": "https://docs.qingque.cn/d/home/eZQCR1cjLJ5SqrV-AfCve0rYn",
    "region": "可灵中国版与国际版入口/会员权益不同；本条为中国版官网资料",
    "regionSource": "https://ppg.viviv.com/doodle/kLmGpQFM.html",
    "models": "可灵视频与图像生成模型适用视频/短剧制作；中国版与国际版的模型、权益和计费可能不同",
    "modelsSource": "https://klingai.com/",
    "free": "可灵中国版免费账号可体验部分图片/视频功能；不同模型/时长/水印消耗的积分按账户与活动变化",
    "freeSource": "https://klingai.com/",
    "commercial": "可灵AI 创作内容使用须遵守用户服务协议；非会员或未经书面许可不得移除可灵品牌标识/水印，或应显著标明由AI生成；不得侵犯第三方权益。",
    "commercialSource": "https://ppg.viviv.com/doodle/oarzodFE.html"
  },
  "lovable": {
    "payments": [
      "Credit / debit card",
      "Apple Pay",
      "Google Pay",
      "WeChat Pay",
      "Alipay",
      "iDEAL",
      "Amazon Pay",
      "Cash App Pay",
      "Link"
    ],
    "paymentSource": "https://stripe.com/customers/lovable",
    "price": "Pro $25/月（月付参考）；免费档可使用基础构建额度",
    "priceSource": "https://lovable.dev/pricing",
    "region": "官网订阅覆盖多个国家，结账时根据所在地动态显示可用钱包与银行卡",
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
    "price": "Luma 官网：周付 $9.99/周，月付 $49.99/月，年付 $99.99/年；首次周订阅或有优惠",
    "priceSource": "https://luma.ai/pricing",
    "region": "官网提供网页订阅与 iOS 购买，具体地区/币种由官方结算和商店决定",
    "regionSource": "https://lumalabs.ai/learning-hub/payments-subscriptions",
    "commercial": "商用输出依付费套餐和具体产品条款；创作者须有输入素材的合法权益，第三方素材权利不自动取得",
    "commercialSource": "https://lumalabs.ai/legal/terms-of-service",
    "models": "Luma 提供视频生成及 Ray 系列编辑/修改能力；各模型视频时长和套餐权限不同",
    "modelsSource": "https://lumalabs.ai/",
    "free": "Luma Dream Machine Free 可用部分图片及 Ray3 视频草稿，导出带水印，仅个人非商业用途；模型及额度见官网",
    "freeSource": "https://lumalabs.ai/learning-hub/payments-subscriptions"
  },
  "langchain": {
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
    "price": "LlamaIndex 开源库免费；LlamaCloud 托管解析、检索与存储是另一个计费服务",
    "priceSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/pyproject.toml",
    "free": "LlamaIndex Core 可免费本地安装；接入付费 API、LlamaCloud 另计",
    "freeSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/LICENSE",
    "region": "开源库可本地安装；LlamaCloud 托管服务按厂商规定地区使用",
    "regionSource": "https://github.com/run-llama/llama_index",
    "commercial": "核心开源库 MIT，允许商业使用、修改和发行；须保留许可及版权声明，模型服务另计",
    "commercialSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/LICENSE",
    "models": "LlamaIndex 不是模型：使用各家语言模型和嵌入模型构建文档解析、索引、RAG 和智能体",
    "modelsSource": "https://github.com/run-llama/llama_index"
  },
  "llamacpp": {
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
    "price": "Community Edition 自托管无需订阅费；Dify Cloud 按消息额度和工作区订阅，企业多租户另需商业许可",
    "priceSource": "https://github.com/langgenius/dify",
    "free": "Community Edition 可自行部署；云端 Sandbox 额度另按官方方案",
    "freeSource": "https://github.com/langgenius/dify",
    "region": "自托管版可在自有服务器部署；云端服务涉及账号/地区和云计算费用",
    "regionSource": "https://github.com/langgenius/dify",
    "commercial": "可作为企业应用后端，但源码授权是加附加条件的 Apache 2.0：多租户服务需另购商业许可，前端 Logo/版权不可擅自去除",
    "commercialSource": "https://github.com/langgenius/dify/blob/main/LICENSE",
    "models": "Dify 工作流并非独立底座模型，可按任务连接外部 LLM、嵌入模型和工具，费用按供应商计算",
    "modelsSource": "https://github.com/langgenius/dify"
  },
  "n8n": {
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
      "Credit / debit card（Visa / Mastercard / Amex）",
      "Apple Pay（部分地区）",
      "Google Pay（部分地区）",
      "Apple App Store（iOS）",
      "Google Play（Android）"
    ],
    "paymentSource": "https://help.suno.com/en/articles/2421185",
    "region": "Suno 网页接受多币种信用卡；Apple Pay/Google Pay 及本地银行卡随国家地区显示",
    "regionSource": "https://help.suno.com/en/articles/2421185",
    "models": "Suno 根据提示词和歌词生成音乐、歌曲、伴奏；具体生成次数、模型和商业权益依套餐",
    "modelsSource": "https://suno.com/pricing",
    "price": "Suno Pro 年付折合约 $8/月（年付）；Premier 和月付另有套餐，商用只覆盖订阅生效期间作品",
    "priceSource": "https://suno.com/pricing",
    "free": "免费方案每天 50 积分，适用免费模型与创作额度；免费生成音乐不附商用授权",
    "freeSource": "https://suno.com/pricing"
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
    "price": "千问聊天产品与阿里云百炼 API 分开：聊天可体验；百炼模型调用按模型/Token/套餐计费",
    "priceSource": "https://help.aliyun.com/zh/model-studio/what-is-model-studio",
    "region": "千问聊天服务和阿里云百炼 API 是不同入口；百炼提供北京、新加坡、香港、弗吉尼亚、法兰克福及东京区域，模型与价格随区域不同",
    "regionSource": "https://help.aliyun.com/zh/model-studio/what-is-model-studio",
    "models": "千问聊天应用和阿里云百炼 API 是两个入口：百炼提供不同千问模型、Token 定价及地区版本",
    "modelsSource": "https://help.aliyun.com/zh/model-studio/what-is-model-studio",
    "free": "千问聊天可以免费体验基础对话；阿里云百炼开发者 API 可能提供适用的新用户额度，商业模型另按 Token 计费",
    "freeSource": "https://help.aliyun.com/zh/model-studio/new-free-quota",
    "commercial": "千问聊天生成内容与阿里云百炼 Wan/千问 API 以各自服务条款为准。API 可用于业务应用，但应履行模型/第三方素材许可证及适用地区、内容合规义务；不把聊天版会员权益等同视频 API。",
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
    "price": "ChatGPT Plus $20/月（月付）；API 另按模型调用计费，Plus 订阅不包含 API 额度",
    "priceSource": "https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus",
    "free": "ChatGPT 有免费方案；文件、研究、图像、模型次数随套餐和负载变化",
    "freeSource": "https://openai.com/chatgpt/pricing/",
    "region": "ChatGPT 消费者访问国家和 OpenAI API 支持名单不同；官方国家名单按产品单独核对",
    "regionSource": "https://help.openai.com/en/articles/7947663-chatgpt-supported-countries",
    "models": "ChatGPT 通过用户当前套餐和模型选择器使用 GPT 系列；网页可用型号与开发者 API 型号分开",
    "modelsSource": "https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview"
  },
  "claude": {
    "price": "Claude Free $0；Pro $20/月（月付），年付 $200/年；API 费用另计",
    "priceSource": "https://claude.com/pricing",
    "free": "Claude Free 可免费聊天、网络搜索、代码与文档；限制随使用量而变",
    "freeSource": "https://claude.com/pricing",
    "region": "Claude 网页与 API 需按官方支持国家分别判断；Pro 个人订阅和商业 API 不互含",
    "regionSource": "https://support.claude.com/en/articles/8114491-get-started-with-claude",
    "models": "Claude 网页/工作台提供 Claude 模型家族；模型是否可选取决于个人、团队和 API 套餐",
    "modelsSource": "https://claude.com/pricing"
  },
  "gemini": {
    "price": "Gemini 网页有免费功能；Google AI Pro US$19.99/月（美国/部分地区参考），Gemini API 另按 Token 计费",
    "priceSource": "https://one.google.com/about/plans?hl=en_US",
    "free": "Gemini 网页有免费访问级别；Gemini 开发者 API 有适用模型免费额度，调用量和地区另有约束",
    "freeSource": "https://ai.google.dev/gemini-api/docs/pricing",
    "payments": [
      "Credit / debit card（Google One 订阅，适用地区）",
      "Google Play（Android 应用内购买）"
    ],
    "paymentSource": "https://support.google.com/googleone/answer/9003634?hl=en",
    "region": "Gemini Web、Gemini API、Google One 订阅属于不同商品/计费和地区范围；不将 Google One 服务地区等同 Gemini 应用可用地区",
    "regionSource": "https://support.google.com/gemini/answer/13575153?hl=en",
    "models": "Gemini 消费者应用和开发者 API 可用模型不同；Google AI Pro 可访问更高等级 Gemini 模型及 Deep Research",
    "modelsSource": "https://one.google.com/about/plans?hl=en_US",
    "commercial": "Gemini 应用与 Gemini API 属不同产品条款；输出商业使用须符合 Google 服务及生成式 AI 禁止使用政策、输入素材权利，组织用户还受 Workspace/Cloud 合同约束。",
    "commercialSource": "https://policies.google.com/terms/generative-ai"
  },
  "grok": {
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
    "price": "Basic $10/月（年付折合 $8/月）；Standard $30/月（年付 $24/月）；Pro $60/月（年付 $48/月）；Mega $120/月（年付 $96/月）",
    "priceSource": "https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans",
    "free": "官网要求订阅套餐才能开始常规生成；不承诺固定免费试用或免费额度，部分活动以官方说明为准",
    "freeSource": "https://docs.midjourney.com/hc/en-us/articles/33329261836941-Getting-Started-Guide",
    "region": "官网和 Discord 订阅相通，Stripe 结算仅美元；具体卡与钱包依结账国家而定",
    "regionSource": "https://docs.midjourney.com/hc/en-us/articles/27868831972365-Accepted-Payment-Methods",
    "models": "Midjourney 提供图像与短视频生成模型、图像风格控制、角色参考；版本与视频额度按套餐公布",
    "modelsSource": "https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans"
  },
  "ollama": {
    "price": "Ollama 本地运行免费；云模型按百万 Tokens 用量计费；Pro $20/月、Max $100/月、Team $500/月，含不同额度云端积分",
    "priceSource": "https://ollama.com/pricing",
    "free": "本地模型运行不限制次数、无需会员；云端按量付费，计划含云端积分与并发限制",
    "freeSource": "https://ollama.com/pricing",
    "region": "本地软件可自行部署；Ollama 云端数据处理与在线模型服务可能涉及美国、欧洲、新加坡等区域",
    "regionSource": "https://ollama.com/pricing",
    "models": "Ollama 本地运行用户选择的开源模型；云端可按不同模型输入/缓存/输出 Tokens 价格付费",
    "modelsSource": "https://ollama.com/pricing"
  },
  "replit": {
    "price": "Replit Starter 免费；Core $25/月（月付），年付折合 $20/月（含 $25/月积分）；Pro $100/月（月付），年付折合 $95/月",
    "priceSource": "https://replit.com/pricing",
    "free": "Starter 赠每日 Agent 积分，最多可发布 1 个项目；具体 Agent/发布/数据库使用上限由套餐限制",
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
    "price": "Runway Standard 年付折合 $12/月，年付一次结算；每月 625 积分；Pro 及 Unlimited 每月 2,250 积分；Gen-4.5 视频按 12 积分/秒",
    "priceSource": "https://runway.com/pricing",
    "free": "Free 账号一次性 125 积分（不每日重置）；Gen-4.5 在 Web 仅 Standard 或以上套餐可用",
    "freeSource": "https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work",
    "region": "Runway 网页与 App 订阅和具体模型地区规则分开；支付宝、微信等钱包是否出现依所选国家结算",
    "regionSource": "https://help.runwayml.com/hc/en-us/articles/30657959470483-What-payment-methods-are-available",
    "models": "Gen-4.5 提供文字/图片生成视频，网页 Standard 及以上可用，12 积分/秒，时长 2–10 秒",
    "modelsSource": "https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5"
  }
};
export const MARKET_RESEARCH_CHECKED_AT='2026-10-31';
export function researchedFact(id:string){return RESEARCHED_FACTS[id];}
