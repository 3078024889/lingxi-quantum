import{LINGXI_TASK_STATES,type LingxiArtifact,type LingxiRecoveryState,type LingxiTaskState}from"./task-contract";

export type LingxiTaskDomain="tool"|"sasi";
export type LingxiExecutionLane="browser"|"self-hosted"|"external"|"deferred";
export type LingxiBillingMode="free"|"included"|"paid"|"user-key"|"unknown";
export type LingxiVerificationState="unverified"|"checking"|"verified"|"rejected";

export type UnifiedTaskRecord={
 id:string;
 domain:LingxiTaskDomain;
 capability:string;
 state:LingxiTaskState;
 progress:number;
 createdAt:string;
 updatedAt:string;
 lane?:LingxiExecutionLane;
 billing?:LingxiBillingMode;
 recovery?:LingxiRecoveryState;
 artifacts: LingxiArtifact[];
 verification:LingxiVerificationState;
 userMessage?:string;
 safeError?:string;
 metadata?:Record<string,unknown>;
};

const allowed:Record<LingxiTaskState,ReadonlySet<LingxiTaskState>>={
 created:new Set(["queued","planning","running","cancelled","failed"]),
 queued:new Set(["planning","running","waiting","cancelled","failed"]),
 planning:new Set(["running","waiting","cancelled","failed"]),
 running:new Set(["validating","retrying","waiting","succeeded","failed","cancelled"]),
 validating:new Set(["retrying","succeeded","failed","cancelled"]),
 retrying:new Set(["running","waiting","failed","cancelled"]),
 waiting:new Set(["queued","running","cancelled","expired","failed"]),
 succeeded:new Set(),
 failed:new Set(["retrying"]),
 cancelled:new Set(),
 expired:new Set()
};

function iso(value?:string){const date=value?new Date(value):new Date();if(Number.isNaN(date.valueOf()))throw new Error("TASK_TIME_INVALID");return date.toISOString()}
function cleanProgress(value:number){if(!Number.isFinite(value))return 0;return Math.max(0,Math.min(100,Math.round(value)))}
function ensureState(value:string):asserts value is LingxiTaskState{if(!(LINGXI_TASK_STATES as readonly string[]).includes(value))throw new Error("TASK_STATE_INVALID")}

export function createUnifiedTask(input:{id:string;domain:LingxiTaskDomain;capability:string;createdAt?:string;lane?:LingxiExecutionLane;billing?:LingxiBillingMode;metadata?:Record<string,unknown>}):UnifiedTaskRecord{
 const id=input.id.trim(),capability=input.capability.trim();if(!id||id.length>180)throw new Error("TASK_ID_INVALID");if(!capability||capability.length>180)throw new Error("TASK_CAPABILITY_INVALID");
 const now=iso(input.createdAt);
 return{id,domain:input.domain,capability,state:"created",progress:0,createdAt:now,updatedAt:now,lane:input.lane,billing:input.billing,recovery:"none",artifacts:[],verification:"unverified",metadata:input.metadata};
}

export function transitionUnifiedTask(task:UnifiedTaskRecord,next:LingxiTaskState,patch:Partial<Omit<UnifiedTaskRecord,"id"|"domain"|"capability"|"createdAt"|"state">>={}):UnifiedTaskRecord{
 ensureState(next);
 if(task.state!==next&&!allowed[task.state].has(next))throw new Error("TASK_TRANSITION_INVALID");
 const updated={...task,...patch,state:next,progress:cleanProgress(patch.progress??task.progress),updatedAt:iso(patch.updatedAt)};
 if(next==="succeeded"&&updated.verification==="rejected")throw new Error("TASK_RESULT_REJECTED");
 if(next==="succeeded")updated.progress=100;
 return updated;
}

export function attachUnifiedArtifacts(task:UnifiedTaskRecord,artifacts:readonly LingxiArtifact[],verification: LingxiVerificationState="unverified"):UnifiedTaskRecord{
 const normalized=artifacts.filter(a=>a&&typeof a.id==="string"&&a.id.trim()).map(a=>({...a,id:a.id.trim()}));
 return{...task,artifacts:normalized,verification,updatedAt:iso()};
}

export function markUnifiedTaskVerified(task:UnifiedTaskRecord,ok:boolean,message?:string):UnifiedTaskRecord{
 if(task.state!=="validating"&&task.state!=="succeeded")throw new Error("TASK_VERIFY_STATE_INVALID");
 return{...task,verification:ok?"verified":"rejected",userMessage:message||task.userMessage,updatedAt:iso()};
}

export function canResumeUnifiedTask(task:UnifiedTaskRecord){
 return task.recovery==="ready"||task.recovery==="partial"||task.state==="waiting"||task.state==="retrying"||task.state==="failed";
}

export function publicTaskView(task:UnifiedTaskRecord){
 return{id:task.id,domain:task.domain,capability:task.capability,state:task.state,progress:task.progress,recovery:task.recovery??"none",verification:task.verification,artifacts:task.artifacts.map(a=>({id:a.id,kind:a.kind,name:a.name,mime:a.mime,byteSize:a.byteSize})),message:task.userMessage??null};
}
