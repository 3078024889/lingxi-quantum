export interface SourceInventory{routes:string[];apiRoutes:string[];migrations:string[];sasiFiles:string[];legacyCandidates:string[]}
export function summarizeInventory(x:SourceInventory){return {routes:x.routes.length,apiRoutes:x.apiRoutes.length,migrations:x.migrations.length,sasiFiles:x.sasiFiles.length,legacyCandidates:x.legacyCandidates.length}}
