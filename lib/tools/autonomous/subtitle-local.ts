
import {subtitleBlocks,rebuildSubtitles} from '../shared/subtitle-document';
type TranslatorInstance={translate:(text:string)=>Promise<string>;destroy?:()=>void};
async function getTranslator(sourceLanguage:string,targetLanguage:string):Promise<TranslatorInstance>{
 const T=(globalThis as unknown as {Translator?:{availability?:(o:any)=>Promise<string>;create:(o:any)=>Promise<TranslatorInstance>}}).Translator;
 if(!T?.create)throw new Error("LOCAL_TRANSLATOR_UNAVAILABLE");
 const opts={sourceLanguage,targetLanguage};
 if(T.availability){const a=await T.availability(opts);if(a==="unavailable")throw new Error("LOCAL_LANGUAGE_PAIR_UNAVAILABLE")}
 return await T.create(opts);
}
export async function translateSubtitleLocal(text:string,targetLanguage:string,sourceLanguage="auto",signal?:AbortSignal){
 signal?.throwIfAborted();
 const blocks=subtitleBlocks(text);
 const translator=await getTranslator(sourceLanguage,targetLanguage);
 try{
  const out=new Map<number,string>();
  for(const [i,block] of blocks.entries()){
   signal?.throwIfAborted();
   if(block.text===null)continue;
   out.set(i,await translator.translate(block.text));
  }
  signal?.throwIfAborted();return rebuildSubtitles(blocks,out);
 }finally{translator.destroy?.()}
}
