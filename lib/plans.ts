// 灵犀场 V49：在售余额只保留一个 SASI 余额体系。
// CNY 与 USD 使用各自独立的价格簿，不做实时汇率换算。
export type Product = {
  id:string;name:string;nameEn:string;priceUsd:number;priceRmb:number;
  type:"permanent"|"subscription";days?:number;note:string;noteEn:string;highlight?:boolean;
  group:"production";sasiAmountFen?:number;
};

import { BALANCE_TOPUP_AMOUNTS } from "@/lib/balance-topups";
const RMB_TOPUPS=BALANCE_TOPUP_AMOUNTS;
export const sasiProductionProducts:Product[]=RMB_TOPUPS.map(amount=>({
  id:`sasi-balance-${amount}`,name:`余额充值 ¥${amount}`,nameEn:`Balance top-up ¥${amount}`,
  priceRmb:amount,priceUsd:0,type:"permanent",group:"production",sasiAmountFen:amount*100,
  note:"一个余额可用于全部 SASI；用户连接的智能服务费用由对应服务商直接收取。",
  noteEn:"One balance works across all SASI. Connected intelligence services bill the user directly.",
}));

export const allProducts=[...sasiProductionProducts];
export function getProduct(id:string){
  const configured=allProducts.find(p=>p.id===id);if(configured)return configured;
  // Preserve fulfillment of orders created before the displayed packs changed.
  const legacy=/^sasi-balance-(20|50|100|200|500|1000|2000|10000)$/.exec(id);
  if(legacy){const amount=Number(legacy[1]);return {...sasiProductionProducts[0],id,priceRmb:amount,sasiAmountFen:amount*100,name:`余额充值 ¥${amount}`,nameEn:`Balance top-up ¥${amount}`};}
  const custom=/^sasi-balance-custom-(\d{1,5})$/.exec(id);const amountRmb=custom?Number(custom[1]):0;
  if(!Number.isInteger(amountRmb)||amountRmb<10||amountRmb>10000)return undefined;
  return{id,name:`余额充值 ¥${amountRmb}`,nameEn:`Balance top-up ¥${amountRmb}`,priceUsd:0,priceRmb:amountRmb,type:"permanent" as const,note:"自定义人民币余额充值。",noteEn:"Custom CNY balance top-up.",group:"production" as const,sasiAmountFen:amountRmb*100};
}
