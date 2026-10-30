/** Reviewed observations. Keep dated snapshots; never infer missing limits. */
export type FactKey = "purpose"|"free"|"price"|"region"|"watermark"|"commercial"|"failure"|"refund"|"phone"|"card"|"models"|"reasoning";
export type ProductFact = {text:string;source:string;checkedAt:string;scope:string;kind:"official"};
export type FactSnapshot = {product:string;observedAt:string;facts:Partial<Record<FactKey,ProductFact>>};
const day="2026-10-29";
const pikaPrice="https://pika.art/pricing";
const pikaHelp="https://pika.art/faq";
const runwayPrice="https://runway.com/pricing";
const runwayCredits="https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work";
const claudeHelp="https://support.claude.com/en/articles/8114491-get-started-with-claude";
function official(text:string,source:string,scope:string):ProductFact{return {text,source,scope,checkedAt:day,kind:"official"};}
function official2026(text:string,source:string,scope:string):ProductFact{return {text,source,scope,checkedAt:'2026-10-30',kind:'official'};}
export const factSnapshots:readonly FactSnapshot[]=[
 {product:"pika",observedAt:day,facts:{
  purpose:official("生成和编辑视频、图片与音频",pikaHelp,"当前 Pika Create 网页版"),
  models:official("官网列有 Pika 2.5、Pikaframes 等；不同模型功能不同",pikaPrice,"网页模型目录；不是版本发布日期"),
  free:official("Free 每月赠送 0 积分；可单买积分包",pikaPrice,"当前 Free 套餐；不代表每日免费生成"),
  price:official("Starter $10/月，含 900 积分/月",pikaPrice,"USD，按月付款；其他套餐另计"),
  watermark:official("当前套餐下载无水印；旧文件原有水印不变",pikaHelp,"当前网页套餐，包括 Free"),
  commercial:official("Free 不含商用授权；付费订阅含商用，仍须遵守素材和模型条款",pikaHelp,"Starter、Creator、Fancy；购买积分包不改变 Free 商用权限"),
  failure:official("失败且扣积分时，提交任务时间和错误给客服调查；未承诺一律自动退回",pikaHelp,"生成失败问题"),
  refund:official("FAQ 写明订阅与积分包不退款；取消订阅会停止下次续费",pikaHelp,"官网说明；异常扣款请联系官方，法定权利另依适用规则"),
 }},
 {product:"runway",observedAt:day,facts:{
  purpose:official("视频与图像创作，可按模型和套餐选择",runwayPrice,"Runway 创作平台"),
  free:official("一次性 125 积分，不到期；不是每日补充",runwayCredits,"Free 套餐"),
  price:official("Standard 年付折合 $12/月，含 625 积分/月",runwayPrice,"USD，按年付款；不是每月只扣 $12"),
  models:official("Gen-4.5 每秒 12 积分；5 秒需 60 积分",runwayCredits,"模型计费示例；不表示 Free 可用该模型"),
  watermark:official("Standard 付费套餐列明无水印",runwayPrice,"不据此推断 Free 水印规则"),
  card:official("官方说明可无需信用卡开始免费体验", "https://runway.com/product/ai-video-generator","开始免费体验；不表示付费无需付款方式"),
 }},
 {product:"claude",observedAt:day,facts:{
  purpose:official("问答、分析、写作与编程协作",claudeHelp,"Claude 应用"),
  free:official("免费用量每 5 小时恢复；消息数浮动，另可能有限额",claudeHelp,"不是固定每天可发送的次数"),
  region:official("仅支持指定地区；使用者须年满 18 岁",claudeHelp,"中国大陆具体支持状态本轮待核实"),
 }},
 {product:"chatgpt",observedAt:day,facts:{
  price:official("ChatGPT Plus 为 $20/月（按月收费）；API 用量不包含在 Plus 内","https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus","ChatGPT Plus 个人订阅，美国公开价格；税费及地区结算另依官方页面"),
  free:official("ChatGPT 提供免费方案；具体使用限额和可用模型可能变化","https://openai.com/chatgpt/pricing/","网页版个人使用；不保证每日固定次数"),
 }},
 {product:"claude",observedAt:day,facts:{
  price:official("Claude Pro 美国按月订阅 $20/月；选择年付时为 $200/年","https://support.claude.com/en/articles/11049762-choose-a-claude-plan","个人 Pro 套餐；不同国家、平台及税费可能不同"),
  free:official("Claude Free 为 $0，免费使用量有限且随条件变化","https://claude.com/pricing","个人 Free 套餐；不代表固定每日次数"),
 }},
 {product:"n8n",observedAt:day,facts:{purpose:official("把多步工作连起来，也可创建调用工具的 AI 智能体","https://n8n.io/ai-agents/","工作流与智能体平台；需配置和测试")}},
 {product:"ahrefs-brand-radar",observedAt:day,facts:{purpose:official("查看品牌在 AI 回答中的提及和引用","https://ahrefs.com/brand-radar","AI 可见度分析，不保证提升排名")}},

 {product:"comfyui",observedAt:"2026-10-30",facts:{
  purpose:{text:"开源节点式生成工作流，可运行图像、视频、音频和 3D 模型",source:"https://support.comfy.org/articles/9806306061-about-comfy",scope:"ComfyUI 开源工作流引擎",checkedAt:"2026-10-30",kind:"official"},
  free:{text:"开源核心可在自有设备上免费运行；硬件和所调用模型的实际成本另计",source:"https://support.comfy.org/articles/9806306061-about-comfy",scope:"本地开源核心，不包括 Comfy Cloud 或 Partner Nodes",checkedAt:"2026-10-30",kind:"official"},
  price:{text:"Comfy Cloud 和 Partner Nodes 为可选付费服务；实际价格需在购买前核对官网",source:"https://support.comfy.org/articles/9806306061-about-comfy",scope:"托管云服务和第三方节点，不代表本地开源软件收费",checkedAt:"2026-10-30",kind:"official"}
 }},
 {product:"n8n",observedAt:"2026-10-30",facts:{
  price:{text:"n8n Cloud Starter €20/月（按年计费），包含 2,500 次工作流执行；不等同于本地社区版价格",source:"https://n8n.io/pricing/",scope:"Starter Cloud 官方年付套餐示例；币种为 EUR，不兑换成美元",checkedAt:"2026-10-30",kind:"official"},
  card:{text:"官网显示 n8n Cloud 免费试用无需信用卡",source:"https://n8n.io/pricing/",scope:"仅限试用入口，正式付费仍可能需要支付方式",checkedAt:"2026-10-30",kind:"official"}
 }},
 {product:"dify",observedAt:"2026-10-30",facts:{
  purpose:{text:"支持 AI 智能体、工作流、知识库应用及托管或自部署",source:"https://www.dify.ai/",scope:"Dify Cloud、Enterprise 和 Community Edition 是不同部署形态",checkedAt:"2026-10-30",kind:"official"}
 }},
 {product:"openwebui",observedAt:"2026-10-30",facts:{
  purpose:{text:"自托管 AI 聊天工作空间，可连接本地和云端模型",source:"https://openwebui.com/",scope:"面向自行部署和企业部署；不代表免除第三方模型费用",checkedAt:"2026-10-30",kind:"official"}
 }},
 {product:"ollama",observedAt:"2026-10-30",facts:{
  purpose:official2026("在自己的电脑上运行大语言模型，也提供云端模型服务","https://ollama.com/pricing","本地运行与 Ollama Cloud 分别计费"),
  free:official2026("本地模型可在自有硬件上运行；云端按各模型用量收费","https://ollama.com/pricing","本地计算成本不等于免费云算力"),
  price:official2026("Pro $20/月；云端另有按量计费，模型价格按每百万 tokens 区分","https://ollama.com/pricing","Ollama Cloud 美元公开价格，不含本地硬件费用")
 }},
 {product:"perplexity",observedAt:"2026-10-30",facts:{
  purpose:official2026("提供带来源引用的网页研究与问答","https://www.perplexity.ai/hub","Perplexity 搜索与研究产品"),
  free:official2026("基础搜索提供免费使用；高级研究和模型额度随套餐变化","https://www.perplexity.ai/enterprise/pricing","个人 Free 方案"),
  price:official2026("个人 Pro $20/月；按年付费等方案见官网","https://www.perplexity.ai/enterprise/pricing","美元个人套餐；可能存在按年优惠")
 }},
 {product:"dify",observedAt:"2026-10-30",facts:{
  free:official2026("Sandbox 免费方案含 200 条 message credits；额度会随不同模型消耗","https://www.dify.ai/pricing","Dify Cloud Sandbox；不是每天 200 次"),
  price:official2026("Professional $590/工作区/年；Cloud 与自部署 Community 方案不同","https://www.dify.ai/pricing","按年付款的云端 Professional 方案"),
  commercial:official2026("Community 开源版须遵守 Dify 开源许可；企业授权单独提供","https://www.dify.ai/pricing","不把开源代码许可等同于所有模型及素材商用许可")
 }},
 {product:"comfyui",observedAt:"2026-10-30",facts:{
  card:official2026("Comfy Cloud 新用户可获 5 次免费 GPU 运行，无需信用卡","https://comfy.org/pricing/","托管 Comfy Cloud 新用户权益"),
  models:official2026("Comfy Cloud Standard 年付折合 $16/月；按月为 $20/月","https://comfy.org/pricing/","托管服务价格，非本地开源软件使用费")
 }},
 {product:"deepseek",observedAt:"2026-10-30",facts:{
  purpose:official2026("提供面向开发者的对话、推理与多模态模型 API","https://api-docs.deepseek.com/quick_start/pricing/","DeepSeek API，区别于免费聊天网页"),
  price:official2026("API 以每百万 tokens 计费，并区分输入、输出、缓存命中与高低峰价格","https://api-docs.deepseek.com/quick_start/pricing/","具体模型价格及峰谷时段详见官方实时表"),
  models:official2026("官方列出 deepseek-flash 与 deepseek-v4-pro，包含不同功能和调用限制","https://api-docs.deepseek.com/quick_start/pricing/","API 产品，不自动等同于聊天应用的可选模型")
 }},
 {product:"runway",observedAt:"2026-10-30",facts:{
  free:official2026("免费版提供一次性 125 credits，使用后不自动补充","https://help.runwayml.com/hc/en-us/articles/50404627334547-Free-plan-details","免费版，视频可选模型有限"),
  watermark:official2026("免费方案生成的视频有 Runway 水印；标准版及以上可无水印","https://help.runwayml.com/hc/en-us/articles/50404627334547-Free-plan-details","仅指官方视频生成导出"),
  models:official2026("Standard 每月 625 credits；Gen-4.5 使用 12 credits/秒","https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work","不同模型的额度和生成单价不可直接互换")
 }},
 {product:"claude",observedAt:"2026-10-30",facts:{
  price:official2026("美国个人 Pro $20/月；API 用量单独计费","https://support.claude.com/en/articles/8325606-what-is-the-pro-plan","个人订阅，美国公开价格；其他地区可能不同"),
  free:official2026("可使用 Free 方案，消息与模型限额依使用情况和官方规则变化","https://support.claude.com/en/articles/8325606-what-is-the-pro-plan","支持地区的 Claude 个人应用")
 }},
 {product:"chatgpt",observedAt:"2026-10-30",facts:{
  price:official2026("ChatGPT Plus $20/月；API 不包含在 Plus 订阅内","https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus","美国公开个人订阅价格，地区税费另计"),
  region:official2026("ChatGPT 仅支持官方公布的国家与地区；不支持地区访问可能受限","https://help.openai.com/en/articles/7947663-chatgpt-supported-countries","以官网实时支持国家列表为准")
 }},
 {product:"openwebui",observedAt:"2026-10-30",facts:{
  free:official2026("可自行部署 Open WebUI；接入云端 AI 模型时仍可能产生模型费用","https://docs.openwebui.com/","自托管使用场景，与第三方模型价格分开"),
  models:official2026("支持 Ollama 与 OpenAI 兼容接口，也提供 Docker、Python 和桌面安装方式","https://docs.openwebui.com/","使用前需根据安装方式自行配置")
 }},
 {product:"anthropic-sdk-python",observedAt:"2026-10-30",facts:{
  purpose:official2026("供 Python 开发者调用 Claude API 的官方 SDK，支持同步、异步、流式接口","https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python","开发库，不是直接在线聊天工具"),
  models:official2026("可通过 pip 安装 anthropic，要求 Python 3.10 或更高版本","https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python","开发工具的环境要求，不代表 Claude API 免费"),
  price:official2026("此 SDK 是接入 Claude API 的开发组件，实际 API 调用另行计费","https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python","不能把 SDK 安装费用和 API token 费用混为一谈")
 }},
 {product:"vllm",observedAt:"2026-10-30",facts:{
  purpose:official2026("在自有服务器上运行模型，支持批处理推理和在线模型服务","https://docs.vllm.ai/en/latest/getting_started/quickstart/","开发者部署工具，不是现成的云端聊天网页"),
  models:official2026("官方快速上手以 Linux 和 Python 3.11–3.14 为基础，GPU 选型依环境而定","https://docs.vllm.ai/en/latest/getting_started/quickstart/","部署条件，具体硬件需求随模型变化")
 }}
 {product:"chatgpt",observedAt:"2026-10-30",facts:{
  models:official2026("GPT-6 系列用于 ChatGPT 聊天；GPT-6.1 Terra 在 Work/Codex 推出，不代表聊天界面均可选","https://help.openai.com/en/articles/6825453-chatgpt-release-notes","产品与工作模式分开；实际版本依账户、地区与工作区"),
  reasoning:official2026("GPT-6 在 ChatGPT 支持不同思考档位，具体档位由套餐和权限决定；并非独立综合智力分数","https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt","ChatGPT 模型选择说明，不含跨产品统一基准"),
 }},
 {product:"claude",observedAt:"2026-10-30",facts:{
  models:official2026("Anthropic API 模型家族：Claude Fable 5.1、Opus 5.5、Sonnet 5.5、Haiku 5.5；Claude 应用可选型号另依套餐","https://platform.claude.com/docs/en/models/overview","API 模型目录，不表示 Claude 网页端全部开放"),
  reasoning:official2026("官方将 Fable 5.1 定位为高难推理和长流程智能体任务，将 Opus 5.5 用于知识工作与编程","https://platform.claude.com/docs/en/models/overview","厂商模型定位；不是独立跨平台胜负结论"),
 }},
 {product:"gemini",observedAt:"2026-10-30",facts:{
  models:official2026("Gemini API 模型目录：Gemini 4 Argon、Gemini 3.8 Flash 等；Gemini 网页应用实际可用版本另行核对","https://ai.google.dev/gemini-api/docs/models","API 模型家族；不是 Gemini App 套餐可用性保证"),
  reasoning:official2026("Gemini 4 Argon 官方定位支持复杂编程、数学、科学和智能体推理，API 上下文上限为 100 万 token","https://ai.google.dev/gemini-api/docs/latest-model","Gemini 4 Argon API 技术规格；非应用端实测分数"),
 }},
 {product:"runway",observedAt:"2026-10-30",facts:{
  models:official2026("Gen-4.5：网页支持文生视频、图生视频，标准及以上方案，2–10 秒，12 积分/秒","https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5","Gen-4.5 文档；其他模型、方案和额度另算"),
  reasoning:official2026("官方描述其擅长执行复杂镜头编排与时序指令；属于视频指令遵循，不是通用语言模型推理分数","https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5","厂商能力说明，未进行统一质量盲测"),
 }},
];
export function latestFacts(slug:string,asOf='2026-10-30'):FactSnapshot|undefined{
 const relevant=factSnapshots.filter(s=>s.product===slug&&s.observedAt<=asOf);
 if(!relevant.length)return undefined;
 relevant.sort((a,b)=>a.observedAt.localeCompare(b.observedAt));
 const facts:Partial<Record<FactKey,ProductFact>>={};
 for(const snapshot of relevant)Object.assign(facts,snapshot.facts);
 return {product:slug,observedAt:relevant[relevant.length-1].observedAt,facts};
}
export function productHistory(slug:string){return factSnapshots.filter(s=>s.product===slug).slice().sort((a,b)=>a.observedAt.localeCompare(b.observedAt));}
export function isStale(fact:ProductFact,now:string,maxDays=30){return Date.parse(now)-Date.parse(fact.checkedAt)>maxDays*86400000;}
export function questionFields(query:string):FactKey[]{
 const result:FactKey[]=[];
 if(/免费|额度|每天|次数|积分|free|credit/i.test(query))result.push("free");
 if(/多少钱|价格|费用|price|cost/i.test(query))result.push("price");
 if(/水印|watermark/i.test(query))result.push("watermark");
 if(/商用|commercial/i.test(query))result.push("commercial");
 if(/失败|扣费|fail/i.test(query))result.push("failure");
 if(/退款|refund/i.test(query))result.push("refund");
 if(/手机号|手机号码|phone/i.test(query))result.push("phone");
 if(/信用卡|credit card/i.test(query))result.push("card");
 if(/大陆|地区|国内|region/i.test(query))result.push("region");
 return result;
}
export const factLabels:Record<FactKey,string>={purpose:"主要用途",free:"免费额度",price:"价格",region:"地区与年龄",watermark:"导出水印",commercial:"商用条件",failure:"失败扣费",refund:"取消与退款",phone:"手机号要求",card:"信用卡要求",models:"模型与用量",reasoning:"推理与理解能力"};
