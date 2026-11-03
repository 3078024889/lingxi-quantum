/**
 * Company facts are separate from products, SDKs and community repositories.
 * Only dated publisher statements are shown as corporate dates, financings or
 * parent-company listings. An absent value is NOT a claim of no funding/IPO.
 * 2026-11-01 manual review; every nonempty fact carries its own source.
 */
import {founderForPublisher} from './market-founder-evidence';
type EvidenceValue={text:string;source:string;asOf:string};
export type CompanyEvidence={
 kind:'company'|'open_source_project'|'software_library';
 publisherSource:string;
 /** Officially sourced legal entity; this is NOT a natural-person legal representative. */
 legalEntity?:EvidenceValue;
 legalEntityScope?:'service_operator'|'group_parent';
 ipoFiling?:EvidenceValue;
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
 openai:{kind:'company',publisherSource:'https://openai.com/about/',legalEntity:fact('OpenAI OpCo, LLC','https://openai.com/policies/row-terms-of-use/','2026-01-01'),legalEntityScope:'service_operator',founded:fact('2015','https://openai.com/about/'),headquarters:fact('美国 · 加州旧金山（OpenAI OpCo 地址）','https://openai.com/policies/feb-2024-data-processing-addendum/')},
 anthropic:{kind:'company',publisherSource:'https://www.anthropic.com/company',legalEntity:fact('Anthropic, PBC','https://www.anthropic.com/news/s1-sec','2026-10-26'),legalEntityScope:'service_operator',ipoFiling:fact('2026-10-26 已提交 S-1，尚未完成上市','https://www.anthropic.com/news/s1-sec','2026-10-26'),founded:fact('2021','https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai'),headquarters:fact('美国 · 旧金山','https://www.anthropic.com/transparency/voluntary-commitments'),funding:fact('2022年 B 轮融资 5.8 亿美元（历史轮次，非累计融资）','https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai','2022-04-29')},
 google:{kind:'company',publisherSource:'https://about.google/',legalEntity:fact('Google LLC','https://policies.google.com/terms','2026-07-30'),legalEntityScope:'service_operator',founded:fact('1998','https://about.google/our-story/'),headquarters:fact('美国 · 加州 Mountain View','https://about.google/company-info/our-story/'),listing:fact('Alphabet 集团上市公司旗下产品；NASDAQ: GOOGL / GOOG','https://abc.xyz/investor/')},
 alibaba:{kind:'company',publisherSource:'https://www.alibabagroup.com/',legalEntity:fact('Alibaba Group Holding Limited','https://home.alibabagroup.com/en-US/document-2003564382071554048','2026-05-20'),legalEntityScope:'group_parent',founded:fact('1999','https://www.alibabagroup.com/en-US/about-alibaba'),headquarters:fact('中国 · 浙江杭州','https://www.alibabagroup.com/en-US/about-alibaba'),listing:fact('阿里巴巴集团上市公司旗下产品；NYSE: BABA / HKEX: 9988','https://www.alibabagroup.com/en-US/ir')},
 bytedance:{kind:'company',publisherSource:'https://www.bytedance.com/about',legalEntity:fact('ByteDance Ltd.','https://www.bytedance.com/en/corporate-structure','2026-11-02'),legalEntityScope:'group_parent',founded:fact('2012','https://www.bytedance.com/about'),headquarters:fact('中国 · 北京（公司起源）','https://www.bytedance.com/about')},
 kuaishou:{kind:'company',publisherSource:'https://ir.kuaishou.com/',legalEntity:fact('Kuaishou Technology','https://ir.kuaishou.com/static-files/9b436e92-fd39-404c-877e-c3b0d9b92b80','2026-11-02'),legalEntityScope:'group_parent',founded:fact('2014-02-11','https://ir.kuaishou.com/static-files/9b436e92-fd39-404c-877e-c3b0d9b92b80','2026-11-02'),headquarters:fact('中国 · 北京海淀区（快手科技总部）','https://ir.kuaishou.com/zh-hans/investor-resources/investor-faqs','2026-11-02'),listing:fact('快手科技旗下产品；港交所 1024.HK，2021年2月5日挂牌','https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishoukejijintianyuxiangganglianjiaosuozhubanguapaishangshi','2021-02-05'),projectStarted:fact('快手最早应用于 2011 年推出','https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishouliangweilianhechuangshirendiaozhengfengong/')},
 luma:{kind:'company',publisherSource:'https://lumalabs.ai/llm-info',legalEntity:fact('Luma AI, Inc.','https://lumalabs.ai/legal/terms-of-service','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2021','https://lumalabs.ai/llm-info'),headquarters:fact('美国 · 加州 Redwood City','https://lumalabs.ai/llm-info')},
 runway:{kind:'company',publisherSource:'https://trust.runwayml.com/',legalEntity:fact('Runway AI, Inc.','https://trust.runwayml.com/','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2018','https://runway.com/news/runway-raises-50-series-c','2022-12-05'),headquarters:fact('美国 · 纽约（2022年 SEC 申报的主要营业地址，非2026年实时总部认定）','https://www.sec.gov/Archives/edgar/data/1957455/000123191922000071/xslFormDX01/primary_doc.xml','2022-12-31'),funding:fact('2026年2月 E 轮融资 3.15 亿美元（单轮，非累计）','https://runway.com/news/runway-series-e-funding','2026-02-10'),projectStarted:fact('2018年起开展生成式媒体研发','https://trust.runwayml.com/')},
 elevenlabs:{kind:'company',publisherSource:'https://elevenlabs.io/about',legalEntity:fact('Eleven Labs Inc.','https://elevenlabs.io/terms-of-use','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2022','https://elevenlabs.io/docs/help-center/other/what-is-eleven-labs'),headquarters:fact('英国 · 伦敦（欧洲总部与全球运营中心，非全球法定总部）','https://elevenlabs.io/blog/london-office-opening','2024-08-14'),funding:fact('2026年2月 D 轮融资 5 亿美元；公告时累计融资 7.81 亿美元（非估值）','https://elevenlabs.io/blog/series-d','2026-02-04')},
 suno:{kind:'company',publisherSource:'https://suno.com/about',legalEntity:fact('Suno Inc.','https://suno.com/terms','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2022','https://suno.com/about'),headquarters:fact('美国 · 马萨诸塞州 Cambridge（官网明确标注总部）','https://suno.com/careers','2026-11-02'),funding:fact('官网公布累计融资超过 7.75 亿美元','https://suno.com/about'),scale:fact('超过 1 亿人创作过音乐；团队 250+ 人；官方称在 35 个国家/地区位列音乐应用第一','https://suno.com/about')},
 replit:{kind:'company',publisherSource:'https://replit.com/about',legalEntity:fact('Replit, Inc.','https://replit.com/terms-of-service','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2016','https://replit.com/news/replit-opens-london-office'),headquarters:fact('美国 · 旧金山','https://replit.com/news/replit-opens-london-office'),funding:fact('2026年3月公布 4 亿美元融资（该轮，不等于累计）','https://replit.com/blog/replit-raises-400-million-dollars','2026-03-11')},
 comfy:{kind:'open_source_project',publisherSource:'https://comfy.org/about/',projectStarted:fact('ComfyUI 开源项目始于 2023 年 1 月','https://comfy.org/about/'),funding:fact('Comfy 团队 2026年4月公告：本轮 3000 万美元，累计 4700 万美元','https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open','2026-04-24')},
 huggingface:{kind:'company',publisherSource:'https://huggingface.co/',legalEntity:fact('Hugging Face, Inc.','https://huggingface.co/terms-of-service','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2016','https://salesforceventures.com/perspectives/welcome-hugging-face/'),funding:fact('2023年8月 D 轮融资 2.35 亿美元（IBM 官方参与公告；单轮）','https://newsroom.ibm.com/2023-08-24-IBM-to-Participate-in-235M-Series-D-Funding-Round-of-Hugging-Face','2023-08-24'),scale:fact('官网当前展示 2M+ 模型、1M+ AI 应用、500K+ 数据集','https://huggingface.co/') },
 deepseek:{kind:'company',publisherSource:'https://www.deepseek.com/',legalEntity:fact('杭州深度求索人工智能基础技术研究有限公司','https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2023','https://www.linkedin.com/company/deepseek-ai/')}, 
 xai:{kind:'company',publisherSource:'https://x.ai/company',legalEntity:fact('SpaceX Super Intelligence LLC','https://x.ai/legal/terms-of-service','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2023','https://x.ai/company'),headquarters:fact('美国 · 德州 Austin（SpaceX Super Intelligence LLC 主要营业地）','https://x.ai/legal/terms-of-service','2026-10-27'),funding:fact('xAI 于 2026-01-06 公布 200 亿美元 Series E；属于加入 SpaceX 前的历史融资轮','https://x.ai/news/series-e','2026-01-06'),scale:fact('Colossus 计算设施：200,000 GPUs（官方公司页面）','https://x.ai/company') },
 perplexity:{kind:'company',publisherSource:'https://www.perplexity.ai/',legalEntity:fact('Perplexity AI, Inc.','https://www.perplexity.ai/en-GB/hub/legal/terms-of-service','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2022','https://brand.perplexity.ai/pdf/the-economic-impacts-of-AI-on-enterprise-IT-organizations.pdf'),headquarters:fact('美国 · 加州旧金山（官方法务联系地址，不视为总部地址）','https://www.perplexity.ai/zh/hub/legal/terms-of-service','2026-11-02')},
 n8n:{kind:'company',publisherSource:'https://n8n.io/press/',legalEntity:fact('n8n GmbH','https://n8n.io/imprint/','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2019','https://n8n.io/press/'),headquarters:fact('德国 · 柏林','https://n8n.io/press/')},
 langchain:{kind:'company',publisherSource:'https://www.langchain.com/about',legalEntity:fact('LangChain Inc.','https://www.langchain.com/terms-of-service','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2023','https://www.langchain.com/about'),headquarters:fact('美国 · 旧金山','https://www.langchain.com/about'),projectStarted:fact('LangChain Python 开源项目始于 2022 年末；公司于 2023 年初成立','https://www.langchain.com/about'),funding:fact('2025-10-20 公布 1.25 亿美元融资，估值 12.5 亿美元（该轮融资）','https://www.langchain.com/blog/three-years-langchain','2025-10-20'),scale:fact('覆盖 35%《财富》500 强企业；开源项目下载量超过 10 亿；LangSmith 每日处理超过 10 亿条事件','https://www.langchain.com/about') },
 llamaindex:{kind:'company',publisherSource:'https://www.llamaindex.ai/about',legalEntity:fact('LlamaIndex, Inc.','https://www.llamaindex.ai/legal/terms-of-service','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2023','https://www.prnewswire.com/news-releases/llamaindex-secures-19-million-series-a-to-power-enterprise-grade-knowledge-agents-302390936.html','2025-03-04'),headquarters:fact('美国 · 旧金山（公司资料显示的总部）','https://www.linkedin.com/company/llamaindex','2026-11-02'),projectStarted:fact('开源框架于 2022 年末推出','https://www.llamaindex.ai/blog/llamaindex-is-more-than-a-rag-framework'),funding:fact('2025-03-04 公布 1900 万美元 A 轮融资；公告时累计融资 2750 万美元','https://www.llamaindex.ai/blog/announcing-our-series-a-and-llamacloud-general-availability','2025-03-04'),scale:fact('官网当前展示：每月 2500 万+ 软件包下载、30 万+ LlamaParse 用户、1500+ 贡献者、2 万+ 社区成员','https://www.llamaindex.ai/about') },
 lovable:{kind:'company',publisherSource:'https://lovable.dev/blog/series-c',legalEntity:fact('Lovable Labs Incorporated','https://lovable.dev/terms','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2023','https://lovable.dev/gpt-engineer'),headquarters:fact('瑞典 · 斯德哥尔摩（公司称其为运营重心）','https://lovable.dev/blog/series-c','2026-08-12'),projectStarted:fact('Lovable 产品于 2024 年 11 月上线（产品上线时间，不等同于公司注册日期）','https://lovable.dev/blog/series-c','2026-08-12'),funding:fact('2026-08-12 公布 4 亿美元 C 轮融资，投后估值 133 亿美元（该轮，非累计）','https://lovable.dev/blog/series-c','2026-08-12'),scale:fact('官方披露：用户累计创建超过 6000 万个项目；由 Lovable 构建的应用每月访问量超过 9 亿次','https://lovable.dev/blog/series-c','2026-08-12') },
 midjourney:{kind:'company',publisherSource:'https://www.midjourney.com/',legalEntity:fact('Midjourney, Inc.','https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service','2026-11-02'),legalEntityScope:'service_operator',founded:fact('2021','https://tollbit.forbes.com/companies/midjourney/','2026-04-16'),headquarters:fact('美国 · 加州旧金山（公司职业页面及企业档案）','https://www.linkedin.com/company/midjourney','2026-11-02'),funding:fact('官网将其描述为 community-funded research lab；未在该页面公布融资金额','https://www.midjourney.com/'),scale:fact('官网 About 页面披露团队规模为 60 人','https://www.midjourney.com/') },
 dify:{kind:'company',publisherSource:'https://dify.ai/legal/terms-of-service',legalEntity:fact('LangGenius, Inc.','https://www.dify.ai/legal/terms-of-service','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2023','https://www.dify.ai/ko/blog/dify-raises-30m-tomorrow-s-organizations-will-be-built-by-people-and-agents'),headquarters:fact('美国 · 加州 Menlo Park（官网总部）','https://dify.ai/about-us'),funding:fact('2026 年 3 月 Pre-A 轮融资 3000 万美元（单轮，非累计）','https://dify.ai/about-us','2026-03-10')},
 ollama:{kind:'company',publisherSource:'https://ollama.com/',legalEntity:fact('Ollama Inc.','https://ollama.com/terms','2026-11-03'),legalEntityScope:'service_operator',founded:fact('2023','https://www.linkedin.com/company/ollama/'),headquarters:fact('美国 · 加州 Palo Alto（公司资料页）','https://www.linkedin.com/company/ollama/'),projectStarted:fact('2023 年已正式发布本地模型运行产品（不代表公司注册日期）','https://ollama.com/blog/run-code-llama-locally','2023-08-24'),scale:fact('官网当前展示：每月安装量 900 万+、模型下载量 10 亿+、累计服务 Token 200T+','https://ollama.com/') },
 openwebui:{kind:'open_source_project',publisherSource:'https://github.com/open-webui/open-webui',projectStarted:fact('2023 年已有仓库提交','https://github.com/open-webui/open-webui/commit/7313e4246aa088b72ddb934642252dfd4f104661','2023-12-31')},
 ggml:{kind:'open_source_project',publisherSource:'https://github.com/ggml-org/llama.cpp',projectStarted:fact('2023 年已有仓库提交','https://github.com/ggml-org/llama.cpp/commit/edd1ab7bc34c10a780ee7f9a4499f7689cdad36d','2023-12-31')},
 vllm:{kind:'open_source_project',publisherSource:'https://github.com/vllm-project/vllm',projectStarted:fact('2023 年已有仓库提交','https://github.com/vllm-project/vllm/commit/4934d492744d14104353b8236ef8a0405edf1622','2023-12-30')},
 automatic1111:{kind:'open_source_project',publisherSource:'https://github.com/AUTOMATIC1111/stable-diffusion-webui',projectStarted:fact('2022 年已有仓库提交','https://github.com/AUTOMATIC1111/stable-diffusion-webui/commit/210449b374d522c94a67fe54289a9eb515933a9f','2022-12-31')},
 fasterwhisper:{kind:'software_library',publisherSource:'https://github.com/SYSTRAN/faster-whisper',projectStarted:fact('2023 年已有仓库提交','https://github.com/SYSTRAN/faster-whisper/commit/44f7e589478866546bfcd1d105e254a74e2caad5','2023-12-14')},
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
/** Stable publisher identity. Do NOT infer one company per product or
 * mistake software libraries for incorporated businesses. The mapping above
 * is reviewed independently; never derive an owner from a product's name. */
export function publisherIdentityFor(productId:string){
 const key=map[productId];
 if(!key)return null;
 const value=parent[key];
 return {id:key,name:COMPANY_PUBLIC_NAMES[key]||key,kind:value.kind,
  officialSource:value.publisherSource};
}

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
  listingSource:evidence?.listing?.source||null,companySource:evidence?.publisherSource||null,
  legalEntity:evidence?.legalEntity?.text||null,legalEntitySource:evidence?.legalEntity?.source||null,
  legalEntityScope:evidence?.legalEntityScope||null,
   creator:key?founderForPublisher(key):null,
  ipoFiling:evidence?.ipoFiling?.text||null,ipoFilingSource:evidence?.ipoFiling?.source||null
 };
}
