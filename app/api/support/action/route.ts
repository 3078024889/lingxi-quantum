import{NextRequest,NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{mergeSupportContext,supportLifecycle,verifySupportActionToken}from"@/lib/support/lifecycle";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get("ticket")||"";
 const action=req.nextUrl.searchParams.get("action")||"";
 const token=req.nextUrl.searchParams.get("token")||"";
 if(!["viewed","processing","completed"].includes(action)||!verifySupportActionToken(id,action,token)){
  return NextResponse.json({error:"INVALID_SUPPORT_ACTION"},{status:403});
 }
 const a=createAdminClient();
 const{data,error}=await a.from("lingxifield_support_tickets").select("id,status,context").eq("id",id).maybeSingle();
 if(error||!data)return NextResponse.json({error:"TICKET_NOT_FOUND"},{status:404});
 const now=new Date().toISOString(),life=supportLifecycle(data.context);
 const patch:any={viewedAt:life.viewedAt||now};
 let status=data.status;
 if(action==="processing"){
  patch.processingAt=life.processingAt||now;
  status="reviewing";
 }
 if(action==="completed"){
  patch.processingAt=life.processingAt||now;
  patch.completedAt=life.completedAt||now;
  status="fixed";
 }
 const context=mergeSupportContext(data.context,patch);
 const u=await a.from("lingxifield_support_tickets").update({context,status,updated_at:now}).eq("id",id);
 if(u.error)return NextResponse.json({error:"UPDATE_FAILED"},{status:500});
 const target=new URL("/account/support",req.nextUrl.origin);
 target.searchParams.set("ticket",id.slice(0,8));
 target.searchParams.set("updated",action);
 return NextResponse.redirect(target,303);
}
