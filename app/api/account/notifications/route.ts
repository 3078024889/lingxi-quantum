import {publicNoticeItems} from '@/lib/release/public-announcements';
import {accountMoneyFeed} from "@/lib/notifications/money-feed";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const lang=req.nextUrl.searchParams.get('lang')||'zh';
 const feed=await accountMoneyFeed(user.id,lang,req.nextUrl.searchParams.get('platform')||'web');
 const notices=publicNoticeItems(lang).map(n=>({...n,read:feed.seen.has(n.eventKey)}));
 const items=[...feed.items,...notices].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 return NextResponse.json({items,partial:feed.partial,readAvailable:feed.readAvailable,unread:items.filter(x=>!x.read).length},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>null) as {eventKeys?:unknown}|null;
 const keys=Array.isArray(body?.eventKeys)?body!.eventKeys.map(String).filter(x=>x.length>0&&x.length<=180).slice(0,100):[];
 if(!keys.length)return NextResponse.json({ok:true});
 const admin=createAdminClient();
 const {error}=await admin.from("lingxifield_notification_reads").upsert(keys.map(event_key=>({user_id:user.id,event_key,read_at:new Date().toISOString()})),{onConflict:"user_id,event_key"});
 if(error)return NextResponse.json({error:"NOTIFICATION_UPDATE_FAILED"},{status:500});
 return NextResponse.json({ok:true});
}
