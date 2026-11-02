export type VendorQuoteInput={productId:string;planId:string;currency:string;provider?:string|null};
export type VendorOrder={productId:string;planId:string;currency:string;provider:string;
  publisherId:string;vendorUserId:string;merchantOrderRef:string;providerPaymentRef:string;
  amountMinor:number;status:string;paidVerifiedAt:string};
export function vendorPlacementQuote(input:VendorQuoteInput,curatedIds:readonly string[]):{
 productId:string;planId:string;currency:string;provider:string|null;amountMinor:number;amount:number;
 interval:string;merchantCheckoutReady:false;paymentUrl:null;fulfillment:string
};
export function vendorEntitlementDecision(input:{verifiedOrder:VendorOrder;approvedClaim:{
 status:string;publisherId:string;productId:string;vendorUserId:string};
 providerProof:{signatureVerified:boolean;orderRef:string;transactionRef:string;amountMinor:number;currency:string;provider:string}}):{
 decision:'eligible_for_reviewed_placement';productId:string;planId:string;merchantOrderRef:string
};
