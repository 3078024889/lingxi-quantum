export type VendorPlan={id:'listing'|'brand'|'launch'|'category';amount:number;durationDays:number|null;unit:string;visibility:string;orderable:boolean;benefits:readonly string[]};
export type VendorQuote={planId:string;amount:number;currency:'CNY'|'USD';amountMinor:number;durationDays:number|null;unit:string;paid:boolean;rankingImpact:false;sponsored:boolean;requiresVerifiedVendor:boolean};
export declare const VENDOR_PLANS:readonly VendorPlan[];
export declare const VALID_CURRENCIES:readonly ('CNY'|'USD')[];
export declare function selectBillingCurrency(requested:unknown,country:unknown):'CNY'|'USD';
export declare function vendorQuote(planId:unknown,currency:unknown):VendorQuote|null;
export declare function checkoutProviderAllowed(currency:unknown,provider:unknown):boolean;
export declare function validateVendorCheckoutRequest(input:unknown):({plan:VendorQuote;companyId:string;productId:string;idempotencyKey:string;provider:'paypal'|'alipay'|'wechat'})|null;
