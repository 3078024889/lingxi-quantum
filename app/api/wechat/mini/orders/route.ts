import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { TOPUP_EXPIRY_MS, validOrderDeletionIds } from "@/lib/mini/order-deletion";
import { checkRateLimit } from "@/lib/rate-limit";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
 const session = await requireMiniSession(req);
 if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
 const admin = createAdminClient();
 // A local pending state is not proof of non-payment. Query the platform first.
 const { data: expired } = await admin.from("orders").select("id")
  .eq("user_id", session.userId).is("user_deleted_at", null).eq("status", "pending").eq("provider", "wechat_mini_virtual")
  .lte("created_at", new Date(Date.now() - TOPUP_EXPIRY_MS).toISOString())
  .like("product_id", "sasi-balance-%").order("created_at", { ascending: false }).limit(5);
 await Promise.allSettled((expired || []).map(async row => {
   const result = await reconcileVirtualToolOrder(row.id, session.userId);
   if (result.paid || !(result.closed || result.providerConfirmedUnpaid)) return;
   await admin.from("orders").update({ user_deleted_at: new Date().toISOString() })
     .eq("id", row.id).eq("user_id", session.userId).in("status", ["pending", "canceled"]);
 }));
 const { data, error } = await admin.from("orders")
  .select("id,product_id,amount_rmb,amount_usd,currency,status,provider,channel,created_at,paid_at")
  .eq("user_id", session.userId).is("user_deleted_at", null).order("created_at", { ascending: false }).limit(100);
 if (error) return NextResponse.json({ error: "订单暂时没有加载出来" }, { status: 500 });
 return NextResponse.json({ orders: data || [], deletionSupported: true }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(req: Request) {
 const session = await requireMiniSession(req);
 if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
 if (!(await checkRateLimit(`mini-order-delete:${session.userId}`, 60, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
 const raw = await req.text();
 if (raw.length > 8192) return NextResponse.json({ error: "请求过大" }, { status: 413 });
 let body; try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
 const unique = validOrderDeletionIds(body?.orderIds);
 if (!unique) return NextResponse.json({ error: "订单编号无效" }, { status: 400 });
 const admin = createAdminClient();
 const { data: owned, error } = await admin.from("orders").select("id").eq("user_id", session.userId).in("id", unique);
 if (error) return NextResponse.json({ error: "订单暂时无法删除" }, { status: 503 });
 if (owned?.length !== unique.length) return NextResponse.json({ error: "订单不存在或无权操作" }, { status: 404 });
 const { data: deleted, error: writeError } = await admin.from("orders").update({ user_deleted_at: new Date().toISOString() })
  .eq("user_id", session.userId).in("id", unique).select("id");
 if (writeError || deleted?.length !== unique.length) return NextResponse.json({ error: "删除未完成，请重试" }, { status: 503 });
 return NextResponse.json({ deletedIds: unique }, { headers: { "Cache-Control": "private, no-store" } });
}
