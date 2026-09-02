import { NextResponse } from "next/server";
import { alipayEnabled } from "@/lib/alipay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { available: alipayEnabled() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
