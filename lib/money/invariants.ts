import type{MoneyBalanceSnapshot}from"./types";

export function assertMoneySnapshot(snapshot:MoneyBalanceSnapshot){
  for(const [name,value] of Object.entries({
    availableMinor:snapshot.availableMinor,
    refundableMinor:snapshot.refundableMinor,
    refundHoldMinor:snapshot.refundHoldMinor,
    legacyAvailableMinor:snapshot.legacyAvailableMinor,
    activeAvailableMinor:snapshot.activeAvailableMinor,
  })){
    if(!Number.isSafeInteger(value)||value<0)throw new Error(`MONEY_INVALID_${name.toUpperCase()}`);
  }
  if(snapshot.refundHoldMinor>snapshot.refundableMinor){
    throw new Error("MONEY_REFUND_HOLD_EXCEEDS_REFUNDABLE");
  }
  if(snapshot.availableMinor!==snapshot.legacyAvailableMinor+snapshot.activeAvailableMinor){
    throw new Error("MONEY_AVAILABLE_SUM_MISMATCH");
  }
  return snapshot;
}

export function formatMinor(currency:"CNY"|"USD",minor:number){
  const n=(Number(minor)||0)/100;
  return currency==="CNY"?`¥${n.toFixed(2)}`:`$${n.toFixed(2)}`;
}
