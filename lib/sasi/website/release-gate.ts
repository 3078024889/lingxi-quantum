export interface ReleaseEvidence{name:string;pass:boolean;details?:string}
export function releaseGate(evidence:ReleaseEvidence[],required:string[]){const missing=required.filter(name=>!evidence.some(x=>x.name===name&&x.pass));return {pass:missing.length===0,missing}}
