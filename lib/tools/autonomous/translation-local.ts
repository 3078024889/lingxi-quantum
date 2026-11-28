/** Device-only translation. Model downloads contain no document text. */
export type LocalTranslationOptions={signal?:AbortSignal;onProgress?:(message:string)=>void};
type Engine={translate(text:string):Promise<string>;destroy?():void};
/** Release the UI even when a browser/model promise ignores cancellation. */
export function awaitLocalOperation<T>(operation:Promise<T>,signal?:AbortSignal,timeoutMs=120_000):Promise<T>{
 signal?.throwIfAborted();
 return new Promise((resolve,reject)=>{
  const done=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort)};
  const abort=()=>{done();reject(signal?.reason||new Error('LOCAL_TRANSLATION_CANCELLED'))};
  const timer=setTimeout(()=>{done();reject(new Error('LOCAL_TRANSLATION_TIMEOUT'))},timeoutMs);
  signal?.addEventListener('abort',abort,{once:true});
  operation.then(value=>{done();resolve(value)},error=>{done();reject(error)});
 });
}

function guardedEngine(engine:Engine,target:string,options:LocalTranslationOptions):Engine{
 return {
  async translate(text){
   const output:string[]=[];
   // Keep clauses short for both browser and downloadable models. A nonempty
   // answer to one long paragraph is not proof that every sentence was translated.
   for(const part of splitTranslationText(text)){
    options.signal?.throwIfAborted();
    if(!part.trim()){output.push(part);continue}
    const translated=await awaitLocalOperation(engine.translate(part),options.signal);
    if(!translated?.trim()||translated.includes('\uFFFD'))throw Error('LOCAL_TRANSLATION_INCOMPLETE');
    output.push(translated);
   }
   return output.join(target==='zh'?'':' ');
  },
  destroy:()=>engine.destroy?.(),
 };
}
const currencyCodes:Record<string,string>={美元:'USD',人民币:'CNY',元:'CNY',欧元:'EUR',英镑:'GBP',日元:'JPY'};
export async function translateWithGlossary(engine:Engine,text:string,glossary:{source:string;target:string}[]){
 // Keep explicit monetary units literal: small local models can turn 元 into $.
 // ISO codes are unambiguous and do not imply currency conversion.
 const money=Array.from(text.matchAll(/(?:人民币\s*)?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*(美元|人民币|元|欧元|英镑|日元)/gu),match=>({
  source:match[0],target:`${match[1]} ${currencyCodes[match[2]]}`,
 }));
 const terms=[...money,...glossary.filter(term=>!money.some(amount=>term.source.includes(amount.source)))].filter(term=>term.source&&text.includes(term.source)).sort((a,b)=>b.source.length-a.source.length);
 if(!terms.length)return engine.translate(text);
 const escape=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp(terms.map(term=>escape(term.source)).join('|'),'gu');
 const parts:string[]=[];let start=0;
 for(const match of text.matchAll(pattern)){
  const before=text.slice(start,match.index);
  if(before.trim())parts.push(await engine.translate(before));else parts.push(before);
  parts.push(terms.find(term=>term.source===match[0])!.target);
  start=match.index!+match[0].length;
 }
 const last=text.slice(start);parts.push(last.trim()?await engine.translate(last):last);
 return parts.join(' ');
}
type NativeFactory={availability?:(options:unknown)=>Promise<string>;create(options:unknown):Promise<Engine>};
const models:Record<string,string>={
 'zh:en':'onnx-community/opus-mt-zh-en',
 'en:zh':'Xenova/opus-mt-en-zh',
};
const revisions:Record<string,string>={
 'onnx-community/opus-mt-zh-en':'8e3032ebeebbacda779fe95efa64c03b962f83f3',
 'Xenova/opus-mt-en-zh':'046f55aec303cdee3e0318604406d4df20f1e8ea',
};
let cachedModel:{id:string;pipe:any}|undefined;
let modelQueue:Promise<unknown>=Promise.resolve();

export function splitTranslationText(text:string,limit=180):string[]{
 if(!Number.isInteger(limit)||limit<1)throw Error('LOCAL_TRANSLATION_LIMIT_INVALID');
 const chunks:string[]=[];let current='';
 for(const part of text.split(/(?<=[。！？.!?;；\n])/u)){
  for(const character of Array.from(part)){
   current+=character;
   if(Array.from(current).length>=limit){chunks.push(current);current=''}
  }
  if(current&&/[。！？.!?;；\n]$/u.test(current)){chunks.push(current);current=''}
 }
 if(current)chunks.push(current);
 return chunks;
}

async function detectSource(text:string,signal?:AbortSignal){
 signal?.throwIfAborted();
 // Recognize unambiguous scripts without waiting for a browser model download.
 if(/[\u3040-\u30ff]/u.test(text))return 'ja';
 if(/[\uac00-\ud7af]/u.test(text))return 'ko';
 if(/[\u4e00-\u9fff]/u.test(text))return 'zh';
 if(/[\u0600-\u06ff]/u.test(text))return 'ar';
 const detector=(globalThis as any).LanguageDetector;
 if(detector?.create&&await detector.availability?.()==='available'){
  const instance=await detector.create({signal});
  try{signal?.throwIfAborted();const result=await instance.detect(text,{signal});signal?.throwIfAborted();if(result?.[0]?.confidence>=.7)return String(result[0].detectedLanguage).split('-')[0]}
  finally{instance.destroy?.()}
 }
 // Script detection is safe for these scripts. Latin languages require an
 // explicit choice rather than silently assuming all Latin text is English.
 throw Error('LOCAL_SOURCE_LANGUAGE_REQUIRED');
}

