export type ControlAction="approve"|"reject"|"pause"|"resume"|"rollback";export interface ControlEvent{action:ControlAction;taskId:string;reason?:string;at:string}
export function controlEvent(taskId:string,action:ControlAction,reason?:string):ControlEvent{return {taskId,action,reason,at:new Date().toISOString()}}
