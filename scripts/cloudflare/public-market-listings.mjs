// Only the anonymous, published catalog. Seller drafts and writes remain in Next.
// Public diagnostics are coarse codes; never expose upstream payload or credentials.
export async function publicMarketListings(request,env,fetcher=fetch){
 const url=new URL(request.url);
 if(url.pathname!=="/api/sasi/marketplace/listings"||!["GET","HEAD"].includes(request.method)||url.searchParams.get("mode")==="mine")return null;
 const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
 const reply=(body,status,diagnostic="ok")=>new Response(request.method==="HEAD"?null:JSON.stringify(body),{status,headers:{...headers,"x-lingxi-catalog-diagnostic":diagnostic}});
 const origin=(env.NEXT_PUBLIC_SUPABASE_URL||"").trim();
 const key=(env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").trim();
 if(origin!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"||!key)return reply({items:[],error:"MARKET_LISTINGS_UNAVAILABLE"},503,"missing-public-configuration");
 const query=new URL(origin+"/rest/v1/sasi_market_listings");
 query.searchParams.set("select","id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at");
 query.searchParams.set("status","eq.published");query.searchParams.set("scan_status","eq.clean");
 query.searchParams.set("order","created_at.desc");query.searchParams.set("limit","36");
 let reason="upstream-unavailable";
 for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetcher(query.toString(),{headers:{apikey:key,Authorization:"Bearer "+key},redirect:"error",signal:AbortSignal.timeout(8000)});
   if(!res.ok){
    reason="upstream-"+(Number.isInteger(res.status)&&res.status>=400&&res.status<=599?String(res.status):"error");
    if([502,503,504].includes(res.status)&&attempt===0)continue;
    break;
   }
   const rows=await res.json();
   if(!Array.isArray(rows)||rows.length>36||rows.some(row=>row.status!=="published"||row.scan_status!=="clean")){
    reason="invalid-catalog-data";break;
   }
   return reply({items:rows.map(row=>({...row,description:String(row.description??"").slice(0,800)}))},200);
  }catch(e){
   reason=e?.name==="TimeoutError"?"upstream-timeout":"upstream-network-error";
   if(attempt===1)break;
  }
 }
 return reply({items:[],error:"MARKET_LISTINGS_UNAVAILABLE"},503,reason);
}
