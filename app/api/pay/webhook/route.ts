import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";

// NowPayments 到账回调（IPN）。用 IPN Secret 校验签名，防伪造。
function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, k) => {
        acc[k] = sortObject(obj[k]);
        return acc;
      }, {});
  }
  return obj;
}

export async function POST(req: Request) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  const signature = req.headers.get("x-nowpayments-sig");
  const raw = await req.text();

  if (!secret || !signature) {
    return NextResponse.json({ error: "未配置或缺少签名" }, { status: 400 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "无效负载" }, { status: 400 });
  }
  const sorted = JSON.stringify(sortObject(body));
  const hmac = crypto.createHmac("sha512", secret).update(sorted).digest("hex");
  if (hmac !== signature) {
    return NextResponse.json({ error: "签名校验失败" }, { status: 401 });
  }

  const status = body.payment_status;
  const orderId = body.order_id;
  if (!orderId) return NextResponse.json({ ok: true });

  const admin = createAdminClient();

  if (status === "finished" || status === "confirmed") {
    const { data: order } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (order && order.status !== "paid") {
      const product = getProduct(order.product_id);
      const now = new Date();

      if (order.product_type === "permanent") {
        // 永久解锁：写入 unlocks 表
        await admin.from("unlocks").upsert({
          user_id: order.user_id,
          product_id: order.product_id,
        });
        // 若买的是四项合集，把单项也一并解锁
        if (order.product_id === "bundle") {
          const items = ["breath", "intuition", "heart-reset", "ascending-heart"];
          for (const pid of items) {
            await admin
              .from("unlocks")
              .upsert({ user_id: order.user_id, product_id: pid });
          }
        }
      } else {
        // 订阅：延长 manifest_until
        const days = product?.days ?? 30;
        const { data: profile } = await admin
          .from("profiles")
          .select("manifest_until")
          .eq("id", order.user_id)
          .single();
        const current =
          profile?.manifest_until && new Date(profile.manifest_until) > now
            ? new Date(profile.manifest_until)
            : now;
        const until = new Date(current.getTime() + days * 86400000);
        await admin
          .from("profiles")
          .update({ manifest_until: until.toISOString() })
          .eq("id", order.user_id);
      }

      await admin
        .from("orders")
        .update({ status: "paid", paid_at: now.toISOString() })
        .eq("id", orderId);
    }
  } else if (status === "failed" || status === "expired") {
    await admin.from("orders").update({ status: "failed" }).eq("id", orderId);
  }

  return NextResponse.json({ ok: true });
}
