export interface AcceptanceRecord{resultId:string;projectId:string;accepted:boolean;reason?:string;at:string}
export class AcceptanceLedger{private rows:AcceptanceRecord[]=[];record(x:Omit<AcceptanceRecord,"at">){const row={...x,at:new Date().toISOString()};this.rows.push(row);return row}forProject(projectId:string){return this.rows.filter(x=>x.projectId===projectId)}}
