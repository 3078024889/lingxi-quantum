// User-facing summaries are only shown for facts supported by a named publisher source.
// Missing payment methods and geographic access are deliberately not inferred.
export type OfferGuide={
  tasks:string[];
  free:string;
  paid:string;
  cost:string;
  payment:string;
  region:string;
  source:string;
  checkedAt:string;
  monthlyUsd?:number;
  billing?:'monthly'|'annual_equivalent';
};
export const OFFER_GUIDE:Record<string,OfferGuide>={
 runway:{tasks:['短剧视频','图生视频','图片生成'],free:'可体验部分图片和视频工具：一次性 125 积分，不会每日恢复。',
  paid:'Standard 解锁更多视频、图片模型、无水印下载，每月 625 积分。',
  cost:'年付折合 $12/月（按年付款）',monthlyUsd:12,billing:'annual_equivalent',
  payment:'付费方式以 Runway 结算页为准',region:'可用地区以官方注册页为准',source:'https://runway.com/pricing',checkedAt:'2026-10-30'},
 suno:{tasks:['歌曲制作','短剧配乐','背景音乐'],free:'可免费生成音乐：每天 50 积分；免费作品不含商用权，下载另有限制。',
  paid:'Pro 含每月 2,500 积分、商用授权及每月 20 次下载。',
  cost:'年付折合 $8/月（按年付款）',monthlyUsd:8,billing:'annual_equivalent',
  payment:'以 Suno 结算页为准',region:'应用地区可能受商店限制',source:'https://suno.com/pricing',checkedAt:'2026-10-30'},
 elevenlabs:{tasks:['视频配音','声音合成','音效生成'],free:'免费生成语音等内容：每月共享 10,000 积分，具体时长因模型而异。',
  paid:'Starter 每月 30,000 积分，可做更多配音及语音生成。',
  cost:'$6/月（按月付）',monthlyUsd:6,billing:'monthly',
  payment:'以 ElevenLabs 结算页为准',region:'可用地区以官网为准',source:'https://elevenlabs.io/pricing',checkedAt:'2026-10-30'},
 lovable:{tasks:['AI建网站','制作网页','生成小程序原型'],free:'每天免费 5 个构建积分，最多 30 个/月，可尝试生成网站和应用。',
  paid:'Pro 提供更多构建额度、私有项目和自定义域名等。',
  cost:'Pro $25/月（月付参考）',monthlyUsd:25,billing:'monthly',
  payment:'以 Lovable 结算页为准',region:'官网及服务支持地区为准',source:'https://lovable.dev/pricing',checkedAt:'2026-10-30'},
 chatgpt:{tasks:['图片生成','写作','编程','研究'],free:'免费聊天、搜索和生成图片；模型与次数有限额。',
  paid:'Plus 可获得更高额度、更多推理与研究工具，API 费用另计。',
  cost:'Plus $20/月',monthlyUsd:20,billing:'monthly',
  payment:'支付选项以官网或应用商店结算页为准',region:'仅限官方支持的国家和地区',source:'https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus',checkedAt:'2026-10-30'},
 claude:{tasks:['AI写代码','长文本写作','资料分析'],free:'可以免费聊天、写作、分析图片和生成代码，使用额度有限。',
  paid:'Pro 增加使用额度、研究、终端编程及更多模型。',
  cost:'Pro $20/月（月付）',monthlyUsd:20,billing:'monthly',
  payment:'按官网或应用商店的当地结算方式',region:'仅在 Claude 支持地区提供注册和付费',source:'https://www.anthropic.com/pricing',checkedAt:'2026-10-30'},
 perplexity:{tasks:['联网搜索','带来源的研究','资料整理'],free:'免费联网搜索并提供参考来源；复杂研究与次数有限。',
  paid:'Pro 增加高级模型、深度研究、创建文档和应用等。',
  cost:'Pro $20/月',monthlyUsd:20,billing:'monthly',
  payment:'以 Perplexity 结算页为准',region:'以官网支持地区为准',source:'https://www.perplexity.ai/enterprise/pricing',checkedAt:'2026-10-30'},
 comfyui:{tasks:['图片生成','视频工作流','本地生成'],free:'开源工具可在自己的电脑上使用；需要本地算力与模型。',
  paid:'托管云服务和合作模型可能收费，本地安装并不等于云端免费。',
  cost:'本地软件免费；云服务按官网价格',payment:'云端付费方式由官网说明',region:'本地使用取决于硬件及模型许可',
  source:'https://www.comfy.org/',checkedAt:'2026-10-30'},
 ollama:{tasks:['本地聊天','本地运行模型','AI编程'],free:'在自己的电脑上免费运行兼容的开源模型，需自行提供硬件。',
  paid:'可选云端服务、计算资源与第三方模型可能收费。',
  cost:'本地工具免费；云端另计',payment:'云服务以官网结算为准',region:'本地可用性取决于系统与模型许可',
  source:'https://ollama.com/',checkedAt:'2026-10-30'},
 replit:{tasks:['建网站','AI编程','发布应用'],free:'可从入门功能体验 AI 协作编程；免费额度以官网账户显示为准。',
  paid:'Core 扩展 AI 编程、项目与部署用量。',
  cost:'Core 年付折合 $18/月（年付）',monthlyUsd:18,billing:'annual_equivalent',
  payment:'以 Replit 结算页为准',region:'可用地区以官网为准',source:'https://replit.com/pricing',checkedAt:'2026-10-30'}
};
export type PriceLeaderboard={label:string;billing:'monthly'|'annual_equivalent';items:{id:string;monthlyUsd:number;tasks:string[];source:string;cost:string}[]};
export function priceBoards():PriceLeaderboard[]{
 return (['monthly','annual_equivalent'] as const).map(billing=>({
  label:billing==='monthly'?'月付入门价格榜':'年付折合月价榜',billing,
  items:Object.entries(OFFER_GUIDE).filter(([,v])=>v.billing===billing&&v.monthlyUsd!==undefined)
   .map(([id,v])=>({id,monthlyUsd:v.monthlyUsd!,tasks:v.tasks,source:v.source,cost:v.cost}))
   .sort((a,b)=>a.monthlyUsd-b.monthlyUsd||a.id.localeCompare(b.id))
 }));
}
export const USER_TASKS=['短剧视频','图片生成','歌曲制作','视频配音','AI建网站','AI写代码','联网搜索','本地运行模型'];
