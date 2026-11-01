export type SafeSasiGenerationInput={kind:"image"|"video";prompt:string;ratio:"1:1"|"16:9"|"9:16";duration?:number;style:string};

/** Validate the complete request before allocating tasks or calling any model worker. */
export function parseSasiGenerationInput(raw:unknown):SafeSasiGenerationInput{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("INVALID_GENERATION_REQUEST");
 const value=raw as Record<string,unknown>;
 if(value.kind!=="image"&&value.kind!=="video")throw Error("INVALID_GENERATION_REQUEST");
 if(typeof value.prompt!=="string"||value.prompt.trim().length<2||value.prompt.length>4000)throw Error("INVALID_GENERATION_REQUEST");
 if(value.style!=null&&(typeof value.style!=="string"||value.style.length>180))throw Error("INVALID_GENERATION_REQUEST");
 if(value.ratio!=null&&!["1:1","16:9","9:16"].includes(String(value.ratio)))throw Error("INVALID_GENERATION_REQUEST");
 let duration:number|undefined;
 if(value.kind==="video"){
  const n=value.duration==null?6:typeof value.duration==="number"||typeof value.duration==="string"?Number(value.duration):NaN;
  if(!Number.isInteger(n)||n<2||n>30)throw Error("INVALID_GENERATION_REQUEST");
  duration=n;
 }
 return {kind:value.kind,prompt:value.prompt.trim(),ratio:(value.ratio||"1:1") as SafeSasiGenerationInput["ratio"],duration,style:(value.style||"") as string};
}
