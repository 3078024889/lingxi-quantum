import { createHash } from "node:crypto";
import { hasUnlock } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { subjectFromAssessment, type SubjectIdentity } from "@/lib/report-subject";
import { BASE_DENDRITE_PRODUCT_IDS, calculateDendrite, calculateLifeArchetypeFromReports, getDendriteProduct, MINI_LIFE_ARCHETYPE_ALGORITHM, type DendriteResult, type RelationshipAssessmentType } from "@/lib/mini/dendrite-engine";
import { webPublicationEvidence } from "@/lib/mini/web-report-evidence";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const LIFE_ARCHETYPE_TRIBUTARIES = [
  { productId: "life-map-report", nameZh: "生命图谱", nameEn: "Life Blueprint" },
  { productId: "relationship-resonance", nameZh: "关系共振", nameEn: "Relationship Resonance", noteZh: "深度关系、合伙商业、其他关系，任一完成即计入一条支流" },
  { productId: "resilience-report", nameZh: "生命韧性", nameEn: "Life Resilience" },
  { productId: "romance-report", nameZh: "桃花磁场", nameEn: "Romance Field" },
  { productId: "wealth-report", nameZh: "财富创造地图", nameEn: "Wealth Creation Map" },
  { productId: "daily-tide-report", nameZh: "今日潮汐", nameEn: "Today's Tide" },
  { productId: "tarot-reading", nameZh: "生命镜像", nameEn: "Life Mirror" },
  { productId: "qian-reading", nameZh: "生命灵签", nameEn: "Life Oracle" },
] as const;

type AssessmentRow = { id: string; product_id: string; input: unknown; result: unknown; created_at: string; algorithm_version?: string };

type WebReportSpec = {
  productId: string;
  table: string;
  select: string;
  nameField: string;
};

