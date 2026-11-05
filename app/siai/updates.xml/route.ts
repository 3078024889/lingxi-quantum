import {getSiaiDirectoryRows} from "@/app/siai/catalog-data";

export const dynamic="force-dynamic";
const escapeXml=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
const safeDate=(v:string|null):Date|null=>{
 if(!v)return null;
 const d=new Date(v);
 return Number.isFinite(d.valueOf())?d:null;
};

export async function GET(){
 const {curated}=getSiaiDirectoryRows();
 // Reviewed ≠ newly added; never describe a review timestamp as a new listing.
 const entries=curated.flatMap(row=>{
  const checked=safeDate(row.checkedAt);
  return checked?[{id:row.id,name:row.name,category:row.category,date:checked}]:[];
 }).sort((a,b)=>b.date.getTime()-a.date.getTime()).slice(0,40);
 const items=entries.map(row=>
  `<item><title>${escapeXml(row.name)} — SIAI reviewed profile</title><link>https://lingxifield.com/siai</link><guid isPermaLink="false">urn:lingxifield:siai:${escapeXml(row.id)}:${row.date.toISOString()}</guid><pubDate>${row.date.toUTCString()}</pubDate><description>${escapeXml(row.category)}; checked official source data. Review may not represent a new launch.</description></item>`
 ).join("");
 const xml=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>LINGXIFIELD Global SIAI — Reviewed Profiles</title><link>https://lingxifield.com/siai</link><description>Reviewed SI/AI platform information updates, not unverified candidate submissions.</description><language>en</language>${items}</channel></rss>`;
 return new Response(xml,{headers:{
  "Content-Type":"application/rss+xml; charset=utf-8",
  "Cache-Control":"public, max-age=300, s-maxage=900",
  "X-Content-Type-Options":"nosniff"
 }});
}
