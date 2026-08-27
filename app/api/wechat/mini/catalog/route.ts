import { NextResponse } from "next/server";
import { getMiniCatalog } from "@/lib/mini/catalog";

export async function GET() {
  return NextResponse.json(
    { items: getMiniCatalog() },
    { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" } }
  );
}
