import type {LivingSiteProject} from "./living-project";import {commitSite} from "./living-project";import type {SiteDNA} from "./site-dna";
export interface RepairAttempt{issue:string;change:string;pass:boolean}
export function applyValidatedRepair(project:LivingSiteProject,next:SiteDNA,attempts:RepairAttempt[],artifacts:string[]=[]){const failed=attempts.filter(x=>!x.pass);if(failed.length)throw new Error("SITE_REPAIR_INCOMPLETE:"+failed.map(x=>x.issue).join(","));return commitSite(project,next,"validated-repair",{pass:true,issues:[]},artifacts)}
