/**
 * Company facts are separate from products, SDKs and community repositories.
 * Only dated publisher statements are shown as corporate dates, financings or
 * parent-company listings. An absent value is NOT a claim of no funding/IPO.
 * 2026-11-01 manual review; every nonempty fact carries its own source.
 */
type EvidenceValue={text:string;source:string;asOf:string};
export type CompanyEvidence={
 kind:'company'|'open_source_project'|'software_library';
 publisherSource:string;
 founded?:EvidenceValue;
 headquarters?:EvidenceValue;
 projectStarted?:EvidenceValue;
 funding?:EvidenceValue;
 listing?:EvidenceValue;
 scale?:EvidenceValue;
};
const checked='2026-11-01';
const fact=(text:string,source:string,asOf=checked):EvidenceValue=>({text,source,asOf});
const parent={
 openai:{kind:'company',publisherSource:'https://openai.com/about/',founded:fact('2015','https://openai.com/about/'),headquarters:fact('美国 · 加州旧金山（OpenAI OpCo 地址）','https://openai.com/policies/feb-2024-data-processing-addendum/')},
 anthropic:{kind:'company',publisherSource:'https://www.anthropic.com/company',founded:fact('2021','https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai'),headquarters:fact('美国 · 旧金山','https://www.anthropic.com/transparency/voluntary-commitments'),funding:fact('2022年 B 轮融资 5.8 亿美元（历史轮次，非累计融资）','https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai','2022-04-29')},
 google:{kind:'company',publisherSource:'https://about.google/',founded:fact('1998','https://about.google/our-story/'),headquarters:fact('美国 · 加州 Mountain View','https://about.google/company-info/our-story/'),listing:fact('Alphabet 集团上市公司旗下产品；NASDAQ: GOOGL / GOOG','https://abc.xyz/investor/')},
 alibaba:{kind:'company',publisherSource:'https://www.alibabagroup.com/',founded:fact('1999','https://www.alibabagroup.com/en-US/about-alibaba'),headquarters:fact('中国 · 浙江杭州','https://www.alibabagroup.com/en-US/about-alibaba'),listing:fact('阿里巴巴集团上市公司旗下产品；NYSE: BABA / HKEX: 9988','https://www.alibabagroup.com/en-US/ir')},
 bytedance:{kind:'company',publisherSource:'https://www.bytedance.com/about',founded:fact('2012','https://www.bytedance.com/about'),headquarters:fact('中国 · 北京（公司起源）','https://www.bytedance.com/about')},
 kuaishou:{kind:'company',publisherSource:'https://ir.kuaishou.com/',founded:fact('2011','https://ir.kuaishou.com/about-us/senior-management/'),listing:fact('快手科技旗下产品；港交所 1024.HK，2021年2月5日挂牌','https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishoukejijintianyuxiangganglianjiaosuozhubanguapaishangshi','2021-02-05'),projectStarted:fact('快手最早应用于 2011 年推出','https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishouliangweilianhechuangshirendiaozhengfengong/')},
 luma:{kind:'company',publisherSource:'https://lumalabs.ai/llm-info',founded:fact('2021','https://lumalabs.ai/llm-info'),headquarters:fact('美国 · 加州 Redwood City','https://lumalabs.ai/llm-info')},
 runway:{kind:'company',publisherSource:'https://trust.runwayml.com/',projectStarted:fact('2018年起开展生成式媒体研发','https://trust.runwayml.com/')},
 elevenlabs:{kind:'company',publisherSource:'https://elevenlabs.io/about',founded:fact('2022','https://elevenlabs.io/docs/help-center/other/what-is-eleven-labs')},
 suno:{kind:'company',publisherSource:'https://suno.com/about',founded:fact('2022','https://suno.com/about'),funding:fact('官网公布累计融资超过 7.75 亿美元','https://suno.com/about'),scale:fact('超过 1 亿人创作过音乐；团队 250+ 人；官方称在 35 个国家/地区位列音乐应用第一','https://suno.com/about')},
 replit:{kind:'company',publisherSource:'https://replit.com/about',founded:fact('2016','https://replit.com/news/replit-opens-london-office'),headquarters:fact('美国 · 旧金山','https://replit.com/news/replit-opens-london-office'),funding:fact('2026年3月公布 4 亿美元融资（该轮，不等于累计）','https://replit.com/blog/replit-raises-400-million-dollars','2026-03-11')},
 comfy:{kind:'open_source_project',publisherSource:'https://comfy.org/about/',projectStarted:fact('ComfyUI 开源项目始于 2023 年 1 月','https://comfy.org/about/'),funding:fact('Comfy 团队 2026年4月公告：本轮 3000 万美元，累计 4700 万美元','https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open','2026-04-24')},
 huggingface:{kind:'company',publisherSource:'https://huggingface.co/',scale:fact('官网当前展示 2M+ 模型、1M+ AI 应用、500K+ 数据集','https://huggingface.co/') },
 deepseek:{kind:'company',publisherSource:'https://www.deepseek.com/'},
 xai:{kind:'company',publisherSource:'https://x.ai/company',founded:fact('2023','https://x.ai/company'),headquarters:fact('美国 · 德州 Austin（SpaceX Super Intelligence LLC 主要营业地）','https://x.ai/legal/terms-of-service','2026-10-27'),funding:fact('xAI 于 2026-01-06 公布 200 亿美元 Series E；属于加入 SpaceX 前的历史融资轮','https://x.ai/news/series-e','2026-01-06'),scale:fact('Colossus 计算设施：200,000 GPUs（官方公司页面）','https://x.ai/company') },
 perplexity:{kind:'company',publisherSource:'https://www.perplexity.ai/'},
 n8n:{kind:'company',publisherSource:'https://n8n.io/press/',founded:fact('2019','https://n8n.io/press/'),headquarters:fact('德国 · 柏林','https://n8n.io/press/')},
 langchain:{kind:'company',publisherSource:'https://www.langchain.com/about',founded:fact('2023','https://www.langchain.com/about'),headquarters:fact('美国 · 旧金山','https://www.langchain.com/about'),projectStarted:fact('LangChain Python 开源项目始于 2022 年末；公司于 2023 年初成立','https://www.langchain.com/about'),funding:fact('2025-10-20 公布 1.25 亿美元融资，估值 12.5 亿美元（该轮融资）','https://www.langchain.com/blog/three-years-langchain','2025-10-20'),scale:fact('覆盖 35%《财富》500 强企业；开源项目下载量超过 10 亿；LangSmith 每日处理超过 10 亿条事件','https://www.langchain.com/about') },
 llamaindex:{kind:'company',publisherSource:'https://www.llamaindex.ai/about',projectStarted:fact('开源框架于 2022 年末推出','https://www.llamaindex.ai/blog/llamaindex-is-more-than-a-rag-framework'),funding:fact('2025-03-04 公布 1900 万美元 A 轮融资；公告时累计融资 2750 万美元','https://www.llamaindex.ai/blog/announcing-our-series-a-and-llamacloud-general-availability','2025-03-04'),scale:fact('官网当前展示：每月 2500 万+ 软件包下载、30 万+ LlamaParse 用户、1500+ 贡献者、2 万+ 社区成员','https://www.llamaindex.ai/about') },
 lovable:{kind:'company',publisherSource:'https://lovable.dev/blog/series-c',headquarters:fact('瑞典 · 斯德哥尔摩（公司称其为运营重心）','https://lovable.dev/blog/series-c','2026-08-12'),projectStarted:fact('Lovable 产品于 2024 年 11 月上线（产品上线时间，不等同于公司注册日期）','https://lovable.dev/blog/series-c','2026-08-12'),funding:fact('2026-08-12 公布 4 亿美元 C 轮融资，投后估值 133 亿美元（该轮，非累计）','https://lovable.dev/blog/series-c','2026-08-12'),scale:fact('官方披露：用户累计创建超过 6000 万个项目；由 Lovable 构建的应用每月访问量超过 9 亿次','https://lovable.dev/blog/series-c','2026-08-12') },
 midjourney:{kind:'company',publisherSource:'https://www.midjourney.com/',funding:fact('官网将其描述为 community-funded research lab；未在该页面公布融资金额','https://www.midjourney.com/'),scale:fact('官网 About 页面披露团队规模为 60 人','https://www.midjourney.com/') },
 dify:{kind:'company',publisherSource:'https://dify.ai/legal/terms-of-service',founded:fact('2023','https://www.dify.ai/ko/blog/dify-raises-30m-tomorrow-s-organizations-will-be-built-by-people-and-agents'),headquarters:fact('美国 · 加州 Menlo Park（官网总部）','https://dify.ai/about-us'),funding:fact('2026 年 3 月 Pre-A 轮融资 3000 万美元（单轮，非累计）','https://dify.ai/about-us','2026-03-10')},
 ollama:{kind:'company',publisherSource:'https://ollama.com/',scale:fact('官网当前展示：每月安装量 900 万+、模型下载量 10 亿+、累计服务 Token 200T+','https://ollama.com/') },
 openwebui:{kind:'open_source_project',publisherSource:'https://github.com/open-webui/open-webui'},
 ggml:{kind:'open_source_project',publisherSource:'https://github.com/ggml-org/llama.cpp'},
 vllm:{kind:'open_source_project',publisherSource:'https://github.com/vllm-project/vllm'},
 automatic1111:{kind:'open_source_project',publisherSource:'https://github.com/AUTOMATIC1111/stable-diffusion-webui'},
 fasterwhisper:{kind:'software_library',publisherSource:'https://github.com/SYSTRAN/faster-whisper'},
} as const satisfies Record<string,CompanyEvidence>;
const map:Record<string,keyof typeof parent>={
 'anthropic-sdk-python':'anthropic',chatgpt:'openai',claude:'anthropic',comfyui:'comfy',
 deepseek:'deepseek',dify:'dify',elevenlabs:'elevenlabs',fasterwhisper:'fasterwhisper',
 gemini:'google',grok:'xai',langchain:'langchain',llamacpp:'ggml',llamaindex:'llamaindex',
 lovable:'lovable',luma:'luma',midjourney:'midjourney',n8n:'n8n',ollama:'ollama',
 openwebui:'openwebui','openai-python':'openai',perplexity:'perplexity',
 replit:'replit',runway:'runway',automatic1111:'automatic1111',suno:'suno',
 transformers:'huggingface',vllm:'vllm',whisper:'openai',qwen:'alibaba',
 jimeng:'bytedance',kling:'kuaishou',doubao:'bytedance'
};
export const COMPANY_EVIDENCE:Readonly<Record<string,CompanyEvidence>>=Object.fromEntries(
 Object.entries(map).map(([id,key])=>[id,parent[key]])
) as Record<string,CompanyEvidence>;
export const companyEvidenceFor=(id:string):CompanyEvidence|undefined=>COMPANY_EVIDENCE[id];
export const COMPANY_EVIDENCE_IDS=Object.freeze(Object.keys(map));

