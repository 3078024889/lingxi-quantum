// Original glue code inspired by open-source timed-caption workflows.
// Does not copy or bundle any external model implementation.
export type IntegrityCue={start:number;end:number;text:string};
/** Require exactly one translated result for each ASR segment. */
export function extractExactTranslatedCues(reply:string,firstIndex:number,count:number):string[]|null{
 if(typeof reply!=="string"||reply.length>100000||!Number.isSafeInteger(firstIndex)||!Number.isSafeInteger(count)||count<1||count>24)return null;
 const marker=/⟦LX(\d{4})⟧/g,marks=[...reply.matchAll(marker)];
 if(marks.length!==count||!marks.length||reply.slice(0,marks[0].index).trim())return null;
 const values=new Map<number,string>();
 for(let i=0;i<marks.length;i++){
  const start=marks[i].index!+marks[i][0].length;
  const end=i+1<marks.length?marks[i+1].index!:reply.length;
  const id=Number(marks[i][1]),text=reply.slice(start,end).trim();
  if(id<firstIndex||id>=firstIndex+count||values.has(id)||!text||text.length>12000||text.includes("\uFFFD"))return null;
  values.set(id,text);
 }
 if(values.size!==count)return null;
 return Array.from({length:count},(_,i)=>values.get(firstIndex+i)!).every(Boolean)
  ?Array.from({length:count},(_,i)=>values.get(firstIndex+i)!)
  :null;
}
/** Never fabricate timing outside the real video duration. */
export function requireCuesWithinVideo(segments:IntegrityCue[],duration:number):IntegrityCue[]{
 if(!Array.isArray(segments)||!segments.length||!Number.isFinite(duration)||duration<=0)throw Error("VIDEO_TIMELINE_UNVERIFIED");
 const tolerance=Math.min(2,Math.max(.5,duration*.02));
 let previousStart=-1;
 return segments.map(x=>{
  if(!x||!Number.isFinite(x.start)||!Number.isFinite(x.end)||x.start<0||
     x.start+.001<previousStart||x.end<=x.start||x.end>duration+tolerance||
     typeof x.text!=="string"||!x.text.trim()||x.text.includes("\uFFFD"))throw Error("VIDEO_TIMELINE_INVALID");
  previousStart=x.start;
  return {start:x.start,end:x.end,text:x.text.trim()};
 });
}
/** Bilingual cue carries source and translated text at identical ASR timestamps. */
export function pairBilingualCues(source:IntegrityCue[],translated:IntegrityCue[]):IntegrityCue[]{
 if(!Array.isArray(source)||!Array.isArray(translated)||!source.length||source.length!==translated.length)throw Error("BILINGUAL_CUES_MISMATCH");
 return source.map((x,i)=>{
  const y=translated[i];
  if(!y||Math.abs(x.start-y.start)>.001||Math.abs(x.end-y.end)>.001||!x.text.trim()||!y.text.trim())
   throw Error("BILINGUAL_TIMELINE_MISMATCH");
  return {start:x.start,end:x.end,text:x.text.trim()+"\n"+y.text.trim()};
 });
}
