import "server-only";

export type ExperienceRegion="global"|"china";
export type ExperienceWire="openai"|"gemini"|"cloudflare";
export type ExperienceTask="chat"|"knowledge"|"research"|"website"|"drama";
export type ExperienceProvider={
 id:string;
 region:ExperienceRegion;
 wire:ExperienceWire;
 baseUrl:string;
 apiKey:string;
 model:string;
 accountId?:string;
 priority:number;
 dailyShare:number;
 quality:number;
 speed:number;
 tasks:ExperienceTask[];
 canaryPercent:number;
};

function yes(name:string){return /^(1|true|yes|on)$/i.test(String(process.env[name]||"").trim())}
function val(name:string){return String(process.env[name]||"").trim()}
function num(name:string,fallback:number){const n=Number(val(name));return Number.isFinite(n)&&n>0?n:fallback}
function tasks(name:string,fallback:ExperienceTask[]){
 const raw=val(name);if(!raw)return fallback;
 const allowed=new Set<ExperienceTask>(["chat","knowledge","research","website","drama"]);
 const out=raw.split(",").map(x=>x.trim() as ExperienceTask).filter(x=>allowed.has(x));
 return out.length?out:fallback;
}
function add(out:ExperienceProvider[],p:ExperienceProvider,enabled:string){
 if(!yes(enabled)||!p.apiKey||!p.model)return;
 out.push(p);
}
const ALL:ExperienceTask[]=["chat","knowledge","research","website","drama"];

