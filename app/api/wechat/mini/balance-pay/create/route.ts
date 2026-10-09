import { NextResponse } from "next/server";
import { MINI_PAYMENT_PAUSED } from "@/lib/mini/payment-availability";

export const runtime = "nodejs";
export const maxDuration = 15;

// Keep the existing endpoint stable for previously released miniapp versions.
// No order or payment-provider request is created while review is pending.
export async function POST() {
  return NextResponse.json(MINI_PAYMENT_PAUSED, { status: 503 });
}
