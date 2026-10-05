import{NextRequest,NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{runSnapshot}from"@/lib/sasi/durable/public-event-store";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(_req:NextRequest,ctx:{params:Promise<{runId:string}>}){
 const{runId}=await ctx.params;
 if(!/^[0-9a-f-]{36}$/i.test(runId))return NextResponse.json({error:"NOT_FOUND"},{status:404});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const snapshot=await runSnapshot(user.id,runId);
 if(!snapshot)return NextResponse.json({error:"NOT_FOUND"},{status:404});
 return NextResponse.json(snapshot,{headers:{"Cache-Control":"no-store"}});
}
