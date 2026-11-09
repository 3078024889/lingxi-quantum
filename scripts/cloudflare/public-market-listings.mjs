// Only the anonymous, published catalog. Seller drafts and all writes remain in Next.
export async function publicMarketListings(request,env,fetcher=fetch){
 const url=new URL(request.url);
 if(url.pathname!=="/api/sasi/marketplace/listings"||!["GET","HEAD"].includes(request.method)||url.searchParams.get("mode")==="mine")return null;
 const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
 const reply=(body,status)=>new Response(request.method==="HEAD"?null:JSON.stringify(body),{status,headers});
 const origin=(env.NEXT_PUBLIC_SUPABASE_URL||"").trim();
 const key=(env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").trim();
 if(origin!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"||!key)return reply({items:[],error:"MARKET_LISTINGS_UNAVAILABLE"},503);
 const query=new URL(origin+"/rest/v1/sasi_market_public_cards");
 query.searchParams.set("select","id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at");
 query.searchParams.set("status","eq.published");query.searchParams.set("scan_status","eq.clean");
 query.searchParams.set("order","created_at.desc");query.searchParams.set("limit","36");
 for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetcher(query.toString(),{headers:{apikey:key,Authorization:"Bearer "+key},redirect:"error",signal:AbortSignal.timeout(8000)});
   if(!res.ok){if([502,503,504].includes(res.status)&&attempt===0)continue;break;}
   const rows=await res.json();
   if(!Array.isArray(rows)||rows.length>36||rows.some(row=>row.status!=="published"||row.scan_status!=="clean"||String(row.description??"").length>800))break;
   return reply({items:rows.map(row=>({...row,description:String(row.description??"").slice(0,800)}))},200);
  }catch{if(attempt===1)break;}
 }
 return reply({items:[],error:"MARKET_LISTINGS_UNAVAILABLE"},503);
}
