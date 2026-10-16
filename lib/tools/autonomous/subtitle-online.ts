import {parseTranslatedSegments} from '@/lib/tools/document-translation-contract';
import {subtitleBlocks,rebuildSubtitles} from '../shared/subtitle-document';
export async function translateSubtitleOnline(text:string,target:string,source:string,signal?:AbortSignal){
 const blocks=subtitleBlocks(text),segments=blocks.flatMap((b,i)=>b.text===null?[]:[{id:'s'+i,text:b.text}]),translated=new Map<number,string>();
 for(let start=0;start<segments.length;){
  let end=start,chars=0;
  while(end<segments.length&&end-start<30&&chars+segments[end].text.length<=8000){chars+=segments[end].text.length;end++}
  if(end===start)throw Error('SUBTITLE_CUE_TOO_LONG');
  const batch=segments.slice(start,end);
  const r=await fetch('/api/tools/document-translate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({source,target,segments:batch}),signal:AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(190000)])});
  if(!r.ok)throw Error(r.status===401?'AUTH_REQUIRED':'SUBTITLE_TRANSLATION_UNAVAILABLE');
  const data=await r.json();
  for(const item of parseTranslatedSegments(JSON.stringify(data.segments),batch))translated.set(Number(item.id.slice(1)),item.text);
  start=end;
 }
 return rebuildSubtitles(blocks,translated);
}
