export type ActionRisk="low"|"medium"|"high";
export interface ActionDecision{allowed:boolean;requiresConfirmation:boolean;reason:string}
const high=new Set(["payment","delete","send","publish","account.change","production.write"]);
export function decideAction(action:string,explicitConfirmation=false):ActionDecision{if(high.has(action))return explicitConfirmation?{allowed:true,requiresConfirmation:false,reason:"CONFIRMED"}:{allowed:false,requiresConfirmation:true,reason:"EXPLICIT_CONFIRMATION_REQUIRED"};return {allowed:true,requiresConfirmation:false,reason:"LOW_RISK"}}
