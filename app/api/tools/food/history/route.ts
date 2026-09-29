import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const days=Math.max(1,Math.min(31,Number(new URL(req.url).searchParams.get("days")||7)));
 const since=new Date(Date.now()-days*86400000).toISOString(),admin=createAdminClient();
 const{data,error}=await admin.from("nutrition_analysis_history").select("created_at,photo_count,total_kcal,total_protein_g,total_carbs_g,total_fat_g,total_fiber_g,total_sugar_g,total_sodium_mg").eq("user_id",user.id).gte("created_at",since).order("created_at",{ascending:true}).limit(500);
 if(error)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503});
 const rows=data||[],sum=(k:string)=>rows.reduce((a:any,x:any)=>a+Number(x[k]||0),0);
 return NextResponse.json({days,count:rows.length,photos:sum("photo_count"),totals:{kcal:sum("total_kcal"),protein_g:sum("total_protein_g"),carbs_g:sum("total_carbs_g"),fat_g:sum("total_fat_g"),fiber_g:sum("total_fiber_g"),sugar_g:sum("total_sugar_g"),sodium_mg:sum("total_sodium_mg")},rows},{headers:{"Cache-Control":"no-store"}});
}
