/** SRT and WebVTT are formatted independently. Never replace punctuation in spoken text. */
export type LocalSegment={start:number;end:number;text:string};

function timestamp(seconds:number,separator:","|"."){
 const ms=Math.max(0,Math.round((Number.isFinite(seconds)?seconds:0)*1000));
 const hour=Math.floor(ms/3600000);
 const minute=Math.floor(ms%3600000/60000);
 const second=Math.floor(ms%60000/1000);
 const millis=ms%1000;
 return `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:${String(second).padStart(2,"0")}${separator}${String(millis).padStart(3,"0")}`;
}

function safeEnd(s:LocalSegment){
 const start=Number.isFinite(s.start)?s.start:0;
 const end=Number.isFinite(s.end)?s.end:start;
 return Math.max(start,end);
}

function validSegments(segments:LocalSegment[]){
 return segments.filter(s=>typeof s.text==="string"&&s.text.trim().length>0);
}

export function toSrt(segments:LocalSegment[]){
 return validSegments(segments).map((s,i)=>`${i+1}\n${timestamp(s.start,",")} --> ${timestamp(safeEnd(s),",")}\n${s.text.trim()}`).join("\n\n");
}

export function toVtt(segments:LocalSegment[]){
 const body=validSegments(segments).map(s=>`${timestamp(s.start,".")} --> ${timestamp(safeEnd(s),".")}\n${s.text.trim()}`).join("\n\n");
 return "WEBVTT\n\n"+body;
}
