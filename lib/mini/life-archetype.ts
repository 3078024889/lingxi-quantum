import { hasUnlock } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { BASE_DENDRITE_PRODUCT_IDS, calculateLifeArchetypeFromReports, type DendriteResult } from "@/lib/mini/dendrite-engine";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Create FIELD 09 once all eight paid/authorized tributaries are active. */
export async function ensureLifeArchetype(userId: string) {
  const admin = createAdminClient();
  const now = Date.now();
  const [{ data: unlocks }, { data: profile }] = await Promise.all([
    admin.from("unlocks").select("product_id, expires_at").eq("user_id", userId),
    admin.from("profiles").select("manifest_until").eq("id", userId).maybeSingle(),
  ]);
  const active = (unlocks ?? []).filter((row) => !row.expires_at || Date.parse(row.expires_at) > now).map((row) => row.product_id);
  const manifestActive = !!profile?.manifest_until && Date.parse(profile.manifest_until) > now;
  const missing = BASE_DENDRITE_PRODUCT_IDS.filter((productId) => !manifestActive && !hasUnlock(active, productId));
  if (missing.length) return { ready: false, missing, completed: 8 - missing.length };

  const cutoff = new Date(now - YEAR_MS).toISOString();
  const { data: rows } = await admin.from("mini_dendrite_assessments")
    .select("id, product_id, result, created_at")
    .eq("user_id", userId).in("product_id", BASE_DENDRITE_PRODUCT_IDS as unknown as string[])
    .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(96);
  const latest = new Map<string, NonNullable<typeof rows>[number]>();
  for (const row of rows ?? []) if (!latest.has(row.product_id)) latest.set(row.product_id, row);
  const missingReports = BASE_DENDRITE_PRODUCT_IDS.filter((productId) => !latest.has(productId));
  if (missingReports.length) return { ready: false, missing: missingReports, completed: 8 - missingReports.length };

  const sourceRows = BASE_DENDRITE_PRODUCT_IDS.map((productId) => latest.get(productId)!);
  const newestSource = sourceRows.reduce((max, row) => Math.max(max, Date.parse(row.created_at)), 0);
  const { data: existing } = await admin.from("mini_dendrite_assessments").select("id, created_at")
    .eq("user_id", userId).eq("product_id", "life-archetype").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing && Date.parse(existing.created_at) >= newestSource) return { ready: true, generated: false, submissionId: existing.id, completed: 8, missing: [] as string[] };

  const result = calculateLifeArchetypeFromReports(sourceRows.map((row) => ({ productId: row.product_id, result: row.result as DendriteResult })));
  const { data, error } = await admin.from("mini_dendrite_assessments").insert({
    user_id: userId, product_id: "life-archetype",
    input: { sourceAssessmentIds: sourceRows.map((row) => row.id), sourceWindowDays: 365, generatedAt: new Date().toISOString() },
    result, algorithm_version: result.algorithm,
  }).select("id").single();
  if (error || !data) throw new Error(`life archetype insert failed: ${error?.code ?? "unknown"}`);
  return { ready: true, generated: true, submissionId: data.id, completed: 8, missing: [] as string[] };
}
