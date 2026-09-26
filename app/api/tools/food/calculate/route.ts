import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime = "nodejs";

type InputItem = { food_id?: unknown; grams?: unknown };

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { items?: InputItem[] } | null;
  const raw = Array.isArray(body?.items) ? body!.items : [];
  if (!raw.length || raw.length > 50) {
    return NextResponse.json({ error: "INVALID_FOOD_ITEMS" }, { status: 400 });
  }

  const items = raw.map((item) => ({
    food_id: Number(item.food_id),
    grams: Number(item.grams),
  }));

  if (items.some((x) => !Number.isInteger(x.food_id) || x.food_id <= 0 || !Number.isFinite(x.grams) || x.grams <= 0 || x.grams > 10000)) {
    return NextResponse.json({ error: "INVALID_FOOD_ITEMS" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("calculate_food_nutrition", {
    p_items: items,
  });

  if (error) {
    return NextResponse.json({ error: "FOOD_CALCULATION_UNAVAILABLE" }, { status: 503 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
