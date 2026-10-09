import{rankExecutionLanes,type LingxiExecutionLane}from"./smart-execution";

export type UnifiedExecutionPolicyInput={
 inputBytes:number;
 maxInputBytes?:number;
 browserEligible:boolean;
 deterministic:boolean;
 needsNetwork:boolean;
 serverAvailable:boolean;
 externalAllowed:boolean;
 sensitive?:boolean;
 userAllowsExternal?:boolean;
};
export type UnifiedExecutionPlacement={
 lanes:LingxiExecutionLane[];
 primary:LingxiExecutionLane;
 reason:"OK"|"INPUT_TOO_LARGE"|"NO_EXECUTION_PATH"|"EXTERNAL_CONSENT_REQUIRED";
};

export function chooseUnifiedExecution(input:UnifiedExecutionPolicyInput):UnifiedExecutionPlacement{
 const allowExternal=input.externalAllowed&&(!input.sensitive||input.userAllowsExternal===true);
 const lanes=rankExecutionLanes({
  browserEligible:input.browserEligible,
  deterministic:input.deterministic,
  needsNetwork:input.needsNetwork,
  serverAvailable:input.serverAvailable,
  externalAllowed:allowExternal,
  inputBytes:input.inputBytes,
  maxInputBytes:input.maxInputBytes
 });
 const primary=lanes[0];
 if(primary==="reject")return{lanes,primary,reason:"INPUT_TOO_LARGE"};
 if(primary==="defer")return{lanes,primary,reason:input.externalAllowed&&!allowExternal?"EXTERNAL_CONSENT_REQUIRED":"NO_EXECUTION_PATH"};
 return{lanes,primary,reason:"OK"};
}
