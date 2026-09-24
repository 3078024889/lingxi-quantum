import { createAdminClient } from "@/lib/supabase/admin";

export type ToolQuoteResult={toolId:string;billingType:string;quantity:number;unitName:string;amountRmb:number;amountUsd:number};

function money(n:number){return Number(Math.max(0,n).toFixed(2))}
function applyTier(quantity:number,config:any){
 const tiers=Array.isArray(config?.tiers)?config.tiers:[];
 for(const t of tiers){const max=Number(t?.max),price=Number(t?.price);if(Number.isFinite(max)&&Number.isFinite(price)&&quantity<=max)return price}
 const after=Number(config?.after),block=Number(config?.block),blockPrice=Number(config?.blockPrice);
 if(Number.isFinite(after)&&Number.isFinite(block)&&block>0&&Number.isFinite(blockPrice)){
  const base=tiers.length?Number(tiers[tiers.length-1]?.price||0):0;
  return base+Math.ceil(Math.max(0,quantity-after)/block)*blockPrice;
 }
 return NaN;
}
function calculate(quantity:number,base:number,unit:number,min:number,max:number|null|undefined,config:any){
 const tier=applyTier(quantity,config);
 let amount=Number.isFinite(tier)?tier:base+unit*quantity;
 amount=Math.max(amount,min);
 if(max!=null&&Number.isFinite(Number(max)))amount=Math.min(amount,Number(max));
 return money(amount);
}
export async function calculateToolQuote(toolId:string,quantityRaw:number):Promise<ToolQuoteResult>{
 const quantity=Math.max(0,Number(quantityRaw));
 if(!Number.isFinite(quantity)||quantity<=0)throw new Error("INVALID_QUANTITY");
 if(quantity>10000)throw new Error("QUANTITY_TOO_LARGE");
 const admin=createAdminClient();
 const {data,error}=await admin.from("tool_pricing").select("*").eq("tool_id",toolId).eq("enabled",true).single();
 if(error||!data)throw new Error("TOOL_PRICING_NOT_FOUND");
 const amountRmb=calculate(quantity,Number(data.base_price_rmb||0),Number(data.unit_price_rmb||0),Number(data.min_price_rmb||0),data.max_price_rmb,data.pricing_json);
 const hasUsd=data.base_price_usd!=null||data.unit_price_usd!=null||data.min_price_usd!=null;
 const amountUsd=hasUsd
  ?calculate(quantity,Number(data.base_price_usd||0),Number(data.unit_price_usd||0),Number(data.min_price_usd||0),data.max_price_usd,data.pricing_json_usd)
  :money(amountRmb*0.15);
 return{toolId,billingType:String(data.billing_type),quantity,unitName:String(data.unit_name),amountRmb,amountUsd};
}
