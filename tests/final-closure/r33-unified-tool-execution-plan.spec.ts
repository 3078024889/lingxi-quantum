import{test,expect}from"playwright/test";
import{LINGXIFIELD_PUBLIC_TOOL_REGISTRY}from"../../lib/tools/platform/tool-registry";
import{unifiedToolExecutionPlan}from"../../lib/tools/engine/unified-plan";

test("every public tool has a truthful unified execution plan",()=>{
 const plans=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map(tool=>unifiedToolExecutionPlan(tool.slug));
 expect(LINGXIFIELD_PUBLIC_TOOL_REGISTRY.length).toBeGreaterThanOrEqual(100);
 expect(plans.every(Boolean)).toBeTruthy();
 expect(plans).toHaveLength(LINGXIFIELD_PUBLIC_TOOL_REGISTRY.length);
 const engine=plans.filter(x=>x?.kind==="engine-graph");
 const dedicated=plans.filter(x=>x?.kind==="dedicated");
 expect(engine.length+dedicated.length).toBe(LINGXIFIELD_PUBLIC_TOOL_REGISTRY.length);
 for(const plan of plans){
  expect(plan?.capabilities.length).toBeGreaterThan(0);
  expect(plan?.resultChecks.length).toBeGreaterThan(0);
 }
});
