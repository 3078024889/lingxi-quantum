export interface UserCorrection{projectId:string;field:string;before:unknown;after:unknown;accepted:boolean;at:string}
export function learningSignals(rows:UserCorrection[]){return rows.filter(x=>x.accepted).map(x=>({key:x.field,projectId:x.projectId,value:x.after,source:"explicit-user-correction",at:x.at}))}
