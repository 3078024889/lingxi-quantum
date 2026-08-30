import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import MiniDendriteReport from "./MiniDendriteReport";
import MiniLifeArchetypeReport from "./MiniLifeArchetypeReport";
import { hasUnlock } from "@/lib/access";
import { ensureLifeArchetype } from "@/lib/mini/life-archetype";
import { MINI_LIFE_ARCHETYPE_ALGORITHM, type DendriteResult } from "@/lib/mini/dendrite-engine";
import { buildReportEntries } from "@/lib/mini/report-entry-library";

export default async function MiniReportPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) redirect("/account");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data } = await supabase.from("mini_dendrite_assessments")
    .select("id, product_id, input, result, algorithm_version, created_at")
    .eq("id", searchParams.id).eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/account/orders");
  const archiveInput = (data.input ?? {}) as { name?: string; partnerName?: string; relationshipType?: "deep" | "business" | "other"; subjectId?: string; identityVerified?: boolean };
  if (data.product_id === "life-archetype" && (data.algorithm_version !== MINI_LIFE_ARCHETYPE_ALGORITHM || archiveInput.identityVerified !== true)) {
    const priorInput = archiveInput;
    const refreshed = await ensureLifeArchetype(user.id, priorInput.subjectId);
    if (refreshed.ready && refreshed.submissionId && refreshed.submissionId !== data.id) redirect(`/mini-report?id=${refreshed.submissionId}`);
    redirect(`/archetype?status=${encodeURIComponent(("blockedReason" in refreshed && refreshed.blockedReason) || "identity-required")}`);
  }
  if (data.product_id !== "life-archetype") {
    const [{ data: unlockRows }, { data: profile }] = await Promise.all([
      supabase.from("unlocks").select("product_id, expires_at").eq("user_id", user.id),
      supabase.from("profiles").select("manifest_until").eq("id", user.id).maybeSingle(),
    ]);
    const now = Date.now();
    const activeUnlocks = (unlockRows ?? []).filter((row) => !row.expires_at || Date.parse(row.expires_at) > now).map((row) => row.product_id);
    const manifestActive = !!profile?.manifest_until && Date.parse(profile.manifest_until) > now;
    if (!manifestActive && !hasUnlock(activeUnlocks, data.product_id)) redirect("/account/orders");
  }
  const result = data.result as DendriteResult & {
    titleZh: string; titleEn: string; insightZh: string; insightEn: string;
    nodes: Array<{ id: string; zh: string; en: string; score: number }>;
    dominant: Array<{ id: string; zh: string; en: string; score: number }>;
    chapters?: Array<{ id: string; titleZh: string; titleEn: string; bodyZh: string; bodyEn: string }>;
    evidence?: { answered: number; total: number; historyProducts: number; sourceZh: string; sourceEn: string };
    archetypeCardIndexes?: number[]; cardRolesZh?: string[]; cardRolesEn?: string[];
    artworkIndex?: number;
    fieldContributions?: Array<{ productId: string; score: number; state: "long-term" | "recent" | "active" | "tension" }>;
    structuralRelations?: Array<{ from: string; to: string; kind: "reinforce" | "bridge" | "tension"; strength: number }>;
  };
  const input = archiveInput;
  const relationshipNames = { deep: "深度关系共振", business: "合伙商业共振", other: "其他关系共振" } as const;
  const productName = data.product_id === "life-archetype"
    ? "生命原型 · 八流归一"
    : data.product_id === "relationship-resonance"
      ? relationshipNames[input.relationshipType ?? "deep"]
      : getProduct(data.product_id)?.name ?? data.product_id;
  const subjectName = input.partnerName ? `${input.name || "我"} × ${input.partnerName}` : input.name || "未命名生命档案";
  if (data.product_id === "life-archetype") return <MiniLifeArchetypeReport reportId={data.id} subjectName={subjectName} createdAt={data.created_at} result={result} />;
  // Rebuild publication prose from immutable nodes and Evidence Leaves on read.
  // Earlier archives receive the current eleven-reading language layer without
  // rewriting the user's original answers or calculation trace.
  const publicationResult = {
    ...result,
    reportEntries: buildReportEntries(data.product_id, input.relationshipType, result.nodes, result.evidenceLeaves ?? []),
  };
  return <MiniDendriteReport reportId={data.id} relationshipType={input.relationshipType} productId={data.product_id} productName={productName} subjectName={subjectName} createdAt={data.created_at} result={publicationResult} />;
}
