export type UsdBalanceProduct={id:string;wallet:"ai"|"sasi";amountUsd:number;nameZh:string;nameEn:string};

export const USD_BALANCE_AMOUNTS=[10,20,50,100,300,500,1000,2000,10000] as const;

export const usdBalanceProducts:UsdBalanceProduct[]=[
 ...USD_BALANCE_AMOUNTS.map(amount=>({id:`ai-usd-balance-${amount}`,wallet:"ai" as const,amountUsd:amount,nameZh:`AI USD余额 $${amount}`,nameEn:`AI USD Balance $${amount}`})),
 ...USD_BALANCE_AMOUNTS.map(amount=>({id:`sasi-usd-balance-${amount}`,wallet:"sasi" as const,amountUsd:amount,nameZh:`SASI USD余额 $${amount}`,nameEn:`SASI USD Balance $${amount}`})),
];

export function getUsdBalanceProduct(id:string){return usdBalanceProducts.find(x=>x.id===id)}
