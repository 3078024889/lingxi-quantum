export type LingxiExecutionLane="browser"|"self-hosted"|"external"|"defer"|"reject";
export type SmartExecutionInput={
 browserEligible:boolean;
 deterministic:boolean;
 needsNetwork:boolean;
 serverAvailable:boolean;
 externalAllowed:boolean;
 inputBytes:number;
 maxInputBytes?:number;
};

export function rankExecutionLanes(input:SmartExecutionInput):LingxiExecutionLane[]{
 const max=input.maxInputBytes??512*1024*1024;
 if(input.inputBytes>max)return["reject"];
 const lanes:LingxiExecutionLane[]=[];
 if(input.browserEligible&&!input.needsNetwork)lanes.push("browser");
 if(input.serverAvailable)lanes.push("self-hosted");
 if(input.externalAllowed)lanes.push("external");
 if(!lanes.length)lanes.push("defer");
 return lanes;
}
