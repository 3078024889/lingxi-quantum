export type Permission="read.project"|"write.project"|"create.artifact"|"publish"|"send"|"payment"|"delete"|"production.write";
export interface PermissionGrant{permission:Permission;confirmed:boolean;expiresAt?:number}
export function canPerform(grants:PermissionGrant[],permission:Permission,now=Date.now()){const g=grants.find(x=>x.permission===permission&&x.confirmed&&(x.expiresAt==null||x.expiresAt>now));return Boolean(g)}
