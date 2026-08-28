import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import { LIFE_SIGNS } from "@/lib/qian-data";
import MiniDendriteReport from "./MiniDendriteReport";
import MiniLifeArchetypeReport from "./MiniLifeArchetypeReport";
import { hasUnlock } from "@/lib/access";
import { ensureLifeArchetype } from "@/lib/mini/life-archetype";
import { MINI_LIFE_ARCHETYPE_ALGORITHM, type DendriteResult } from "@/lib/mini/dendrite-engine";

function deterministicSelection<T>(items: T[], seed: number, count: number) {
  const pool = [...items];
  const selected: T[] = [];
  let state = (seed || 1) >>> 0;
  while (pool.length && selected.length < count) {
    state = (state * 1664525 + 1013904223) >>> 0;
    selected.push(pool.splice(state % pool.length, 1)[0]);
  }
  return selected;
}

export default async function MiniReportPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) redirect("/account");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data } = await supabase.from("mini_dendrite_assessments")
    .select("id, product_id, input, result, algorithm_version, created_at")
    .eq("id", searchParams.id).eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/account/orders");
  if (data.product_id === "life-archetype" && data.algorithm_version !== MINI_LIFE_ARCHETYPE_ALGORITHM) {
    const refreshed = await ensureLifeArchetype(user.id);
    if (refreshed.ready && refreshed.submissionId && refreshed.submissionId !== data.id) redirect(`/mini-report?id=${refreshed.submissionId}`);
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
  const input = (data.input ?? {}) as { name?: string; partnerName?: string; relationshipType?: "deep" | "business" | "other" };
  const relationshipNames = { deep: "关系共振 · 深度关系", business: "关系共振 · 合伙商业", other: "关系共振 · 其他关系" } as const;
  const productName = data.product_id === "life-archetype"
    ? "生命原型 · 八流归一"
    : data.product_id === "relationship-resonance"
      ? relationshipNames[input.relationshipType ?? "deep"]
      : getProduct(data.product_id)?.name ?? data.product_id;
  const subjectName = input.partnerName ? `${input.name || "我"} × ${input.partnerName}` : input.name || "未命名生命档案";
  const cards = data.product_id === "qian-reading" ? (result.archetypeCardIndexes ?? []).map((index) => LIFE_SIGNS[index]).filter(Boolean).map((card) => ({
    index: card.index, nameZh: card.nameZh, nameEn: card.nameEn,
  })) : [];
  const fullArtDir: Record<string, string> = {
    "life-map-report":"lifemap", "relationship-resonance":input.relationshipType === "business" ? "relationship-full/business" : input.relationshipType === "deep" ? "relationship-full/romantic" : "relationship-full/general", "resilience-report":"resilience-full",
    "romance-report":"romance-full", "wealth-report":"wealth-full", "daily-tide-report":"daily-tide-full",
    "tarot-reading":"tarot-full", "qian-reading":"qian-full",
  };
  const archetypePool = [
    "lifemap", "relationship-full/general", "relationship-full/business", "relationship-full/romantic",
    "resilience-full", "romance-full", "wealth-full", "daily-tide-full", "tarot-full", "qian-full",
  ].flatMap((dir) => Array.from({ length: 12 }, (_, index) => `/images/${dir}/page-${index}.png`));
  const artSeed = result.artworkIndex ?? result.dominant.reduce((sum, node) => sum + node.score, 0);
  const artworks = data.product_id === "life-archetype"
    ? deterministicSelection(archetypePool, artSeed, 8)
    : fullArtDir[data.product_id]
      ? deterministicSelection(Array.from({ length: 12 }, (_, index) => `/images/${fullArtDir[data.product_id]}/page-${index}.png`), artSeed, 6)
      : [];
  const fallbackRolesZh = data.product_id === "qian-reading" ? ["源流签", "灵魂签", "行者签"] : data.product_id === "life-archetype" ? ["当前原型"] : [];
  const fallbackRolesEn = data.product_id === "qian-reading" ? ["Source Sign", "Soul Sign", "Wayfarer Sign"] : data.product_id === "life-archetype" ? ["Current Archetype"] : [];
  if (data.product_id === "life-archetype") return <MiniLifeArchetypeReport subjectName={subjectName} createdAt={data.created_at} result={result} artworks={artworks} />;
  return <MiniDendriteReport productId={data.product_id} productName={productName} subjectName={subjectName} createdAt={data.created_at} result={result} cards={cards} artworks={artworks} cardRolesZh={result.cardRolesZh ?? fallbackRolesZh} cardRolesEn={result.cardRolesEn ?? fallbackRolesEn} />;
}
