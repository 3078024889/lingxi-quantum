import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {telegramApi,telegramMemberCount} from "@/lib/telegram/community";
import {buildPost, singaporeDay, singaporeHour, SLOT_HOURS, type TelegramSlot} from "@/lib/telegram/editorial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Each Vercel Hobby cron fires at most once per day and may arrive anytime in its designated hour.
export async function publishTelegramSlot(request:Request, slot:TelegramSlot) {
  const expected=(process.env.CRON_SECRET||"").trim();
  if (!expected || request.headers.get("authorization")!==`Bearer ${expected}`) {
    return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  }
  const now=new Date();
  // The exact slot, not the caller's query string, chooses what may be published.
  if(singaporeHour(now)!==SLOT_HOURS[slot]) {
    return NextResponse.json({error:"OUTSIDE_PUBLISH_WINDOW",slot},{status:409});
  }
  const token=(process.env.TELEGRAM_BOT_TOKEN||"").trim();
  const webhook=(process.env.TELEGRAM_WEBHOOK_SECRET||"").trim();
  const group=(process.env.TELEGRAM_CHAT_ID||"@globalsiai").trim();
  if(!token||webhook.length<16||!group){
    return NextResponse.json({error:"BOT_NOT_CONFIGURED"},{status:503});
  }
  // Registration uses only server-held secrets; no token ever appears in a link or response.
  // Re-registering is harmless and helps recover from external webhook resets.
  try {
    await telegramApi(token,"setWebhook",{
      url:"https://lingxifield.com/api/telegram/webhook",
      secret_token:webhook,allowed_updates:["message"],drop_pending_updates:false,
    });
  } catch {
    return NextResponse.json({error:"WEBHOOK_SETUP_FAILED"},{status:503});
  }
  const key=`post:${singaporeDay(now)}:${slot}`;
  const db=createAdminClient();
  const claim=await db.from("telegram_community_events")
    .insert({event_key:key,event_kind:"daily",status:"claimed"});
  if(claim.error?.code==="23505")return NextResponse.json({ok:true,duplicate:true,slot});
  if(claim.error)return NextResponse.json({error:"STORAGE_UNAVAILABLE"},{status:503});
  try{
    await telegramApi(token,"sendMessage",{
      chat_id:group,text:buildPost(now,slot,"telegram"),disable_web_page_preview:true,
    });
    const done=await db.from("telegram_community_events")
      .update({status:"delivered"}).eq("event_key",key);
    if(done.error) return NextResponse.json({error:"SENT_BUT_LOG_FAILED",slot},{status:503});
    if(slot==="community"){
      const day=singaporeDay(now);
      const [members,delivered]=await Promise.all([
        telegramMemberCount(token,group),
        db.from("telegram_community_events").select("event_key")
          .eq("event_kind","daily").eq("status","delivered").like("event_key",`post:${day}:%`),
      ]);
      // Reporting is best effort and does not block delivery.
      if(!delivered.error){
        await db.from("telegram_community_daily_metrics").upsert({
          snapshot_day:day,member_count:members,
          posts_delivered:(delivered.data||[]).length,observed_at:now.toISOString(),
        },{onConflict:"snapshot_day"});
      }
    }
    return NextResponse.json({ok:true,slot,date:singaporeDay(now)});
  }catch{
    await db.from("telegram_community_events").update({status:"failed"}).eq("event_key",key);
    // Do not automatically retry a possibly-delivered message and cause duplicate marketing posts.
    return NextResponse.json({error:"PUBLISH_FAILED",slot},{status:503});
  }
}
