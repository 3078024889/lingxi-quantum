/** Best-effort usage telemetry must never interrupt a local tool or file delivery. */
export function trackToolEvent(
 eventType:"tool_open"|"file_selected"|"process_started"|"process_completed"|"process_failed"|"export_clicked",
 toolId:string, metadata:Record<string,unknown>={}
){
 try{
  if(typeof window==="undefined"||navigator.doNotTrack==="1"||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  if(/bot|crawler|spider|headless/i.test(navigator.userAgent||""))return;
  if(sessionStorage.getItem("lx-analytics-test")==="1")return;
  const key="lx-tool-session";let id=sessionStorage.getItem(key);
  if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
  const body=JSON.stringify({eventType,toolId,sessionId:id,metadata});
  if(navigator.sendBeacon?.("/api/tools/analytics/track",new Blob([body],{type:"application/json"})))return;
  void fetch("/api/tools/analytics/track",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}).catch(()=>{});
 }catch{/* Storage restrictions, blocked telemetry and serialization never break the tool. */}
}
