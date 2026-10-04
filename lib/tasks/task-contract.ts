export const LINGXI_TASK_STATES=["created","queued","planning","running","validating","retrying","waiting","succeeded","failed","cancelled","expired"] as const;
export type LingxiTaskState=typeof LINGXI_TASK_STATES[number];

export type LingxiArtifact={
 id:string;
 kind:string;
 name?:string;
 mime?:string;
 byteSize?:number;
 localRef?:string;
 remoteRef?:string;
 metadata?:Record<string,unknown>;
};

export type LingxiRecoveryState="none"|"ready"|"partial"|"ghost"|"expired";
export type LingxiTaskSnapshot={
 id:string;
 state:LingxiTaskState;
 progress:number;
 createdAt:string;
 updatedAt:string;
 artifacts?:LingxiArtifact[];
 recovery?:LingxiRecoveryState;
};

export type LingxiTaskPhase="preparing"|"running"|"succeeded"|"failed";
export function phaseFromLingxiTaskState(state:LingxiTaskState):LingxiTaskPhase{
 if(state==="created"||state==="queued"||state==="planning"||state==="waiting")return"preparing";
 if(state==="running"||state==="validating"||state==="retrying")return"running";
 if(state==="succeeded")return"succeeded";
 return"failed";
}
export function isLingxiTaskTerminal(state:LingxiTaskState){return state==="succeeded"||state==="failed"||state==="cancelled"||state==="expired"}
