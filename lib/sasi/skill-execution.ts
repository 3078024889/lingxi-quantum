export type SkillSelection={source:"platform"|"user";id:string};
export type RuntimeSkill={id:string;name:string;description:string;instructions:string;source:"platform"|"user";sha256?:string};

export function normalizeSkillSelection(value:unknown):SkillSelection|null{
 if(!value||typeof value!=="object")return null;
 const v=value as Record<string,unknown>,source=v.source,id=String(v.id||"").trim();
 if((source!=="platform"&&source!=="user")||!id||id.length>160)return null;
 return{source,id};
}
export function skillRuntimeConstraint(skill:RuntimeSkill|null){
 if(!skill)return null;
 return{
  skillId:skill.id,skillName:skill.name,source:skill.source,sha256:skill.sha256||null,
  instruction:skill.instructions.slice(0,20000),
 };
}
