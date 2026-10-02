export type UsdBalanceProduct={id:string;wallet:"sasi";amountUsd:number;nameZh:string;nameEn:string};
export const USD_BALANCE_AMOUNTS=[10,20,50,100,300,500,1000,2000,10000] as const;
export const usdBalanceProducts:UsdBalanceProduct[]=USD_BALANCE_AMOUNTS.map(amount=>({id:`sasi-usd-balance-${amount}`,wallet:"sasi",amountUsd:amount,nameZh:`余额充值 $${amount}`,nameEn:`Balance top-up $${amount}`}));
export function getUsdBalanceProduct(id:string){return usdBalanceProducts.find(x=>x.id===id)}
