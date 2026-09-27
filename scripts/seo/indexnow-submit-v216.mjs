const SITE=process.env.INDEXNOW_SITE||"https://lingxifield.com";
const KEY=process.env.INDEXNOW_KEY||"7c56b31c5ed003a219fe79c3177ee7ac";
const HOST=new URL(SITE).host;
const ENDPOINT=process.env.INDEXNOW_ENDPOINT||"https://api.indexnow.org/indexnow";
const RETIRED=["/gate/relation","/practice","/romance","/archetype","/live-as","/declaration","/subconscious","/life-map","/relationship","/tarot","/wealth","/daily"];
const xml=await fetch(`${SITE}/sitemap.xml`,{headers:{"user-agent":"LINGXIFIELD-SEO/1.0"}}).then(r=>{if(!r.ok)throw new Error(`SITEMAP_HTTP_${r.status}`);return r.text()});
const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
for(const p of RETIRED)urls.push(`${SITE}${p}`);
const unique=[...new Set(urls)];
for(let i=0;i<unique.length;i+=10000){
 const urlList=unique.slice(i,i+10000);
 const res=await fetch(ENDPOINT,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({host:HOST,key:KEY,keyLocation:`${SITE}/${KEY}.txt`,urlList})});
 if(!res.ok)throw new Error(`INDEXNOW_HTTP_${res.status}:${await res.text()}`);
 console.log(`INDEXNOW_SUBMITTED=${urlList.length}`);
}
console.log(`INDEXNOW_TOTAL=${unique.length}`);
