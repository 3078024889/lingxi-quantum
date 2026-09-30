export type AsrInput={durationSeconds:number;language?:string;memoryMb?:number;quality:"fast"|"balanced"|"quality";modelAvailable:(m:string)=>boolean};
export type AsrPlan={model:string;chunkSeconds:number;reason:string};
export function planAsr(x:AsrInput):AsrPlan{
 const mem=x.memoryMb??2048;
 const wanted=x.quality==="quality"?"small":x.quality==="balanced"?"base":"tiny";
 const candidates=mem>=4096?[wanted,"base","tiny"]:mem>=2048?["base","tiny"]:["tiny"];
 const model=candidates.find(x.modelAvailable)??"";
 if(!model)return{model:"",chunkSeconds:0,reason:"本地语音模型尚未准备好"};
 return{model,chunkSeconds:x.durationSeconds>1800?30:60,reason:`使用本地 ${model} 级语音识别能力`};
}
export function validateTranscript(x:{text:string;durationSeconds:number;segments?:number}){
 if(x.durationSeconds<=0)return{ok:false,code:"INVALID_DURATION"};
 if(!x.text.trim())return{ok:false,code:"EMPTY_TRANSCRIPT"};
 return{ok:true,code:"OK",chars:x.text.trim().length,segments:x.segments??0};
}
