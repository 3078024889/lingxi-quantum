import "server-only";
import{createAdminClient}from"@/lib/supabase/admin";
import{reconcileWithdrawal}from"@/lib/money/reconcile-worker";

async function ownedWithdrawal(id:string,userId:string){
 const admin=createAdminClient();
 const {data,error}=await admin.from("balance_withdrawals")
  .select("id,status")
  .eq("id",id)
  .eq("user_id",userId)
  .single();
 if(error||!data)return null;
 return data;
}

function publicStatus(value:unknown){
 const s=String(value||"");
 return s==="completed"?"completed":s==="failed"||s==="rejected"?"failed":s==="requested"?"requested":"processing";
}

export async function dispatchWithdrawal(id:string,userId:string){
 const admin=createAdminClient();
 const owned=await ownedWithdrawal(id,userId);
 if(!owned)return{ok:false,error:"WITHDRAWAL_NOT_FOUND"};
 if(!["requested","processing"].includes(String(owned.status)))return{ok:true,status:publicStatus(owned.status),withdrawalId:id};

 if(owned.status==="requested"){
  await admin.from("balance_withdrawals").update({
   status:"processing",
   processing_started_at:new Date().toISOString(),
   updated_at:new Date().toISOString(),
  }).eq("id",id).eq("user_id",userId).eq("status","requested");
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

export async function refreshWithdrawal(id:string,userId:string){
 const owned=await ownedWithdrawal(id,userId);
 if(!owned)return{ok:false,error:"WITHDRAWAL_NOT_FOUND"};
 if(!["requested","processing"].includes(String(owned.status)))return{ok:true,status:publicStatus(owned.status),withdrawalId:id};
 return dispatchWithdrawal(id,userId);
}
