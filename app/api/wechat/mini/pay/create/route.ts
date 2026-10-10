import { NextResponse } from "next/server";

// Retired content/subscription purchases: old clients cannot create new orders.
export async function POST() {
  return NextResponse.json({ error: "旧商品购买已停止，请更新小程序后从工具或充值页继续。", code: "MINI_PRODUCT_RETIRED" }, { status: 410 });
}
