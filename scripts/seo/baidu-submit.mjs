const SITE=(process.env.BAIDU_SITE||"").trim().replace(/\/+$/,"");
const TOKEN=(process.env.BAIDU_TOKEN||"").trim();
const SOURCE_SITEMAP=(process.env.BAIDU_SITEMAP||"https://lingxifield.com/sitemap.xml").trim();
const ENDPOINT=(process.env.BAIDU_ENDPOINT||"https://data.zz.baidu.com/urls").trim();
const BATCH_SIZE=Math.max(1,Math.min(Number(process.env.BAIDU_BATCH_SIZE||2000),2000));

if(!SITE)throw new Error("BAIDU_SITE_REQUIRED");
if(!TOKEN)throw new Error("BAIDU_TOKEN_REQUIRED");
const target=new URL(SITE);

const sitemapRes=await fetch(SOURCE_SITEMAP,{headers:{"user-agent":"LINGXIFIELD-SEO/1.0"}});
if(!sitemapRes.ok)throw new Error(`BAIDU_SITEMAP_HTTP_${sitemapRes.status}`);
const xml=await sitemapRes.text();
const source=[...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map(m=>m[1]);
if(!source.length)throw new Error("BAIDU_SITEMAP_EMPTY");

const blocked=[
 /^\/(?:api|admin|auth|account|checkout|checkout-usd|share)(?:\/|$)/,
 /^\/tools\/(?:admin|pay)(?:\/|$)/,
 /^\/tools\/burn-after-read\/.+/,
 /^\/sasi\/(?:connections|chat|operator|project-dna)(?:\/|$)/,
 /^\/paypal\/(?:return|cancel)(?:\/|$)/,
 /^\/(?:explore|learn|glossary|live-as|subconscious|practice|field-tests|life-map|relationship|qian|mirror|tarot|resilience|romance|daily|wealth|archetype|mini-report|membership|origin|dream|declaration|narrative|number-energy|gate|field|field-test|manifestation|consciousness|inner-sovereignty|energy-exchange|energy|exchange|inner-practice|inner-practice-technique)(?:\/|$)/
];

const urls=[...new Set(source.map(raw=>{
 const u=new URL(raw);
 return new URL(u.pathname+u.search,target.origin).toString();
}).filter(raw=>!blocked.some(re=>re.test(new URL(raw).pathname))))];

console.log(`BAIDU_SITE=${target.origin}`);
console.log(`BAIDU_SOURCE_SITEMAP=${SOURCE_SITEMAP}`);
console.log(`BAIDU_URL_TOTAL=${urls.length}`);

let submitted=0;
for(let i=0;i<urls.length;i+=BATCH_SIZE){
 const batch=urls.slice(i,i+BATCH_SIZE);
 const api=new URL(ENDPOINT);
 api.searchParams.set("site",target.origin);
 api.searchParams.set("token",TOKEN);

 const res=await fetch(api,{
   method:"POST",
   headers:{"content-type":"text/plain; charset=utf-8"},
   body:batch.join("\n")
 });
 const body=await res.text();
 if(!res.ok)throw new Error(`BAIDU_HTTP_${res.status}:${body}`);

 let parsed;
 try{parsed=JSON.parse(body)}catch{parsed={raw:body}}

 if(parsed.not_same_site?.length)throw new Error(`BAIDU_NOT_SAME_SITE:${parsed.not_same_site.length}`);
 if(parsed.not_valid?.length)throw new Error(`BAIDU_NOT_VALID:${parsed.not_valid.length}`);

 submitted+=batch.length;
 console.log(`BAIDU_BATCH_SUBMITTED=${batch.length}`);
 if(typeof parsed.success==="number")console.log(`BAIDU_SUCCESS=${parsed.success}`);
 if(typeof parsed.remain==="number")console.log(`BAIDU_REMAIN=${parsed.remain}`);
}
console.log(`BAIDU_SUBMITTED_TOTAL=${submitted}`);
console.log("BAIDU_SUBMIT=PASS");
