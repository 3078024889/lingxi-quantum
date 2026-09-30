import type {ProjectDNA,ResultDNA} from "./continuity";
export interface ProjectRecord{project:ProjectDNA;results:ResultDNA[];updatedAt:string}
export interface ProjectStore{load(projectId:string):Promise<ProjectRecord|undefined>;save(record:ProjectRecord):Promise<void>}
export class MemoryProjectStore implements ProjectStore{private data=new Map<string,ProjectRecord>();async load(id:string){return this.data.get(id)}async save(record:ProjectRecord){this.data.set(record.project.projectId,{...record,updatedAt:new Date().toISOString()})}}
