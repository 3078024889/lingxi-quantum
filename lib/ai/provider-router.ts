export type TaskKind = "knowledge" | "simple_text" | "research" | "vision" | "coding";
export type Intelligence = "light" | "standard" | "high";
export type ProviderUsage={inputTokens:number;outputTokens:number;cachedTokens:number};
export type ProviderResult={provider:string;model:string;text:string;usage:ProviderUsage;pricing:ProviderConfig};
export type ProviderConfig={
 provider:string;model:string;baseUrl:string;apiKey:string;
 inputRmbPerM:number;outputRmbPerM:number;cachedRmbPerM:number;
};
export type ProviderCapabilities={
 wire:"chat"|"responses";
 reasoningEffort:boolean;
 thinking:boolean;
};

export function reasoningEffortForTier(tier:Intelligence){
 return tier==="light"?"low":tier==="high"?"max":"high";
}

export function providerCapabilities(p:ProviderConfig):ProviderCapabilities{
 if(p.provider==="volcengine")return {wire:"responses",reasoningEffort:true,thinking:true};
 if(p.provider==="zhipu")return {wire:"chat",reasoningEffort:true,thinking:true};
 return {wire:"chat",reasoningEffort:false,thinking:false};
}

function envNumber(name:string,fallback:number){
 const raw=process.env[name];
 if(raw==null||raw.trim()==="")return fallback;
 const n=Number(raw);
 return Number.isFinite(n)?n:fallback;
}

