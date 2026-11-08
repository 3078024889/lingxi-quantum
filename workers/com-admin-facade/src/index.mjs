/**
 * LINGXIFIELD international same-origin administrative API bridge.
 * Scoped ONLY to /api/account/money-admin or /api/account/money-admin/access.
 * Never creates payments, uses secret Supabase credentials, or redirects cookies.
 *
 * Cloudflare Route must be /api/account/money-admin* (most-specific route)
 * after separate CI/Cloudflare cutover and authenticated admin browser acceptance.
 */
const ALLOWED=new Set(["/api/account/money-admin","/api/account/money-admin/access"]);
const SITES=new Set(["lingxifield.com","www.lingxifield.com"]);
const UPSTREAM="https://lingxifield.cn";
function json(obj,status){return new Response(JSON.stringify(obj),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"private, no-store","x-content-type-options":"nosniff"}})}
export default {
 async fetch(request){
  const url=new URL(request.url);
  if(url.protocol!=="https:"||!SITES.has(url.hostname.toLowerCase()))return json({error:"INVALID_SITE"},403);
  if(!ALLOWED.has(url.pathname))return json({error:"ROUTE_NOT_ALLOWED"},404);
  if(!["GET","POST"].includes(request.method))return json({error:"METHOD_NOT_ALLOWED"},405);
  if(request.method==="POST"&&url.pathname!=="/api/account/money-admin")return json({error:"METHOD_NOT_ALLOWED"},405);
  if(url.search.length>1024)return json({error:"QUERY_TOO_LONG"},413);
  if(request.method==="POST"){
   const origin=request.headers.get("origin")||"";
   if(origin!==url.origin)return json({error:"INVALID_ORIGIN"},403);
   const length=Number(request.headers.get("content-length")||0);
   if(!Number.isSafeInteger(length)||length>16384)return json({error:"REQUEST_TOO_LARGE"},413);
   if(!/^application\/json\b/i.test(request.headers.get("content-type")||""))
     return json({error:"JSON_REQUIRED"},415);
  }
  const upstream=new URL(url.pathname+url.search,UPSTREAM);
  const headers=new Headers();
  const cookie=request.headers.get("cookie");if(cookie)headers.set("cookie",cookie);
  headers.set("accept","application/json");
  if(request.method==="POST"){
   headers.set("content-type","application/json");
   // Browser origin was checked against .com above before rewriting for .cn.
   headers.set("origin",UPSTREAM);
  }
  const options={method:request.method,headers,redirect:"manual",cache:"no-store"};
  if(request.method==="POST"){
   // Stream without buffering large body; <=16KB must be enforced by frontend
   // and rechecked at the .cn API entrypoint.
   options.body=request.body;
  }
  try{
   const result=await fetch(upstream.toString(),options);
   if(result.status>=300&&result.status<400)return json({error:"UPSTREAM_REDIRECT_REJECTED"},502);
   const outgoing=new Headers();
   outgoing.set("cache-control","private, no-store");
   outgoing.set("x-content-type-options","nosniff");
   const type=result.headers.get("content-type")||"";
   if(!type.toLowerCase().includes("application/json"))return json({error:"UPSTREAM_NON_JSON"},502);
   outgoing.set("content-type","application/json; charset=utf-8");
   // Intentionally do not copy Set-Cookie, Location, CORS, or arbitrary headers.
   return new Response(result.body,{status:result.status,headers:outgoing});
  }catch{return json({error:"CN_ADMIN_UPSTREAM_UNAVAILABLE"},503)}
 }
};
