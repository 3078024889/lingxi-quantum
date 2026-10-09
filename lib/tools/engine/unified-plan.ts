import{graphForTool}from"./stage-graph";
import{LINGXIFIELD_PUBLIC_TOOL_REGISTRY,publicToolBySlug}from"@/lib/tools/platform/tool-registry";
import{recipeBySlug}from"@/lib/tools/platform";

export type UnifiedToolExecutionPlan=
 |{kind:"engine-graph";toolId:string;capabilities:string[];resultChecks:string[];stageCount:number;privacyMode:string}
 |{kind:"dedicated";toolId:string;capabilities:string[];resultChecks:string[];privacyMode:string;reason:"DEDICATED_TOOL_FLOW"};

const NON_ENGINE_CAPABILITIES=new Set(["download.local","share.link","privacy.temp-mail","privacy.burn-after-read","storage.private","commerce.quote","commerce.pay"]);

function recipeChecks(slug:string,capabilities:string[]){
 const checks:string[]=[];
 if(capabilities.some(x=>x.startsWith("document.")||x==="pdf"))checks.push("output-opens");
 if(capabilities.some(x=>x.startsWith("image.")))checks.push("image-decodes");
 if(capabilities.some(x=>x.startsWith("media.")||x.startsWith("video.")||x.startsWith("audio.")))checks.push("media-decodes");
 if(capabilities.some(x=>x.startsWith("privacy.")))checks.push("privacy-contract-holds");
 if(capabilities.includes("download.local"))checks.push("download-reopens");
 if(!checks.length)checks.push("result-present");
 return[...new Set(checks)];
}

export function unifiedToolExecutionPlan(toolId:string):UnifiedToolExecutionPlan|null{
 const pub=publicToolBySlug(toolId),recipe=recipeBySlug(toolId);
 if(!pub||!recipe)return null;
 const graph=graphForTool(toolId);
 if(graph&&graph.stages.length){
  return{kind:"engine-graph",toolId,capabilities:[...recipe.capabilities],resultChecks:[...new Set([...graph.resultChecks,...recipeChecks(toolId,recipe.capabilities)])],stageCount:graph.stages.length,privacyMode:recipe.privacyMode};
 }
 // A missing generic engine graph is not automatically a defect: several tools use
 // dedicated browser/API flows. Keep that explicit until a real executor graph is proven.
 return{kind:"dedicated",toolId,capabilities:[...recipe.capabilities],resultChecks:recipeChecks(toolId,recipe.capabilities),privacyMode:recipe.privacyMode,reason:"DEDICATED_TOOL_FLOW"};
}

export function assertAllPublicToolsHaveExecutionPlans(){
 const missing:string[]=[];
 const slugs=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map(x=>x.slug);
 for(const slug of slugs)if(!unifiedToolExecutionPlan(slug))missing.push(slug);
 if(missing.length)throw new Error("TOOL_EXECUTION_PLAN_MISSING:"+missing.join(","));
 return{count:slugs.length};
}
