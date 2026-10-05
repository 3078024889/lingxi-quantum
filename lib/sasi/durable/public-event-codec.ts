export type PublicRunEventKind=
 "RUN_STARTED"|"STEP_STARTED"|"STEP_FINISHED"|"TEXT_DELTA"|"STATE_SNAPSHOT"|
 "ARTIFACT_CREATED"|"APPROVAL_REQUIRED"|"RUN_WAITING"|"RUN_RESUMED"|
 "RUN_COMPLETED"|"RUN_FAILED";

export type PublicRunEvent={
 id:number;
 runId:string;
 kind:PublicRunEventKind;
 step:string|null;
 at:string;
 data:Record<string,unknown>;
};

const KINDS=new Set<PublicRunEventKind>([
 "RUN_STARTED","STEP_STARTED","STEP_FINISHED","TEXT_DELTA","STATE_SNAPSHOT",
 "ARTIFACT_CREATED","APPROVAL_REQUIRED","RUN_WAITING","RUN_RESUMED",
 "RUN_COMPLETED","RUN_FAILED"
]);

const PUBLIC_DATA_KEYS=new Set([
 "label","state","attempt","recoverable","artifactId","versionId","artifactKind",
 "approvalId","summary","reason","progress","text","resultRef"
]);

export function normalizePublicKind(value:unknown):PublicRunEventKind|null{
 const raw=String(value||"").toUpperCase().replaceAll(".","_").replaceAll("-","_");
 if(KINDS.has(raw as PublicRunEventKind))return raw as PublicRunEventKind;
 if(raw==="ATTEMPT_COMPLETED")return "STEP_FINISHED";
 if(raw==="ATTEMPT_FAILED")return "RUN_FAILED";
 if(raw==="CHECKPOINT")return "STATE_SNAPSHOT";
 return null;
}

export function sanitizeEventData(value:unknown):Record<string,unknown>{
 const source=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
 const out:Record<string,unknown>={};
 for(const [key,v] of Object.entries(source)){
  if(!PUBLIC_DATA_KEYS.has(key))continue;
  if(v==null||typeof v==="string"||typeof v==="number"||typeof v==="boolean")out[key]=v;
 }
 return out;
}

export function toPublicRunEvent(row:Record<string,unknown>):PublicRunEvent|null{
 const kind=normalizePublicKind(row.kind);
 if(!kind)return null;
 const id=Number(row.id);
 const runId=String(row.run_id||"");
 if(!Number.isFinite(id)||id<1||!runId)return null;
 const metadata=sanitizeEventData(row.metadata);
 return {
  id,runId,kind,
  step:row.step?String(row.step):null,
  at:String(row.created_at||new Date(0).toISOString()),
  data:metadata
 };
}

export function encodeSse(event:PublicRunEvent){
 return `id: ${event.id}\nevent: ${event.kind}\ndata: ${JSON.stringify(event)}\n\n`;
}

export function encodeHeartbeat(at=new Date().toISOString()){
 return `event: ping\ndata: ${JSON.stringify({at})}\n\n`;
}
