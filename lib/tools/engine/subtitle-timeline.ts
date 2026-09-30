export type Cue={start:number;end:number;text:string};
export function validateTimeline(cues:Cue[]){
 let last=0;
 for(let i=0;i<cues.length;i++){
  const c=cues[i];
  if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.end<=c.start)return{ok:false,code:"INVALID_CUE",index:i};
  if(c.start<last)return{ok:false,code:"OVERLAP_OR_UNSORTED",index:i};
  if(!c.text.trim())return{ok:false,code:"EMPTY_CUE",index:i};
  last=c.end;
 }
 return{ok:true,code:"OK",count:cues.length};
}
export function shiftTimeline(cues:Cue[],delta:number){return cues.map(c=>({ ...c,start:Math.max(0,c.start+delta),end:Math.max(0,c.end+delta)}));}
