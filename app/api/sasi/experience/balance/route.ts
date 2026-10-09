import{NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{readExperienceAllowance}from"@/lib/sasi/experience/daily-budget";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(){
 const supabase=createClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const allowance=await readExperienceAllowance(user.id);
 return NextResponse.json({allowance},{headers:{"Cache-Control":"private, no-store"}});
}
