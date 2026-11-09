// Isolated no-route Cloudflare Worker — public-network diagnosis only.
// Does not collect, print, or modify credentials, orders, user content or database rows.
export default {
 async fetch(request){
  const pathname=new URL(request.url).pathname;
  if(pathname!=="/check"||request.method!=="GET")return new Response("Not found",{status:404});
  const targets=[
   ["supabase","https://sxsgdpqojepgbbrxrzlq.supabase.co/rest/v1/sasi_market_listings?select=id&status=eq.published&limit=1"],
   ["cn","https://lingxifield.cn/api/sasi/marketplace/listings"]
  ];
  const result={};
  for(const [name,url] of targets){
   try{
    const response=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(12000),headers:{accept:"application/json"}});
    let contract="unverified";
    if(name==="cn"&&response.ok){
     const json=await response.json();
     contract=Array.isArray(json?.items)&&json.items.every(item=>item.status==="published"&&item.scan_status==="clean")?"public-clean":"invalid";
    }
    result[name]={status:response.status,contract};
   }catch(error){
    const name=String(error?.name||"Error").replace(/[^a-z]/gi,"").slice(0,30);
    result[name==="cn"?"cn":"supabase"]={status:0,errorName:name};
   }
  }
  return Response.json(result,{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }
};
