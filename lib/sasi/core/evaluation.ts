export interface EvaluationSignal{name:string;score:number;weight:number;details?:string}
export interface EvaluationResult{pass:boolean;score:number;signals:EvaluationSignal[];threshold:number}
export function evaluate(signals:EvaluationSignal[],threshold=.8):EvaluationResult{const denom=signals.reduce((s,x)=>s+Math.max(x.weight,0),0)||1;const score=signals.reduce((s,x)=>s+Math.min(1,Math.max(0,x.score))*Math.max(x.weight,0),0)/denom;return {pass:score>=threshold,score,signals,threshold}}
export function resultPerCompute(completedResults:number,cost:number){return completedResults/Math.max(cost,0.000001)}
