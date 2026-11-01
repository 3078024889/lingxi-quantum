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
};
const checked='2026-11-01';
const fact=(text:string,source:string,asOf=checked):EvidenceValue=>({text,source,asOf});
const parent={
 openai:{kind:'company',publisherSource:'https://openai.com/about/',founded:fact('2015','https://openai.com/about/')},
 anthropic:{kind:'company',publisherSource:'https://www.anthropic.com/company',founded:fact('2021','https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai'),headquarters:fact('美国 · 旧金山','https://www.anthropic.com/transparency/voluntary-commitments'),funding:fact('2022年 B 轮融资 5.8 亿美元（历史轮次，非累计融资）','https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai','2022-04-29')},
 google:{kind:'company',publisherSource:'https://about.google/',founded:fact('1998','https://about.google/our-story/'),listing:fact('Alphabet 集团上市公司旗下产品；NASDAQ: GOOGL / GOOG','https://abc.xyz/investor/')},
 alibaba:{kind:'company',publisherSource:'https://www.alibabagroup.com/',founded:fact('1999','https://www.alibabagroup.com/en-US/about-alibaba'),listing:fact('阿里巴巴集团上市公司旗下产品；NYSE: BABA / HKEX: 9988','https://www.alibabagroup.com/en-US/ir')},
 bytedance:{kind:'company',publisherSource:'https://www.bytedance.com/about',founded:fact('2012','https://www.bytedance.com/about'),headquarters:fact('中国 · 北京（公司起源）','https://www.bytedance.com/about')},
 kuaishou:{kind:'company',publisherSource:'https://ir.kuaishou.com/',listing:fact('快手科技旗下产品；港交所 1024.HK，2021年2月5日挂牌','https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishoukejijintianyuxiangganglianjiaosuozhubanguapaishangshi','2021-02-05'),projectStarted:fact('快手最早应用于 2011 年推出','https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishouliangweilianhechuangshirendiaozhengfengong/')},
 luma:{kind:'company',publisherSource:'https://lumalabs.ai/llm-info',founded:fact('2021','https://lumalabs.ai/llm-info'),headquarters:fact('美国 · 加州 Redwood City','https://lumalabs.ai/llm-info')},
 runway:{kind:'company',publisherSource:'https://trust.runwayml.com/',projectStarted:fact('2018年起开展生成式媒体研发','https://trust.runwayml.com/')},
 elevenlabs:{kind:'company',publisherSource:'https://elevenlabs.io/about',founded:fact('2022','https://elevenlabs.io/docs/help-center/other/what-is-eleven-labs')},
 suno:{kind:'company',publisherSource:'https://suno.com/about',founded:fact('2022','https://suno.com/about'),funding:fact('官网公布累计融资超过 7.75 亿美元','https://suno.com/about')},
 replit:{kind:'company',publisherSource:'https://replit.com/about',founded:fact('2016','https://replit.com/news/replit-opens-london-office'),headquarters:fact('美国 · 旧金山','https://replit.com/news/replit-opens-london-office'),funding:fact('2026年3月公布 4 亿美元融资（该轮，不等于累计）','https://replit.com/blog/replit-raises-400-million-dollars','2026-03-11')},
 comfy:{kind:'open_source_project',publisherSource:'https://comfy.org/about/',projectStarted:fact('ComfyUI 开源项目始于 2023 年 1 月','https://comfy.org/about/'),funding:fact('Comfy 团队 2026年4月公告：本轮 3000 万美元，累计 4700 万美元','https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open','2026-04-24')},
 huggingface:{kind:'company',publisherSource:'https://huggingface.co/about'},
 deepseek:{kind:'company',publisherSource:'https://www.deepseek.com/'},
 xai:{kind:'company',publisherSource:'https://x.ai/'},
 perplexity:{kind:'company',publisherSource:'https://www.perplexity.ai/'},
 n8n:{kind:'company',publisherSource:'https://n8n.io/'},
 langchain:{kind:'company',publisherSource:'https://www.langchain.com/'},
 llamaindex:{kind:'company',publisherSource:'https://www.llamaindex.ai/'},
 lovable:{kind:'company',publisherSource:'https://lovable.dev/'},
 midjourney:{kind:'company',publisherSource:'https://www.midjourney.com/'},
 dify:{kind:'company',publisherSource:'https://www.dify.ai/'},
 ollama:{kind:'company',publisherSource:'https://ollama.com/'},
 openwebui:{kind:'open_source_project',publisherSource:'https://github.com/open-webui/open-webui'},
 ggml:{kind:'open_source_project',publisherSource:'https://github.com/ggml-org/llama.cpp'},
 vllm:{kind:'open_source_project',publisherSource:'https://github.com/vllm-project/vllm'},
 automatic1111:{kind:'open_source_project',publisherSource:'https://github.com/AUTOMATIC1111/stable-diffusion-webui'},
 fasterwhisper:{kind:'software_library',publisherSource:'https://github.com/SYSTRAN/faster-whisper'},
};
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
