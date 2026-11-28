import {subtitleBlocks,rebuildSubtitles} from '../shared/subtitle-document';
import {createLocalTranslator,translateWithGlossary} from './translation-local';
export async function translateSubtitleLocal(text:string,targetLanguage:string,sourceLanguage="auto",signal?:AbortSignal){
 signal?.throwIfAborted();
 const blocks=subtitleBlocks(text);
 const translator=await createLocalTranslator(sourceLanguage,targetLanguage,blocks.map(x=>x.text||'').join(' '),{signal});
 try{
  const out=new Map<number,string>();
  for(const [i,block] of blocks.entries()){
   signal?.throwIfAborted();
   if(block.text===null)continue;
   out.set(i,await translateWithGlossary(translator,block.text,[]));
  }
  signal?.throwIfAborted();return rebuildSubtitles(blocks,out);
 }finally{translator.destroy?.()}
}
