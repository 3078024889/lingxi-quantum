import{TOOLS}from"@/lib/tools/registry";
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

export const TOOL_CAPABILITIES:readonly LingxiCapability[]=TOOLS.map(tool=>({
 id:`tool:${tool.slug}`,kind:"tool",status:tool.status,localOnly:tool.localOnly,title:tool.titleZh,route:`/tools/${tool.slug}`,
 metadata:{slug:tool.slug,category:tool.category,accept:tool.accept??null,multiple:Boolean(tool.multiple),maxFiles:tool.maxFiles??null,maxSizeMB:tool.maxSizeMB??null}
}));

export const SASI_CAPABILITIES:readonly LingxiCapability[]=Object.values(SASI_SKILLS).map(skill=>({
 id:`sasi:${skill.id}`,kind:"sasi-skill",status:"live",localOnly:false,title:skill.title,modes:skill.modes,
 metadata:{skillId:skill.id,priority:skill.priority}
}));

const ALL=[...TOOL_CAPABILITIES,...SASI_CAPABILITIES];
const INDEX=new Map(ALL.map(row=>[row.id,row]));
if(INDEX.size!==ALL.length)throw new Error("CAPABILITY_ID_COLLISION");

export function listLingxiCapabilities(kind?:LingxiCapabilityKind){return kind?ALL.filter(row=>row.kind===kind):ALL.slice()}
export function getLingxiCapability(id:string){return INDEX.get(id)??null}
export function toolCapabilityId(slug:string){return`tool:${slug.trim()}`}
export function sasiCapabilityId(id:SasiSkillId){return`sasi:${id}`}
