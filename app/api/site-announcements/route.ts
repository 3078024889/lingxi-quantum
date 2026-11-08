import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

/** Public release-only fields. Never expose accounts, order contents or admin emails. */
export async function GET(){
 try{
  const now=new Date().toISOString();
  const {data,error}=await createAdminClient()
    .from("lingxifield_announcements")
    .select("id,version_label,title_zh,title_en,published_at,expires_at")
    .eq("is_active",true)
    .in("platform",["all","web"])
    .lte("published_at",now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("published_at",{ascending:false})
    .limit(8);
  if(error)throw new Error("ANNOUNCEMENT_QUERY_FAILED");
  return NextResponse.json({items:(data||[]).map(a=>({
    id:a.id,version:a.version_label,
    titleZh:a.title_zh,titleEn:a.title_en||a.title_zh,
    publishedAt:a.published_at,href:"/account/notifications"
  }))},{headers:{"Cache-Control":"public, max-age=30, s-maxage=120","X-Content-Type-Options":"nosniff"}});
 }catch{
  return NextResponse.json({items:[],error:"ANNOUNCEMENTS_UNAVAILABLE"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
