export type BillingMode="free-local"|"managed"|"byok"|"disabled";
export function assertBillingMode(x:{mode:BillingMode;platformProviderCharge:boolean;userProviderKey:boolean}){
 if(x.mode==="free-local"&&x.platformProviderCharge)throw new Error("FREE_LOCAL_PROVIDER_CHARGE_FORBIDDEN");
 if(x.mode==="byok"&&(!x.userProviderKey||x.platformProviderCharge))throw new Error("BYOK_PROVIDER_BILLING_MIXED");
 if(x.mode==="managed"&&x.userProviderKey)throw new Error("MANAGED_BYOK_MIXED");
 if(x.mode==="disabled"&&(x.platformProviderCharge||x.userProviderKey))throw new Error("DISABLED_BILLING_FORBIDDEN");
 return true;
}
