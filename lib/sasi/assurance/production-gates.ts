export type GateName="SOURCE_EXISTS"|"SOURCE_BUILD_PASS"|"UNIT_PASS"|"INTEGRATION_PASS"|"DATABASE_PASS"|"BROWSER_E2E_PASS"|"MOBILE_PASS"|"PRODUCTION_PASS";
export interface GateEvidence{name:GateName;pass:boolean;evidence:string[]}
export const GATE_ORDER:GateName[]=["SOURCE_EXISTS","SOURCE_BUILD_PASS","UNIT_PASS","INTEGRATION_PASS","DATABASE_PASS","BROWSER_E2E_PASS","MOBILE_PASS","PRODUCTION_PASS"];
export function closureState(rows:GateEvidence[]){const map=new Map(rows.map(x=>[x.name,x]));const firstBlocked=GATE_ORDER.find(x=>!map.get(x)?.pass);return {pass:!firstBlocked,firstBlocked,completed:GATE_ORDER.filter(x=>map.get(x)?.pass)}}
