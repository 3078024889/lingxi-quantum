export interface Deliverable{kind:"file"|"image"|"video"|"web"|"data"|"text";uri?:string;content?:unknown;name:string}
export interface Delivery{projectId:string;taskId:string;deliverables:Deliverable[];validated:boolean;issues:string[]}
export function deliverableReady(x:Delivery){return {pass:x.validated&&x.deliverables.length>0&&x.issues.length===0,deliverableCount:x.deliverables.length}}
