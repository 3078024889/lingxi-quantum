import type {SasiV5Economics,SasiV5QualityTier} from "./types";
const fen=(v:number|undefined)=>Number.isFinite(v)?Math.max(0,Math.ceil(v??0)):0;
export function qualityAdjustedCostFen(e:SasiV5Economics){const r=Math.max(.05,Math.min(1,e.acceptedRate));const c=fen(e.expectedAttemptCostFen)+fen(e.localComputeFen)+fen(e.storageFen)+fen(e.bandwidthFen)+fen(e.paymentAllocationFen)+fen(e.failureReserveFen);return Math.ceil(c/r)}
export function targetContributionMargin(t:SasiV5QualityTier,c:string){if(/deterministic|convert|parse|ocr|compose/i.test(c))return .72;if(/video/i.test(c))return t==="premium"?.38:.42;if(/image/i.test(c))return t==="premium"?.48:.54;return t==="premium"?.56:.62}
export function minimumContributionMargin(c:string){if(/video/i.test(c))return .28;if(/image/i.test(c))return .38;if(/deterministic|convert|parse|ocr|compose/i.test(c))return .58;return .48}
export function roundProductPriceFen(raw:number){const v=Math.max(1,Math.ceil(raw));if(v<100)return Math.max(1,Math.ceil(v/10)*10-1);if(v<1000)return Math.ceil(v/20)*20-1;return Math.ceil(v/100)*100-1}
export function outcomeQuote(i:{deliveryCostFen:number;targetMargin:number;minimumPriceFen?:number}){const t=Math.max(.01,Math.min(.9,i.targetMargin));return Math.max(i.minimumPriceFen??1,roundProductPriceFen(i.deliveryCostFen/(1-t)))}
export function realizedMargin(p:number,c:number){return p<=0?-1:(p-c)/p}
