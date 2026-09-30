import type {SiteDNA} from "./site-dna";export interface CreationStage{name:"intent"|"site-dna"|"plan"|"build"|"validate"|"repair"|"release";pass:boolean;issues:string[]}
export interface WebsiteCreationRun{site:SiteDNA;stages:CreationStage[];artifacts:string[]}
export function creationComplete(run:WebsiteCreationRun){const required=["intent","site-dna","plan","build","validate","release"];const missing=required.filter(name=>!run.stages.some(x=>x.name===name&&x.pass));return {pass:missing.length===0,missing}}
