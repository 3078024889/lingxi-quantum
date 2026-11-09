// Isolated Cloudflare network probe. No production routes, orders or private data.
export default {
 async fetch(request,env){
  if(new URL(request.url).pathname!=="/check"||request.method!=="GET")
    return new Response("Not found",{status:404});
  const origin="https://sxsgdpqojepgbbrxrzlq.supabase.co";
  const publicKey=String(env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").trim();
  const listingUrl=new URL(origin+"/rest/v1/sasi_market_listings");
  listingUrl.searchParams.set("select","id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at");
  listingUrl.searchParams.set("status","eq.published");
  listingUrl.searchParams.set("scan_status","eq.clean");
  listingUrl.searchParams.set("order","created_at.desc");
  listingUrl.searchParams.set("limit","36");
  const targets=[
   {name:"supabase",url:origin+"/rest/v1/sasi_market_listings?select=id&status=eq.published&limit=1",headers:{accept:"application/json"},redirect:"manual"},
   {name:"supabase-key",url:listingUrl.toString(),headers:{accept:"application/json",apikey:publicKey,Authorization:"Bearer "+publicKey},redirect:"error"},
   {name:"cn",url:"https://lingxifield.cn/api/sasi/marketplace/listings",headers:{accept:"application/json"},redirect:"manual"}
  ];
  const result={};
  for(const target of targets){
   if(target.name==="supabase-key"&&!publicKey){result[target.name]={status:0,errorName:"PublicKeyMissing"};continue;}
   try{
    const response=await fetch(target.url,{redirect:target.redirect,signal:AbortSignal.timeout(12000),headers:target.headers});
    let contract="unverified";
    if(response.ok&&target.name!=="supabase"){
     const json=await response.json();
     const items=target.name==="cn"?json?.items:json;
     contract=Array.isArray(items)&&items.every(item=>item.status==="published"&&item.scan_status==="clean")?"public-clean":"invalid";
    }
    result[target.name]={status:response.status,contract};
   }catch(error){
    result[target.name]={status:0,errorName:String(error?.name||"Error").replace(/[^a-z]/gi,"").slice(0,30)};
   }
  }
  return Response.json(result,{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }
};
