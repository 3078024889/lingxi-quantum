#!/usr/bin/env node
import assert from "node:assert/strict";
const sites=["https://lingxifield.com","https://lingxifield.cn"];
async function get(url){
 const r=await fetch(url,{headers:{"user-agent":"LINGXIFIELD-SEO-Postdeploy/1.0"},signal:AbortSignal.timeout(25000)});
 const content=await r.text();
 assert.equal(r.status,200,`${url}: HTTP ${r.status}`);
 return {r,content};
}
const tags=html=>Array.from(html.matchAll(/<link\b[^>]*>/gi),x=>x[0]);
const attr=(tag,key)=>tag.match(new RegExp(key+'="([^"]+)"','i'))?.[1]||null;
for(const site of sites){
 const [robots,map,page]=await Promise.all([get(site+"/robots.txt"),get(site+"/sitemap.xml"),get(site+"/siai")]);
 const observedSitemap=robots.content.match(/^Sitemap:\\s*(\\S+)/im)?.[1]??"(missing)";
 assert(robots.content.includes("Sitemap: "+site+"/sitemap.xml"),`${site} robots sitemap mismatch: expected ${site}/sitemap.xml, observed ${observedSitemap}`);
 const locs=Array.from(map.content.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g),m=>m[1]);
 assert(locs.includes(site+"/siai"),site+" sitemap misses SIAI");
 assert(locs.every(url=>new URL(url).origin===site),site+" sitemap has cross-host loc");
 const links=tags(page.content);
 const canonicals=links.filter(t=>attr(t,"rel")==="canonical");
 assert.equal(canonicals.length,1,site+" canonical count");
 assert.equal(attr(canonicals[0],"href"),site+"/siai",site+" canonical URL");
 const alternates=links.filter(t=>attr(t,"rel")==="alternate");
 assert(alternates.some(t=>attr(t,"hreflang")==="zh-CN"&&attr(t,"href")==="https://lingxifield.cn/siai"),site+" regional hreflang");
 assert(alternates.some(t=>attr(t,"hreflang")==="en"&&attr(t,"href")==="https://lingxifield.com/en/siai"),site+" English hreflang");
 assert(!/noindex/i.test(page.r.headers.get("x-robots-tag")||""),site+" noindex response");
 assert(!/rel=["']?canonical/i.test(page.r.headers.get("link")||""),site+" conflicting HTTP canonical");
 assert(/全球\s*SIAI\s*排行榜/.test(page.content),site+" missing SSR heading");

 if(site==="https://lingxifield.com"){
  const toolUrls=locs.filter(url=>/^https:\/\/lingxifield\.com\/tools\/[^/]+$/.test(url));
  assert(toolUrls.length>=100,"public tools disappeared from production sitemap");
  const sample=[
   "/tools/pdf-editor","/tools/pdf-compress","/tools/batch-image",
   "/tools/ocr","/tools/video-transcription","/tools/food-calorie",
   "/tools/temp-mail"
  ].map(path=>site+path);
  for(const url of sample){
   assert(toolUrls.includes(url),"core tool missing from production sitemap: "+url);
  }
  const picks=[...new Set([...sample,toolUrls[0],toolUrls[Math.floor(toolUrls.length/2)],toolUrls.at(-1)])];
  for(const url of picks){
   const html=await get(url);
   const canonicals=tags(html.content).filter(t=>attr(t,"rel")==="canonical");
   assert.equal(canonicals.length,1,"tool canonical count "+url);
   assert.equal(attr(canonicals[0],"href"),url,"wrong tool canonical "+url);
   assert(!/noindex/i.test(html.r.headers.get("x-robots-tag")||""),"tool noindex "+url);
   assert(/<title>[^<]+<\/title>/i.test(html.content),"missing tool title "+url);
  }
  console.log("SEO LIVE TOOL SAMPLE PASS",picks.length,"of",toolUrls.length);
 }
 console.log("SEO LIVE PASS",site,JSON.stringify({sitemapUrls:locs.length,canonical:site+"/siai",alternates:alternates.length}));
}
