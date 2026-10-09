import{test,expect}from"playwright/test";
import{selectSasiSkills,compileSasiSkillGuidance}from"../../lib/sasi/skills/router";
import{SASI_SKILLS}from"../../lib/sasi/skills/catalog";
import{sasiSkillUi}from"../../lib/sasi/skills/ui";

const examples=[
 {mode:"research",prompt:"追踪最近60天 ArXiv 论文，按方法和局限排序",expected:"research-tracking"},
 {mode:"research",prompt:"精读这篇论文的实验设计、假设和不足",expected:"academic-deep-reading"},
 {mode:"research",prompt:"根据论文生成可编辑PPT，并标注每页数据来源",expected:"editable-presentation"},
 {mode:"research",prompt:"把Excel数据做成交互数据图表",expected:"data-visualization"},
 {mode:"learning",prompt:"根据我的真实记录整理一份周报",expected:"work-report"},
 {mode:"book",prompt:"润色我写的这段内容，保留数据和真实体验",expected:"content-refinement"}
]as const;
for(const item of examples){
 test(`auto-route outcome skill ${item.expected}`,()=>{
  const plan=selectSasiSkills({mode:item.mode,prompt:item.prompt,hasEvidence:true});
  expect(plan.ids).toContain(item.expected);
  expect(plan.ids.length).toBeLessThanOrEqual(8);
  expect(compileSasiSkillGuidance(plan.ids)).toContain(SASI_SKILLS[item.expected].guidance);
 });
}
test("do not hallucinate web execution when a research source isn't available",()=>{
 const text=compileSasiSkillGuidance(selectSasiSkills({mode:"research",prompt:"追踪最新论文"}).ids);
 expect(text).toContain("Mark retrieval not available");
});
test("new skills have complete nine-language visible labels",()=>{
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"]as const){
  for(const mode of ["book","learning","research","website"]as const){
   const rows=sasiSkillUi(mode,lang);
   expect(rows.every(row=>row.label.trim()&&row.description.trim())).toBeTruthy();
  }
 }
});
