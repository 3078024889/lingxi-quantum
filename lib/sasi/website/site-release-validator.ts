import {requiredChecks,type SiteChange} from "./change-impact";export interface CheckEvidence{name:string;pass:boolean}
export function validateSiteRelease(changes:SiteChange[],evidence:CheckEvidence[]){const required=requiredChecks(changes);const missing=required.filter(name=>!evidence.some(x=>x.name===name&&x.pass));return {pass:missing.length===0,required,missing}}
