export type SasiRunControl="pause"|"resume"|"cancel"|"approve"|"reject";
export type SasiControlRequest={
 runId:string;
 action:SasiRunControl;
 actor:"user"|"system";
 reason?:string;
 idempotencyKey:string;
};
export function controlRequiresHuman(action:SasiRunControl){
 return action==="approve"||action==="reject";
}