export function experienceProviders(region:ExperienceRegion){
 const out:ExperienceProvider[]=[];

 if(region==="global"){
  add(out,{id:"openrouter-free",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_OPENROUTER_BASE_URL")||"https://openrouter.ai/api/v1",apiKey:val("SASI_EXPERIENCE_OPENROUTER_API_KEY"),model:val("SASI_EXPERIENCE_OPENROUTER_MODEL")||"openrouter/free",priority:num("SASI_EXPERIENCE_OPENROUTER_PRIORITY",10),dailyShare:num("SASI_EXPERIENCE_OPENROUTER_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_OPENROUTER_QUALITY",0.82),speed:num("SASI_EXPERIENCE_OPENROUTER_SPEED",0.70),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_OPENROUTER_TASKS",ALL)},"SASI_EXPERIENCE_OPENROUTER_ENABLED");
  add(out,{id:"groq-free",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_GROQ_BASE_URL")||"https://api.groq.com/openai/v1",apiKey:val("SASI_EXPERIENCE_GROQ_API_KEY"),model:val("SASI_EXPERIENCE_GROQ_MODEL"),priority:num("SASI_EXPERIENCE_GROQ_PRIORITY",20),dailyShare:num("SASI_EXPERIENCE_GROQ_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_GROQ_QUALITY",0.82),speed:num("SASI_EXPERIENCE_GROQ_SPEED",0.95),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_GROQ_TASKS",ALL)},"SASI_EXPERIENCE_GROQ_ENABLED");
  add(out,{id:"cerebras-free",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_CEREBRAS_BASE_URL")||"https://api.cerebras.ai/v1",apiKey:val("SASI_EXPERIENCE_CEREBRAS_API_KEY"),model:val("SASI_EXPERIENCE_CEREBRAS_MODEL"),priority:num("SASI_EXPERIENCE_CEREBRAS_PRIORITY",30),dailyShare:num("SASI_EXPERIENCE_CEREBRAS_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_CEREBRAS_QUALITY",0.84),speed:num("SASI_EXPERIENCE_CEREBRAS_SPEED",0.95),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_CEREBRAS_TASKS",ALL)},"SASI_EXPERIENCE_CEREBRAS_ENABLED");
  add(out,{id:"nvidia-nim-free",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_NVIDIA_BASE_URL")||"https://integrate.api.nvidia.com/v1",apiKey:val("SASI_EXPERIENCE_NVIDIA_API_KEY"),model:val("SASI_EXPERIENCE_NVIDIA_MODEL"),priority:num("SASI_EXPERIENCE_NVIDIA_PRIORITY",40),dailyShare:num("SASI_EXPERIENCE_NVIDIA_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_NVIDIA_QUALITY",0.88),speed:num("SASI_EXPERIENCE_NVIDIA_SPEED",0.75),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_NVIDIA_TASKS",ALL)},"SASI_EXPERIENCE_NVIDIA_ENABLED");
  add(out,{id:"gemini-free",region,wire:"gemini",baseUrl:val("SASI_EXPERIENCE_GEMINI_BASE_URL")||"https://generativelanguage.googleapis.com/v1beta",apiKey:val("SASI_EXPERIENCE_GEMINI_API_KEY"),model:val("SASI_EXPERIENCE_GEMINI_MODEL"),priority:num("SASI_EXPERIENCE_GEMINI_PRIORITY",50),dailyShare:num("SASI_EXPERIENCE_GEMINI_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_GEMINI_QUALITY",0.90),speed:num("SASI_EXPERIENCE_GEMINI_SPEED",0.75),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_GEMINI_TASKS",ALL)},"SASI_EXPERIENCE_GEMINI_ENABLED");
  add(out,{id:"mistral-free",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_MISTRAL_BASE_URL")||"https://api.mistral.ai/v1",apiKey:val("SASI_EXPERIENCE_MISTRAL_API_KEY"),model:val("SASI_EXPERIENCE_MISTRAL_MODEL"),priority:num("SASI_EXPERIENCE_MISTRAL_PRIORITY",70),dailyShare:num("SASI_EXPERIENCE_MISTRAL_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_MISTRAL_QUALITY",0.84),speed:num("SASI_EXPERIENCE_MISTRAL_SPEED",0.78),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_MISTRAL_TASKS",ALL)},"SASI_EXPERIENCE_MISTRAL_ENABLED");
  add(out,{id:"fireworks-trial",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_FIREWORKS_BASE_URL")||"https://api.fireworks.ai/inference/v1",apiKey:val("SASI_EXPERIENCE_FIREWORKS_API_KEY"),model:val("SASI_EXPERIENCE_FIREWORKS_MODEL"),priority:num("SASI_EXPERIENCE_FIREWORKS_PRIORITY",90),dailyShare:num("SASI_EXPERIENCE_FIREWORKS_DAILY_SHARE",0.25),quality:num("SASI_EXPERIENCE_FIREWORKS_QUALITY",0.80),speed:num("SASI_EXPERIENCE_FIREWORKS_SPEED",0.85),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_FIREWORKS_TASKS",ALL)},"SASI_EXPERIENCE_FIREWORKS_ENABLED");

  if(yes("SASI_EXPERIENCE_CLOUDFLARE_ENABLED")&&val("SASI_EXPERIENCE_CLOUDFLARE_API_TOKEN")&&val("SASI_EXPERIENCE_CLOUDFLARE_ACCOUNT_ID")&&val("SASI_EXPERIENCE_CLOUDFLARE_MODEL")){
   out.push({id:"cloudflare-workers-ai",region,wire:"cloudflare",baseUrl:"https://api.cloudflare.com/client/v4",apiKey:val("SASI_EXPERIENCE_CLOUDFLARE_API_TOKEN"),accountId:val("SASI_EXPERIENCE_CLOUDFLARE_ACCOUNT_ID"),model:val("SASI_EXPERIENCE_CLOUDFLARE_MODEL"),priority:num("SASI_EXPERIENCE_CLOUDFLARE_PRIORITY",60),dailyShare:num("SASI_EXPERIENCE_CLOUDFLARE_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_CLOUDFLARE_QUALITY",0.78),speed:num("SASI_EXPERIENCE_CLOUDFLARE_SPEED",0.80),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_CLOUDFLARE_TASKS",ALL)});
  }
 }

 if(region==="china"){
  add(out,{id:"zhipu-experience",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_ZHIPU_BASE_URL")||"https://open.bigmodel.cn/api/paas/v4",apiKey:val("SASI_EXPERIENCE_ZHIPU_API_KEY"),model:val("SASI_EXPERIENCE_ZHIPU_MODEL"),priority:num("SASI_EXPERIENCE_ZHIPU_PRIORITY",10),dailyShare:num("SASI_EXPERIENCE_ZHIPU_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_ZHIPU_QUALITY",0.88),speed:num("SASI_EXPERIENCE_ZHIPU_SPEED",0.80),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_ZHIPU_TASKS",ALL)},"SASI_EXPERIENCE_ZHIPU_ENABLED");
  add(out,{id:"volcengine-experience",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_VOLCENGINE_BASE_URL")||"https://ark.cn-beijing.volces.com/api/v3",apiKey:val("SASI_EXPERIENCE_VOLCENGINE_API_KEY"),model:val("SASI_EXPERIENCE_VOLCENGINE_MODEL"),priority:num("SASI_EXPERIENCE_VOLCENGINE_PRIORITY",20),dailyShare:num("SASI_EXPERIENCE_VOLCENGINE_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_VOLCENGINE_QUALITY",0.90),speed:num("SASI_EXPERIENCE_VOLCENGINE_SPEED",0.82),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_VOLCENGINE_TASKS",ALL)},"SASI_EXPERIENCE_VOLCENGINE_ENABLED");
  add(out,{id:"aliyun-experience",region,wire:"openai",baseUrl:val("SASI_EXPERIENCE_ALIYUN_BASE_URL")||"https://dashscope.aliyuncs.com/compatible-mode/v1",apiKey:val("SASI_EXPERIENCE_ALIYUN_API_KEY"),model:val("SASI_EXPERIENCE_ALIYUN_MODEL"),priority:num("SASI_EXPERIENCE_ALIYUN_PRIORITY",30),dailyShare:num("SASI_EXPERIENCE_ALIYUN_DAILY_SHARE",1),quality:num("SASI_EXPERIENCE_ALIYUN_QUALITY",0.88),speed:num("SASI_EXPERIENCE_ALIYUN_SPEED",0.80),canaryPercent:num("SASI_EXPERIENCE_CANARY_PERCENT",100),tasks:tasks("SASI_EXPERIENCE_ALIYUN_TASKS",ALL)},"SASI_EXPERIENCE_ALIYUN_ENABLED");
 }

 return out.sort((a,b)=>a.priority-b.priority);
}

export function experienceRegionFromHost(host:string|null|undefined):ExperienceRegion{
 const value=String(host||"").toLowerCase();
 return value.includes("lingxifield.cn")?"china":"global";
}