/** Publisher and maintainer names are not the same as product names. Legal
 * identities are only asserted where the publisher documents them.
 * A missing exchange announcement is NOT evidence that a firm is unlisted. */
const COMPANY_PUBLIC_NAMES:Partial<Record<keyof typeof parent,string>>={
 openai:'OpenAI Group PBC',anthropic:'Anthropic',google:'Google / Alphabet',alibaba:'Alibaba Group',
 bytedance:'ByteDance',kuaishou:'Kuaishou Technology',luma:'Luma AI',runway:'Runway',
 elevenlabs:'ElevenLabs',suno:'Suno',replit:'Replit',comfy:'Comfy',
 huggingface:'Hugging Face',deepseek:'DeepSeek',xai:'xAI',perplexity:'Perplexity AI',
 n8n:'n8n',langchain:'LangChain',llamaindex:'LlamaIndex',lovable:'Lovable',
 midjourney:'Midjourney',dify:'LangGenius, Inc.',ollama:'Ollama',
 openwebui:'Open WebUI project',ggml:'ggml-org',vllm:'vLLM project',
 automatic1111:'AUTOMATIC1111',fasterwhisper:'SYSTRAN (faster-whisper)'
};
export type CompanyListingState='listed_parent'|'unconfirmed'|'not_applicable';
export function companyPresentationFor(id:string, fallbackName:string){
 const key=map[id];const evidence=key?(parent as Record<string,CompanyEvidence>)[key]:undefined;
 const isCompany=evidence?.kind==='company';
 const projectYear=evidence?.projectStarted?.text.match(/(?:19|20)\d{2}/)?.[0];
 const started=isCompany?evidence?.founded?.text:projectYear;
 const startedSource=isCompany?evidence?.founded?.source:evidence?.projectStarted?.source;
 const listingState:CompanyListingState=evidence?.listing?'listed_parent':isCompany?'unconfirmed':'not_applicable';
 return {
  name:key?(COMPANY_PUBLIC_NAMES[key]||fallbackName):fallbackName,
  kind:evidence?.kind||'company',year:started||null,yearSource:startedSource||null,
  listingState,listingDetail:evidence?.listing?.text||null,
  listingSource:evidence?.listing?.source||null,companySource:evidence?.publisherSource||null
 };
}
