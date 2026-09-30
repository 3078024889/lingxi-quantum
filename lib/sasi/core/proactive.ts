import {decideAction} from "./action-policy";
export interface ProactiveSuggestion{id:string;projectId:string;action:string;reason:string;createdAt:string}
export function suggest(projectId:string,action:string,reason:string):ProactiveSuggestion|undefined{const decision=decideAction(action,false);if(!decision.allowed)return undefined;return {id:crypto.randomUUID(),projectId,action,reason,createdAt:new Date().toISOString()}}
