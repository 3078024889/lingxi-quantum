export type EngineKind="document"|"image"|"video"|"audio"|"web"|"nutrition"|"knowledge"|"website";
export interface EngineRequest<T=unknown>{kind:EngineKind;operation:string;input:T;locale?:string}
export interface EngineResult<T=unknown>{ok:boolean;result?:T;artifacts:string[];issues:string[]}
export interface CapabilityEngine{kind:EngineKind;supports(operation:string):boolean;execute<T=unknown,R=unknown>(request:EngineRequest<T>):Promise<EngineResult<R>>}
