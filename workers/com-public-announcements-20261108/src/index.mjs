// Public announcement feed for .com only. No Chinese-origin proxy or privileged key.
// Fast Cloudflare Workers runtime + Supabase public Data API/RLS.
const headers={"content-type":"application/json; charset=utf-8","x-content-type-options":"nosniff","cache-control":"public, max-age=30, s-maxage=120"};
function reply(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...headers,...extra}})}
function postgrestUrl(base,now){
 const target=new URL("/rest/v1/lingxifield_announcements",base);
 target.searchParams.set("select","id,version_label,title_zh,title_en,body_zh,body_en,published_at,expires_at,platform");
 target.searchParams.set("is_active","eq.true");
 target.searchParams.set("platform","in.(all,web,miniapp)");
 target.searchParams.set("published_at","lte."+now);
 target.searchParams.set("or","(expires_at.is.null,expires_at.gt."+now+")");
 target.searchParams.set("order","published_at.desc");
 target.searchParams.set("limit","8");
 return target;
}
export default {
 async fetch(request,env){
  const incoming=new URL(request.url);
  if(incoming.pathname!=="/api/site-announcements")return reply({error:"NOT_FOUND"},404,{"cache-control":"no-store"});
  if(request.method!=="GET"&&request.method!=="HEAD")
   return reply({error:"METHOD_NOT_ALLOWED"},405,{"allow":"GET, HEAD","cache-control":"no-store"});
  const base=String(env.SUPABASE_URL||"").trim(),key=String(env.SUPABASE_PUBLIC_KEY||"").trim();
  if(!base.startsWith("https://")||!key)return reply({items:[],error:"PUBLIC_FEED_CONFIGURATION_MISSING"},503,{"cache-control":"no-store"});
  const now=new Date().toISOString().replace(/\.\d{3}Z$/,"Z");
  const target=postgrestUrl(base,now);
  const h=new Headers({apikey:key,accept:"application/json"});
  if(key.startsWith("eyJ"))h.set("authorization","Bearer "+key);
  try{
   const upstream=await fetch(target.toString(),{headers:h,redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(7000)});
   if(!upstream.ok)return reply({items:[],error:"PUBLIC_FEED_UNAVAILABLE"},503,{"cache-control":"no-store"});
   const data=await upstream.json();
   if(!Array.isArray(data)||data.length>8)throw Error("UNEXPECTED_FEED_RESPONSE");
   const items=data.map(a=>({
    id:a.id,version:a.version_label,
    titleZh:a.title_zh,titleEn:a.title_en||a.title_zh,
    bodyZh:a.body_zh,bodyEn:a.body_en||a.body_zh,
    platform:a.platform,publishedAt:a.published_at,href:"/announcements"
   }));
   return request.method==="HEAD"?new Response(null,{status:200,headers}):reply({items});
  }catch{return reply({items:[],error:"PUBLIC_FEED_UNAVAILABLE"},503,{"cache-control":"no-store"});}
 }
};
