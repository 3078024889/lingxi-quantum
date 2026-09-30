export interface Budget{maxCost:number;maxSteps:number;maxDurationMs:number}
export interface BudgetUsage{cost:number;steps:number;durationMs:number}
export function withinBudget(b:Budget,u:BudgetUsage){const violations:string[]=[];if(u.cost>b.maxCost)violations.push("COST_LIMIT");if(u.steps>b.maxSteps)violations.push("STEP_LIMIT");if(u.durationMs>b.maxDurationMs)violations.push("TIME_LIMIT");return {pass:violations.length===0,violations}}
