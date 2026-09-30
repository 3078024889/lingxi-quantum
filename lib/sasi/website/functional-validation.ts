export interface FunctionalProbe{name:string;pass:boolean}
export function functionalGate(rows:FunctionalProbe[],required:string[]){const missing=required.filter(name=>!rows.some(x=>x.name===name&&x.pass));return {pass:missing.length===0,missing}}
