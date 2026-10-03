import{NextResponse}from"next/server";
import{reconcileDueWithdrawals}from"@/lib/money/reconcile-worker";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=90;

function authorized(req:Request){
 const secret=process.env.CRON_SECRET?.trim();
 return Boolean(secret&&req.headers.get("authorization")===`Bearer ${secret}`);
}

export async function GET(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 try{
  const result=await reconcileDueWithdrawals(20);
  const completed=result.filter((x:any)=>x?.status==="completed").length;
  const failed=result.filter((x:any)=>x?.status==="failed").length;
  const pending=result.length-completed-failed;
  return NextResponse.json({
   ok:true,
   checked:result.length,
   completed,
   failed,
   pending,
  },{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("[withdrawal reconcile cron]",error instanceof Error?error.message:"unknown");
  return NextResponse.json({ok:false,error:"RECONCILIATION_FAILED"},{status:500});
 }
}
