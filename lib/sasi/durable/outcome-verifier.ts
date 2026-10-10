import{verifyUnifiedOutcome}from"@/lib/tasks/outcome-contract";
export type Verification={
 pass:boolean;score:number;reasons:string[];retryable:boolean;
};

export function verifyTextOutcome(input:{text:string;minChars?:number;mustContain?:string[];forbid?:string[]}):Verification{
 const v=verifyUnifiedOutcome({kind:"text",...input});
 return{pass:v.pass,score:v.score,reasons:v.reasons,retryable:v.retryable};
}

export function shouldEscalate(v:Verification,attempt:number,maxAttempts=2){
 return !v.pass&&v.retryable&&attempt<maxAttempts;
}
