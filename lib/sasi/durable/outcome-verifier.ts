export type Verification={
 pass:boolean;score:number;reasons:string[];retryable:boolean;
};

export function verifyTextOutcome(input:{
 text:string;minChars?:number;mustContain?:string[];forbid?:string[];
}):Verification{
 const reasons:string[]=[];const text=String(input.text||"").trim();
 const min=Math.max(1,Number(input.minChars||24));
 if(text.length<min)reasons.push("TOO_SHORT");
 for(const x of input.mustContain||[])if(x&&!text.includes(x))reasons.push(`MISSING:${x}`);
 for(const x of input.forbid||[])if(x&&text.includes(x))reasons.push(`FORBIDDEN:${x}`);
 const score=Math.max(0,1-reasons.length*.25);
 return {pass:reasons.length===0,score,reasons,retryable:reasons.some(x=>x==="TOO_SHORT"||x.startsWith("MISSING:"))};
}

export function shouldEscalate(v:Verification,attempt:number,maxAttempts=2){
 return !v.pass&&v.retryable&&attempt<maxAttempts;
}
