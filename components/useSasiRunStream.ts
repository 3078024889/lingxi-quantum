"use client";
import{useEffect,useRef,useState}from"react";
import type{PublicRunEvent}from"@/lib/sasi/durable/public-event-codec";

export function useSasiRunStream(runId:string|null|undefined){
 const[events,setEvents]=useState<PublicRunEvent[]>([]);
 const[state,setState]=useState<string>("idle");
 const[lastEventId,setLastEventId]=useState(0);
 const seen=useRef(new Set<number>());

 useEffect(()=>{
  if(!runId){setEvents([]);setState("idle");setLastEventId(0);seen.current.clear();return}
  let active=true,source:EventSource|null=null;

  const add=(event:PublicRunEvent)=>{
   if(!active||seen.current.has(event.id))return;
   seen.current.add(event.id);setLastEventId(x=>Math.max(x,event.id));
   setEvents(rows=>[...rows,event].slice(-200));
   if(event.kind==="RUN_COMPLETED")setState("succeeded");
   else if(event.kind==="RUN_FAILED")setState("failed");
   else if(event.kind==="RUN_WAITING"||event.kind==="APPROVAL_REQUIRED")setState("waiting");
   else setState("running");
  };

  const openSource=(after:number)=>{
   if(!active||source)return;
   const suffix=after>0?`?after=${encodeURIComponent(String(after))}`:"";
   source=new EventSource(`/api/sasi/runs/${encodeURIComponent(runId)}/events${suffix}`);
   const kinds=["RUN_STARTED","STEP_STARTED","STEP_FINISHED","TEXT_DELTA","STATE_SNAPSHOT","ARTIFACT_CREATED","APPROVAL_REQUIRED","RUN_WAITING","RUN_RESUMED","RUN_COMPLETED","RUN_FAILED"];
   for(const kind of kinds)source.addEventListener(kind,(e:MessageEvent)=>{
    try{add(JSON.parse(e.data) as PublicRunEvent)}catch{}
   });
  };

  void fetch(`/api/sasi/runs/${encodeURIComponent(runId)}/snapshot`,{cache:"no-store"})
   .then(async r=>r.ok?r.json():null)
   .then(body=>{
    if(!active||!body){openSource(0);return}
    setState(String(body.state||"running"));
    for(const event of Array.isArray(body.events)?body.events:[])add(event as PublicRunEvent);
    const after=Number(body.lastEventId||0);
    openSource(Number.isFinite(after)&&after>0?Math.floor(after):0);
   }).catch(()=>openSource(0));

  return()=>{active=false;source?.close()};
 },[runId]);

 return{events,state,lastEventId};
}
