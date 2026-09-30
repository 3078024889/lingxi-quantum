export interface VisualMeasurement{name:string;pass:boolean;details?:string}
export function visualGate(rows:VisualMeasurement[]){const required=["no-overflow","responsive","readable","primary-action-visible"];const missing=required.filter(name=>!rows.some(x=>x.name===name&&x.pass));return {pass:missing.length===0,missing}}
