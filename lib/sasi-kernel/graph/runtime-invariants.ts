export function assertTaskNodeInvariant(x:{taskState:string;nodeStates:string[]}){
 const terminal=new Set(["succeeded","failed","cancelled"]);
 if(x.taskState==="succeeded"&&x.nodeStates.some(s=>s!=="succeeded"&&s!=="skipped"))throw new Error("SASI_INVARIANT_SUCCESS_WITH_UNFINISHED_NODE");
 if(x.taskState==="failed"&&!x.nodeStates.some(s=>s==="failed"))throw new Error("SASI_INVARIANT_FAILED_WITHOUT_FAILED_NODE");
 if(terminal.has(x.taskState)&&x.nodeStates.some(s=>s==="running"||s==="validating"||s==="retrying"))throw new Error("SASI_INVARIANT_TERMINAL_WITH_ACTIVE_NODE");
 return true;
}
export function monotonicProgress(previous:number,next:number){if(previous<0||previous>1||next<0||next>1||next<previous)throw new Error("SASI_PROGRESS_NOT_MONOTONIC");return next}
