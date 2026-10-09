import {test,expect} from "playwright/test";
import {selectSasiSkills,validateSasiSkillIds,compileSasiSkillGuidance} from "../../lib/sasi/skills/router";

test("explicit paper critique and research tracking survive eight-skill budget",()=>{
 const plan=selectSasiSkills({mode:"research",prompt:"追踪最近60天 arxiv 论文并精读，比较实验设计"});
 expect(plan.ids).toContain("research-tracker");
 expect(plan.ids).toContain("research-critique");
 expect(plan.ids.length).toBeLessThanOrEqual(8);
 expect(plan.reason["research-tracker"]).toEqual(expect.arrayContaining([expect.stringMatching(/^trigger:/)]));
});
test("data visualization and reports route to actual requested capability",()=>{
 const plan=selectSasiSkills({mode:"research",prompt:"请将 Excel 数据生成图表，制作研究报告"});
 expect(plan.ids).toContain("data-visualization");
 expect(plan.ids).toContain("report-synthesis");
});
test("workflow authoring stays selectable in all modes and rejects foreign modes",()=>{
 for(const mode of ["drama","website","book","learning","research"] as const){
  const plan=selectSasiSkills({mode,prompt:"帮我创建技能，把这项任务做成可复用流程"});
  expect(plan.ids).toContain("skill-authoring");
 }
 expect(validateSasiSkillIds(["drama-script","research-tracker","research-tracker"],"research")).toEqual(["research-tracker"]);
});
test("research guidance prohibits invented sources and fake artifact claims",()=>{
 const guidance=compileSasiSkillGuidance(["research-tracker","data-visualization","report-synthesis"]);
 expect(guidance).toContain("never invent a paper or citation");
 expect(guidance).toContain("only claim downloadable");
 expect(guidance).toContain("never fabricate metrics");
});
