import { NextResponse } from "next/server";
import { sasiReadiness } from "@/lib/sasi/readiness";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(sasiReadiness(), { headers: { "Cache-Control": "no-store" } });
}
