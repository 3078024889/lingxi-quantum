import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { pollSasiVideo, providerAssetAccess, submitSasiVideo, type SasiVideoSelection } from "@/lib/sasi/provider";
import { createSasiAigcMetadata, embedSasiAigcMetadata, readSasiAigcMetadata } from "@/lib/sasi/aigc-label";

export type SasiJobRow = {
  id: string;
  user_id: string;
  project_id: string;
  node_id: string | null;
  provider: string;
  model: string;
  provider_job_id: string | null;
  status: string;
  quoted_points: number;
  reserved_points: number;
  settled_points: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error_code: string | null;
  created_at: string;
  updated_at: string;
};

const MAX_DELIVERY_BYTES = 100 * 1024 * 1024;

async function downloadTrustedVideo(provider: string, initialUrl: string) {
  let current = new URL(initialUrl);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const access = providerAssetAccess(provider, current.toString());
    if (!access.trusted) throw new Error("UNTRUSTED_DELIVERY_HOST");
    const response = await fetch(current, { headers: access.headers, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(60_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("INVALID_DELIVERY_REDIRECT");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`DELIVERY_HTTP_${response.status}`);
    const declaredSize = Number(response.headers.get("content-length") ?? 0);
    if (declaredSize > MAX_DELIVERY_BYTES) throw new Error("DELIVERY_TOO_LARGE");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength < 12 || bytes.byteLength > MAX_DELIVERY_BYTES) throw new Error("INVALID_DELIVERY_SIZE");
    const mp4 = String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
    if (!mp4) throw new Error("AIGC_LABEL_REQUIRES_MP4");
    return { bytes, mimeType: "video/mp4", extension: "mp4" };
  }
  throw new Error("TOO_MANY_DELIVERY_REDIRECTS");
}

export async function dispatchSasiJob(admin: SupabaseClient, job: SasiJobRow) {
  if (job.status !== "confirmed") return job;
  try {
    const submitted = await submitSasiVideo({
      prompt: String(job.input.prompt ?? "").slice(0, 4000),
      duration: Number(job.input.duration),
      aspectRatio: job.input.aspectRatio === "9:16" || job.input.aspectRatio === "1:1" ? job.input.aspectRatio : "16:9",
      quality: job.input.quality === "balanced" || job.input.quality === "cinema" ? job.input.quality : "fast",
      selection: { provider: job.provider, model: job.model, quality: job.input.quality } as SasiVideoSelection,
    });
    const { data, error } = await admin.from("sasi_jobs").update({
      status: "queued",
      provider_job_id: submitted.providerJobId,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", job.id).eq("status", "confirmed").select().single();
    if (error || !data) throw new Error("JOB_DISPATCH_STATE_FAILED");
    return data as SasiJobRow;
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 120) : "PROVIDER_SUBMIT_FAILED";
    await admin.rpc("release_sasi_job", { p_job_id: job.id, p_status: "failed", p_error_code: code });
    throw error;
  }
}

export async function refreshSasiJob(admin: SupabaseClient, job: SasiJobRow) {
  if (!new Set(["queued", "running"]).has(job.status) || !job.provider_job_id) return job;
  const provider = await pollSasiVideo(job.provider, job.model, job.provider_job_id);
  if (provider.state === "queued" || provider.state === "running") {
    if (job.status !== provider.state) {
      const { data } = await admin.from("sasi_jobs").update({ status: provider.state, updated_at: new Date().toISOString() })
        .eq("id", job.id).in("status", ["queued", "running"]).select().single();
      return (data ?? job) as SasiJobRow;
    }
    return job;
  }
  if (provider.state === "failed") {
    await admin.rpc("release_sasi_job", { p_job_id: job.id, p_status: "failed", p_error_code: provider.errorCode });
    const { data } = await admin.from("sasi_jobs").select("*").eq("id", job.id).single();
    return (data ?? job) as SasiJobRow;
  }

  const { data: existing } = await admin.from("sasi_deliveries").select("*").eq("job_id", job.id).maybeSingle();
  if (!existing) {
    const downloaded = await downloadTrustedVideo(job.provider, provider.videoUrl);
    const aigcMetadata = createSasiAigcMetadata(job.id);
    const labeledBytes = embedSasiAigcMetadata(downloaded.bytes, aigcMetadata);
    const verifiedLabel = readSasiAigcMetadata(labeledBytes);
    if (!verifiedLabel || verifiedLabel.AIGC.ProduceID !== job.id || verifiedLabel.AIGC.Label !== "1") throw new Error("AIGC_METADATA_VERIFICATION_FAILED");
    const media = { ...downloaded, bytes: labeledBytes, sha256: createHash("sha256").update(labeledBytes).digest("hex") };
    const objectPath = `${job.user_id}/${job.project_id}/AI-generated-${job.id}.${media.extension}`;
    const uploaded = await admin.storage.from("sasi-deliveries").upload(objectPath, media.bytes, {
      contentType: media.mimeType,
      upsert: false,
      cacheControl: "0",
    });
    if (uploaded.error && !String(uploaded.error.message).toLowerCase().includes("already exists")) throw new Error("DELIVERY_STORAGE_FAILED");
    const inserted = await admin.from("sasi_deliveries").upsert({
      user_id: job.user_id,
      project_id: job.project_id,
      job_id: job.id,
      bucket_id: "sasi-deliveries",
      object_path: objectPath,
      media_kind: "video",
      mime_type: media.mimeType,
      byte_size: media.bytes.byteLength,
      sha256: media.sha256,
      ai_generated: true,
      label_metadata: { ...aigcMetadata, visibleDisclosure: "delivery_interface", cleanVisualExportRequested: true },
    }, { onConflict: "job_id" });
    if (inserted.error) throw new Error("DELIVERY_RECORD_FAILED");
  }
  const output = {
    deliveryReady: true,
    providerResultReceived: true,
    aiGenerated: true,
    supplierCost: provider.providerCostMinor == null ? null : {
      minor: provider.providerCostMinor,
      currency: provider.providerCostCurrency,
      source: job.provider === "xai" ? "provider-reported" : "provider-estimate",
    },
  };
  const settled = await admin.rpc("settle_sasi_job", {
    p_job_id: job.id,
    p_actual_points: job.quoted_points,
    p_provider_cost_minor: provider.providerCostMinor,
    p_output: output,
  });
  if (settled.error || !(settled.data as { ok?: boolean } | null)?.ok) throw new Error("JOB_SETTLEMENT_FAILED");
  const { data } = await admin.from("sasi_jobs").select("*").eq("id", job.id).single();
  return (data ?? { ...job, status: "succeeded", output }) as SasiJobRow;
}

export function publicSasiJob(job: SasiJobRow) {
  return {
    id: job.id,
    projectId: job.project_id,
    nodeId: job.node_id,
    status: job.status,
    canCancel: job.status === "confirmed" && !job.provider_job_id,
    quotedAmountFen: job.quoted_points,
    reservedAmountFen: job.reserved_points,
    settledAmountFen: job.settled_points,
    errorCode: job.error_code,
    input: job.input,
    output: job.output,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}
