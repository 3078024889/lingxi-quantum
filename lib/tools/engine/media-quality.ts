export type ArtifactEvidence={
 bytes:number;mime?:string;beforeBytes?:number;durationSeconds?:number;
 pageCount?:number;textChars?:number;confidence?:number;
};
export type QualityResult={ok:boolean;code:string;message:string};
export function validateArtifact(e:ArtifactEvidence):QualityResult{
 if(!Number.isFinite(e.bytes)||e.bytes<=0)return{ok:false,code:"EMPTY_OUTPUT",message:"没有生成可用结果"};
 if(e.durationSeconds!==undefined&&(!Number.isFinite(e.durationSeconds)||e.durationSeconds<=0))return{ok:false,code:"INVALID_MEDIA_DURATION",message:"生成的媒体无法正常读取"};
 if(e.pageCount!==undefined&&(!Number.isInteger(e.pageCount)||e.pageCount<=0))return{ok:false,code:"INVALID_PAGE_COUNT",message:"生成的文档没有可用页面"};
 if(e.textChars!==undefined&&e.textChars<0)return{ok:false,code:"INVALID_TEXT_RESULT",message:"文字结果无效"};
 if(e.confidence!==undefined&&(e.confidence<0||e.confidence>1))return{ok:false,code:"INVALID_CONFIDENCE",message:"结果可信度无效"};
 return{ok:true,code:"OK",message:"结果已通过完整性检查"};
}
export function compressionDecision(before:number,after:number):QualityResult{
 if(before<=0||after<=0)return{ok:false,code:"INVALID_SIZE",message:"无法比较文件大小"};
 if(after>=before)return{ok:false,code:"NOT_SMALLER",message:"处理后的文件没有变小，建议保留原文件"};
 return{ok:true,code:"SMALLER",message:`文件体积减少 ${Math.round((1-after/before)*100)}%`};
}
