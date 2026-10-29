export type TimedTranslation={start:number;end:number;text:string};
type Translate=(text:string)=>Promise<string>;

// Keep cue identity separate from translated prose. A missing, duplicated or
// empty cue retries individually; source text must never fill a missing result.
export async function translateTimedText<T extends TimedTranslation>(input:T[],source:string,target:string,translate:Translate):Promise<T[]>{
 if(!input.length||input.some(cue=>!cue.text.trim()))throw Error('TRANSCRIPT_EMPTY');
 if(source===target)return input.map(cue=>({...cue}));
 const output:T[]=[];
 for(let base=0;base<input.length;){
  const group:T[]=[];let size=0;
  while(base+group.length<input.length&&group.length<24){
   const cue=input[base+group.length];
   if(cue.text.length>28000)throw Error('TRANSLATION_TEXT_TOO_LONG');
   if(group.length&&size+cue.text.length+32>28000)break;
   group.push(cue);size+=cue.text.length+32;
  }
  const marker=(index:number)=>`⟦LX${index}⟧`;
  const translated=await translate(group.map((cue,index)=>`${marker(base+index)} ${cue.text}`).join('\n'));
  const map=new Map<number,string>();let valid=true;
  const pattern=/⟦LX(\d+)⟧\s*([\s\S]*?)(?=⟦LX\d+⟧|$)/g;
  for(const match of translated.matchAll(pattern)){
   const index=Number(match[1]),text=match[2].trim();
   if(index<base||index>=base+group.length||map.has(index)||!text){valid=false;break}
   map.set(index,text);
  }
  if(map.size!==group.length)valid=false;
  for(let index=0;index<group.length;index++){
   const text=valid?map.get(base+index)!:(await translate(group[index].text)).trim();
   if(!text||text.includes('\uFFFD'))throw Error('TRANSLATION_INCOMPLETE');
   output.push({...group[index],text});
  }
  base+=group.length;
 }
 return output;
}
