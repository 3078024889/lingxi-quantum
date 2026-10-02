import{test,expect}from"playwright/test";
import{transitionPaidTask}from"../../lib/tools/commerce/paid-task-state";

test("paid task state machine is deterministic and terminal until reset",()=>{
 let s:any="idle";
 for(const type of ["PRICE","QUOTED","PAY","PAID","GENERATE","COMPLETE"] as const)s=transitionPaidTask(s,{type} as any);
 expect(s).toBe("completed");
 expect(()=>transitionPaidTask(s,{type:"PAY"} as any)).toThrow(/INVALID_PAID_TASK_TRANSITION/);
 expect(transitionPaidTask(s,{type:"RESET"})).toBe("idle");
});
