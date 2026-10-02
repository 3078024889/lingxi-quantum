import "server-only";

export type PricingCurrency = "CNY" | "USD";
export type ExecutionMode = "local" | "connected_service" | "server";
export type BillingClass = "PAID_TOOL" | "SASI_BALANCE" | "SUPPLIER_DIRECT_ONLY" | "DISABLED";

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
  billingClass:BillingClass;
  directCostMinor:number;
  configuredRetailMinor?:number;
  targetGrossMargin?:number;
}) {
  const {currency,billingClass}=input;
  if (!Number.isSafeInteger(input.directCostMinor) || input.directCostMinor < 0) throw new Error("INVALID_DIRECT_COST");
  if (billingClass==="DISABLED") throw new Error("PRICING_DISABLED");
  if (billingClass==="SUPPLIER_DIRECT_ONLY") {
    return {currency,amountMinor:0,directCostMinor:0,targetGrossMargin:null};
  }
  const configured=input.configuredRetailMinor??0;
  if (!Number.isSafeInteger(configured) || configured < 0) throw new Error("INVALID_CONFIGURED_RETAIL");
  if (billingClass==="SASI_BALANCE") {
    if (configured<=0) throw new Error("SASI_PRICE_REQUIRED");
    return {currency,amountMinor:configured,directCostMinor:input.directCostMinor,targetGrossMargin:null};
  }
  const margin=input.targetGrossMargin??MINIMUM_GROSS_MARGIN;
  const minimum=Math.ceil(minimumRetailForMargin(input.directCostMinor,margin));
  const amount=Math.max(minimum,configured);
  if (amount<=0) throw new Error("PRICING_UNVERIFIED");
  assertMarginFloor(amount,input.directCostMinor,margin);
  return {currency,amountMinor:amount,directCostMinor:input.directCostMinor,targetGrossMargin:margin};
}
