import type{LingxiTaskState}from"./task-contract";

export type LingxiCheckpoint={
 taskId:string;
 checkpointId:string;
 sequence:number;
 state:LingxiTaskState;
 createdAt:string;
 artifactRefs:string[];
 stateRef?:string;
 nodeId?:string;
 attempt?:number;
};

export function checkpointHasInlinePayload(value:unknown):boolean{
 if(!value||typeof value!=="object")return false;
 const text=JSON.stringify(value);
 return /\"(?:blob|bytes|base64|fileData|inlineValue)\"\s*:/i.test(text);
}

export function validateCheckpoint(checkpoint:LingxiCheckpoint){
 if(!checkpoint.taskId||!checkpoint.checkpointId)throw new Error("LINGXI_CHECKPOINT_ID_REQUIRED");
 if(!Number.isInteger(checkpoint.sequence)||checkpoint.sequence<0)throw new Error("LINGXI_CHECKPOINT_SEQUENCE_INVALID");
 if(checkpoint.artifactRefs.some(ref=>!ref||ref.length>1024))throw new Error("LINGXI_CHECKPOINT_ARTIFACT_REF_INVALID");
 if(checkpoint.stateRef&&checkpoint.stateRef.length>2048)throw new Error("LINGXI_CHECKPOINT_STATE_REF_INVALID");
 if(checkpointHasInlinePayload(checkpoint))throw new Error("LINGXI_CHECKPOINT_INLINE_PAYLOAD_FORBIDDEN");
 return checkpoint;
}
