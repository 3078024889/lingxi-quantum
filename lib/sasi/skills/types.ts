export type SasiMode="drama"|"website"|"book"|"learning"|"research";

export type SasiSkillId=
 |"agent-skill-discovery"
 |"document-understanding"
 |"semantic-retrieval"
 |"evidence-grounding"
 |"structured-output"
 |"web-research"
 |"browser-execution"
 |"multi-model-routing"
 |"workflow-orchestration"
 |"observability"
 |"multimodal-continuity"
 |"website-production"
 |"drama-script"
 |"drama-storyboard"
 |"drama-visual"
 |"drama-sound"
 |"teaching-practice"
 |"source-comparison";

export type SasiSkillDefinition={
 id:SasiSkillId;
 title:string;
 description:string;
 modes:SasiMode[];
 triggers:string[];
 priority:number;
 guidance:string;
 inspiration:string[];
 licensePattern:string;
};

export type SasiSkillRequest={
 mode:SasiMode;
 prompt?:string;
 files?:string[];
 hasEvidence?:boolean;
};

export type SasiSkillPlan={
 ids:SasiSkillId[];
 reason:Record<SasiSkillId,string[]>;
};
