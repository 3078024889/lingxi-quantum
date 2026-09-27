import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicSasiJob, type SasiJobRow } from "@/lib/sasi/production";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { data, error } = await supabase.from("sasi_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
  if (error) return NextResponse.json({ error: "JOB_LIST_FAILED" }, { status: 503 });
  return NextResponse.json({ jobs: ((data ?? []) as SasiJobRow[]).map(publicSasiJob) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  return NextResponse.json({error: "VIDEO_BYOK_REQUIRED", destination: "/sasi/drama"}, {status: 410});
}
