/** Sourced publisher facts. Payment methods are capabilities, not a guarantee of local checkout. */
export type MarketResearchFact={payments?:string[];paymentSource?:string;extraPaymentSource?:string;price?:string;priceSource?:string;free?:string;freeSource?:string;region?:string;regionSource?:string;commercial?:string;commercialSource?:string};
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
    "regionSource": "https://www.doubao.com/legal/ey01"
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
    "regionSource": "https://jimeng.jianying.com/"
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
    "regionSource": "https://ppg.viviv.com/doodle/kLmGpQFM.html"
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
    "regionSource": "https://stripe.com/customers/lovable"
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
    "priceSource": "https://luma.ai/",
    "region": "官网提供网页订阅与 iOS 购买，具体地区/币种由官方结算和商店决定",
    "regionSource": "https://lumalabs.ai/learning-hub/payments-subscriptions"
  },
  "langchain": {
    "price": "LangChain 开源框架免费；LangSmith Developer $0/席位/月（每月含 5,000 基础追踪），Plus $39/席位/月，超额按用量计费",
    "priceSource": "https://www.langchain.com/pricing",
    "free": "框架免费；LangSmith Developer 1 个免费席位、每月 5,000 条基础追踪",
    "freeSource": "https://www.langchain.com/pricing",
    "region": "LangChain 本地 SDK 可自行安装；LangSmith 托管服务与地区另行区分",
    "regionSource": "https://www.langchain.com/pricing",
    "commercial": "LangChain 源码采用 MIT，可集成商业应用；模型供应商 API 与 LangSmith 服务需单独遵守条款",
    "commercialSource": "https://github.com/langchain-ai/langchain/blob/master/libs/langchain/LICENSE"
  },
  "llamaindex": {
    "price": "LlamaIndex 开源库免费；LlamaCloud 托管解析、检索与存储是另一个计费服务",
    "priceSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/pyproject.toml",
    "free": "LlamaIndex Core 可免费本地安装；接入付费 API、LlamaCloud 另计",
    "freeSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/LICENSE",
    "region": "开源库可本地安装；LlamaCloud 托管服务按厂商规定地区使用",
    "regionSource": "https://github.com/run-llama/llama_index",
    "commercial": "核心开源库 MIT，允许商业使用、修改和发行；须保留许可及版权声明，模型服务另计",
    "commercialSource": "https://github.com/run-llama/llama_index/blob/main/llama-index-core/LICENSE"
  },
  "llamacpp": {
    "price": "llama.cpp 开源软件免费；本地 GPU/CPU、模型文件、云端算力成本自理",
    "priceSource": "https://github.com/ggml-org/llama.cpp",
    "free": "本地推理完全可免费运行，前提是自行提供兼容模型与硬件",
    "freeSource": "https://github.com/ggml-org/llama.cpp",
    "region": "无需注册地区白名单；本地运行不依赖海外网页订阅，模型获取依其发行限制",
    "regionSource": "https://github.com/ggml-org/llama.cpp",
    "commercial": "llama.cpp 引擎 MIT，可用于商业部署；下载的具体大模型应按其独立许可证判断商用",
    "commercialSource": "https://github.com/ggml-org/llama.cpp"
  },
  "dify": {
    "price": "Community Edition 自托管无需订阅费；Dify Cloud 按消息额度和工作区订阅，企业多租户另需商业许可",
    "priceSource": "https://github.com/langgenius/dify",
    "free": "Community Edition 可自行部署；云端 Sandbox 额度另按官方方案",
    "freeSource": "https://github.com/langgenius/dify",
    "region": "自托管版可在自有服务器部署；云端服务涉及账号/地区和云计算费用",
    "regionSource": "https://github.com/langgenius/dify",
    "commercial": "可作为企业应用后端，但源码授权是加附加条件的 Apache 2.0：多租户服务需另购商业许可，前端 Logo/版权不可擅自去除",
    "commercialSource": "https://github.com/langgenius/dify/blob/main/LICENSE"
  },
  "n8n": {
    "price": "n8n 自托管社区版可免费使用；n8n Cloud Starter €20/月（按年计费，含 2,500 次执行）",
    "priceSource": "https://n8n.io/pricing/",
    "free": "自托管 Community 免费；Cloud 试用是另外的托管服务",
    "freeSource": "https://n8n.io/pricing/",
    "region": "自托管运行不需要 SaaS 地区许可；Cloud 账号及付款按官网条件",
    "regionSource": "https://n8n.io/pricing/"
  },
  "comfyui": {
    "price": "ComfyUI 本地开源软件免费；Comfy Cloud / 第三方节点另计",
    "priceSource": "https://support.comfy.org/articles/9806306061-about-comfy",
    "free": "本地工作流与节点界面免费运行，需显卡/模型；Partner Nodes 可能收费",
    "freeSource": "https://support.comfy.org/articles/9806306061-about-comfy",
    "region": "本地离线操作可自行安装；云端节点、模型下载地域和网络另看服务商",
    "regionSource": "https://github.com/Comfy-Org/ComfyUI",
    "commercial": "引擎 GPL-3.0 许可商业使用；若发行修改版需满足对应源代码/相同许可义务，模型/节点版权单独判断",
    "commercialSource": "https://github.com/Comfy-Org/ComfyUI/blob/master/LICENSE"
  },
  "automatic1111": {
    "price": "Stable Diffusion WebUI 开源安装免费；运行 GPU/云算力和模型权重成本自理",
    "priceSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "free": "本地 WebUI 不按生成次数收费；第三方云端或外部模型可能付费",
    "freeSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "region": "本地部署工具，无官网会员购买地区要求；模型下载和服务出口规则另议",
    "regionSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "commercial": "WebUI 源码为 AGPL-3.0，商用可行但网络提供修改版可能触发源码披露义务；生成模型自身另有授权",
    "commercialSource": "https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/master/LICENSE.txt"
  },
  "fasterwhisper": {
    "price": "faster-whisper 本地开源软件免费；算力和下载模型成本另计",
    "priceSource": "https://github.com/SYSTRAN/faster-whisper",
    "free": "不按转录分钟收取软件使用费；CPU/GPU 资源由使用者承担",
    "freeSource": "https://github.com/SYSTRAN/faster-whisper",
    "region": "本地 Python 组件，无平台注册和会员付款地域要求",
    "regionSource": "https://github.com/SYSTRAN/faster-whisper",
    "commercial": "代码 MIT，可用于商业转录服务；须保留版权和许可，音频素材权利单独处理",
    "commercialSource": "https://github.com/SYSTRAN/faster-whisper/blob/master/LICENSE"
  },
  "openai-python": {
    "price": "OpenAI 官方 Python SDK 免费；实际模型 API 按调用量计费，不包含在 SDK 许可中",
    "priceSource": "https://github.com/openai/openai-python/blob/main/pyproject.toml",
    "free": "SDK 可免费安装和使用，API Token 用量另收费",
    "freeSource": "https://github.com/openai/openai-python",
    "region": "SDK 自身可安装；OpenAI API 仅在官方支持地区提供，需分开判断",
    "regionSource": "https://github.com/openai/openai-python",
    "commercial": "SDK 为 Apache-2.0，可嵌入商用软件；API 服务及模型输出遵守 OpenAI 具体条款",
    "commercialSource": "https://github.com/openai/openai-python/blob/main/pyproject.toml"
  },
  "whisper": {
    "price": "Whisper 官方开源模型/推理代码免费；硬件与托管识别 API 另计",
    "priceSource": "https://github.com/openai/whisper",
    "free": "本地语音识别不收云端按分钟费用；自行提供计算资源",
    "freeSource": "https://github.com/openai/whisper",
    "region": "本地可安装使用；第三方托管识别平台的地区条件独立",
    "regionSource": "https://github.com/openai/whisper",
    "commercial": "Whisper 代码 MIT，可用于商业转录；音频、个人数据等权利及合规责任独立",
    "commercialSource": "https://github.com/openai/whisper/blob/main/pyproject.toml"
  },
  "vllm": {
    "price": "vLLM 开源推理服务软件免费；GPU/云算力、模型授权与网络运营成本自行承担",
    "priceSource": "https://github.com/vllm-project/vllm",
    "free": "自行部署推理服务无需软件订阅费",
    "freeSource": "https://github.com/vllm-project/vllm",
    "region": "本地/自有云部署不依赖网页购买地区；模型来源和云厂商另有限制",
    "regionSource": "https://github.com/vllm-project/vllm",
    "commercial": "推理引擎 Apache-2.0，可用于商业部署，需遵循版权通知与第三方模型许可证",
    "commercialSource": "https://github.com/vllm-project/vllm/blob/main/pyproject.toml"
  },
  "transformers": {
    "price": "Transformers 开源框架免费；模型下载、推理 GPU、托管 Inference Providers 另计",
    "priceSource": "https://github.com/huggingface/transformers",
    "free": "本地安装调用库不收软件会员费；模型许可按模型卡独立判断",
    "freeSource": "https://github.com/huggingface/transformers",
    "region": "开源库本地运行；在线 Hub 和云推理受各自账户及地区规则约束",
    "regionSource": "https://github.com/huggingface/transformers",
    "commercial": "Transformers 代码 Apache-2.0 可商用；具体模型权重许可可能另有限制",
    "commercialSource": "https://github.com/huggingface/transformers"
  },
  "openwebui": {
    "price": "Open WebUI 自托管软件可自行安装；调用 OpenAI/Ollama 等模型的实际成本另计",
    "priceSource": "https://github.com/open-webui/open-webui",
    "free": "自托管软件可部署；集成的云模型 API/硬件成本另算",
    "freeSource": "https://github.com/open-webui/open-webui",
    "region": "自托管实例可在自有服务器部署；云模型 API 按供应商地区支持",
    "regionSource": "https://github.com/open-webui/open-webui",
    "commercial": "使用 Open WebUI 有商业用途条件；超过 50 个终端用户时不得擅自移除 Open WebUI 品牌，需许可或企业版",
    "commercialSource": "https://github.com/open-webui/open-webui/blob/main/LICENSE"
  },
