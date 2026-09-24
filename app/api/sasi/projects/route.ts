import { NextRequest, NextResponse } from "next/server";
import { createProjectProposal } from "@/lib/sasi/project-proposal";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

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

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const contentLength=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>256*1024){
    return NextResponse.json({error:"PROJECT_REQUEST_TOO_LARGE"},{status:413});
  }

  const admin=createAdminClient();

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

  const { data, error } = await admin.rpc("create_sasi_project_service", {
    p_user_id: user.id,
    p_request_id: requestId,
    p_kind: proposal.kind,
    p_title: proposal.title,
    p_language: proposal.language,
    p_input: proposal.input,
    p_stages: proposal.stages,
  });
  const result=data as {ok?:boolean;error?:string;created?:boolean}|null;

  if (error || !result?.ok) {
    const code=result?.error||"PROJECT_CREATE_FAILED";
    console.error("[sasi projects] create failed",{dbCode:error?.code||null,resultCode:code});
    const status=code==="project_rate_limited"?429:
      code==="project_input_too_large"?413:
      code==="idempotency_conflict"?409:
      unavailable(error?.code)?503:400;
    return NextResponse.json({error:unavailable(error?.code)?"SASI_FOUNDATION_NOT_APPLIED":code},{status});
  }

  return NextResponse.json(
    { project: result, ...proposal.proposal },
    { status: result.created===false ? 200 : 201 }
  );
}
