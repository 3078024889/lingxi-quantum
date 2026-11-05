import { NextResponse } from "next/server";
import {
  commandReply, isAllowedGroup, isClearSpam, telegramApi,
  validWebhookSecret, welcomeText, type TelegramUpdate,
} from "@/lib/telegram/community";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function claimUpdate(id: number): Promise<boolean> {
  const admin = createAdminClient();
  const key = `update:${id}`;
  const result = await admin.from("telegram_community_events")
    .insert({ event_key: key, event_kind: "webhook", status: "claimed" });
  if (!result.error) return true;
  if (result.error.code !== "23505") throw new Error("Unable to reserve Telegram update");
  // Telegram retries failed webhooks. Reclaim only failed records, atomically.
  // Already-claimed or delivered updates never run twice concurrently.
  const retry = await admin.from("telegram_community_events")
    .update({ status: "claimed" }).eq("event_key", key).eq("status", "failed")
    .select("event_key");
  if (retry.error) throw new Error("Unable to reclaim failed Telegram update");
  return (retry.data?.length || 0) === 1;
}

export async function POST(request: Request) {
  if (!validWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"), process.env.TELEGRAM_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const allowedGroup = process.env.TELEGRAM_CHAT_ID || "@globalsiai";
  if (!token) return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 503 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 65536) return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 65536) return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  let update: TelegramUpdate;
  try { update = JSON.parse(raw); } catch { return NextResponse.json({ error: "BAD_JSON" }, { status: 400 }); }
  if (!Number.isSafeInteger(update?.update_id)) return NextResponse.json({ error: "BAD_UPDATE" }, { status: 400 });
  const message = update.message;
  if (!message || message.from?.is_bot) return NextResponse.json({ ok: true });
  const privateChat = message.chat.type === "private";
  if (!privateChat && !isAllowedGroup(message.chat, allowedGroup)) return NextResponse.json({ ok: true });

  const command = message.text ? commandReply(message.text) : null;
  const newMembers = !privateChat && message.new_chat_members?.some((member) => !member.is_bot);
  const spam = !privateChat && !command && isClearSpam(message.text || "");
  if (!command && !newMembers && !spam) return NextResponse.json({ ok: true });

  try {
    if (!(await claimUpdate(update.update_id))) return NextResponse.json({ ok: true, duplicate: true });
    if (spam) {
      await telegramApi(token, "deleteMessage", { chat_id: message.chat.id, message_id: message.message_id });
    } else {
      await telegramApi(token, "sendMessage", {
        chat_id: message.chat.id, text: command || welcomeText(),
        disable_web_page_preview: true,
      });
    }
    await createAdminClient().from("telegram_community_events")
      .update({ status: "delivered" }).eq("event_key", `update:${update.update_id}`);
    return NextResponse.json({ ok: true });
  } catch {
    // A failed claim is visible for manual recovery; avoid repeated messages from Telegram retries.
    await createAdminClient().from("telegram_community_events")
      .update({ status: "failed" }).eq("event_key", `update:${update.update_id}`);
    return NextResponse.json({ error: "DELIVERY_FAILED" }, { status: 503 });
  }
}