"suno":{"payments":["Credit / debit card（Visa / Mastercard / Amex）","Apple Pay（部分地区）","Google Pay（部分地区）","Apple App Store（iOS）","Google Play（Android）"],"paymentSource":"https://help.suno.com/en/articles/2421185","region":"Suno 网页接受多币种信用卡；Apple Pay/Google Pay 及本地银行卡随国家地区显示","regionSource":"https://help.suno.com/en/articles/2421185"},
"perplexity":{"payments":["信用卡/借记卡（订阅）","Visa / Mastercard / Amex（企业订阅）"],"paymentSource":"https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions","region":"网页个人 Pro 与 Enterprise 付款政策不同，企业接受 Visa/Mastercard/Amex；各地区额外方式以结算页为准","regionSource":"https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions"},
"qwen":{"payments":["支付宝（阿里云百炼 API 账户充值）","银联在线支付（阿里云百炼 API 账户）","网银（阿里云百炼 API 账户）"],"paymentSource":"https://help.aliyun.com/zh/model-studio/new-free-quota","price":"千问聊天产品与阿里云百炼 API 分开：聊天可体验；百炼模型调用按模型/Token/套餐计费","priceSource":"https://help.aliyun.com/zh/model-studio/what-is-model-studio","region":"千问聊天服务和阿里云百炼 API 是不同入口；百炼提供北京、新加坡、香港、弗吉尼亚、法兰克福及东京区域，模型与价格随区域不同","regionSource":"https://help.aliyun.com/zh/model-studio/what-is-model-studio"},
"deepseek":{"payments":["支付宝（DeepSeek API 账户充值）","微信支付（DeepSeek API 账户充值）"],"paymentSource":"https://deepseek.apifox.cn/常见问题-5904006m0","region":"DeepSeek 聊天网页/应用与开发者 API 分开；API 充值需完成相应实名认证","regionSource":"https://deepseek.apifox.cn/常见问题-5904006m0"}
};
export const MARKET_RESEARCH_CHECKED_AT='2026-10-31';
export function researchedFact(id:string){return RESEARCHED_FACTS[id];}
