import{LINGXIFIELD_PUBLIC_TOOL_REGISTRY,type PublicToolRegistryEntry}from"@/lib/tools/platform/tool-registry";
import{SASI_SKILLS}from"@/lib/sasi/skills/catalog";
import type{SasiMode,SasiSkillId}from"@/lib/sasi/skills/types";

export type UnifiedCapabilityKind="tool"|"skill";
export type UnifiedCapabilityEntry={
 id:string;
 kind:UnifiedCapabilityKind;
 title:string;
 aliases:string[];
 capabilities:string[];
 modes:SasiMode[];
 privacyMode?:string;
 execution:"local"|"online"|"orchestrated";
 priority:number;
};

const toolEntries:UnifiedCapabilityEntry[]=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map((tool:PublicToolRegistryEntry)=>({
 id:tool.slug,kind:"tool",title:tool.zh,
 aliases:[tool.slug,tool.zh,tool.en],
 capabilities:[...tool.capabilities],
 modes:[],
 privacyMode:tool.privacyMode,
 execution:tool.mode==="local"?"local":"online",
 priority:70
}));

const skillEntries:UnifiedCapabilityEntry[]=Object.values(SASI_SKILLS).map(skill=>({
 id:skill.id,kind:"skill",title:skill.title,
 aliases:[skill.id,skill.title,...skill.triggers],
 capabilities:[skill.id,...skill.triggers],
 modes:[...skill.modes],
 execution:"orchestrated",
 priority:skill.priority
}));

export const LINGXI_UNIFIED_CAPABILITIES:UnifiedCapabilityEntry[]=[...toolEntries,...skillEntries];

function normalize(value:string){
 return value.toLowerCase().normalize("NFKC").replace(/[\s_/.-]+/g," ").trim();
}
function terms(value:string){
 return normalize(value).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>=2);
}
function phraseScore(query:string,value:string){
 const q=normalize(query),v=normalize(value);if(!q||!v)return 0;
 if(q===v)return 12;
 const qc=q.replace(/\s+/g,""),vc=v.replace(/\s+/g,"");
 if(qc===vc)return 12;
 if(q.includes(v)||v.includes(q)||qc.includes(vc)||vc.includes(qc))return Math.min(10,3+Math.floor(Math.min(qc.length,vc.length)/4));
 const qTerms=new Set(terms(q)),vTerms=terms(v);
 let score=0;for(const token of vTerms)if(qTerms.has(token))score+=2;
 return score;
}

export function findUnifiedCapabilities(query:string,input?:{mode?:SasiMode;limit?:number;kinds?:UnifiedCapabilityKind[]}){
 const limit=Math.max(1,Math.min(20,input?.limit??8));
 const allowKinds=input?.kinds?.length?new Set(input.kinds):null;
 return LINGXI_UNIFIED_CAPABILITIES
  .filter(item=>!allowKinds||allowKinds.has(item.kind))
  .filter(item=>!input?.mode||item.kind==="tool"||item.modes.includes(input.mode))
  .map(item=>{
   let score=0;
   for(const value of [...item.aliases,...item.capabilities])score=Math.max(score,phraseScore(query,value));
   if(item.kind==="skill"&&input?.mode&&item.modes.includes(input.mode))score+=score?2:0;
   return{...item,score};
  })
  .filter(item=>item.score>0)
  .sort((a,b)=>b.score-a.score||b.priority-a.priority||a.id.localeCompare(b.id))
  .slice(0,limit);
}

export function unifiedCapabilityById(kind:UnifiedCapabilityKind,id:string){
 return LINGXI_UNIFIED_CAPABILITIES.find(item=>item.kind===kind&&item.id===id)||null;
}

export function assertUnifiedCapabilityCatalog(){
 const keys=new Set<string>();
 for(const item of LINGXI_UNIFIED_CAPABILITIES){
  const key=`${item.kind}:${item.id}`;if(keys.has(key))throw new Error("UNIFIED_CAPABILITY_DUPLICATE:"+key);keys.add(key);
  if(!item.title||!item.capabilities.length)throw new Error("UNIFIED_CAPABILITY_INCOMPLETE:"+key);
 }
 if(toolEntries.length<100)throw new Error("UNIFIED_TOOL_CATALOG_TOO_SMALL");
 if(skillEntries.length!==Object.keys(SASI_SKILLS).length)throw new Error("UNIFIED_SKILL_CATALOG_DRIFT");
 return{tools:toolEntries.length,skills:skillEntries.length,total:LINGXI_UNIFIED_CAPABILITIES.length};
}
