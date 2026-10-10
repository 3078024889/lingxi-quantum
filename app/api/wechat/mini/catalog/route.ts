import { NextResponse } from "next/server";


export async function GET() {
  return NextResponse.json(
    { items: [] },
    { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" } }
  );
}
