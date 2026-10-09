import { NextResponse } from "next/server";
import { miniVirtualToolsEnabled } from "@/lib/mini/virtual-goods";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ enabled: miniVirtualToolsEnabled() }, { headers: { "Cache-Control": "no-store" } });
}
