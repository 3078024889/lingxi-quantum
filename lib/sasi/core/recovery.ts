import type {GraphNode} from "./capability-graph";import type {FailureAtlas} from "./failure-atlas";
export interface RecoveryPlan{nodeId:string;strategies:string[];reason:string}
export function planRecovery(node:GraphNode,atlas:FailureAtlas,fingerprint?:string):RecoveryPlan{const learned=fingerprint?atlas.bestRepair(fingerprint):undefined;const strategies=[...(learned?[learned]:[]),...(node.fallback??[])].filter((v,i,a)=>a.indexOf(v)===i);return {nodeId:node.id,strategies,reason:learned?"LEARNED_REPAIR":"DECLARED_FALLBACK"}}
