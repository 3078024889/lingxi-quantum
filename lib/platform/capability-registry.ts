import{TOOLS}from"@/lib/tools/registry";
import{LINGXIFIELD_PUBLIC_TOOL_REGISTRY}from"@/lib/tools/platform/tool-registry";
import{SASI_SKILLS}from"@/lib/sasi/skills/catalog";
import type{SasiMode,SasiSkillId}from"@/lib/sasi/skills/types";

export type LingxiCapabilityKind="tool"|"sasi-skill";
export type LingxiCapability={
 id:string;
 kind:LingxiCapabilityKind;
 status:"live"|"beta"|"planned";
 localOnly:boolean;
 title:string;
 route?:string;
 modes?:SasiMode[];
 metadata?:Record<string,unknown>;
};

const legacyToolMeta=new Map(TOOLS.map(tool=>[tool.slug,tool] as const));

export const TOOL_CAPABILITIES:readonly LingxiCapability[]=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map(tool=>{
 const meta=legacyToolMeta.get(tool.slug);
 return{
  id:`tool:${tool.slug}`,kind:"tool",status:meta?.status??"beta",localOnly:tool.mode==="local",title:tool.zh,route:`/tools/${tool.slug}`,
  metadata:{
   slug:tool.slug,mode:tool.mode,capabilities:tool.capabilities,contractVersion:tool.contractVersion,privacyMode:tool.privacyMode,
   requiresNineLanguage:tool.requiresNineLanguage,requiresDesktop:tool.requiresDesktop,requiresMobile:tool.requiresMobile,requiresRealFixture:tool.requiresRealFixture,
   accept:meta?.accept??null,multiple:Boolean(meta?.multiple),maxFiles:meta?.maxFiles??null,maxSizeMB:meta?.maxSizeMB??null
  }
 };
});

export const SASI_CAPABILITIES:readonly LingxiCapability[]=Object.values(SASI_SKILLS).map(skill=>({
 id:`sasi:${skill.id}`,kind:"sasi-skill",status:"live",localOnly:false,title:skill.title,modes:skill.modes,
 metadata:{skillId:skill.id,priority:skill.priority}
}));

const ALL=[...TOOL_CAPABILITIES,...SASI_CAPABILITIES];
const INDEX=new Map(ALL.map(row=>[row.id,row]));
if(INDEX.size!==ALL.length)throw new Error("CAPABILITY_ID_COLLISION");
if(TOOL_CAPABILITIES.length!==LINGXIFIELD_PUBLIC_TOOL_REGISTRY.length)throw new Error("PUBLIC_TOOL_CAPABILITY_DRIFT");

export function listLingxiCapabilities(kind?:LingxiCapabilityKind){return kind?ALL.filter(row=>row.kind===kind):ALL.slice()}
export function getLingxiCapability(id:string){return INDEX.get(id)??null}
export function toolCapabilityId(slug:string){return`tool:${slug.trim()}`}
export function sasiCapabilityId(id:SasiSkillId){return`sasi:${id}`}
