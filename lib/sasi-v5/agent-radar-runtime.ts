import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

type Source={key:string;repo:string;capabilities:string[]};
const SOURCES:Source[]=[
 {key:"openai-agents-python",repo:"openai/openai-agents-python",capabilities:["agent","tools","handoff","guardrails","tracing"]},
 {key:"langgraph",repo:"langchain-ai/langgraph",capabilities:["agent","workflow","checkpoint","durable-execution"]},
 {key:"autogen",repo:"microsoft/autogen",capabilities:["agent","multi-agent","workflow"]},
 {key:"flowise",repo:"FlowiseAI/Flowise",capabilities:["workflow","agent","mcp"]},
 {key:"langflow",repo:"langflow-ai/langflow",capabilities:["workflow","agent","mcp"]},
 {key:"comfyui",repo:"comfyanonymous/ComfyUI",capabilities:["image","video","node-graph"]},
 {key:"ragflow",repo:"infiniflow/ragflow",capabilities:["rag","agent","knowledge"]},
 {key:"anythingllm",repo:"Mintplex-Labs/anything-llm",capabilities:["workspace","agent","rag"]},
 {key:"litellm",repo:"BerriAI/litellm",capabilities:["gateway","router","budget"]},
 {key:"open-webui",repo:"open-webui/open-webui",capabilities:["model-gateway","tools","mcp"]},
];

function cleanTag(v:unknown){return String(v??"").trim().slice(0,120)}
async function latestRelease(source:Source){
 const response=await fetch(`https://api.github.com/repos/${source.repo}/releases/latest`,{
   headers:{"Accept":"application/vnd.github+json","User-Agent":"LINGXIFIELD-SASI-Agent-Radar"},
   cache:"no-store",signal:AbortSignal.timeout(15_000),
 });
 if(response.status===404){
   const repo=await fetch(`https://api.github.com/repos/${source.repo}`,{
     headers:{"Accept":"application/vnd.github+json","User-Agent":"LINGXIFIELD-SASI-Agent-Radar"},
     cache:"no-store",signal:AbortSignal.timeout(15_000),
   });
   const body=await repo.json().catch(()=>({})) as any;
   if(!repo.ok)throw new Error(`RADAR_GITHUB_${repo.status}`);
   return{version:cleanTag(body.pushed_at)||"unreleased",url:`https://github.com/${source.repo}`,publishedAt:cleanTag(body.pushed_at)};
 }
 const body=await response.json().catch(()=>({})) as any;
 if(!response.ok)throw new Error(`RADAR_GITHUB_${response.status}`);
 return{
   version:cleanTag(body.tag_name)||cleanTag(body.name)||"unknown",
   url:String(body.html_url??`https://github.com/${source.repo}`).slice(0,500),
   publishedAt:cleanTag(body.published_at),
 };
}

export async function runAgentRadar(){
 const admin=createAdminClient();const results:any[]=[];
 for(const source of SOURCES){
   try{
     const release=await latestRelease(source);
     const {error}=await admin.from("sasi_v5_agent_registry").upsert({
       agent_key:source.key,version:release.version,source:`github:${source.repo}`,
       stage:"quarantine",capabilities:source.capabilities,permissions:[],
       license_status:"review",security_status:"review",
       benchmark_evidence:{sourceUrl:release.url,publishedAt:release.publishedAt,discoveredBy:"agent-radar"},
       traffic_share:0,updated_at:new Date().toISOString(),
     },{onConflict:"agent_key,version"});
     if(error)throw error;
     results.push({key:source.key,ok:true,version:release.version});
   }catch(error){
     results.push({key:source.key,ok:false,error:error instanceof Error?error.message:"RADAR_UNKNOWN"});
   }
 }
 return{checked:SOURCES.length,results,completedAt:new Date().toISOString()};
}
