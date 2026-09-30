export type NodeState="queued"|"running"|"validating"|"retrying"|"succeeded"|"failed"|"skipped";
export type NodeRun={nodeId:string;state:NodeState;attempt:number;startedAt?:string;completedAt?:string;error?:{code:string;message:string};artifacts:string[]};
export function beginNode(x:NodeRun,now=new Date().toISOString()):NodeRun{
 if(!["queued","retrying"].includes(x.state))throw new Error("SASI_NODE_CANNOT_START");
 return{...x,state:"running",attempt:x.attempt+1,startedAt:now,error:undefined};
}
export function validateNode(x:NodeRun):NodeRun{if(x.state!=="running")throw new Error("SASI_NODE_CANNOT_VALIDATE");return{...x,state:"validating"}}
export function finishNode(x:NodeRun,artifacts:string[],now=new Date().toISOString()):NodeRun{
 if(x.state!=="validating")throw new Error("SASI_NODE_CANNOT_FINISH");
 return{...x,state:"succeeded",artifacts,completedAt:now};
}
export function failNode(x:NodeRun,code:string,message:string,maxAttempts:number):NodeRun{
 if(!["running","validating"].includes(x.state))throw new Error("SASI_NODE_CANNOT_FAIL");
 return{...x,state:x.attempt<maxAttempts?"retrying":"failed",error:{code,message}};
}
