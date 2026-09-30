export type Attempt={engine:string;ok:boolean;code?:string};
export function nextFallback(attempts:Attempt[],available:string[]){
 const failed=new Set(attempts.filter(x=>!x.ok).map(x=>x.engine));
 return available.find(x=>!failed.has(x))??null;
}
export function shouldRetry(code:string,attempt:number){
 if(attempt>=2)return false;
 return ["MODEL_LOAD_FAILED","OUT_OF_MEMORY","TEMPORARY_RUNTIME_ERROR"].includes(code);
}
export function userFailure(code:string){
 const m:Record<string,string>={
  MODEL_LOAD_FAILED:"这次没有成功加载处理能力，请重新尝试",
  OUT_OF_MEMORY:"这个文件较大，当前设备无法稳定完成处理",
  EMPTY_OUTPUT:"没有生成可用结果，请换一个文件重新尝试",
  UNSUPPORTED:"这个文件暂时无法处理，请换一种格式"
 };
 return m[code]??"这一步没有处理成功，可以重新尝试";
}
