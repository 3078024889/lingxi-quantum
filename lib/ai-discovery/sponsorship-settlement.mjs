/** Pure server-side settlement contract. Never trust client payment assertions. */
const allowedCurrencies=new Set(["CNY","USD"]);
const paidStates=new Set(["paid","settled"]);
const idPattern=/^[A-Za-z0-9_-]{4,128}$/;
export function verifySponsorshipSettlement({order,placement,trustedGatewayEvent}){
 if(!order||!placement||!trustedGatewayEvent)throw Error("SETTLEMENT_INPUT_MISSING");
 if(trustedGatewayEvent.verifiedByServer!==true||trustedGatewayEvent.signatureValid!==true)throw Error("UNVERIFIED_GATEWAY_EVENT");
 if(!idPattern.test(order.id??"")||!idPattern.test(placement.id??"")||!idPattern.test(trustedGatewayEvent.eventId??""))throw Error("INVALID_SETTLEMENT_IDENTIFIER");
 if(order.productType!=="ai_directory_sponsorship"||order.placementId!==placement.id||trustedGatewayEvent.orderId!==order.id)throw Error("ORDER_PLACEMENT_MISMATCH");
 if(!allowedCurrencies.has(order.currency)||order.currency!==trustedGatewayEvent.currency)throw Error("SETTLEMENT_CURRENCY_MISMATCH");
 if(!Number.isSafeInteger(order.amountMinor)||order.amountMinor<=0||order.amountMinor!==trustedGatewayEvent.amountMinor)throw Error("SETTLEMENT_AMOUNT_MISMATCH");
 if(!paidStates.has(trustedGatewayEvent.status)||order.status!=="paid")throw Error("PAYMENT_NOT_SETTLED");
 if(trustedGatewayEvent.refunded===true||trustedGatewayEvent.disputed===true||order.refunded===true)throw Error("PAYMENT_REVERSED");
 return Object.freeze({placementId:placement.id,verifiedPaymentId:order.id,gatewayEventId:trustedGatewayEvent.eventId,currency:order.currency,amountMinor:order.amountMinor});
}
export function settlementIdempotencyKey(verified){
 if(!verified?.gatewayEventId||!verified?.verifiedPaymentId)throw Error("UNVERIFIED_SETTLEMENT");
 return `${verified.verifiedPaymentId}:${verified.gatewayEventId}`;
}
