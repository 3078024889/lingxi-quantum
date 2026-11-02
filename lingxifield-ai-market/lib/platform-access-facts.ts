// Evidence-backed access facts. Unknown does not mean unsupported.
// Do not infer payment methods from a provider's billing currency or guess OAuth providers.
export type PublisherAccess={
  login:readonly string[];
  loginSource?:string;
  payment:readonly string[];
  paymentSource?:string;
  models?:string;
  limitations?:string;
  commercial?:string;
  commercialSource?:string;
  mainland?:'yes'|'no'|'conditional'|'unknown';
  regionNote?:string;
  checkedAt:string;
};
export const PUBLISHER_ACCESS:Readonly<Record<string,PublisherAccess>>={
 chatgpt:{login:['邮箱','Google','Apple','Microsoft'],loginSource:'https://help.openai.com/en/articles/7426629-why-cant-i-log-in-to-chatgpt',payment:['网页：信用卡 / 借记卡','iOS：Apple App Store','Android：Google Play','地区限定：UPI、Pix、GoPay、Kakao Pay、Naver Pay、GCash、MoMo、Link'],paymentSource:'https://help.openai.com/en/articles/10421635-which-payment-methods-are-supported-for-chatgpt',models:'多种 ChatGPT 模型，具体可用模型随套餐调整',limitations:'免费额度有限；图片、研究、语音额度与模型不同',commercial:'须依据服务条款、具体功能及适用政策',mainland:'no',regionNote:'中国大陆未在官方 ChatGPT 支持国家/地区名单；不应推荐为中国大陆无需代理可用',checkedAt:'2026-10-30'},
 claude:{login:['邮箱验证链接','Google'],loginSource:'https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account',payment:['网页版：信用卡 / 借记卡','iOS：Apple App Store','Android：Google Play'],paymentSource:'https://support.claude.com/en/articles/8325618-paid-plan-billing-faqs',models:'Claude 模型系列；不同方案与版本能力不同',limitations:'免费额度受限，Cowork、Claude Code 等功能随套餐变化',commercial:'按 Anthropic 具体服务条款执行',mainland:'no',regionNote:'中国大陆未列入官方 Claude 支持地区；注册必须持有受支持地区可收短信手机号',checkedAt:'2026-10-30'},
 runway:{login:['邮箱密码','Google','Apple'],loginSource:'https://help.runwayml.com/hc/en-us/articles/24297557468563-Creating-a-Runway-Account',payment:['信用卡 / 借记卡','Amazon Pay','Apple Pay','Google Pay','支付宝 Alipay','微信支付 WeChat Pay','Cash App Pay','美国限定：Stripe Instant Bank Payments'],paymentSource:'https://help.runwayml.com/hc/en-us/articles/30657959470483-What-payment-methods-are-available',models:'视频与图片生成模型，具体模型随产品更新',limitations:'免费积分、单次生成时长、输出规格和水印受套餐约束',commercial:'需按所选 Runway 方案及输出许可核对',mainland:'unknown',checkedAt:'2026-10-30'},
 suno:{login:['手机短信','Apple','Google','Microsoft','Discord'],loginSource:'https://help.suno.com/en/articles/3134401',payment:[],models:'Suno 音乐生成模型',limitations:'免费额度每日恢复；商用权与订阅状态有关',commercial:'免费创作不包含商用授权；付费计划可按对应规则使用',commercialSource:'https://suno.com/pricing',mainland:'unknown',checkedAt:'2026-10-30'},
 doubao:{login:['手机号短信','运营商一键登录','Apple ID','抖音账号'],loginSource:'https://www.doubao.com/legal/doubao_account_service_terms',payment:[],models:'豆包对话、多模态与视频创作相关模型，实际按功能入口',limitations:'图片与视频功能、导出额度和水印规则随入口更新',commercial:'生成内容商用须按豆包相关协议与具体服务规则',mainland:'yes',regionNote:'中国大陆官方产品；具体功能可能因账号和版本不同',checkedAt:'2026-10-30'},
 jimeng:{login:['剪映账号','抖音账号','Apple ID'],loginSource:'https://lf3-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/dreamina/b966ce40-d931-4397-8def-38fe5d03c729.html',payment:[],models:'图片 4.0、Seedance 2.0 等，套餐和开放范围不同',limitations:'每日签到积分、视频时长、高清加速、去水印等权限按会员层级；价格与活动随时间变更',commercial:'按即梦 AI 服务协议及生成内容许可执行',mainland:'yes',regionNote:'中国大陆官方入口；各地区版本可能不同',checkedAt:'2026-10-30'},
 kling:{login:['快手账号','手机号短信'],loginSource:'https://ppg.viviv.com/doodle/oarzodFE.html',payment:[],models:'可灵视频与图片生成模型，版本按产品更新',limitations:'视频生成长度、分辨率和积分消耗以实际模型及账户套餐为准',commercial:'按可灵服务协议与相应会员权益核对',mainland:'conditional',regionNote:'全球版与中国版存在地区入口差异',checkedAt:'2026-10-30'},
 deepseek:{login:['邮箱','Google','Apple'],loginSource:'https://www.deepseek.com/news/deepseek-app/',payment:[],models:'DeepSeek 聊天与深度思考模型，具体型号随官方版本更新',limitations:'聊天应用与开发者 API 分别计费；不同模型能力有区别',commercial:'开发者 API 商业使用条款须单独确认',mainland:'unknown',checkedAt:'2026-10-30'},
 elevenlabs:{login:[],payment:['Apple App Store','Google Play','官网 Stripe 结算'],paymentSource:'https://elevenlabs.io/docs/help-center/product/mobile-apps/elevenlabs-for-ios-and-android/managing-your-elevenlabs-subscription-mobile-app-vs-website',models:'语音合成、语音克隆与音效生成模型，依具体版本',limitations:'免费积分及音频时长与模型、套餐相关',commercial:'免费/付费音频商用须根据 ElevenLabs 适用条款判断',mainland:'unknown',checkedAt:'2026-10-30'},
 midjourney:{login:['Google','Discord'],loginSource:'https://docs.midjourney.com/hc/en-us/articles/33390994570509-Logging-In-Connecting-Accounts',payment:['Visa','Mastercard','American Express','部分地区：Apple Pay、Amazon Pay、支付宝、Google Pay、Link','不支持 PayPal'],paymentSource:'https://docs.midjourney.com/hc/en-us/articles/27868831972365-Accepted-Payment-Methods',models:'Midjourney 图片与视频模型，依官网版本',limitations:'订阅与任务模式限制须区分',commercial:'按具体订阅与商业用途条款执行',mainland:'unknown',checkedAt:'2026-10-30'},
 comfyui:{login:['本地无需平台账户'],loginSource:'https://comfy.org/download',payment:[],models:'由用户安装的开源模型决定，不是单一模型',limitations:'受本机显存、CPU、模型与许可证限制',commercial:'软件开源；模型及第三方节点的商业授权须分别核对',mainland:'yes',regionNote:'本地离线软件可安装运行；不代表云服务在所有地区可用',checkedAt:'2026-10-30'},
 ollama:{login:['本地无需平台账户'],loginSource:'https://ollama.com/download',payment:[],models:'由本地下载运行的具体模型决定',limitations:'计算性能受本机硬件和模型大小影响',commercial:'商用取决于实际使用的模型许可',mainland:'yes',regionNote:'本地工具无需依赖云端登录；模型下载及云服务另计',checkedAt:'2026-10-30'}
};
export function accessFor(id:string):PublisherAccess|undefined{return PUBLISHER_ACCESS[id];}
export function accessValue(values:readonly string[]|undefined,empty='未找到官方公开说明'):string{
 return values?.length?values.join('、'):empty;
}
export function geoSummary(id:string):string{
 // SEO visibility and AI citation share need separate comparable measurements by region/date/query set.
 return '尚无可比监测数据';
}
