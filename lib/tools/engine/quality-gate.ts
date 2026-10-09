import{outcomeCompressionImproved,verifyUnifiedOutcome}from"@/lib/tasks/outcome-contract";
export type QualityEvidence={nonEmpty:boolean;outputBytes?:number;inputBytes?:number;confidence?:number;pages?:number;duration?:number};
export type QualityVerdict={ok:boolean;reason?:string};
export function validateArtifact(e:QualityEvidence):QualityVerdict{
 if(!e.nonEmpty)return{ok:false,reason:"EMPTY_RESULT"};
 if(e.outputBytes!=null&&(!Number.isFinite(e.outputBytes)||e.outputBytes<=0))return{ok:false,reason:"EMPTY_FILE"};
 if(e.confidence!=null&&(e.confidence<0||e.confidence>1))return{ok:false,reason:"INVALID_CONFIDENCE"};
 if(e.pages!=null&&e.pages<1)return{ok:false,reason:"NO_PAGES"};
 if(e.duration!=null&&e.duration<=0)return{ok:false,reason:"NO_MEDIA_DURATION"};
 return{ok:true};
}
export function compressionActuallyHelped(inputBytes:number,outputBytes:number){
 return Number.isFinite(inputBytes)&&Number.isFinite(outputBytes)&&inputBytes>0&&outputBytes>0&&outputBytes<inputBytes;
}
