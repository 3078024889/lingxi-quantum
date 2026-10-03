import{DEFAULT_MODE_SKILLS}from"./catalog";
import type{SasiMode,SasiSkillId}from"./types";

export type SasiModeAdapter={
 mode:SasiMode;
 input:"creation"|"knowledge";
 result:"video"|"website"|"grounded-answer";
 defaultSkills:SasiSkillId[];
 evidenceRequired:boolean;
};

export const SASI_MODE_ADAPTERS:Record<SasiMode,SasiModeAdapter>={
 drama:{mode:"drama",input:"creation",result:"video",defaultSkills:DEFAULT_MODE_SKILLS.drama,evidenceRequired:false},
 website:{mode:"website",input:"creation",result:"website",defaultSkills:DEFAULT_MODE_SKILLS.website,evidenceRequired:false},
 book:{mode:"book",input:"knowledge",result:"grounded-answer",defaultSkills:DEFAULT_MODE_SKILLS.book,evidenceRequired:true},
 learning:{mode:"learning",input:"knowledge",result:"grounded-answer",defaultSkills:DEFAULT_MODE_SKILLS.learning,evidenceRequired:true},
 research:{mode:"research",input:"knowledge",result:"grounded-answer",defaultSkills:DEFAULT_MODE_SKILLS.research,evidenceRequired:true},
};