const WEB_REPORT_SPECS: WebReportSpec[] = [
  { productId:"life-map-report", table:"life_map_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
  { productId:"relationship-resonance", table:"relationship_submissions", select:"id,name_a,name_b,birth_input_a,relationship_type,full_report,created_at", nameField:"name_a" },
  { productId:"resilience-report", table:"resilience_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
  { productId:"romance-report", table:"romance_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
  { productId:"wealth-report", table:"wealth_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
  { productId:"daily-tide-report", table:"daily_tide_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
  { productId:"tarot-reading", table:"tarot_reading_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
  { productId:"qian-reading", table:"qian_submissions", select:"id,name,birth_input,full_report,created_at", nameField:"name" },
];

function relationshipTypeFromWeb(value: unknown): RelationshipAssessmentType {
  return value === "business" ? "business" : value === "general" ? "other" : "deep";
}

function webRowToAssessment(spec: WebReportSpec, row: Record<string, unknown>): AssessmentRow | null {
  const rawName = row[spec.nameField];
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const report = typeof row.full_report === "string" ? row.full_report.trim() : "";
  const id = typeof row.id === "string" ? row.id : "";
  const createdAt = typeof row.created_at === "string" ? row.created_at : "";
  if (!name || !report || !id || !createdAt) return null;
  const relationshipType = spec.productId === "relationship-resonance" ? relationshipTypeFromWeb(row.relationship_type) : undefined;
  const result = webPublicationEvidence({ id, productId:spec.productId, report, relationshipType });
  if (!result) return null;
  const birth = (spec.productId === "relationship-resonance" ? row.birth_input_a : row.birth_input) as Record<string, unknown> | null;
  const birthDate = birth && [birth.year,birth.month,birth.day].every((value) => typeof value === "number")
    ? `${String(birth.year).padStart(4,"0")}-${String(birth.month).padStart(2,"0")}-${String(birth.day).padStart(2,"0")}`
    : undefined;
  return {
    id:`web:${spec.table}:${id}`,
    product_id:spec.productId,
    input:{ name, ...(birthDate?{birthDate}:{}), source:"web-publication", ...(relationshipType?{relationshipType}:{}), ...(typeof row.name_b === "string"?{partnerName:row.name_b}: {}) },
    result,
    created_at:createdAt,
    algorithm_version:"web-publication-v1",
  };
}

function hasEvidenceLeaves(row: AssessmentRow) {
  const leaves = (row.result as { evidenceLeaves?: unknown[] } | null)?.evidenceLeaves;
  return Array.isArray(leaves) && leaves.length > 0;
}

function relationshipTypeFromInput(input: unknown): RelationshipAssessmentType {
  const value = (input ?? {}) as { relationshipType?: unknown };
  return value.relationshipType === "business" ? "business" : value.relationshipType === "other" || value.relationshipType === "general" ? "other" : "deep";
}

function rehydrateEvidence(row: AssessmentRow): AssessmentRow {
  if (hasEvidenceLeaves(row)) return row;
  const input = row.input && typeof row.input === "object" && !Array.isArray(row.input)
    ? row.input as { responses?: unknown; customResponses?: unknown }
    : null;
  if (!input?.responses || typeof input.responses !== "object" || Array.isArray(input.responses)) return row;
  const product = getDendriteProduct(row.product_id, relationshipTypeFromInput(row.input));
  if (!product) return row;
  try {
    const customResponses = input.customResponses && typeof input.customResponses === "object" && !Array.isArray(input.customResponses)
      ? input.customResponses as Record<string, string>
      : {};
    const rebuilt = calculateDendrite(product, input.responses as Record<string, string>, customResponses);
    return { ...row, result: { ...rebuilt, context: (row.result as DendriteResult | null)?.context ?? rebuilt.context }, algorithm_version: rebuilt.algorithm };
  } catch {
    return row;
  }
}

function sourceDigest(rows: AssessmentRow[]) {
  return createHash("sha256").update(rows.map((row) => `${row.id}:${row.created_at}:${JSON.stringify(row.result)}`).join("|")).digest("hex");
}

function subjectGroups(userId: string, rows: AssessmentRow[]) {
  const groups = new Map<string, { subject: SubjectIdentity; rows: AssessmentRow[] }>();
  for (const row of rows) {
    const subject = subjectFromAssessment(userId, row.input);
    if (!subject) continue;
    const current = groups.get(subject.subjectId) ?? { subject, rows: [] };
    current.rows.push(row);
    groups.set(subject.subjectId, current);
  }
  return groups;
}

function progressForSubject(subject: SubjectIdentity, rows: AssessmentRow[], active: string[], manifestActive: boolean) {
  const latest = new Map<string, AssessmentRow>();
  const latestEvidenceReady = new Map<string, AssessmentRow>();
  for (const row of rows) {
    if (!latest.has(row.product_id)) latest.set(row.product_id, row);
    if (hasEvidenceLeaves(row) && !latestEvidenceReady.has(row.product_id)) latestEvidenceReady.set(row.product_id, row);
  }
  // A saved, same-subject report inside the 365-day window remains a valid
  // tributary even after its short individual reading entitlement expires.
  // Current access controls whether that report can be reopened, not whether
  // its already-recorded evidence may participate in Life Archetype.
  const completedIds = BASE_DENDRITE_PRODUCT_IDS.filter((productId) => latest.has(productId));
  const missing = BASE_DENDRITE_PRODUCT_IDS.filter((productId) => !completedIds.includes(productId));
  const evidenceMissing = completedIds.filter((productId) => !latestEvidenceReady.has(productId));
  const firstCompletedAt = [...latest.values()].reduce<string | null>((first, row) => !first || Date.parse(row.created_at) < Date.parse(first) ? row.created_at : first, null);
  const windowEndsAt = firstCompletedAt ? new Date(Date.parse(firstCompletedAt) + YEAR_MS).toISOString() : null;
  return { subject, latest, latestEvidenceReady, completedIds, missing, evidenceMissing, firstCompletedAt, windowEndsAt, tributaries: LIFE_ARCHETYPE_TRIBUTARIES.map((item) => {
    const row = latest.get(item.productId);
    const evidenceRow = latestEvidenceReady.get(item.productId);
    const accessActive = manifestActive || hasUnlock(active, item.productId);
    return { ...item, completed: !!row, assessmentCompleted: !!row, evidenceReady: !!evidenceRow, needsRetest: !!row && !evidenceRow, accessActive, completedAt: (evidenceRow ?? row)?.created_at ?? null, reportId: (evidenceRow ?? row)?.id ?? null };
  }) };
}

async function loadSubjectState(userId: string) {
  const admin = createAdminClient();
  const now = Date.now();
  const cutoff = new Date(now - YEAR_MS).toISOString();
  const [{ data: unlocks }, { data: profile }, { data: rows }, { data: archetypes }, webResults] = await Promise.all([
    admin.from("unlocks").select("product_id, expires_at").eq("user_id", userId),
    admin.from("profiles").select("manifest_until").eq("id", userId).maybeSingle(),
    admin.from("mini_dendrite_assessments").select("id, product_id, input, result, created_at, algorithm_version").eq("user_id", userId).in("product_id", BASE_DENDRITE_PRODUCT_IDS as unknown as string[]).gte("created_at", cutoff).order("created_at", { ascending: false }).limit(240),
    admin.from("mini_dendrite_assessments").select("id, input, created_at, algorithm_version").eq("user_id", userId).eq("product_id", "life-archetype").order("created_at", { ascending: false }).limit(32),
    Promise.all(WEB_REPORT_SPECS.map(async (spec) => ({
      spec,
      response: await admin.from(spec.table).select(spec.select).eq("user_id",userId).gte("created_at",cutoff).order("created_at",{ascending:false}).limit(48),
    }))),
  ]);
  const active = (unlocks ?? []).filter((row) => !row.expires_at || Date.parse(row.expires_at) > now).map((row) => row.product_id);
  const manifestActive = !!profile?.manifest_until && Date.parse(profile.manifest_until) > now;
  const webRows = webResults.flatMap(({ spec, response }) => {
    if (response.error) {
      console.error(`[life-archetype] failed to read ${spec.table}`, response.error.code);
      return [] as AssessmentRow[];
    }
    return ((response.data ?? []) as unknown as Record<string,unknown>[]).map((row) => webRowToAssessment(spec,row)).filter((row):row is AssessmentRow=>!!row);
  });
  const hydratedRows = [...((rows ?? []) as AssessmentRow[]).map(rehydrateEvidence), ...webRows]
    .sort((left,right)=>Date.parse(right.created_at)-Date.parse(left.created_at));
  return { admin, active, manifestActive, groups: subjectGroups(userId, hydratedRows), archetypes: (archetypes ?? []) as AssessmentRow[] };
}

export async function listLifeArchetypeSubjects(userId: string) {
  const state = await loadSubjectState(userId);
  return [...state.groups.values()].map(({ subject, rows }) => {
    const progress = progressForSubject(subject, rows, state.active, state.manifestActive);
    const archive = state.archetypes.find((row) => (row.input as { subjectId?: string } | null)?.subjectId === subject.subjectId);
    return { subject, completed: progress.completedIds.length, missing: progress.missing, tributaries: progress.tributaries, firstCompletedAt: progress.firstCompletedAt, windowEndsAt: progress.windowEndsAt, archivedSubmissionId: archive?.id ?? null };
  }).sort((left, right) => right.completed - left.completed || left.subject.displayName.localeCompare(right.subject.displayName, "zh-CN"));
}

/** Generate only from eight valid reports belonging to the same primary subject. */
export async function ensureLifeArchetype(userId: string, requestedSubjectId?: string) {
  const state = await loadSubjectState(userId);
  const candidates = [...state.groups.values()].map(({ subject, rows }) => ({ subject, rows, progress: progressForSubject(subject, rows, state.active, state.manifestActive) }));
  const completedCandidates = candidates.filter((item) => item.progress.completedIds.length === BASE_DENDRITE_PRODUCT_IDS.length);
  const selected = requestedSubjectId
    ? candidates.find((item) => item.subject.subjectId === requestedSubjectId)
    : completedCandidates.length === 1
      ? completedCandidates[0]
      : completedCandidates.length > 1
        ? undefined
        : candidates.sort((a, b) => b.progress.completedIds.length - a.progress.completedIds.length)[0];
  if (!requestedSubjectId && completedCandidates.length > 1) return {
    ready: false, subjectSelectionRequired: true, completed: 8, missing: [] as string[],
    tributaries: LIFE_ARCHETYPE_TRIBUTARIES.map((item) => ({ ...item, completed: false })),
  };
  if (!selected) return { ready: false, completed: 0, missing: BASE_DENDRITE_PRODUCT_IDS.slice(), tributaries: LIFE_ARCHETYPE_TRIBUTARIES.map((item) => ({ ...item, completed: false })) };
  const { subject, rows, progress } = selected;
  const matchingArchive = state.archetypes.find((row) => (row.input as { subjectId?: string } | null)?.subjectId === subject.subjectId);
  if (progress.missing.length) return { ready: false, subject, completed: progress.completedIds.length, missing: progress.missing, firstCompletedAt: progress.firstCompletedAt, windowEndsAt: progress.windowEndsAt, tributaries: progress.tributaries, archivedSubmissionId: matchingArchive?.id ?? null };

  const relationshipRows = rows.filter((row) => row.product_id === "relationship-resonance" && hasEvidenceLeaves(row));
  const relationshipByType = new Map<string, AssessmentRow>();
  for (const row of relationshipRows) {
    const relationshipType = ((row.input ?? {}) as { relationshipType?: RelationshipAssessmentType }).relationshipType ?? "deep";
    if (!relationshipByType.has(relationshipType)) relationshipByType.set(relationshipType, row);
  }
  if (progress.evidenceMissing.length) return {
    ready:false, blockedReason:"legacy-evidence-missing", blockedProductIds:progress.evidenceMissing,
    subject, completed:8, missing:[] as string[], firstCompletedAt:progress.firstCompletedAt,
    windowEndsAt:progress.windowEndsAt, tributaries:progress.tributaries,
  };
  const sourceRows = BASE_DENDRITE_PRODUCT_IDS.map((productId) => progress.latestEvidenceReady.get(productId)!);
  const enrichedSourceRows = [...sourceRows.filter((row) => row.product_id !== "relationship-resonance"), ...relationshipByType.values()];
  const sourceHash = sourceDigest(enrichedSourceRows);
  const archiveInput = matchingArchive?.input as { sourceHash?: string; identityVerified?: boolean } | null;
  if (matchingArchive && matchingArchive.algorithm_version === MINI_LIFE_ARCHETYPE_ALGORITHM && archiveInput?.sourceHash === sourceHash && archiveInput.identityVerified === true) return { ready: true, generated: false, subject, submissionId: matchingArchive.id, completed: 8, missing: [] as string[], firstCompletedAt: progress.firstCompletedAt, windowEndsAt: progress.windowEndsAt, tributaries: progress.tributaries };

  const identityVerified = enrichedSourceRows.every((row) => subjectFromAssessment(userId, row.input)?.subjectId === subject.subjectId);
  let result: DendriteResult;
  try {
    result = calculateLifeArchetypeFromReports(enrichedSourceRows.map((row) => ({ productId: row.product_id, result: row.result as DendriteResult, completedAt: row.created_at, relationshipType: ((row.input ?? {}) as { relationshipType?: RelationshipAssessmentType }).relationshipType })), { identityVerified });
  } catch (error) {
    const message = error instanceof Error ? error.message : "life archetype evidence audit failed";
    return { ready:false, blockedReason:message.includes("identity")?"identity-mismatch":message.includes("evidence leaves")?"legacy-evidence-missing":message.includes("365")?"outside-365-days":"coverage-incomplete", subject, completed:8, missing:[] as string[], firstCompletedAt:progress.firstCompletedAt, windowEndsAt:progress.windowEndsAt, tributaries:progress.tributaries };
  }
  result.context = { subjectName: subject.displayName, subjectId: subject.subjectId };
  const { data, error } = await state.admin.from("mini_dendrite_assessments").insert({
    user_id: userId, product_id: "life-archetype",
    input: { name:subject.displayName, subjectId: subject.subjectId, subjectIdentity: subject, normalizedSubjectName:subject.normalizedName, identityVerified:true, engineVersion:"v6", sourceAssessmentIds: enrichedSourceRows.map((row) => row.id), sourceReportHashes: enrichedSourceRows.map((row) => sourceDigest([row])), sourceHash, sourceWindowDays: 365, firstCompletedAt: progress.firstCompletedAt, windowEndsAt: progress.windowEndsAt, generatedAt: new Date().toISOString(), relationshipEvidenceCount: relationshipByType.size, coverageAudit:result.archetypeCoverage },
    result, algorithm_version: result.algorithm,
  }).select("id").single();
  if (error || !data) throw new Error(`life archetype insert failed: ${error?.code ?? "unknown"}`);
  return { ready: true, generated: true, subject, submissionId: data.id, completed: 8, missing: [] as string[], firstCompletedAt: progress.firstCompletedAt, windowEndsAt: progress.windowEndsAt, tributaries: progress.tributaries };
}