function configs():ProviderConfig[]{
 const out:ProviderConfig[]=[];

 const zk=process.env.ZHIPU_API_KEY?.trim();
 if(zk){
  out.push({
   provider:"zhipu",
   model:process.env.ZHIPU_MODEL?.trim()||"glm-5.3-flash",
   baseUrl:(process.env.ZHIPU_BASE_URL||"https://open.bigmodel.cn/api/paas/v4").replace(/\/$/,""),
   apiKey:zk,
   // GLM-5.3-Flash may currently be covered by an account grant/free quota.
   // Keep these explicit env vars available so pricing can be changed without code deploy.
   inputRmbPerM:envNumber("ZHIPU_INPUT_RMB_PER_M",0),
   outputRmbPerM:envNumber("ZHIPU_OUTPUT_RMB_PER_M",0),
   cachedRmbPerM:envNumber("ZHIPU_CACHED_RMB_PER_M",0),
  });
 }

 const dk=process.env.DEEPSEEK_API_KEY?.trim();
 if(dk){
  out.push({
   provider:"deepseek",
   model:process.env.DEEPSEEK_MODEL?.trim()||"deepseek-flash",
   baseUrl:(process.env.DEEPSEEK_BASE_URL||"https://api.deepseek.com").replace(/\/$/,""),
   apiKey:dk,
   // Conservative peak pricing in RMB / 1M tokens (2026-09).
   inputRmbPerM:envNumber("DEEPSEEK_INPUT_RMB_PER_M",2),
   outputRmbPerM:envNumber("DEEPSEEK_OUTPUT_RMB_PER_M",8),
   cachedRmbPerM:envNumber("DEEPSEEK_CACHED_RMB_PER_M",0.04),
  });
 }

 const vk=process.env.VOLCENGINE_ARK_API_KEY?.trim();
 if(vk){
  out.push({
   provider:"volcengine",
   model:process.env.AI_DEFAULT_MODEL?.trim()||"doubao-seed-evolving",
   baseUrl:(process.env.VOLCENGINE_ARK_BASE_URL||"https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/,""),
   apiKey:vk,
   inputRmbPerM:envNumber("VOLCENGINE_INPUT_RMB_PER_M",6),
   outputRmbPerM:envNumber("VOLCENGINE_OUTPUT_RMB_PER_M",30),
   cachedRmbPerM:envNumber("VOLCENGINE_CACHED_RMB_PER_M",1.2),
  });
 }
 return out;
}

function tierPreferredNames(tier:Intelligence):string[]{
 if(tier==="light")return [
  process.env.AI_LIGHT_PROVIDER||"zhipu","deepseek","volcengine"
 ].filter(Boolean);
 if(tier==="high")return [
  process.env.AI_HIGH_PROVIDER||"volcengine","deepseek","zhipu"
 ].filter(Boolean);
 return [
  process.env.AI_STANDARD_PROVIDER||"deepseek","zhipu","volcengine"
 ].filter(Boolean);
}

function modelOverride(p:ProviderConfig,tier:Intelligence){
 const key=tier==="light"?"AI_LIGHT_MODEL":tier==="high"?"AI_HIGH_MODEL":"AI_STANDARD_MODEL";
 const providerKey=tier==="light"?"AI_LIGHT_PROVIDER":tier==="high"?"AI_HIGH_PROVIDER":"AI_STANDARD_PROVIDER";
 if((process.env[providerKey]||"").trim()===p.provider && (process.env[key]||"").trim()){
  return {...p,model:process.env[key]!.trim()};
 }
 return p;
}

export function providerCandidates(tier:Intelligence):ProviderConfig[]{
 const all=configs(),names=[...new Set(tierPreferredNames(tier))];
 const ordered:ProviderConfig[]=[];
 for(const n of names){
  const hit=all.find(x=>x.provider===n);
  if(hit && !ordered.some(x=>x.provider===hit.provider)) ordered.push(modelOverride(hit,tier));
 }
 for(const p of all)if(!ordered.some(x=>x.provider===p.provider))ordered.push(p);
 return ordered;
}

export function selectProvider(_task:TaskKind,tier:Intelligence):ProviderConfig{
 const list=providerCandidates(tier);
 if(!list.length)throw new Error("NO_AI_PROVIDER_CONFIGURED");
 return list[0];
}

export function intelligenceFactor(tier:Intelligence){
 return tier==="light"?1:tier==="high"?5:2;
}
export function minimumChargeFenForTier(tier:Intelligence){
 const base=Math.max(1,Number(process.env.AI_MINIMUM_CHARGE_FEN||10));
 return base*intelligenceFactor(tier);
}
export function maxOutputForTier(tier:Intelligence){
 return tier==="light"?1536:tier==="high"?8192:4096;
}

function providerCostRmb(p:ProviderConfig,u:ProviderUsage){
 const normal=Math.max(0,u.inputTokens-u.cachedTokens);
 return normal/1_000_000*p.inputRmbPerM
  +u.cachedTokens/1_000_000*p.cachedRmbPerM
  +u.outputTokens/1_000_000*p.outputRmbPerM;
}

export function estimateMaxRetailFen(inputChars:number,task:TaskKind,tier:Intelligence){
 const candidates=providerCandidates(tier);
 if(!candidates.length)throw new Error("NO_AI_PROVIDER_CONFIGURED");
 const approxInput=Math.max(1,Math.ceil(inputChars/2));
 const maxOut=maxOutputForTier(tier);
 const retail=Math.max(1,Number(process.env.AI_RETAIL_MULTIPLIER||4))*intelligenceFactor(tier);
 const minimumFen=minimumChargeFenForTier(tier);
 // Reserve against the most expensive currently-configured fallback, not only the first provider.
 const worst=Math.max(...candidates.map(p =>
  approxInput/1_000_000*p.inputRmbPerM + maxOut/1_000_000*p.outputRmbPerM
 ));
 return {reserveFen:Math.max(minimumFen,Math.ceil(worst*retail*100)),maxOutputTokens:maxOut};
}

export function actualChargeFen(p:ProviderConfig,u:ProviderUsage,tier:Intelligence){
 const costRmb=providerCostRmb(p,u);
 const retail=Math.max(1,Number(process.env.AI_RETAIL_MULTIPLIER||4))*intelligenceFactor(tier);
 const minimumFen=minimumChargeFenForTier(tier);
 return {providerCostFen:costRmb*100,chargeFen:Math.max(minimumFen,Math.ceil(costRmb*retail*100))};
}

function outputText(data:any){
 if(typeof data?.output_text==="string")return data.output_text.trim();
 return (data?.output||[]).flatMap((x:any)=>x?.content||[]).map((x:any)=>x?.text||"").join("").trim();
}

async function callProvider(p:ProviderConfig,input:string,tier:Intelligence,limit:number):Promise<ProviderResult>{
 if(p.provider==="volcengine"){
  const capabilities=providerCapabilities(p);
  const body:Record<string,unknown>={model:p.model,input,max_output_tokens:limit};
  if(capabilities.thinking)body.thinking={type:"enabled"};
  if(capabilities.reasoningEffort)body.reasoning={effort:reasoningEffortForTier(tier)};
  const r=await fetch(`${p.baseUrl}/responses`,{
   method:"POST",
   headers:{Authorization:`Bearer ${p.apiKey}`,"Content-Type":"application/json"},
   body:JSON.stringify(body)
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(`${p.provider.toUpperCase()}_${r.status}`);
  const u=data.usage||{};
  return {provider:p.provider,model:String(data.model||p.model),text:outputText(data),pricing:p,usage:{
   inputTokens:Number(u.input_tokens||0),outputTokens:Number(u.output_tokens||0),
   cachedTokens:Number(u.input_tokens_details?.cached_tokens||0)
  }};
 }

 const extra:any={};
 if(p.provider==="zhipu"){
  const capabilities=providerCapabilities(p);
  extra.temperature=1;extra.top_p=.95;
  if(capabilities.reasoningEffort)extra.reasoning_effort=reasoningEffortForTier(tier);
  if(capabilities.thinking)extra.thinking={type:"enabled",clear_thinking:false};
 }
 const r=await fetch(`${p.baseUrl}/chat/completions`,{
  method:"POST",
  headers:{Authorization:`Bearer ${p.apiKey}`,"Content-Type":"application/json"},
  body:JSON.stringify({
   model:p.model,messages:[{role:"user",content:input}],
   max_tokens:limit,stream:false,...extra
  })
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(`${p.provider.toUpperCase()}_${r.status}`);
 const u=data.usage||{};
 return {provider:p.provider,model:String(data.model||p.model),
  text:String(data.choices?.[0]?.message?.content||"").trim(),pricing:p,usage:{
   inputTokens:Number(u.prompt_tokens||u.input_tokens||0),
   outputTokens:Number(u.completion_tokens||u.output_tokens||0),
   cachedTokens:Number(u.prompt_cache_hit_tokens||u.prompt_tokens_details?.cached_tokens||0)
  }};
}

export async function runText(input:string,task:TaskKind,tier:Intelligence,maxOutputTokens?:number):Promise<ProviderResult>{
 const candidates=providerCandidates(tier);
 if(!candidates.length)throw new Error("NO_AI_PROVIDER_CONFIGURED");
 const limit=maxOutputTokens||maxOutputForTier(tier);
 let last:unknown;
 for(const p of candidates){
  try{return await callProvider(p,input,tier,limit)}
  catch(e){
   last=e;
   console.error("[AI provider fallback]",{provider:p.provider,model:p.model,error:e instanceof Error?e.message:String(e)});
  }
 }
 throw last instanceof Error?last:new Error("ALL_AI_PROVIDERS_FAILED");
}
