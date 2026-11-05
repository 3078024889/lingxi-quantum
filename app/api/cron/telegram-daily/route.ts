import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dailyPost, singaporeDate, telegramApi } from "@/lib/telegram/community";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "@globalsiai";
  if (!token) return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 503 });
  const date = singaporeDate(new Date());
  const key = `daily:${date}`;
  const admin = createAdminClient();
  const claim = await admin.from("telegram_community_events")
    .insert({ event_key: key, event_kind: "daily", status: "claimed" });
  if (claim.error?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (claim.error) return NextResponse.json({ error: "STORAGE_UNAVAILABLE" }, { status: 503 });
  try {
    await telegramApi(token, "sendMessage", {
      chat_id: chatId, text: dailyPost(new Date()), disable_web_page_preview: true,
    });
    await admin.from("telegram_community_events")
      .update({ status: "delivered" }).eq("event_key", key);
    return NextResponse.json({ ok: true, day: date });
  } catch {
    await admin.from("telegram_community_events")
      .update({ status: "failed" }).eq("event_key", key);
    return NextResponse.json({ error: "DELIVERY_FAILED" }, { status: 503 });
  }
}
