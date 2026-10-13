export type DeliveryCallback=()=>void|boolean|Promise<void|boolean>;
/** An explicit incomplete result and a rejected processor must both keep the paid task retryable. */
export async function requireCompletedDelivery(deliver:DeliveryCallback){
 if(await deliver()===false)throw Error('DELIVERY_NOT_COMPLETE');
}
