export interface ResultEvidence{kind:"artifact"|"validation"|"metric";ref:string;value?:unknown}
export interface CompletedResult<T=unknown>{resultId:string;projectId:string;intent:string;completedAt:string;value:T;artifacts:string[];validation:{pass:boolean;score:number;issues:string[]};evidence:ResultEvidence[]}
export function completeResult<T>(x:Omit<CompletedResult<T>,"resultId"|"completedAt">):CompletedResult<T>{if(!x.validation.pass)throw new Error("RESULT_NOT_VALIDATED");return {...x,resultId:crypto.randomUUID(),completedAt:new Date().toISOString()}}
