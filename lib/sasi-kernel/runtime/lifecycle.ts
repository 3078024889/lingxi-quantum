import type{LingxiTaskState}from"@/lib/tasks/task-contract";
export const SASI_TASK_STATES=["queued","planning","running","validating","retrying","succeeded","failed","cancelled"] as const;
export type SasiTaskState=Extract<LingxiTaskState,typeof SASI_TASK_STATES[number]>;
export const SASI_NODE_STATES=["queued","running","validating","retrying","succeeded","failed","skipped"] as const;
export type SasiNodeState=typeof SASI_NODE_STATES[number];
const TASK_TRANSITIONS:Record<SasiTaskState,ReadonlySet<SasiTaskState>>={queued:new Set(["planning","running","cancelled","failed"]),planning:new Set(["running","failed","cancelled"]),running:new Set(["validating","retrying","succeeded","failed","cancelled"]),validating:new Set(["succeeded","retrying","failed"]),retrying:new Set(["running","failed","cancelled"]),succeeded:new Set(),failed:new Set(["retrying"]),cancelled:new Set()};
export function canTransitionTask(from:SasiTaskState,to:SasiTaskState){return TASK_TRANSITIONS[from].has(to)}
export function assertTaskTransition(from:SasiTaskState,to:SasiTaskState){if(!canTransitionTask(from,to))throw new Error(`SASI_INVALID_TASK_TRANSITION:${from}->${to}`)}
export function progressForState(state:SasiTaskState,nodeIndex=0,nodeCount=1){if(state==="queued")return 0;if(state==="planning")return .03;if(state==="succeeded"||state==="failed"||state==="cancelled")return 1;const safe=Math.max(1,nodeCount),base=Math.min(.94,Math.max(.05,(nodeIndex/safe)*.9+.05));return state==="validating"?Math.min(.98,base+.04):base}
