import { NextResponse } from "next/server";
import { getMiniCatalog } from "@/lib/mini/catalog";

export async function GET() {
  return NextResponse.json(
    { items: getMiniCatalog() },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } }
  );
}
