/** Reviewed observations. Keep dated snapshots; never infer missing limits. */
export type FactKey = "purpose"|"free"|"price"|"region"|"watermark"|"commercial"|"failure"|"refund"|"phone"|"card"|"models";
export type ProductFact = {text:string;source:string;checkedAt:string;scope:string;kind:"official"};
export type FactSnapshot = {product:string;observedAt:string;facts:Partial<Record<FactKey,ProductFact>>};
const day="2026-10-29";
const pikaPrice="https://pika.art/pricing";
const pikaHelp="https://pika.art/faq";
const runwayPrice="https://runway.com/pricing";
const runwayCredits="https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work";
const claudeHelp="https://support.claude.com/en/articles/8114491-get-started-with-claude";
function official(text:string,source:string,scope:string):ProductFact{return {text,source,scope,checkedAt:day,kind:"official"};}
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
];
export function latestFacts(slug:string,asOf=new Date().toISOString().slice(0,10)):FactSnapshot|undefined{
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
export const factLabels:Record<FactKey,string>={purpose:"主要用途",free:"免费额度",price:"价格",region:"地区与年龄",watermark:"导出水印",commercial:"商用条件",failure:"失败扣费",refund:"取消与退款",phone:"手机号要求",card:"信用卡要求",models:"模型与用量"};
