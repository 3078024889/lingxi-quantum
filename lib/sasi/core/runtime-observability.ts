export interface RuntimeMetric{name:string;value:number;unit:string;projectId?:string;taskId?:string;at:string}
export class RuntimeMetrics{private rows:RuntimeMetric[]=[];record(x:Omit<RuntimeMetric,"at">){const row={...x,at:new Date().toISOString()};this.rows.push(row);return row}query(name:string){return this.rows.filter(x=>x.name===name)}snapshot(){return [...this.rows]}}
