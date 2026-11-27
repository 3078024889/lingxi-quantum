// Safe production API probe: no orders, credentials, PII, row data or mutations.
const endpoint=(process.env.NEXT_PUBLIC_SUPABASE_URL||"").trim();
const key=(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").trim();
if(endpoint!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"||!key)throw Error("SASI_PUBLIC_REST_PREFLIGHT_MISSING_CONFIGURATION");
const url=new URL(endpoint+"/rest/v1/sasi_market_listings");
url.searchParams.set("select","id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at");
url.searchParams.set("status","eq.published");
url.searchParams.set("scan_status","eq.clean");
url.searchParams.set("limit","1");
let success=false;
for(let attempt=1;attempt<=3;attempt++){
 try{
  const response=await fetch(url,{headers:{apikey:key,authorization:"Bearer "+key,accept:"application/json"},redirect:"error",signal:AbortSignal.timeout(12000)});
  const payload=await response.json().catch(()=>null);
  const jsonArray=Array.isArray(payload);
  // Never print the raw payload or response body: errors can contain metadata.
  const errorCode=!jsonArray&&typeof payload?.code==="string"?payload.code.replace(/[^A-Z0-9_]/gi,"").slice(0,50):"none";
  console.log("SASI_ANONYMOUS_REST_ATTEMPT="+attempt+" HTTP="+response.status+" ARRAY="+jsonArray+" CODE="+errorCode);
  if(response.status===200&&jsonArray){
   if(payload.length>1||payload.some(v=>v?.status!=="published"||v?.scan_status!=="clean"))throw Error("SASI_ANONYMOUS_REST_RLS_VIOLATION");
   success=true;break;
  }
 }catch(e){
  console.log("SASI_ANONYMOUS_REST_ATTEMPT="+attempt+" ERROR="+(e instanceof Error&&e.message==="SASI_ANONYMOUS_REST_RLS_VIOLATION"?"RLS_VIOLATION":"UPSTREAM_UNAVAILABLE"));
  if(e instanceof Error&&e.message==="SASI_ANONYMOUS_REST_RLS_VIOLATION")throw e;
 }
}
if(!success)throw Error("SASI_ANONYMOUS_REST_PREFLIGHT_FAILED");
console.log("SASI_ANONYMOUS_REST_PREFLIGHT_PASS");
