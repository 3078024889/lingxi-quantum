export type UsdBalanceProduct={id:string;wallet:"sasi";amountUsd:number;nameZh:string;nameEn:string};
import { BALANCE_TOPUP_AMOUNTS, customTopupAmount } from "@/lib/balance-topups";
export const USD_BALANCE_AMOUNTS=BALANCE_TOPUP_AMOUNTS;
export const usdBalanceProducts:UsdBalanceProduct[]=USD_BALANCE_AMOUNTS.map(amount=>({id:`sasi-usd-balance-${amount}`,wallet:"sasi",amountUsd:amount,nameZh:`余额充值 $${amount}`,nameEn:`Balance top-up $${amount}`}));
export function getUsdBalanceProduct(id:string):UsdBalanceProduct|undefined{
 const configured=usdBalanceProducts.find(x=>x.id===id);if(configured)return configured;
 const custom=/^sasi-usd-balance-custom-([0-9]+)$/.exec(id);
 const legacy=/^sasi-usd-balance-(20|50|100|300|500|1000|2000|10000)$/.exec(id);
 const amount=custom?customTopupAmount(custom[1]):legacy?Number(legacy[1]):null;
 if(amount===null)return undefined;
 return{id,wallet:"sasi",amountUsd:amount,nameZh:`余额充值 $${amount}`,nameEn:`Balance top-up $${amount}`};
}
