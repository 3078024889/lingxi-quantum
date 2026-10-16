"use client";
import {isMeteredTool,isMeteredOperationTool} from './metered-catalog';
export type ExportAccessRequest={id:string;toolId:string;blob:Blob;name:string;units:number;intent:'save'|'share';members?:Blob[];operation?:'burn-note'};
type Gate=(request:ExportAccessRequest)=>Promise<boolean>;
type State={id:string;allowed:boolean;toolId?:string;members?:Blob[];units?:number;request?:ExportAccessRequest;parent?:Blob};
const states=new WeakMap<Blob,State>();
let gate:Gate|null=null;
export function installExportGate(next:Gate){gate=next;return()=>{if(gate===next)gate=null}}
export function registerExportBundle(blob:Blob,members:Blob[]){states.set(blob,{id:crypto.randomUUID(),allowed:false,members})}
export function restoreExportAccess(blob:Blob,id:string,units=1){states.set(blob,{id,allowed:false,units})}
export async function ensureToolExportAccess(blob:Blob,name:string,intent:'save'|'share'='save'){
 const toolId=location.pathname.match(/\/tools\/([^/?#]+)/)?.[1]||'';
 if(isMeteredOperationTool(toolId))return;
 return authorizeExport(blob,name,intent,toolId);
}
export async function ensureBurnNoteAccess(blob:Blob,id:string){
 if(!states.has(blob))restoreExportAccess(blob,id);
 return authorizeExport(blob,'Private note','save','burn-after-read','burn-note');
}
async function authorizeExport(blob:Blob,name:string,intent:'save'|'share',toolId:string,operation?:'burn-note'){
 if(!isMeteredTool(toolId))return;
 let state=states.get(blob);if(!state||state.toolId&&state.toolId!==toolId){state={id:crypto.randomUUID(),allowed:false};states.set(blob,state)}state.toolId=toolId;
 if(state.allowed)return;
 if(state.parent){const parent=states.get(state.parent);if(parent?.toolId===toolId&&parent.request){await ensureToolExportAccess(state.parent,parent.request.name,intent);return}}
 for(const member of state.members||[]){const child=states.get(member);if(child?.parent&&child.parent!==blob){const parent=states.get(child.parent);if(parent?.request&&!parent.allowed)await ensureToolExportAccess(child.parent,parent.request.name,intent)}}
 const members=state.members?.filter(member=>{const s=states.get(member);return !s?.allowed||s.toolId!==toolId});
 if(members&&members.length===0){state.allowed=true;return}
 const request:ExportAccessRequest=state.request?{...state.request,intent}:{id:state.id,toolId,blob,name,units:members?.length||state.units||1,intent,members,operation};
 state.request=request;
 for(const member of request.members||[]){const child=states.get(member)||{id:crypto.randomUUID(),allowed:false};if(!child.allowed){child.toolId=toolId;child.parent=blob;states.set(member,child)}}
 if(!gate)throw Error('EXPORT_ACCESS_NOT_READY');
 if(!await gate(request))throw Error('EXPORT_CANCELLED');
 state.allowed=true;
 for(const member of request.members||[]){const original=states.get(member)||{id:crypto.randomUUID(),allowed:false};original.allowed=true;original.toolId=toolId;states.set(member,original)}
}
