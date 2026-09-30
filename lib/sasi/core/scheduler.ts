export interface ScheduledWork{id:string;projectId:string;taskId:string;notBefore:number;priority:number;attempts:number;maxAttempts:number}
export function nextWork(rows:ScheduledWork[],now=Date.now()){return rows.filter(x=>x.notBefore<=now&&x.attempts<x.maxAttempts).sort((a,b)=>b.priority-a.priority||a.notBefore-b.notBefore)[0]}
export function backoff(attempt:number,baseMs=1000,maxMs=60000){return Math.min(maxMs,baseMs*Math.pow(2,Math.max(0,attempt)))}
