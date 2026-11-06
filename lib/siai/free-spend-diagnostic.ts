export type SpendItem = {
 name: string;
 monthlyPrice: number;
 usedPerMonth: number;
 expectedPerMonth?: number;
 monthlyQuota?: number;
 alternativeMonthlyPrice?: number;
 essential?: boolean;
};
export type SpendInput = {currency:"CNY"|"USD"; items:SpendItem[]};
export type SpendFinding = {
 name:string; status:"keep"|"review"|"downgrade_candidate";
 monthlyPrice:number; costPerUse:number|null; potentialMonthlySavings:number;
 quotaShortfall:number|null;
 reason:string;
};
export type SpendOutput = {
 currency:"CNY"|"USD"; monthlySpend:number;
 potentialMonthlySavings:number; annualizedPotentialSavings:number;
 findings:SpendFinding[]; assumptions:string[];
};
const finite=(x:unknown):x is number=>typeof x==="number"&&Number.isFinite(x);
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function diagnoseAiSpend(input:SpendInput):SpendOutput {
 if(!input||!["CNY","USD"].includes(input.currency)||!Array.isArray(input.items)||input.items.length<1||input.items.length>30) throw new Error("请填写1至30项订阅，并选择CNY或USD");
 const seen=new Set<string>();
 const findings=input.items.map((item)=>{
  const name=String(item?.name??"").trim();
  if(!name||name.length>100||seen.has(name.toLocaleLowerCase()))throw new Error("工具名称不能为空、重复或超过100字");
  seen.add(name.toLocaleLowerCase());
  if(!finite(item.monthlyPrice)||item.monthlyPrice<0||item.monthlyPrice>1_000_000) throw new Error("月费必须为非负的有效金额");
  if(!Number.isInteger(item.usedPerMonth)||item.usedPerMonth<0||item.usedPerMonth>1_000_000) throw new Error("使用次数必须为非负整数");
  if(item.expectedPerMonth!==undefined&&(!Number.isInteger(item.expectedPerMonth)||item.expectedPerMonth<0||item.expectedPerMonth>1_000_000))throw new Error("预计使用次数必须为非负整数");
  if(item.monthlyQuota!==undefined&&(!Number.isInteger(item.monthlyQuota)||item.monthlyQuota<0||item.monthlyQuota>1_000_000))throw new Error("额度必须为非负整数");
  if(item.alternativeMonthlyPrice!==undefined&&(!finite(item.alternativeMonthlyPrice)||item.alternativeMonthlyPrice<0||item.alternativeMonthlyPrice>1_000_000))throw new Error("替代套餐金额无效");
  const price=money(item.monthlyPrice), used=item.usedPerMonth, future=item.expectedPerMonth??used;
  let savings=0;
  let status:SpendFinding["status"]="keep";
  let reason="根据目前提供的使用量，暂无明确降级依据；还需比较功能、免费额度和商用规则。";
  if(!item.essential&&item.expectedPerMonth===0&&price>0){
   savings=price;status="review";
   reason="预计下月不使用；可考虑在确认取消及数据导出规则后暂停订阅。";
  } else if(item.alternativeMonthlyPrice!==undefined&&item.alternativeMonthlyPrice<price&&future>0){
   savings=money(price-item.alternativeMonthlyPrice);status="downgrade_candidate";
   reason="你填写了更便宜的候选价格；只有确认功能、额度、地区及商用条件满足任务后才适合更换。";
  } else if(!item.essential&&used===0&&price>0) {
   status="review"; reason="本月未使用，但未来使用计划尚不明确；建议核对续费前是否仍有需求。";
  }
  const quotaShortfall=item.monthlyQuota!==undefined&&item.expectedPerMonth!==undefined?Math.max(0,item.expectedPerMonth-item.monthlyQuota):null;
  return {name,status,monthlyPrice:price,costPerUse:used>0?money(price/used):null,potentialMonthlySavings:money(savings),quotaShortfall,reason};
 });
 const monthlySpend=money(findings.reduce((s,x)=>s+x.monthlyPrice,0));
 const potentialMonthlySavings=money(findings.reduce((s,x)=>s+x.potentialMonthlySavings,0));
 return {currency:input.currency,monthlySpend,potentialMonthlySavings,annualizedPotentialSavings:money(potentialMonthlySavings*12),findings,assumptions:[
 "仅使用用户手动提供的数据；不连接账单、银行或第三方账号。",
 "潜在节省并非已实现节省，也不是对第三方套餐可用性的验证。",
 "年度值仅为月度潜在节省乘以12，不包含折扣、退款、汇率和税费。",
 "不同币种必须分开诊断，不会将人民币与美元金额直接相加。",
 "必要工具不会仅因使用频率低而自动建议取消。",
 "额度缺口仅比较用户输入的下月预计任务次数和套餐月额度，不代表实际模型供应商限制。",
 ]};
}
