import{test,expect}from"playwright/test";
import{verifyUnifiedOutcome,outcomeCompressionImproved}from"../../lib/tasks/outcome-contract";
import{validateArtifact,compressionActuallyHelped}from"../../lib/tools/engine/quality-gate";
import{verifyTextOutcome,shouldEscalate}from"../../lib/sasi/durable/outcome-verifier";
import{assertAllPublicToolsHaveExecutionPlans,unifiedToolExecutionPlan}from"../../lib/tools/engine/unified-plan";

test("100+ tools all resolve to a unified execution plan",()=>{
 const result=assertAllPublicToolsHaveExecutionPlans();
 expect(result.count).toBeGreaterThanOrEqual(100);
 expect(unifiedToolExecutionPlan("e-sign-pdf")).not.toBeNull();
 expect(unifiedToolExecutionPlan("food-calorie")).not.toBeNull();
});

test("tool and SASI success use the same outcome kernel",()=>{
 const artifact=verifyUnifiedOutcome({kind:"artifact",nonEmpty:true,outputBytes:1024,pages:2});
 expect(artifact.pass).toBeTruthy();
 expect(validateArtifact({nonEmpty:true,outputBytes:1024,pages:2}).ok).toBeTruthy();
 const empty=validateArtifact({nonEmpty:false,outputBytes:0});
 expect(empty.ok).toBeFalsy();
 expect(empty.reason).toBe("EMPTY_RESULT");

 const text=verifyUnifiedOutcome({kind:"text",text:"A grounded answer with enough detail.",minChars:20,mustContain:["grounded"]});
 const sasi=verifyTextOutcome({text:"A grounded answer with enough detail.",minChars:20,mustContain:["grounded"]});
 expect(sasi.pass).toBe(text.pass);
 expect(sasi.reasons).toEqual(text.reasons);
});

test("shared result verification preserves retry and compression semantics",()=>{
 const retry=verifyTextOutcome({text:"short",minChars:30});
 expect(retry.pass).toBeFalsy();
 expect(shouldEscalate(retry,0,2)).toBeTruthy();
 expect(outcomeCompressionImproved(1000,500)).toBeTruthy();
 expect(compressionActuallyHelped(1000,500)).toBeTruthy();
 expect(compressionActuallyHelped(1000,1200)).toBeFalsy();
});