async function onnxTranslate(text:string,source:string,target:string,options:LocalTranslationOptions){
 const id=models[`${source}:${target}`];
 if(!id)throw Error('LOCAL_LANGUAGE_UNSUPPORTED');
 const run=async()=>{
  options.signal?.throwIfAborted();
  if(cachedModel?.id!==id){
   options.onProgress?.('正在准备本地语言包，首次使用需要下载…');
   const mod:any=await import('@huggingface/transformers');
   mod.env.allowLocalModels=true;mod.env.allowRemoteModels=true;
   mod.env.localModelPath='/models/';mod.env.useBrowserCache=true;
   if(mod.env.backends?.onnx?.wasm)mod.env.backends.onnx.wasm.numThreads=1;
   await cachedModel?.pipe.dispose?.();cachedModel=undefined;
   const pipe=await mod.pipeline('translation',id,{device:'wasm',dtype:'q8',revision:revisions[id],progress_callback:(event:any)=>{
    if(options.signal?.aborted)return;
    if(typeof event.progress==='number')options.onProgress?.(event.progress>=100?'这部分语言包已下载，正在准备翻译…':`正在下载语言包 ${Math.round(event.progress)}%`);
   }});
   cachedModel={id,pipe};
   options.onProgress?.('语言包已就绪，正在翻译…');
  }
  const translated:string[]=[];
  for(const piece of splitTranslationText(text)){
   options.signal?.throwIfAborted();
   if(!piece.trim()){translated.push(piece);continue}
   const result=await cachedModel!.pipe(piece,{max_new_tokens:512,num_beams:4});
   options.signal?.throwIfAborted();
   const answer=result?.[0]?.translation_text;
   if(typeof answer!=='string'||!answer.trim()||answer.includes('\uFFFD'))throw Error('LOCAL_TRANSLATION_INCOMPLETE');
   translated.push(answer);
  }
  return translated.join(target==='zh'?'':' ');
 };
 const result=modelQueue.then(run,run);modelQueue=result.catch(()=>{});return result;
}

export async function createLocalTranslator(source:string,target:string,sample:string,options:LocalTranslationOptions={}):Promise<Engine>{
 const from=source==='auto'?await detectSource(sample,options.signal):source;
 options.signal?.throwIfAborted();
 if(from===target)return {translate:async text=>text};
 const native=(globalThis as unknown as {Translator?:NativeFactory}).Translator;
 if(native?.create){
  options.onProgress?.('正在检查本机语言包…');
  const controller=new AbortController();
  const abort=()=>controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort',abort,{once:true});
  const config={sourceLanguage:from,targetLanguage:target,signal:controller.signal,monitor:(monitor:any)=>monitor.addEventListener('downloadprogress',(event:any)=>{
   if(controller.signal.aborted)return;
   const progress=Math.min(100,Math.round((event.loaded||0)*100));
   options.onProgress?.(progress>=100?'语言包已下载，正在准备翻译…':`正在准备本地语言包 ${progress}%`);
  })};
  try{
   if(await awaitLocalOperation(Promise.resolve(native.availability?.(config)),options.signal,15_000)!=='unavailable'){
    const pending=native.create(config);
    // Some implementations resolve after abort. Do not retain that instance.
    void pending.then(engine=>{if(controller.signal.aborted)engine.destroy?.()},()=>{});
    const engine=await awaitLocalOperation(pending,options.signal,180_000);
    options.onProgress?.('语言包已就绪，正在翻译…');
    const guarded=guardedEngine(engine,target,options);
    return {...guarded,destroy:()=>{options.signal?.removeEventListener('abort',abort);controller.abort();engine.destroy?.()}};
   }
  }catch(error){controller.abort();options.signal?.removeEventListener('abort',abort);options.signal?.throwIfAborted();if(!models[`${from}:${target}`])throw error}
  options.signal?.removeEventListener('abort',abort);
  controller.abort();
 }
 const controller=new AbortController();
 const abort=()=>controller.abort(options.signal?.reason);
 options.signal?.addEventListener('abort',abort,{once:true});
 return {
  async translate(text){
   try{return await awaitLocalOperation(onnxTranslate(text,from,target,{...options,signal:controller.signal}),controller.signal,300_000)}
   catch(error){controller.abort();throw error}
  },
  destroy(){options.signal?.removeEventListener('abort',abort);controller.abort()},
 };
}

export async function translateTextLocal(text:string,source:string,target:string,options:LocalTranslationOptions={}){
 const engine=await createLocalTranslator(source,target,text,options);
 try{options.signal?.throwIfAborted();const result=await engine.translate(text);options.signal?.throwIfAborted();return result}
 finally{engine.destroy?.()}
}
