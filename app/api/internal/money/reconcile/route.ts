import{NextResponse}from"next/server";
import{reconcileDueWithdrawals,reconcileWithdrawal}from"@/lib/money/reconcile-worker";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;

function authorized(req:Request){
 const secret=process.env.MONEY_RECONCILE_SECRET?.trim();
 if(!secret||secret.length<24)return false;
 const auth=req.headers.get("authorization")||"";
 return auth===`Bearer ${secret}`;
}

export async function POST(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const body=await req.json().catch(()=>({}));
 const withdrawalId=typeof body.withdrawalId==="string"?body.withdrawalId:"";
 try{
  const result=withdrawalId
    ?await reconcileWithdrawal(withdrawalId)
    :await reconcileDueWithdrawals(Number(body.limit)||20);
  return NextResponse.json({ok:true,result},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("[money reconcile]",error instanceof Error?error.message:"unknown");
  return NextResponse.json({ok:false,error:"RECONCILIATION_FAILED"},{status:500});
 }
}
