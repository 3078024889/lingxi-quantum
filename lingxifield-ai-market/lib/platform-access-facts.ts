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
 chatgpt:{login:['邮箱','Google','Apple','Microsoft'],loginSource:'https://help.openai.com/en/articles/7426629-why-cant-i-log-in-to-chatgpt',payment:[],models:'多种 ChatGPT 模型，具体可用模型随套餐调整',limitations:'免费额度有限；图片、研究、语音额度与模型不同',commercial:'须依据服务条款、具体功能及适用政策',mainland:'conditional',regionNote:'仅官方支持的国家和地区开放服务',checkedAt:'2026-10-30'},
 claude:{login:['邮箱验证链接','Google'],loginSource:'https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account',payment:[],models:'Claude 模型系列；不同方案与版本能力不同',limitations:'免费额度受限，Cowork、Claude Code 等功能随套餐变化',commercial:'按 Anthropic 具体服务条款执行',mainland:'conditional',regionNote:'须位于 Anthropic 公布的支持地区',checkedAt:'2026-10-30'},
 runway:{login:['邮箱密码','Google','Apple'],loginSource:'https://help.runwayml.com/hc/en-us/articles/24297557468563-Creating-a-Runway-Account',payment:[],models:'视频与图片生成模型，具体模型随产品更新',limitations:'免费积分、单次生成时长、输出规格和水印受套餐约束',commercial:'需按所选 Runway 方案及输出许可核对',mainland:'unknown',checkedAt:'2026-10-30'},
 suno:{login:['手机短信','Apple','Google','Microsoft','Discord'],loginSource:'https://help.suno.com/en/articles/3134401',payment:[],models:'Suno 音乐生成模型',limitations:'免费额度每日恢复；商用权与订阅状态有关',commercial:'免费创作不包含商用授权；付费计划可按对应规则使用',commercialSource:'https://suno.com/pricing',mainland:'unknown',checkedAt:'2026-10-30'},
 midjourney:{login:['Google','Discord'],loginSource:'https://docs.midjourney.com/hc/en-us/articles/33390994570509-Logging-In-Connecting-Accounts',payment:[],models:'Midjourney 图片与视频模型，依官网版本',limitations:'订阅与任务模式限制须区分',commercial:'按具体订阅与商业用途条款执行',mainland:'unknown',checkedAt:'2026-10-30'},
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
