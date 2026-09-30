export interface StoredArtifact{id:string;ownerId:string;projectId:string;kind:string;uri:string;sha256?:string;createdAt:string}
export class ArtifactStore{private rows:StoredArtifact[]=[];add(x:StoredArtifact){this.rows.push(x);return x}list(ownerId:string,projectId:string){return this.rows.filter(x=>x.ownerId===ownerId&&x.projectId===projectId)}}
