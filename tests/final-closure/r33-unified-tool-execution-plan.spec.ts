import{test,expect}from"playwright/test";
import{LINGXIFIELD_PUBLIC_TOOL_REGISTRY}from"../../lib/tools/platform/tool-registry";
import{unifiedToolExecutionPlan}from"../../lib/tools/engine/unified-plan";

test("all 118 public tools have a truthful unified execution plan",()=>{
 const plans=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map(tool=>unifiedToolExecutionPlan(tool.slug));
 expect(plans.every(Boolean)).toBeTruthy();
 expect(plans).toHaveLength(118);
 const engine=plans.filter(x=>x?.kind==="engine-graph");
 const dedicated=plans.filter(x=>x?.kind==="dedicated");
 expect(engine.length+dedicated.length).toBe(118);
 for(const plan of plans){
  expect(plan?.capabilities.length).toBeGreaterThan(0);
  expect(plan?.resultChecks.length).toBeGreaterThan(0);
 }
});
