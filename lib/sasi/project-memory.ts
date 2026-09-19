/** Project-owned memory events; content is user data, never system authority. */
export const MEMORY_NODE_TYPE = "project_memory_v1";
export const MEMORY_KINDS = ["goal", "decision", "constraint", "character", "experience"] as const;
export type MemoryKind = typeof MEMORY_KINDS[number];
export type MemoryEvent = {id:string;kind:MemoryKind;text:string;subject:string;supersedes:string|null;createdAt:string};
export const MEMORY_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseMemory(value: Record<string,unknown>) {
  const text=typeof value.text==="string"?value.text.trim():"";
  const subject=typeof value.subject==="string"?value.subject.trim():"";
  if(!MEMORY_KINDS.includes(value.kind as MemoryKind)||text.length<2||text.length>2000||subject.length>80) return null;
  if(value.supersedes!=null && (typeof value.supersedes!=="string"||!MEMORY_UUID.test(value.supersedes))) return null;
  return {kind:value.kind as MemoryKind,text,subject,supersedes:typeof value.supersedes==="string"?value.supersedes:null};
}

export function activeMemories(events:MemoryEvent[]) {
  const replaced=new Set(events.flatMap(e=>e.supersedes?[e.supersedes]:[]));
  return events.filter(e=>!replaced.has(e.id)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
}

export function memoryFamily(events:MemoryEvent[],id:string) {
  const ids=new Set([id]);let changed=true;
  while(changed){changed=false;for(const e of events){if(e.supersedes&&(ids.has(e.id)||ids.has(e.supersedes))){if(!ids.has(e.id)||!ids.has(e.supersedes))changed=true;ids.add(e.id);ids.add(e.supersedes);}}}
  return [...ids];
}

/** Multiple independent branches are required; a keyword match is not proof. */
export function continuityEvidence(branches:{identity:boolean;priorState:boolean;currentEvent:boolean}) {
  return {ready:branches.identity&&branches.priorState&&branches.currentEvent,missing:Object.entries(branches).filter(([,v])=>!v).map(([key])=>key)};
}
