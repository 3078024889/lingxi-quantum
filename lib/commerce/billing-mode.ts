export type BillingMode="paid-tool"|"sasi-balance"|"supplier-direct-only"|"disabled";

export function assertBillingMode(x:{mode:BillingMode;platformCharge:boolean;userProviderKey:boolean}){
  if(x.mode==="supplier-direct-only"&&(!x.userProviderKey||x.platformCharge))throw new Error("SUPPLIER_DIRECT_MODE_INVALID");
  if(x.mode==="disabled"&&(x.platformCharge||x.userProviderKey))throw new Error("DISABLED_BILLING_FORBIDDEN");
  if((x.mode==="paid-tool"||x.mode==="sasi-balance")&&!x.platformCharge)throw new Error("PLATFORM_CHARGE_REQUIRED");
  return true;
}
