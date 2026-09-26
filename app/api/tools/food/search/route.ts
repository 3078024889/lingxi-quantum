import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (!q || q.length > 80) {
    return NextResponse.json({ items: [] });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_food_nutrition", {
    p_query: q,
    p_limit: 12,
  });

  if (error) {
    return NextResponse.json({ error: "FOOD_SEARCH_UNAVAILABLE" }, { status: 503 });
  }

  return NextResponse.json(
    { items: data || [] },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }
  );
}
