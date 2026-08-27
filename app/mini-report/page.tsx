import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import { LIFE_SIGNS } from "@/lib/qian-data";
import MiniDendriteReport from "./MiniDendriteReport";
import { hasUnlock } from "@/lib/access";

export default async function MiniReportPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) redirect("/account");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data } = await supabase.from("mini_dendrite_assessments")
    .select("id, product_id, input, result, algorithm_version, created_at")
    .eq("id", searchParams.id).eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/account/orders");
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
  const result = data.result as {
    titleZh: string; titleEn: string; insightZh: string; insightEn: string;
    nodes: Array<{ id: string; zh: string; en: string; score: number }>;
    dominant: Array<{ id: string; zh: string; en: string; score: number }>;
    chapters?: Array<{ id: string; titleZh: string; titleEn: string; bodyZh: string; bodyEn: string }>;
    evidence?: { answered: number; total: number; historyProducts: number; sourceZh: string; sourceEn: string };
    archetypeCardIndexes?: number[]; cardRolesZh?: string[]; cardRolesEn?: string[];
    artworkIndex?: number;
  };
  const cards = data.product_id === "qian-reading" ? (result.archetypeCardIndexes ?? []).map((index) => LIFE_SIGNS[index]).filter(Boolean).map((card) => ({
    index: card.index, nameZh: card.nameZh, nameEn: card.nameEn,
  })) : [];
  const fullArtDir: Record<string, string> = {
    "life-map-report":"lifemap", "relationship-resonance":"relationship-full/general", "resilience-report":"resilience-full",
    "romance-report":"romance-full", "wealth-report":"wealth-full", "daily-tide-report":"daily-tide-full",
    "tarot-reading":"tarot-full", "qian-reading":"qian-full",
  };
  const archetypePool = [
    "lifemap", "relationship-full/general", "relationship-full/business", "relationship-full/romantic",
    "resilience-full", "romance-full", "wealth-full", "daily-tide-full", "tarot-full", "qian-full",
  ].flatMap((dir) => Array.from({ length: 12 }, (_, index) => `/images/${dir}/page-${index}.png`));
  const artSeed = result.artworkIndex ?? result.dominant.reduce((sum, node) => sum + node.score, 0);
  const artworks = data.product_id === "life-archetype"
    ? [archetypePool[artSeed % archetypePool.length], archetypePool[(artSeed + 37) % archetypePool.length]]
    : fullArtDir[data.product_id]
      ? [0, 5, 9].map((offset) => `/images/${fullArtDir[data.product_id]}/page-${(artSeed + offset) % 12}.png`)
      : [];
  const fallbackRolesZh = data.product_id === "qian-reading" ? ["源流签", "灵魂签", "行者签"] : data.product_id === "life-archetype" ? ["当前原型"] : [];
  const fallbackRolesEn = data.product_id === "qian-reading" ? ["Source Sign", "Soul Sign", "Wayfarer Sign"] : data.product_id === "life-archetype" ? ["Current Archetype"] : [];
  return <MiniDendriteReport productId={data.product_id} productName={getProduct(data.product_id)?.name ?? data.product_id} createdAt={data.created_at} result={result} cards={cards} artworks={artworks} cardRolesZh={result.cardRolesZh ?? fallbackRolesZh} cardRolesEn={result.cardRolesEn ?? fallbackRolesEn} />;
}
