/** Best-effort usage telemetry must never interrupt a local tool or file delivery. */
export function trackToolEvent(
 eventType:"tool_open"|"file_selected"|"process_started"|"process_completed"|"process_failed"|"export_clicked",
 toolId:string, metadata:Record<string,unknown>={}
){
 try{
  if(typeof window==="undefined"||navigator.doNotTrack==="1"||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  if(/bot|crawler|spider|headless/i.test(navigator.userAgent||""))return;
  if(sessionStorage.getItem("lx-analytics-test")==="1")return;
  // Reuse the exact daily session token used by SiteVisitTracker so pageviews and
  // completed tool actions can be joined without storing a person or device ID.
  const day=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai"}).format(new Date());
  const key="lx-visit:"+day;let id=sessionStorage.getItem(key);
  if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
  const clean=(value:unknown)=>typeof value==="string"&&/^[a-z0-9][a-z0-9_-]{0,47}$/i.test(value)?value.toLowerCase():null;
  let attribution:{utm_source:string|null;utm_campaign:string|null;utm_content:string|null}={utm_source:null,utm_campaign:null,utm_content:null};
  try{
   const stored=JSON.parse(sessionStorage.getItem("lx-attribution:"+day)||"null");
   if(stored&&typeof stored==="object")attribution={
    utm_source:clean(stored.utm_source),utm_campaign:clean(stored.utm_campaign),utm_content:clean(stored.utm_content)
   };
   const query=new URLSearchParams(window.location.search);
   if(!attribution.utm_source){
    const source=clean(query.get("utm_source"));
    if(source)attribution={utm_source:source,utm_campaign:clean(query.get("utm_campaign")),utm_content:clean(query.get("utm_content"))};
   }
  }catch{/* Attribution is optional; tool telemetry remains best effort. */}
  const body=JSON.stringify({eventType,toolId,sessionId:id,metadata,attribution});
  if(navigator.sendBeacon?.("/api/tools/analytics/track",new Blob([body],{type:"application/json"})))return;
  void fetch("/api/tools/analytics/track",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}).catch(()=>{});
 }catch{/* Storage restrictions, blocked telemetry and serialization never break the tool. */}
}
