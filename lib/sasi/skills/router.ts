import{DEFAULT_MODE_SKILLS,SASI_SKILLS}from"./catalog";
import type{SasiSkillId,SasiSkillPlan,SasiSkillRequest}from"./types";

const normalize=(value:string)=>value.toLowerCase();

export function selectSasiSkills(request:SasiSkillRequest):SasiSkillPlan{
 const prompt=normalize(request.prompt??"");
 const files=(request.files??[]).map(normalize);
 const selected=new Set<SasiSkillId>(DEFAULT_MODE_SKILLS[request.mode]);
 const reason={} as Record<SasiSkillId,string[]>;
 const note=(id:SasiSkillId,why:string)=>{selected.add(id);(reason[id]??=[]).push(why)};

 for(const id of DEFAULT_MODE_SKILLS[request.mode])note(id,"mode-default");

 for(const skill of Object.values(SASI_SKILLS)){
  if(!skill.modes.includes(request.mode))continue;
  for(const trigger of skill.triggers){
   const t=normalize(trigger);
   if(prompt.includes(t)||files.some(file=>file.includes(t))){
    note(skill.id,`trigger:${trigger}`);
    break;
   }
  }
 }

 if(request.hasEvidence)note("evidence-grounding","evidence-present");
 if(files.some(file=>/\.(pdf|docx?|pptx?|xlsx?|epub|rtf|csv|tsv|ods)$/i.test(file)))note("document-understanding","document-file");
 if(files.some(file=>/\.(png|jpe?g|webp|gif|mp3|wav|m4a|mp4|mov|webm)$/i.test(file)))note("multi-model-routing","media-file");

 const ids=[...selected]
  .filter(id=>SASI_SKILLS[id].modes.includes(request.mode))
  .sort((a,b)=>SASI_SKILLS[b].priority-SASI_SKILLS[a].priority)
  .slice(0,8);

 return{ids,reason};
}

export function validateSasiSkillIds(input:unknown,mode:SasiSkillRequest["mode"]):SasiSkillId[]{
 if(!Array.isArray(input))return DEFAULT_MODE_SKILLS[mode].slice(0,8);
 const result:SasiSkillId[]=[];
 for(const raw of input){
  if(typeof raw!=="string"||!Object.prototype.hasOwnProperty.call(SASI_SKILLS,raw))continue;
  const id=raw as SasiSkillId;
  if(!SASI_SKILLS[id].modes.includes(mode)||result.includes(id))continue;
  result.push(id);
  if(result.length>=8)break;
 }
 return result.length?result:DEFAULT_MODE_SKILLS[mode].slice(0,8);
}

export function compileSasiSkillGuidance(ids:SasiSkillId[]):string{
 const rows=ids.map(id=>SASI_SKILLS[id]?.guidance).filter(Boolean);
 return rows.length?`SASI active skills:\n- ${rows.join("\n- ")}`:"";
}
