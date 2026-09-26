import type {SasiTaskState} from "./types";
const ALLOWED:Record<SasiTaskState,readonly SasiTaskState[]>={created:["planning","cancelled"],planning:["queued","running","failed","cancelled"],queued:["running","failed","cancelled"],running:["validating","succeeded","failed","cancelled"],validating:["succeeded","failed","cancelled"],succeeded:[],failed:[],cancelled:[]};
export function mayTransitionTask(from:SasiTaskState,to:SasiTaskState){return ALLOWED[from].includes(to)}
export function assertTaskTransition(from:SasiTaskState,to:SasiTaskState){if(!mayTransitionTask(from,to))throw new Error(`INVALID_TASK_STATE_TRANSITION:${from}->${to}`);return to}
