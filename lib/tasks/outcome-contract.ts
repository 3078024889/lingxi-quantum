export type UnifiedOutcomeEvidence={
 kind:"artifact"|"text";
 nonEmpty?:boolean;
 outputBytes?:number;
 inputBytes?:number;
 confidence?:number;
 pages?:number;
 duration?:number;
 text?:string;
 minChars?:number;
 mustContain?:string[];
 forbid?:string[];
};

export type UnifiedOutcomeVerdict={
 pass:boolean;
 score:number;
 reasons:string[];
 retryable:boolean;
};

export function verifyUnifiedOutcome(e:UnifiedOutcomeEvidence):UnifiedOutcomeVerdict{
 const reasons:string[]=[];
 if(e.kind==="artifact"){
  if(e.nonEmpty===false)reasons.push("EMPTY_RESULT");
  if(e.outputBytes!=null&&(!Number.isFinite(e.outputBytes)||e.outputBytes<=0))reasons.push("EMPTY_FILE");
  if(e.confidence!=null&&(e.confidence<0||e.confidence>1))reasons.push("INVALID_CONFIDENCE");
  if(e.pages!=null&&e.pages<1)reasons.push("NO_PAGES");
  if(e.duration!=null&&e.duration<=0)reasons.push("NO_MEDIA_DURATION");
 }else{
  const text=String(e.text||"").trim(),min=Math.max(1,Number(e.minChars||24));
  if(text.length<min)reasons.push("TOO_SHORT");
  for(const x of e.mustContain||[])if(x&&!text.includes(x))reasons.push(`MISSING:${x}`);
  for(const x of e.forbid||[])if(x&&text.includes(x))reasons.push(`FORBIDDEN:${x}`);
 }
 const penalty=e.kind==="text"?.25:.2;
 const score=Math.max(0,1-reasons.length*penalty);
 const retryable=reasons.some(x=>x==="TOO_SHORT"||x.startsWith("MISSING:")||x==="EMPTY_RESULT"||x==="EMPTY_FILE"||x==="NO_PAGES"||x==="NO_MEDIA_DURATION");
 return{pass:reasons.length===0,score,reasons,retryable};
}

export function outcomeCompressionImproved(inputBytes:number,outputBytes:number){
 return Number.isFinite(inputBytes)&&Number.isFinite(outputBytes)&&inputBytes>0&&outputBytes>0&&outputBytes<inputBytes;
}
