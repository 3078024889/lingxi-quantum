export interface StoredCheckpoint{id:string;ownerId:string;taskId:string;step:string;state:unknown;at:string}
export class CheckpointStore{private rows:StoredCheckpoint[]=[];save(x:StoredCheckpoint){this.rows.push(x);return x}latest(ownerId:string,taskId:string){return this.rows.filter(x=>x.ownerId===ownerId&&x.taskId===taskId).sort((a,b)=>b.at.localeCompare(a.at))[0]}}
