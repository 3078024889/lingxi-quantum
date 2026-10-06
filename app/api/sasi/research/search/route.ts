import {NextRequest,NextResponse} from "next/server";
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
