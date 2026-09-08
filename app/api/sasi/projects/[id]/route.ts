import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ error: "INVALID_PROJECT_ID" }, { status: 400 });

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
    jobs: (jobs ?? []).map((job) => ({ id: job.id, nodeId: job.node_id, status: job.status, quotedPoints: job.quoted_points, reservedPoints: job.reserved_points, settledPoints: job.settled_points, input: job.input, output: job.output, errorCode: job.error_code, createdAt: job.created_at, updatedAt: job.updated_at })),
    deliveries: (deliveries ?? []).map((delivery) => ({ id: delivery.id, jobId: delivery.job_id, mediaKind: delivery.media_kind, mimeType: delivery.mime_type, byteSize: delivery.byte_size, aiGenerated: delivery.ai_generated, createdAt: delivery.created_at })),
  }, { headers: { "Cache-Control": "no-store" } });
}
