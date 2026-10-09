import {NextRequest,NextResponse} from "next/server";
import {scholarlySearchUrl,parseScholarlyPapers} from "@/lib/sasi/research/openalex-scholarly";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {providerJsonProbe} from "@/lib/security/provider-json-probe";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {coalesce,coalesceKey} from "@/lib/sasi/experience/request-coalescer";
export const runtime="nodejs";export const maxDuration=30;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return reply({error:"REQUEST_INVALID"},403);
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 let body:any;try{body=await boundedRequestJson(req,8192)}catch{return reply({error:"REQUEST_INVALID"},400)}
 if(typeof body?.query!=="string"||!body.query.trim()||body.query.length>1200)return reply({error:"QUERY_REQUIRED"},400);
 if(body.source==="scholarly"){
  const days=typeof body.days==="number"&&Number.isInteger(body.days)?Math.max(1,Math.min(365,body.days)):60;
  const abuse=await enforceAbuseGuard(req,{scope:"sasi-scholarly-search",userId:user.id,accountLimit:12,ipLimit:30,windowSeconds:86400});
  if(!abuse.ok)return reply({state:"busy"},429);
  try{
   const papers=await coalesce(coalesceKey([user.id,"scholarly",body.query,days]),async()=>{
    const url=scholarlySearchUrl(body.query,days);
    const result=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{"Accept":"application/json"},cache:"no-store"});
    if(!result.ok)throw new Error("SCHOLARLY_PROVIDER_UNAVAILABLE");
    const payload=await result.json();
    return parseScholarlyPapers(payload);
   });
   return reply({state:papers.length?"ready":"empty",papers,sources:papers.map(p=>({title:p.title,url:p.url,text:[p.published,p.authors.join(", "),p.source,p.doi].filter(Boolean).join(" | ")})),sourceType:"verified-metadata-only"});
  }catch{return reply({state:"unavailable",papers:[]},503)}
 }
 const key=process.env.SASI_RESEARCH_TAVILY_API_KEY?.trim();
 if(!key||process.env.SASI_RESEARCH_TAVILY_ENABLED!=="true")return reply({state:"unavailable"},503);
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-web-research",userId:user.id,accountLimit:20,ipLimit:60,windowSeconds:86400});if(!abuse.ok)return reply({state:"busy"},429);
 try{
  const sources=await coalesce(coalesceKey([user.id,"web-search",body.query]),async()=>{
   const out=await providerJsonProbe("https://api.tavily.com/search",{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},20_000,1024*1024,{method:"POST",body:JSON.stringify({query:body.query.trim(),search_depth:"basic",max_results:5,include_answer:false,include_raw_content:false,auto_parameters:false})});
   if(!out.ok)throw new Error("SEARCH_UNAVAILABLE");const payload=out.payload as any;
   return (Array.isArray(payload?.results)?payload.results:[]).flatMap((item:any)=>{
    try{const url=new URL(item.url);if(url.protocol!=="https:"||url.username||url.password||typeof item.content!=="string"||!item.content.trim())return[];return[{title:String(item.title||url.hostname).slice(0,240),url:url.toString(),text:item.content.slice(0,4000)}]}catch{return[]}
   });
  });
  return reply({state:sources.length?"ready":"empty",sources});
 }catch{return reply({state:"unavailable"},503)}
}
