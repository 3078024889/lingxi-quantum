import "server-only";
import{createAdminClient}from"@/lib/supabase/admin";
import{scheduleMoneyNotices}from"@/lib/money/operator-notifications";
import{reconcileWithdrawal}from"@/lib/money/reconcile-worker";

async function ownedWithdrawal(id:string,userId:string){
 const admin=createAdminClient();
 const {data,error}=await admin.from("balance_withdrawals")
  .select("id,status,submission_confirmed_at")
  .eq("id",id)
  .eq("user_id",userId)
  .single();
 if(error||!data)return null;
 return data;
}

function publicStatus(value:unknown){
 const s=String(value||"");
 return s==="cancelled"?"cancelled":s==="completed"?"completed":s==="failed"||s==="rejected"?"failed":s==="requested"?"requested":"processing";
}

export async function dispatchWithdrawal(id:string,userId:string,confirmSubmission=false){
 const admin=createAdminClient();
 const owned=await ownedWithdrawal(id,userId);
 if(!owned)return{ok:false,error:"WITHDRAWAL_NOT_FOUND"};
 if(!["requested","processing"].includes(String(owned.status)))return{ok:true,status:publicStatus(owned.status),withdrawalId:id};

 if(owned.status==="requested"&&!owned.submission_confirmed_at){
  if(!confirmSubmission){scheduleMoneyNotices();return{ok:true,status:"requested",withdrawalId:id};}
  const confirmed=await admin.rpc("confirm_balance_withdrawal_submission",{p_withdrawal_id:id,p_user_id:userId});
  if(confirmed.error||!confirmed.data?.ok)return{ok:false,error:confirmed.data?.error||"CONFIRMATION_FAILED"};
 }

 const result=await reconcileWithdrawal(id);
 return{
  ok:true,
  status:publicStatus(result.status),
  withdrawalId:id,
  needsSupport:Boolean((result as any).operatorActionRequired),
  failureCode:(result as any).failureCode||null,
 };
}

export async function refreshWithdrawal(id:string,userId:string,confirmSubmission=false){
 const owned=await ownedWithdrawal(id,userId);
 if(!owned)return{ok:false,error:"WITHDRAWAL_NOT_FOUND"};
 if(!["requested","processing"].includes(String(owned.status)))return{ok:true,status:publicStatus(owned.status),withdrawalId:id};
 return dispatchWithdrawal(id,userId,confirmSubmission);
}
