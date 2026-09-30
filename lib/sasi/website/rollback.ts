export interface ReleaseRevision{revision:number;deploymentId:string;validated:boolean;createdAt:string}
export function rollbackTarget(rows:ReleaseRevision[],currentRevision:number){return [...rows].filter(x=>x.validated&&x.revision<currentRevision).sort((a,b)=>b.revision-a.revision)[0]}
