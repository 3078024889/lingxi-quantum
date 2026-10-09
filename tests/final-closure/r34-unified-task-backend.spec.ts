import{test,expect}from"playwright/test";
import{durableRunToUnifiedTask}from"../../lib/sasi/durable/unified-task-view";
import{chooseUnifiedExecution}from"../../lib/tasks/unified-execution-policy";

test("SASI durable states use the same public task semantics as tools",()=>{
 const waiting=durableRunToUnifiedTask({id:"11111111-1111-4111-8111-111111111111",task:"research",state:"waiting",current_step:"collect",attempt:1,created_at:"2026-10-09T00:00:00.000Z",updated_at:"2026-10-09T00:01:00.000Z"});
 expect(waiting.domain).toBe("sasi");expect(waiting.state).toBe("waiting");expect(waiting.recovery).toBe("ready");
 const done=durableRunToUnifiedTask({id:"22222222-2222-4222-8222-222222222222",task:"website",state:"succeeded",output_json:{artifact:true},created_at:"2026-10-09T00:00:00.000Z",updated_at:"2026-10-09T00:02:00.000Z"});
 expect(done.state).toBe("succeeded");expect(done.progress).toBe(100);expect(done.recovery).toBe("ready");
});

test("browser-local work wins when it can finish without network",()=>{
 const decision=chooseUnifiedExecution({inputBytes:1024,browserEligible:true,deterministic:true,needsNetwork:false,serverAvailable:true,externalAllowed:true});
 expect(decision.primary).toBe("browser");expect(decision.reason).toBe("OK");
});

test("sensitive work never leaves the platform without explicit external consent",()=>{
 const blocked=chooseUnifiedExecution({inputBytes:1024,browserEligible:false,deterministic:false,needsNetwork:true,serverAvailable:false,externalAllowed:true,sensitive:true,userAllowsExternal:false});
 expect(blocked.primary).toBe("defer");expect(blocked.reason).toBe("EXTERNAL_CONSENT_REQUIRED");
 const allowed=chooseUnifiedExecution({inputBytes:1024,browserEligible:false,deterministic:false,needsNetwork:true,serverAvailable:false,externalAllowed:true,sensitive:true,userAllowsExternal:true});
 expect(allowed.primary).toBe("external");
});
