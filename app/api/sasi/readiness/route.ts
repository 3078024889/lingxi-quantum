import { NextResponse } from "next/server";
import { sasiPublicReadiness } from "@/lib/sasi/readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { readiness: sasiPublicReadiness() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
