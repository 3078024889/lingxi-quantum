import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const admin = createAdminClient();
  const { data: delivery } = await admin.from("sasi_deliveries")
    .select("id,bucket_id,object_path,ai_generated,label_metadata")
    .eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!delivery) return NextResponse.json({ error: "DELIVERY_NOT_FOUND" }, { status: 404 });
  const signed = await admin.storage.from(delivery.bucket_id).createSignedUrl(delivery.object_path, 300, { download: true });
  if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "DELIVERY_LINK_FAILED" }, { status: 503 });
  return NextResponse.json({
    url: signed.data.signedUrl,
    expiresIn: 300,
    aiGenerated: delivery.ai_generated,
    label: delivery.label_metadata,
  }, { headers: { "Cache-Control": "no-store" } });
}
