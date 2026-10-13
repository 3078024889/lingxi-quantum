export type ConversationDraft={threadId:string;turns:Array<{question:string;answer?:string}>;prompt:string;queued?:string[];pending:Array<{threadId:string;requestId:string;question:string;answer:string}>};
const prefix='lx-sasi-conversation-v78:';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function boundedDraft(value:any,threadId:string):ConversationDraft|null{
 if(!value||value.threadId!==threadId||!uuid.test(threadId)||!Array.isArray(value.turns)||!Array.isArray(value.pending))return null;
 const turns=value.turns.slice(-40).filter((row:any)=>row&&typeof row.question==='string'&&row.question.length<=12000&&(!row.answer||(typeof row.answer==='string'&&row.answer.length<=32768))).map((row:any)=>({question:row.question,...(typeof row.answer==='string'?{answer:row.answer}:{})}));
 const pending=value.pending.slice(-40).filter((row:any)=>row&&row.threadId===threadId&&uuid.test(row.requestId)&&typeof row.question==='string'&&row.question.length<=12000&&typeof row.answer==='string'&&row.answer.length<=32768).map((row:any)=>({threadId,requestId:row.requestId,question:row.question,answer:row.answer}));
 return {threadId,turns,pending,prompt:typeof value.prompt==='string'?value.prompt.slice(0,12000):'',queued:Array.isArray(value.queued)?value.queued.filter((text:any)=>typeof text==='string'&&text.trim()&&text.length<=12000).slice(0,10):[]};
}
export function readConversationDraft(ownerId:string,threadId:string):ConversationDraft|null{
 if(!uuid.test(ownerId)||!uuid.test(threadId))return null;
 try{const raw=localStorage.getItem(prefix+ownerId+':'+threadId);if(!raw||raw.length>2*1024*1024)return null;return boundedDraft(JSON.parse(raw),threadId)}catch{return null}
}
export function writeConversationDraft(ownerId:string,draft:ConversationDraft){
 if(!uuid.test(ownerId))return;
 const bounded=boundedDraft(draft,draft.threadId);if(!bounded)return;
 try{const raw=JSON.stringify(bounded);if(raw.length>2*1024*1024)return;localStorage.setItem(prefix+ownerId+':'+draft.threadId,raw);localStorage.setItem(prefix+ownerId+':active',draft.threadId)}catch{/* Server history remains authoritative; quota failures must not erase the current dialogue. */}
}
export function activeConversationDraft(ownerId:string){try{const value=localStorage.getItem(prefix+ownerId+':active')||'';return uuid.test(ownerId)&&uuid.test(value)?value:''}catch{return''}}
export function clearActiveConversationDraft(ownerId:string){try{localStorage.removeItem(prefix+ownerId+':active')}catch{}}
