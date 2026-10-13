export function conversationHistory(turns:Array<{question:string;answer?:string}>,budget=48000){
 const all=turns.slice(-12).flatMap(turn=>[{role:'user' as const,content:turn.question},...(turn.answer?[{role:'assistant' as const,content:turn.answer}]:[])]);
 const selected:Array<{role:'user'|'assistant';content:string}>=[];let remaining=budget;
 for(const message of all.reverse()){
  if(remaining<=0)break;
  const content=message.content.slice(0,Math.min(32768,remaining));remaining-=content.length;selected.unshift({...message,content});
 }
 return selected;
}
