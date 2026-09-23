import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSasiOperator } from "@/lib/sasi/operator/access";
import { loadSasiProductionHealth } from "@/lib/sasi/operator/production-health";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSasiOperator(user.email)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const health = await loadSasiProductionHealth();
  return NextResponse.json(health, {
    headers: { "Cache-Control": "no-store" },
  });
}
