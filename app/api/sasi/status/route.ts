import { NextResponse } from "next/server";
import { sasiPublicReadiness } from "@/lib/sasi/readiness";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(sasiPublicReadiness(), { headers: { "Cache-Control": "no-store" } });
}
