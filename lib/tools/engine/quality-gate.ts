import{outcomeCompressionImproved,verifyUnifiedOutcome}from"@/lib/tasks/outcome-contract";

export type QualityEvidence={nonEmpty:boolean;outputBytes?:number;inputBytes?:number;confidence?:number;pages?:number;duration?:number};
export type QualityVerdict={ok:boolean;reason?:string};

export function validateArtifact(e:QualityEvidence):QualityVerdict{
 const v=verifyUnifiedOutcome({kind:"artifact",...e});
 return v.pass?{ok:true}:{ok:false,reason:v.reasons[0]};
}

export function compressionActuallyHelped(inputBytes:number,outputBytes:number){
 return outcomeCompressionImproved(inputBytes,outputBytes);
}
