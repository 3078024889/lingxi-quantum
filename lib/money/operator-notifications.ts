import "server-only";
import {after} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {moneyOperatorSettings} from "./operator-settings";
const labels:Record<string,string>={requested:"新退款申请（待用户确认）",processing:"退款正在处理",completed:"退款完成",cancelled:"用户取消申请",failed:"退款未完成",PROVIDER_FUNDS_REQUIRED:"需要补足商户退款资金",PROVIDER_ACTION_REQUIRED:"退款需要人工处理",OPERATOR_REVIEW_REQUIRED:"退款长时间未完成"};
export function moneyNoticeEmail(event:string,w:{id:string;provider:string;currency:string;amount_minor:number;provider_currency:string;provider_amount_minor:number}){
 const channel=w.provider==="wechat"?"微信支付":w.provider==="alipay"?"支付宝":"PayPal";
 const amount=new Intl.NumberFormat("zh-CN",{style:"currency",currency:w.provider_currency}).format(w.provider_amount_minor/100);
 const instruction=event==="PROVIDER_FUNDS_REQUIRED"?"请检查并补足该商户账户的退款资金，再从管理员看板继续原单退款。":event==="requested"?"用户尚未确认提交，可以取消申请；此时无需补资金。":event==="processing"?"正在联系原支付渠道，请查看看板确认受理结果；请勿另外新建退款。":event==="completed"?"渠道已确认完成，请核对渠道资金记录。":event==="cancelled"?"申请已取消，冻结金额已恢复到用户余额。":"请在管理员看板查看最新状态和处理原因。";
 return{subject:"[灵犀场资金] "+(labels[event]||"退款进度")+" · "+channel+" "+amount,text:[labels[event]||event,"支付渠道："+channel,"渠道退款金额："+amount,"用户余额币种："+w.currency,"申请编号："+w.id,instruction,"资金看板：https://lingxifield.com/account/money-admin"].join("\n")};
}
export async function flushMoneyNotifications(limit=5,forceRetry=false){
 const key=process.env.RESEND_API_KEY;if(!key)return{sent:0,configured:false};
 const admin=createAdminClient(),settings=await moneyOperatorSettings();
 if(forceRetry){const reset=await admin.from("money_notification_outbox").update({available_at:new Date().toISOString(),attempt_count:0}).eq("status","failed").is("locked_until",null);if(reset.error)throw new Error("MONEY_NOTICE_RETRY_FAILED");}
 const {data:rows,error}=await admin.rpc("money_claim_notifications",{p_limit:limit});if(error)throw new Error("MONEY_NOTICE_CLAIM_FAILED");
 let sent=0;
 for(const row of rows||[]){
  try{const {data:w,error}=await admin.from("balance_withdrawals").select("id,provider,currency,amount_minor,provider_currency,provider_amount_minor").eq("id",row.withdrawal_id).single();if(error||!w)throw new Error("REQUEST_UNAVAILABLE");
   const email=moneyNoticeEmail(row.event_type,w);
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+key,"content-type":"application/json","Idempotency-Key":"money-notice/"+row.id},body:JSON.stringify({from:process.env.LINGXIFIELD_MONEY_FROM_EMAIL||process.env.LINGXIFIELD_SUPPORT_FROM_EMAIL||"灵犀场 <support@lingxifield.com>",to:[settings.notify_email],...email}),signal:AbortSignal.timeout(8000)});
   const result=await response.json().catch(()=>null);if(!response.ok||!result?.id)throw new Error("EMAIL_SEND_FAILED");
   const save=await admin.from("money_notification_outbox").update({status:"sent",message_id:result.id,sent_at:new Date().toISOString(),locked_until:null,last_error:null}).eq("id",row.id);if(save.error)throw new Error("EMAIL_RECEIPT_SAVE_FAILED");sent++;
  }catch(e){await admin.from("money_notification_outbox").update({status:"failed",last_error:e instanceof Error?e.message:"EMAIL_SEND_FAILED",locked_until:null,available_at:new Date(Date.now()+Math.min(3600000,60000*2**Number(row.attempt_count||1))).toISOString()}).eq("id",row.id);}
 }
 return{sent,configured:true};
}
export function scheduleMoneyNotices(){after(async()=>{try{await flushMoneyNotifications()}catch{console.error("[money notices] delivery pending; inspect admin dashboard")}});}
