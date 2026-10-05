export type ContextSegment={
 id:string;kind:"goal"|"decision"|"fact"|"artifact"|"todo"|"constraint"|"result";
 text:string;importance:number;createdAt:string;
};
export type ContextBundle={summary:string;segments:ContextSegment[];dropped:number};

export function compactContext(segments:ContextSegment[],maxChars=18000):ContextBundle{
 const pinned=segments.filter(x=>["goal","decision","constraint","todo"].includes(x.kind))
   .sort((a,b)=>b.importance-a.importance||a.createdAt.localeCompare(b.createdAt));
 const rest=segments.filter(x=>!pinned.includes(x))
   .sort((a,b)=>b.importance-a.importance||b.createdAt.localeCompare(a.createdAt));
 const selected:ContextSegment[]=[];let used=0;
 for(const item of [...pinned,...rest]){
  const cost=item.text.length+64;if(used+cost>maxChars)continue;
  selected.push(item);used+=cost;
 }
 const summary=selected.map(x=>`[${x.kind}] ${x.text}`).join("\n");
 return {summary,segments:selected,dropped:Math.max(0,segments.length-selected.length)};
}

export function contextPressure(chars:number,limit=24000){
 const ratio=limit<=0?1:Math.max(0,chars/limit);
 return {ratio,shouldCompact:ratio>=.72,critical:ratio>=.90};
}
