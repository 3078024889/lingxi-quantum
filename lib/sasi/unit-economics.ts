/** Planning calculator only. Never authorizes a payment or replaces reviewed supplier tariffs. */
export function unitEconomics(input:{priceFen:number;supplierFen:number;operationsFen:number;retryReserveFen:number;paymentFeeBps:number}){
 const {priceFen,supplierFen,operationsFen,retryReserveFen,paymentFeeBps}=input;
 if(!Object.values(input).every(n=>Number.isSafeInteger(n)&&n>=0)||priceFen===0||paymentFeeBps>=10000)throw new Error("INVALID_COST_ASSUMPTIONS");
 const paymentFeeFen=Math.ceil(priceFen*paymentFeeBps/10000);
 const totalCostFen=supplierFen+operationsFen+retryReserveFen+paymentFeeFen;
 const contributionFen=priceFen-totalCostFen;
 if(!Number.isSafeInteger(totalCostFen)||!Number.isSafeInteger(priceFen*paymentFeeBps))throw new Error("COST_OUT_OF_RANGE");
 return {...input,paymentFeeFen,totalCostFen,contributionFen,contributionMargin:contributionFen/priceFen};
}
