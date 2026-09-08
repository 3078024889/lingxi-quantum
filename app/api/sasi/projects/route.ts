import { NextResponse } from "next/server";
import { createProjectProposal } from "@/lib/sasi/project-proposal";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

function unavailable(errorCode?: string) {
  return errorCode === "42P01" || errorCode === "42883" || errorCode === "PGRST202";
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { data, error } = await supabase
    .from("sasi_projects")
    .select("id,kind,title,language,current_version,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[sasi projects] list failed", error.code);
    return NextResponse.json({ error: unavailable(error.code) ? "SASI_FOUNDATION_NOT_APPLIED" : "PROJECT_LIST_FAILED" }, { status: 503 });
  }
  const projects = (data ?? []).map((project) => ({
    id: project.id,
    kind: project.kind,
    title: project.title,
    language: project.language,
    currentVersion: project.current_version,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  }));
  return NextResponse.json({ projects }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const proposal = createProjectProposal(body);
  if (!proposal.ok) return NextResponse.json({ error: proposal.error }, { status: 400 });
  const requestId = request.headers.get("Idempotency-Key")?.trim() ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return NextResponse.json({ error: "INVALID_IDEMPOTENCY_KEY" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("create_sasi_project", {
    p_request_id: requestId,
    p_kind: proposal.kind,
    p_title: proposal.title,
    p_language: proposal.language,
    p_input: proposal.input,
    p_stages: proposal.stages,
  });

  if (error || !data) {
    console.error("[sasi projects] create failed", error?.code);
    return NextResponse.json({ error: unavailable(error?.code) ? "SASI_FOUNDATION_NOT_APPLIED" : "PROJECT_CREATE_FAILED" }, { status: 503 });
  }

  return NextResponse.json({ project: data, ...proposal.proposal }, { status: 201 });
}
