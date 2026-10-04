const SITE=(process.env.INDEXNOW_SITE||"").trim().replace(/\/+$/,"");
const KEY=(process.env.INDEXNOW_KEY||"7c56b31c5ed003a219fe79c3177ee7ac").trim();
const SOURCE_SITEMAP=(process.env.INDEXNOW_SOURCE_SITEMAP||"https://lingxifield.com/sitemap.xml").trim();
const ENDPOINT=(process.env.INDEXNOW_ENDPOINT||"https://api.indexnow.org/indexnow").trim();
if(!SITE)throw new Error("INDEXNOW_SITE_REQUIRED");
const target=new URL(SITE);

const verification=await fetch(`${target.origin}/${KEY}.txt`);
if(!verification.ok||(await verification.text()).trim()!==KEY)
  throw new Error(`INDEXNOW_KEY_NOT_VERIFIED:${target.origin}`);

const xmlRes=await fetch(SOURCE_SITEMAP,{headers:{"user-agent":"LINGXIFIELD-SEO/1.0"}});
if(!xmlRes.ok)throw new Error(`INDEXNOW_SITEMAP_HTTP_${xmlRes.status}`);
const xml=await xmlRes.text();
const source=[...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map(x=>x[1]);
if(!source.length)throw new Error("INDEXNOW_SITEMAP_EMPTY");

const retired=[
 "/gate/relation","/practice","/romance","/archetype","/live-as","/declaration",
 "/subconscious","/life-map","/relationship","/tarot","/wealth","/daily"
];

const urls=[...new Set(source.map(raw=>{
 const u=new URL(raw);
 return new URL(u.pathname+u.search,target.origin).toString();
}))];

for(const p of retired)urls.push(new URL(p,target.origin).toString());

if(urls.some(url=>new URL(url).origin!==target.origin))
  throw new Error("INDEXNOW_HOST_MAPPING_FAILED");

console.log(`INDEXNOW_SITE=${target.origin}`);
console.log(`INDEXNOW_SOURCE_SITEMAP=${SOURCE_SITEMAP}`);
console.log(`INDEXNOW_TOTAL=${urls.length}`);

for(let i=0;i<urls.length;i+=10000){
 const urlList=urls.slice(i,i+10000);
 const res=await fetch(ENDPOINT,{
   method:"POST",
   headers:{"content-type":"application/json"},
   body:JSON.stringify({
     host:target.host,
     key:KEY,
     keyLocation:`${target.origin}/${KEY}.txt`,
     urlList
   })
 });
 if(!res.ok)throw new Error(`INDEXNOW_HTTP_${res.status}:${await res.text()}`);
 console.log(`INDEXNOW_SUBMITTED=${urlList.length}`);
}
console.log("INDEXNOW_SUBMIT=PASS");
