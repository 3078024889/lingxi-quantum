export interface PersonDNA{userId:string;preferences:Record<string,unknown>;confirmedChoices:Record<string,unknown>;updatedAt:string}
export interface ProjectDNA{projectId:string;kind:string;goal:string;decisions:Record<string,unknown>;assets:string[];state:Record<string,unknown>;updatedAt:string}
export interface ResultDNA{resultId:string;projectId:string;intent:string;route:string[];accepted:boolean;repairs:string[];metrics:Record<string,number>;createdAt:string}
export interface FailureSignal{task:string;node:string;code:string;locale?:string;device?:string;projectKind?:string;createdAt:string}
export function nextContext(person:PersonDNA|undefined,project:ProjectDNA,results:ResultDNA[]){return {person:person?.preferences??{},project:{goal:project.goal,decisions:project.decisions,state:project.state},successfulPatterns:results.filter(x=>x.accepted).slice(-20).map(x=>({route:x.route,metrics:x.metrics}))}}
