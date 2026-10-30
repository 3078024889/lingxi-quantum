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
  strengths?:string;
  reasoning?:string;
  visualWatermark?:'none'|'included'|'paid_only_no_mark'|'unknown';
  watermarkNote?:string;
  watermarkSource?:string;
};
export const OFFER_GUIDE:Record<string,OfferGuide>={
 runway:{tasks:['短剧视频','图生视频','图片生成'],free:'可体验部分图片和视频工具：一次性 125 积分，不会每日恢复。',
  paid:'Standard 解锁更多视频、图片模型、无水印下载，每月 625 积分。',
  cost:'年付折合 $12/月（按年付款）',monthlyUsd:12,billing:'annual_equivalent',
  strengths:'视频镜头运动、图生视频和动态编辑，适合短剧、广告镜头。',reasoning:'擅长创作指令与视频控制，并非通用文字推理工具。',visualWatermark:'paid_only_no_mark',watermarkNote:'付费套餐支持无可见水印导出；免费档实际限制要按所选模型核对。',watermarkSource:'https://runway.com/pricing',
  payment:'付费方式以 Runway 结算页为准',region:'可用地区以官方注册页为准',source:'https://runway.com/pricing',checkedAt:'2026-10-30'},
 suno:{tasks:['歌曲制作','短剧配乐','背景音乐'],free:'可免费生成音乐：每天 50 积分；免费作品不含商用权，下载另有限制。',
  paid:'Pro 含每月 2,500 积分、商用授权及每月 20 次下载。',
  cost:'年付折合 $8/月（按年付款）',monthlyUsd:8,billing:'annual_equivalent',
  strengths:'快速生成歌曲、旋律、歌词和不同风格配乐，适合短剧配乐。',reasoning:'理解音乐风格和歌词指令，非通用逻辑推理平台。',visualWatermark:'unknown',watermarkNote:'音乐需单独核对商用、署名及版权限制，不套用图片水印标准。',
  payment:'以 Suno 结算页为准',region:'应用地区可能受商店限制',source:'https://suno.com/pricing',checkedAt:'2026-10-30'},
 elevenlabs:{tasks:['视频配音','声音合成','音效生成'],free:'免费生成语音等内容：每月共享 10,000 积分，具体时长因模型而异。',
  paid:'Starter 每月 30,000 积分，可做更多配音及语音生成。',
  cost:'$6/月（按月付）',monthlyUsd:6,billing:'monthly',
  strengths:'多语种配音、自然语音、音效生成，适合旁白与有声内容。',reasoning:'语音创作与编辑工具，不应按文字推理排行榜评价。',visualWatermark:'unknown',watermarkNote:'音频需核对商用许可与内容归属，不以是否有可见水印衡量。',
  payment:'以 ElevenLabs 结算页为准',region:'可用地区以官网为准',source:'https://elevenlabs.io/pricing',checkedAt:'2026-10-30'},
 lovable:{tasks:['AI建网站','制作网页','生成小程序原型'],free:'每天免费 5 个构建积分，最多 30 个/月，可尝试生成网站和应用。',
  paid:'Pro 提供更多构建额度、私有项目和自定义域名等。',
  cost:'Pro $25/月（月付参考）',monthlyUsd:25,billing:'monthly',
  strengths:'用自然语言直接制作网站与 Web 应用，适合没有编程基础的用户。',reasoning:'擅长把需求转换为页面与程序，生成结果仍需要实际运行测试。',visualWatermark:'unknown',
  payment:'以 Lovable 结算页为准',region:'官网及服务支持地区为准',source:'https://lovable.dev/pricing',checkedAt:'2026-10-30'},
 doubao:{tasks:['中文对话','视频生成','图片生成','短剧文案'],free:'可以使用中文对话和图片等创作功能；视频生成和额度以当前账户页面为准。',
 paid:'高级模型和其他增值权益以豆包实际开通页面为准。',
 cost:'有免费功能；收费项目以官网为准',payment:'以豆包官方应用内展示为准',
 region:'中国大陆等支持地区可通过官网及官方商店使用',source:'https://www.doubao.com/',checkedAt:'2026-10-30',
 strengths:'中文指令理解、图片创作、视频生成和多模态内容创作，适合中文短剧与社媒素材。',
 reasoning:'官方模型强调长文本、视觉理解和推理；具体表现随模型版本和功能而变化。',
 visualWatermark:'unknown',watermarkNote:'有用户反馈，部分豆包视频现在提供免费无水印导出选项；尚无对应官方公开规则可确认，实际请以当前账户导出设置为准。'},
 chatgpt:{tasks:['图片生成','写作','编程','研究'],free:'免费聊天、搜索和生成图片；模型与次数有限额。',
  paid:'Plus 可获得更高额度、更多推理与研究工具，API 费用另计。',
  cost:'Plus $20/月',monthlyUsd:20,billing:'monthly',
  strengths:'擅长理解复杂图像提示词，支持有上下文的图像编辑、文案、研究与编程。',reasoning:'复杂推理、研究和长任务协作可选；可用能力和额度随模型与套餐变化。',visualWatermark:'none',watermarkNote:'生成图片通常没有可见角标；仍可能包含 C2PA 来源元数据与不可见来源标记。',watermarkSource:'https://deploymentsafety.openai.com/chatgpt-images-2-0/chatgpt-images-2-0.pdf',
  payment:'支付选项以官网或应用商店结算页为准',region:'仅限官方支持的国家和地区',source:'https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus',checkedAt:'2026-10-30'},
 claude:{tasks:['AI写代码','长文本写作','资料分析'],free:'可以免费聊天、写作、分析图片和生成代码，使用额度有限。',
  paid:'Pro 增加使用额度、研究、终端编程及更多模型。',
  cost:'Pro $20/月（月付）',monthlyUsd:20,billing:'monthly',
  strengths:'长文本理解、代码审查、写作与资料分析，适合研发和研究。',reasoning:'支持多步骤分析与扩展思考，具体模型和额度随方案变化。',visualWatermark:'unknown',
  payment:'按官网或应用商店的当地结算方式',region:'仅在 Claude 支持地区提供注册和付费',source:'https://www.anthropic.com/pricing',checkedAt:'2026-10-30'},
 perplexity:{tasks:['联网搜索','带来源的研究','资料整理'],free:'免费联网搜索并提供参考来源；复杂研究与次数有限。',
  paid:'Pro 增加高级模型、深度研究、创建文档和应用等。',
  cost:'Pro $20/月',monthlyUsd:20,billing:'monthly',
  strengths:'联网研究和来源引用，适合信息搜集与事实交叉核对。',reasoning:'结合来源开展搜索研究；结果准确性仍取决于来源和所选模型。',visualWatermark:'unknown',
  payment:'以 Perplexity 结算页为准',region:'以官网支持地区为准',source:'https://www.perplexity.ai/enterprise/pricing',checkedAt:'2026-10-30'},
 comfyui:{tasks:['图片生成','视频工作流','本地生成'],free:'开源工具可在自己的电脑上使用；需要本地算力与模型。',
  paid:'托管云服务和合作模型可能收费，本地安装并不等于云端免费。',
  cost:'本地软件免费；云服务按官网价格',strengths:'节点式图像工作流，模型、参考图与生成流程都可灵活组合。',reasoning:'推理能力来自接入的具体模型，不是工具本身的固定分数。',visualWatermark:'unknown',watermarkNote:'本地导出是否有水印取决于模型、节点及工作流。',
  payment:'云端付费方式由官网说明',region:'本地使用取决于硬件及模型许可',
  source:'https://www.comfy.org/',checkedAt:'2026-10-30'},
 ollama:{tasks:['本地聊天','本地运行模型','AI编程'],free:'在自己的电脑上免费运行兼容的开源模型，需自行提供硬件。',
  paid:'可选云端服务、计算资源与第三方模型可能收费。',
  cost:'本地工具免费；云端另计',strengths:'在自己的电脑上运行模型，适合本地聊天、代码和隐私敏感任务。',reasoning:'能力完全取决于实际部署模型，不应给 Ollama 统一推理分。',visualWatermark:'unknown',
  payment:'云服务以官网结算为准',region:'本地可用性取决于系统与模型许可',
  source:'https://ollama.com/',checkedAt:'2026-10-30'},
 replit:{tasks:['建网站','AI编程','发布应用'],free:'可从入门功能体验 AI 协作编程；免费额度以官网账户显示为准。',
  paid:'Core 扩展 AI 编程、项目与部署用量。',
  cost:'Core 年付折合 $18/月（年付）',monthlyUsd:18,billing:'annual_equivalent',
  strengths:'在浏览器里生成、运行和部署应用，适合快速建立网站和工具。',reasoning:'擅长代码任务规划与执行，上线前仍需验证功能与安全。',visualWatermark:'unknown',
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
