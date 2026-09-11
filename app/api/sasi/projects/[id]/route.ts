import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROJECT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function authenticatedOwner(projectId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 }) } as const;
  if (!PROJECT_ID_PATTERN.test(projectId)) return { error: NextResponse.json({ error: "INVALID_PROJECT_ID" }, { status: 400 }) } as const;
  const { data: project, error } = await supabase
    .from("sasi_projects")
    .select("id,user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return { error: NextResponse.json({ error: "PROJECT_LOOKUP_FAILED" }, { status: 503 }) } as const;
  if (!project) return { error: NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 }) } as const;
  return { user, supabase } as const;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!PROJECT_ID_PATTERN.test(params.id)) return NextResponse.json({ error: "INVALID_PROJECT_ID" }, { status: 400 });

  const [{ data: project }, { data: nodes, error: nodeError }, { data: assets, error: assetError }, { data: jobs, error: jobError }, { data: deliveries, error: deliveryError }] = await Promise.all([
    supabase.from("sasi_projects").select("id,kind,title,language,current_version,created_at,updated_at").eq("id", params.id).eq("user_id", user.id).maybeSingle(),
    supabase.from("sasi_nodes").select("id,node_type,version,status,input,output,created_at,updated_at").eq("project_id", params.id).eq("user_id", user.id).order("created_at"),
    supabase.from("sasi_assets").select("id,original_name,media_kind,declared_size,verified_size,status,rejection_reason,created_at,updated_at").eq("project_id", params.id).eq("user_id", user.id).order("created_at"),
    supabase.from("sasi_jobs").select("id,node_id,status,quoted_points,reserved_points,settled_points,input,output,error_code,created_at,updated_at").eq("project_id", params.id).eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("sasi_deliveries").select("id,job_id,media_kind,mime_type,byte_size,ai_generated,created_at").eq("project_id", params.id).eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  if (!project) return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });
  if (nodeError || assetError || jobError || deliveryError) return NextResponse.json({ error: "PROJECT_GRAPH_READ_FAILED" }, { status: 503 });
  const nodeIds = (nodes ?? []).map((node) => node.id);
  const { data: dependencies, error: dependencyError } = nodeIds.length
    ? await supabase
        .from("sasi_node_dependencies")
        .select("upstream_node_id,downstream_node_id")
        .in("upstream_node_id", nodeIds)
    : { data: [], error: null };
  if (dependencyError) return NextResponse.json({ error: "PROJECT_GRAPH_READ_FAILED" }, { status: 503 });

  return NextResponse.json({
    project: { id: project.id, kind: project.kind, title: project.title, language: project.language, currentVersion: project.current_version, createdAt: project.created_at, updatedAt: project.updated_at },
    nodes: (nodes ?? []).map((node) => ({ id: node.id, type: node.node_type, version: node.version, status: node.status, input: node.input, output: node.output, createdAt: node.created_at, updatedAt: node.updated_at })),
    dependencies: (dependencies ?? []).map((edge) => ({ upstreamNodeId: edge.upstream_node_id, downstreamNodeId: edge.downstream_node_id })),
    assets: (assets ?? []).map((asset) => ({ id: asset.id, name: asset.original_name, kind: asset.media_kind, declaredSize: asset.declared_size, verifiedSize: asset.verified_size, status: asset.status, rejectionReason: asset.rejection_reason, createdAt: asset.created_at, updatedAt: asset.updated_at })),
    jobs: (jobs ?? []).map((job) => ({ id: job.id, nodeId: job.node_id, status: job.status, quotedAmountFen: job.quoted_points, reservedAmountFen: job.reserved_points, settledAmountFen: job.settled_points, input: job.input, output: job.output, errorCode: job.error_code, createdAt: job.created_at, updatedAt: job.updated_at })),
    deliveries: (deliveries ?? []).map((delivery) => ({ id: delivery.id, jobId: delivery.job_id, mediaKind: delivery.media_kind, mimeType: delivery.mime_type, byteSize: delivery.byte_size, aiGenerated: delivery.ai_generated, createdAt: delivery.created_at })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  const owner = await authenticatedOwner(params.id);
  if ("error" in owner) return owner.error;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "SERVER_WRITE_NOT_CONFIGURED" }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim().replace(/\s+/g, " ").slice(0, 72) : "";
  if (!title) return NextResponse.json({ error: "INVALID_PROJECT_TITLE" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("sasi_projects")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", owner.user.id)
    .select("id,kind,title,language,current_version,created_at,updated_at")
    .single();
  if (error) return NextResponse.json({ error: "PROJECT_UPDATE_FAILED" }, { status: 503 });
  return NextResponse.json({ project: { id: data.id, kind: data.kind, title: data.title, language: data.language, currentVersion: data.current_version, createdAt: data.created_at, updatedAt: data.updated_at } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  const owner = await authenticatedOwner(params.id);
  if ("error" in owner) return owner.error;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "SERVER_WRITE_NOT_CONFIGURED" }, { status: 503 });

  const admin = createAdminClient();
  const { data: activeJobs, error: jobError } = await admin
    .from("sasi_jobs")
    .select("id")
    .eq("project_id", params.id)
    .eq("user_id", owner.user.id)
    .in("status", ["confirmed", "queued", "running"])
    .limit(1);
  if (jobError) return NextResponse.json({ error: "PROJECT_DELETE_CHECK_FAILED" }, { status: 503 });
  if (activeJobs?.length) return NextResponse.json({ error: "PROJECT_HAS_ACTIVE_JOB" }, { status: 409 });

  const [{ data: assets }, { data: deliveries }] = await Promise.all([
    admin.from("sasi_assets").select("bucket_id,object_path").eq("project_id", params.id).eq("user_id", owner.user.id),
    admin.from("sasi_deliveries").select("bucket_id,object_path").eq("project_id", params.id).eq("user_id", owner.user.id),
  ]);
  const { error: deleteError } = await admin.from("sasi_projects").delete().eq("id", params.id).eq("user_id", owner.user.id);
  if (deleteError) return NextResponse.json({ error: "PROJECT_DELETE_FAILED" }, { status: 503 });

  const storageGroups = new Map<string, string[]>();
  for (const item of [...(assets ?? []), ...(deliveries ?? [])]) {
    const paths = storageGroups.get(item.bucket_id) ?? [];
    paths.push(item.object_path);
    storageGroups.set(item.bucket_id, paths);
  }
  const cleanupResults = await Promise.all([...storageGroups].map(([bucket, paths]) => admin.storage.from(bucket).remove(paths)));
  const cleanupPending = cleanupResults.some((result) => Boolean(result.error));
  return NextResponse.json({ deleted: true, cleanupPending });
}
