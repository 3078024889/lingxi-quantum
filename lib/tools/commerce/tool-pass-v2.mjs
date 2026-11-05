/** Pure contract shared by the disabled HTTP endpoints and offline tests.
 * No account or wallet value from the browser can determine a charge.
 */
export const PASS_CURRENCIES=Object.freeze(["CNY","USD"]);
export const PASS_UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function passQuote(contract,sku,currency){
 if(!PASS_CURRENCIES.includes(currency))return null;
 const p=contract.plans.find(p=>p.sku===sku);
 if(!p||!Number.isSafeInteger(p.days)||p.days<1)return null;
 const units=p.price?.[currency];
 if(!Number.isSafeInteger(units)||units<=0)return null;
 return Object.freeze({sku:p.sku,currency,days:p.days,amountMinor:units*100,amount:units,automaticRenewal:false});
}
export function toolPassClassification(contract,toolKey){
 if(typeof toolKey!=="string"||!SLUG.test(toolKey))return "unknown";
 if(contract.eligible_candidate_tool_ids.includes(toolKey))return "locally_eligible";
 if(contract.further_review_tool_ids.includes(toolKey))return "provider_or_runtime_review";
 return "unknown";
}
export function passContractReady(contract){
 if(contract.active!==true)return false;
 if(!Array.isArray(contract.plans)||contract.plans.length!==4)return false;
 if(contract.free_policy?.limit!==1||contract.free_policy?.period!=="lifetime")return false;
 return contract.plans.every(p=>passQuote(contract,p.sku,"CNY")&&passQuote(contract,p.sku,"USD"));
}
