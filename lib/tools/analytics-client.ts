function sessionId(){
  if(typeof window==="undefined")return "";
  const key="lx-tool-session";
  let id=sessionStorage.getItem(key);
  if(!id){
    id=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key,id);
  }
  return id;
}

export function trackToolEvent(
  eventType:"tool_open"|"file_selected"|"process_started"|"process_completed"|"process_failed"|"export_clicked"|"export_paid"|"tool_search",
  toolId:string,
  metadata:Record<string,unknown>={}
){
  if(typeof window==="undefined")return;
  const body=JSON.stringify({eventType,toolId,sessionId:sessionId(),metadata});
  try{
    if(navigator.sendBeacon){
      navigator.sendBeacon("/api/tools/analytics/track",new Blob([body],{type:"application/json"}));
      return;
    }
  }catch{}
  fetch("/api/tools/analytics/track",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}).catch(()=>{});
}
