import {closureState,type GateEvidence} from "../assurance/production-gates";export interface ClosureReport{generatedAt:string;gates:GateEvidence[];notes:string[]}
export function productionClosure(report:ClosureReport){return {...closureState(report.gates),report}}
