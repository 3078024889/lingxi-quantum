import{test,expect}from"playwright/test";
import{attachUnifiedArtifacts,canResumeUnifiedTask,createUnifiedTask,markUnifiedTaskVerified,publicTaskView,transitionUnifiedTask}from"../../lib/tasks/unified-task";

test("tool and SASI tasks share one state machine and artifact contract",()=>{
 const tool=createUnifiedTask({id:"tool-1",domain:"tool",capability:"pdf-editor",lane:"browser",billing:"free",createdAt:"2026-10-09T00:00:00Z"});
 const running=transitionUnifiedTask(tool,"running",{progress:25});
 const validating=transitionUnifiedTask(running,"validating",{progress:90,recovery:"ready"});
 const withFile=attachUnifiedArtifacts(validating,[{id:"pdf-1",kind:"file",name:"signed.pdf",mime:"application/pdf",byteSize:1234}],"checking");
 const verified=markUnifiedTaskVerified(withFile,true);
 const done=transitionUnifiedTask(verified,"succeeded");
 expect(done.progress).toBe(100);
 expect(done.verification).toBe("verified");
 expect(publicTaskView(done).artifacts[0].name).toBe("signed.pdf");

 const sasi=createUnifiedTask({id:"sasi-1",domain:"sasi",capability:"research",lane:"external",billing:"included"});
 expect(transitionUnifiedTask(sasi,"planning").domain).toBe("sasi");
});

test("invalid transitions and rejected outputs cannot masquerade as success",()=>{
 const task=createUnifiedTask({id:"x",domain:"tool",capability:"image-convert"});
 expect(()=>transitionUnifiedTask(task,"succeeded")).toThrow("TASK_TRANSITION_INVALID");
 const running=transitionUnifiedTask(task,"running");
 const validating=transitionUnifiedTask(running,"validating");
 const rejected=markUnifiedTaskVerified(validating,false,"Output failed validation");
 expect(()=>transitionUnifiedTask(rejected,"succeeded")).toThrow("TASK_RESULT_REJECTED");
});

test("recovery state is consistent across tools and SASI",()=>{
 const base=createUnifiedTask({id:"r",domain:"sasi",capability:"drama"});
 const running=transitionUnifiedTask(base,"running",{progress:40});
 const waiting=transitionUnifiedTask(running,"waiting",{recovery:"partial"});
 expect(canResumeUnifiedTask(waiting)).toBeTruthy();
 const publicView=publicTaskView(waiting);
 expect(publicView.recovery).toBe("partial");
 expect((publicView as any).safeError).toBeUndefined();
});
