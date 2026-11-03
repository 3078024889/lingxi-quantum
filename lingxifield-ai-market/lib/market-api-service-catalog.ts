import {API_RATES,VIDEO_RATES} from './market-rate-catalog';
import {researchedFact} from './market-researched-facts';

/** Billing categories: a web subscription is NEVER assumed to cover developer API use. */
export type ApiBillingKind='token'|'time'|'characters'|'plan'|'self-hosted'|'separate'|'no-published-api';
export type ApiUnitRate={id:string;platform:string;name:string;unit:string;price:number;currency:'USD'|'CNY';source:string;checkedAt:string;note:string};
export const API_UNIT_RATES:readonly ApiUnitRate[]=[
 {id:'11labs-v3-tts',platform:'elevenlabs',name:'Eleven v3 text-to-speech',unit:'1000 characters',price:0.10,currency:'USD',source:'https://elevenlabs.io/pricing/api',checkedAt:'2026-10-31',note:'Developer API; character rate, not token price.'},
 {id:'11labs-flash-tts',platform:'elevenlabs',name:'Flash/Turbo text-to-speech',unit:'1000 characters',price:0.05,currency:'USD',source:'https://elevenlabs.io/pricing/api',checkedAt:'2026-10-31',note:'Developer API; model-specific character rate.'},
 {id:'11labs-scribe2',platform:'elevenlabs',name:'Scribe v2 speech-to-text',unit:'audio hour',price:0.22,currency:'USD',source:'https://elevenlabs.io/pricing/api',checkedAt:'2026-10-31',note:'Audio transcription by source duration.'},
 {id:'11labs-scribe-realtime',platform:'elevenlabs',name:'Scribe v2 Realtime',unit:'audio hour',price:0.39,currency:'USD',source:'https://elevenlabs.io/pricing/api',checkedAt:'2026-10-31',note:'Live transcription by source duration.'},
 {id:'11labs-music',platform:'elevenlabs',name:'Eleven Music',unit:'generated minute',price:0.15,currency:'USD',source:'https://elevenlabs.io/pricing/api',checkedAt:'2026-10-31',note:'Music generation by produced audio minutes.'},
 {id:'openai-transcribe',platform:'chatgpt',name:'OpenAI gpt-transcribe',unit:'audio minute',price:0.0045,currency:'USD',source:'https://developers.openai.com/api/docs/pricing',checkedAt:'2026-10-31',note:'Separate transcription API, not a ChatGPT subscription feature.'},
 {id:'openai-transcribe-sdk',platform:'openai-python',name:'OpenAI gpt-transcribe via Python SDK',unit:'audio minute',price:0.0045,currency:'USD',source:'https://developers.openai.com/api/docs/pricing',checkedAt:'2026-10-31',note:'Free SDK library, metered OpenAI API use.'},
 {id:'openai-mini-transcribe',platform:'chatgpt',name:'OpenAI gpt-4o-mini-transcribe',unit:'audio minute',price:0.003,currency:'USD',source:'https://developers.openai.com/api/docs/pricing',checkedAt:'2026-10-31',note:'Official approximate transcription cost/minute.'},
];
const LOCAL=new Set(['ollama','llamacpp','vllm','langchain','llamaindex','transformers','comfyui','automatic1111','whisper','fasterwhisper','openwebui','dify','n8n']);
const SDK=new Set(['openai-python','anthropic-sdk-python']);
const SUBSCRIPTION_WEB=new Set(['suno','midjourney','jimeng','lovable','replit']);
const API_SERVICE=new Set(['deepseek','chatgpt','claude','gemini','grok','qwen','perplexity','elevenlabs','doubao','kling','runway','luma']);
const ALL=['chatgpt','claude','gemini','grok','perplexity','deepseek','qwen','doubao','jimeng','kling','runway','luma','midjourney','suno','elevenlabs','lovable','replit','ollama','llamacpp','vllm','langchain','llamaindex','transformers','comfyui','automatic1111','whisper','fasterwhisper','openwebui','dify','n8n','openai-python','anthropic-sdk-python'] as const;
export const MARKET_API_PRODUCTS:readonly string[]=ALL;
export type ApiServiceOffer={platform:string;kind:ApiBillingKind;descriptionZh:string;descriptionEn:string;subscriptionZh:string|null;subscriptionSource:string|null;tokenRates:typeof API_RATES;unitRates:readonly ApiUnitRate[];videoRates:typeof VIDEO_RATES;source:string|null;checkedAt:string};
export function apiServiceOffer(platform:string):ApiServiceOffer{
 const facts=researchedFact(platform),tokenRates=API_RATES.filter(r=>r.platform===platform);
 const unitRates=API_UNIT_RATES.filter(r=>r.platform===platform);
 const videoRates=VIDEO_RATES.filter(r=>r.platform===platform&&r.region==='API'&&(r.billing==='per-second'||r.billing==='token-only'));
 const local=LOCAL.has(platform),sdk=SDK.has(platform),webPlan=SUBSCRIPTION_WEB.has(platform);
 const hasNumeric=tokenRates.length+unitRates.length+videoRates.length>0;
 const kind:ApiBillingKind=local?'self-hosted':hasNumeric?tokenRates.length?'token':unitRates.length?'characters':'time':sdk?'separate':webPlan?'plan':API_SERVICE.has(platform)?'separate':'no-published-api';
 const notes:Record<ApiBillingKind,[string,string]>={
 token:['API 按模型的每百万输入与输出 Token 分开计费；缓存、工具、地区、长上下文另计。','API input and output tokens billed separately per model; caching, tools, region and context may cost extra.'],
 time:['视频或音频 API 按秒/分钟等指定单位计费，不能换算成文字 Token。','Video/audio API charged per declared unit, not text tokens.'],
 characters:['语音 API 以字符、音频分钟或小时计费，与会员积分不是同一单位。','Speech API billed per character or audio duration; distinct from subscription credits.'],
 plan:['目前列出的主要为网页会员或创作套餐价，不将其冒充独立 API 每次调用价。','Listed amount is a web/creator subscription, not a standalone developer API call price.'],
 'self-hosted':['核心开源工具在自有设备上无厂商按次调用费；GPU、云主机和第三方模型 API 成本由使用方式决定。','Self-hosted core has no vendor fee per request; GPU, hosting and connected model APIs cost separately.'],
 separate:['开发者服务独立于网页会员计费；有公开单价的模型列在下方，其他独立接口不按会员费折算。','Developer APIs are billed separately from web subscriptions; priced endpoints shown below.'],
 'no-published-api':['暂未收录官方标准开发者 API 计费产品；列出已核实的会员价和官方产品入口。','No separately priced public developer API SKU recorded; show verified plans and product access instead.']
 };
 let kind2=kind;
 if(kind==='time'&&unitRates.length)kind2='characters';
 const note=notes[kind2];
 return {platform,kind:kind2,descriptionZh:note[0],descriptionEn:note[1],subscriptionZh:facts?.price||null,subscriptionSource:facts?.priceSource||null,
 tokenRates,unitRates,videoRates,source:tokenRates[0]?.source||unitRates[0]?.source||videoRates[0]?.source||facts?.priceSource||null,checkedAt:'2026-10-31'};
}
