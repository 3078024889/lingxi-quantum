import {LINGXIFIELD_PUBLIC_TOOL_REGISTRY} from "./tool-registry";
import capabilities from "./capability-genome.json";

const byCapability=new Map(capabilities.map(c=>[c.id,c] as const));

function outputsForTool(slug:string){
 const tool=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.find(t=>t.slug===slug);
 if(!tool)return [];
 return Array.from(new Set(tool.capabilities.flatMap(id=>byCapability.get(id)?.output||[])));
}
function inputsForTool(slug:string){
 const tool=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.find(t=>t.slug===slug);
 if(!tool)return [];
 return Array.from(new Set(tool.capabilities.flatMap(id=>byCapability.get(id)?.input||[])));
}

export function compatibleNextTools(slug:string){
 const outputs=new Set(outputsForTool(slug));
 if(!outputs.size)return [];
 return LINGXIFIELD_PUBLIC_TOOL_REGISTRY
  .filter(candidate=>candidate.slug!==slug)
  .map(candidate=>{
   const matched=inputsForTool(candidate.slug).filter(input=>outputs.has(input));
   return matched.length?{slug:candidate.slug,matched}:null;
  })
  .filter((value):value is {slug:string;matched:string[]}=>Boolean(value));
}

export function workflowCompatibilitySnapshot(){
 return LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map(tool=>({
  slug:tool.slug,
  outputs:outputsForTool(tool.slug),
  next:compatibleNextTools(tool.slug),
 }));
}
