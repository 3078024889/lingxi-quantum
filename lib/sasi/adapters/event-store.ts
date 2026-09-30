export interface StoredEvent{id:string;ownerId:string;projectId:string;taskId?:string;type:string;payload:unknown;at:string}
export class EventStore{private rows:StoredEvent[]=[];append(x:StoredEvent){this.rows.push(x);return x}forProject(ownerId:string,projectId:string){return this.rows.filter(x=>x.ownerId===ownerId&&x.projectId===projectId).sort((a,b)=>a.at.localeCompare(b.at))}}
