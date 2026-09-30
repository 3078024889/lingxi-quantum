export interface QualityRequirement{name:string;minimum:number;weight:number}
export interface QualityMeasurement{name:string;score:number}
export function qualityGate(requirements:QualityRequirement[],measurements:QualityMeasurement[]){const failures=requirements.filter(r=>(measurements.find(m=>m.name===r.name)?.score??0)<r.minimum);const weight=requirements.reduce((s,r)=>s+r.weight,0)||1;const score=requirements.reduce((s,r)=>s+(measurements.find(m=>m.name===r.name)?.score??0)*r.weight,0)/weight;return {pass:failures.length===0,score,failures:failures.map(x=>x.name)}}
