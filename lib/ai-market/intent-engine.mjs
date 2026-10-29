// Explainable task discovery. No model-generated assertions or fabricated capability claims.
export const TASKS=Object.freeze({
  'video-subtitles':{keywords:['字幕','subtitles','captions','srt','vtt','подписи','sous-titres','untertitel','subtítulos','자막','字幕生成'],label:'Video subtitles'},
  'video-translate':{keywords:['视频翻译','video translate','dub video','视频配音','翻译视频','dubbing','traduire vidéo'],label:'Translate and dub video'},
  'image-background':{keywords:['抠图','去背景','remove background','background removal','fondo de imagen','背景削除'],label:'Remove image background'},
  'pdf-convert':{keywords:['pdf转','pdf to','转换pdf','convert pdf','pdf转word','pdf to word'],label:'Convert PDF'},
  'image-generate':{keywords:['生成图片','ai图片','generate image','text to image','image generation','图片生成'],label:'Generate images'},
  'code-assistant':{keywords:['写代码','代码助手','debug code','coding assistant','fix bug','编程'],label:'Code assistance'},
  'audio-transcribe':{keywords:['语音转文字','audio to text','transcribe audio','听写','transcription'],label:'Transcribe audio'},
  'research-search':{keywords:['论文搜索','research papers','academic search','科研搜索','找文献'],label:'Research literature'},
  'seo-geo':{keywords:['geo排名','ai搜索可见度','seo','geo visibility','ai citations','ai引用','搜索优化'],label:'AI search visibility'}
});
const fold=s=>s.normalize('NFKC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu,' ').trim();
export function detectIntent(input){
 if(typeof input!=='string'||input.length>500)return {query:'',tasks:[],needsClarification:true};
 const query=fold(input);
 if(!query)return {query,tasks:[],needsClarification:true};
 const tasks=Object.entries(TASKS).map(([id,task])=>{
  const hits=task.keywords.filter(k=>query.includes(fold(k)));
  return {id,label:task.label,confidence:Math.min(1,hits.length*.45),evidence:hits};
 }).filter(x=>x.evidence.length).sort((a,b)=>b.confidence-a.confidence||a.id.localeCompare(b.id));
 return {query,tasks,needsClarification:tasks.length===0};
}
export function validateToolCard(x){
 if(!x||typeof x!=='object'||x.status!=='verified'||typeof x.id!=='string'||!x.id||typeof x.name!=='string'||!x.name)return null;
 if(!Array.isArray(x.capabilities)||!Array.isArray(x.verifiedCapabilities))return null;
 const capabilities=x.capabilities.filter(k=>typeof k==='string'&&x.verifiedCapabilities.includes(k)&&Object.hasOwn(TASKS,k));
 if(!capabilities.length)return null;
 let url;try{url=new URL(x.officialUrl);}catch{return null;}
 if(url.protocol!=='https:'||url.username||url.password)return null;
 const evidence=Array.isArray(x.evidence)?x.evidence.filter(e=>e&&typeof e.url==='string'&&e.verified===true):[];
 if(!evidence.length)return null;
 const pricing=x.pricing&&x.pricing.verified===true?x.pricing:null;
 const access=x.access&&x.access.verified===true?x.access:null;
 return {id:x.id,name:x.name,capabilities,officialUrl:url.href,evidence,pricing,access,sourceStatus:'verified'};
}
export function recommendForQuestion(question,tools,{limit=10}={}){
 if(!Array.isArray(tools)||!Number.isInteger(limit)||limit<1||limit>50)throw Error('INVALID_RECOMMENDATION');
 const intent=detectIntent(question);
 if(!intent.tasks.length)return {intent,results:[],reason:'NO_MATCHED_INTENT'};
 const weight=new Map(intent.tasks.map(t=>[t.id,t.confidence]));
 const results=tools.map(validateToolCard).filter(Boolean).map(tool=>{
  const matches=tool.capabilities.filter(c=>weight.has(c));
  return {tool,matchedTasks:matches,score:matches.reduce((n,c)=>n+weight.get(c),0)};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.tool.name.localeCompare(b.tool.name)).slice(0,limit);
 return {intent,results,reason:results.length?'VERIFIED_CAPABILITY_MATCH':'NO_VERIFIED_TOOL_MATCH'};
}
export function priceDisplay(tool){
 const p=tool?.pricing;
 if(!p||p.verified!==true||!Number.isFinite(p.amount)||p.amount<0||!['USD','CNY'].includes(p.currency)||!p.unit)return {status:'unverified',text:'待核实'};
 return {status:'verified',amount:p.amount,currency:p.currency,unit:p.unit,sourceUrl:p.sourceUrl||null};
}
