import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const root = path.resolve(process.argv[2] || process.cwd());
const key = process.env.INDEXNOW_KEY || "";
const host = process.env.INDEXNOW_HOST || "lingxifield.com";

if (!key) {
  console.log("INDEXNOW_SUBMIT=SKIP");
  console.log("Reason: INDEXNOW_KEY is not set. Set the key in the environment; never commit it to source.");
  process.exit(0);
}

const sitemapPath = path.join(root,"public","sitemap.xml");
if (!fs.existsSync(sitemapPath)) throw new Error("SITEMAP_NOT_FOUND");
const xml = fs.readFileSync(sitemapPath,"utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).filter(u=>u.startsWith("https://"+host+"/") || u==="https://"+host);
const unique = [...new Set(urls)];
if (!unique.length) throw new Error("NO_SITEMAP_URLS");

const endpoint = "https://api.indexnow.org/indexnow";
const chunks = [];
for (let i=0;i<unique.length;i+=10000) chunks.push(unique.slice(i,i+10000));

function post(chunk) {
  return new Promise((resolve,reject)=>{
    const body = JSON.stringify({host,key,keyLocation:`https://${host}/${key}.txt`,urlList:chunk});
    const req = https.request(endpoint,{
      method:"POST",
      headers:{"Content-Type":"application/json; charset=utf-8","Content-Length":Buffer.byteLength(body)}
    },res=>{
      let data="";
      res.on("data",d=>data+=d);
      res.on("end",()=>resolve({status:res.statusCode,body:data}));
    });
    req.on("error",reject);
    req.write(body); req.end();
  });
}

for (let i=0;i<chunks.length;i++) {
  const r=await post(chunks[i]);
  console.log(`INDEXNOW_BATCH=${i+1}/${chunks.length} HTTP=${r.status}`);
  if (![200,202].includes(r.status)) process.exitCode=1;
}
console.log(`INDEXNOW_SUBMIT=DONE urls=${unique.length}`);
