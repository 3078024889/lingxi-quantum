import "server-only";

export type PricingCurrency = "CNY" | "USD";
export type ExecutionMode = "local" | "managed" | "byok";
export type ChargingClass = "FREE_LOCAL" | "PAID_EXTERNAL" | "HYBRID" | "DISABLED_UNVERIFIED";

export const MINIMUM_GROSS_MARGIN = 0.45;

export type DirectCost = {
  supplier: number;
  compute?: number;
  storage?: number;
  bandwidth?: number;
  payment?: number;
  retryReserve?: number;
  otherDirect?: number;
};

export function totalDirectCost(cost: DirectCost) {
  const values = [cost.supplier,cost.compute??0,cost.storage??0,cost.bandwidth??0,cost.payment??0,cost.retryReserve??0,cost.otherDirect??0];
  if (values.some(value => !Number.isFinite(value) || value < 0)) throw new Error("INVALID_DIRECT_COST");
  return values.reduce((sum,value)=>sum+value,0);
}

export function minimumRetailForMargin(directCost:number,targetGrossMargin=MINIMUM_GROSS_MARGIN) {
  if (!Number.isFinite(directCost) || directCost < 0) throw new Error("INVALID_DIRECT_COST");
  if (!Number.isFinite(targetGrossMargin) || targetGrossMargin < MINIMUM_GROSS_MARGIN || targetGrossMargin >= 1) {
    throw new Error("INVALID_MARGIN_TARGET");
  }
  return directCost === 0 ? 0 : directCost / (1-targetGrossMargin);
}

export function grossMargin(retail:number,directCost:number) {
  if (!Number.isFinite(retail) || retail <= 0 || !Number.isFinite(directCost) || directCost < 0) throw new Error("INVALID_PRICE");
  return (retail-directCost)/retail;
}

export function assertMarginFloor(retail:number,directCost:number,targetGrossMargin=MINIMUM_GROSS_MARGIN) {
  if (grossMargin(retail,directCost)+Number.EPSILON < targetGrossMargin) throw new Error("MARGIN_FLOOR_NOT_MET");
}

export function quoteMinorUnits(input:{
  currency:PricingCurrency;
  executionMode:ExecutionMode;
  chargingClass:ChargingClass;
  directCostMinor:number;
  configuredRetailMinor?:number;
  targetGrossMargin?:number;
}) {
  const {currency,executionMode,chargingClass}=input;
  if (!Number.isSafeInteger(input.directCostMinor) || input.directCostMinor < 0) throw new Error("INVALID_DIRECT_COST");
  if (chargingClass==="DISABLED_UNVERIFIED") throw new Error("PRICING_UNVERIFIED");
  if (executionMode==="local" && chargingClass==="FREE_LOCAL") {
    return {currency,amountMinor:0,directCostMinor:0,targetGrossMargin:null};
  }
  if (executionMode==="byok") {
    // Supplier billing belongs to the user's connected supplier account.
    return {currency,amountMinor:0,directCostMinor:0,targetGrossMargin:null};
  }
  const margin=input.targetGrossMargin??MINIMUM_GROSS_MARGIN;
  const minimum=Math.ceil(minimumRetailForMargin(input.directCostMinor,margin));
  const amount=Math.max(minimum,input.configuredRetailMinor??0);
  if (amount<=0) throw new Error("PRICING_UNVERIFIED");
  assertMarginFloor(amount,input.directCostMinor,margin);
  return {currency,amountMinor:amount,directCostMinor:input.directCostMinor,targetGrossMargin:margin};
}
