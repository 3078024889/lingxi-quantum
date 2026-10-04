import {allToolBillingPolicies,toolBillingPolicy,type ToolBillingPolicy} from "./tool-policy-data";
export type PublicExecutionMode="local"|"connected_service"|"server";
export type PublicBillingClass="PAID_TOOL"|"SASI_BALANCE"|"SUPPLIER_DIRECT_ONLY"|"DISABLED";
export type PublicToolBillingPolicy={toolId:string;billingClass:PublicBillingClass;executionMode:PublicExecutionMode;reason:string};
function publicShape(p:ToolBillingPolicy):PublicToolBillingPolicy{return {toolId:p.toolId,billingClass:p.billingClass,executionMode:p.executionMode,reason:p.reason}}
export function publicToolBillingPolicy(toolId:string):PublicToolBillingPolicy{return publicShape(toolBillingPolicy(toolId))}
export function allPublicToolBillingPolicies(){return allToolBillingPolicies().map(publicShape)}
