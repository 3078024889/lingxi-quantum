import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import { LIFE_SIGNS } from "@/lib/qian-data";
import MiniDendriteReport from "./MiniDendriteReport";

export default async function MiniReportPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) redirect("/account");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data } = await supabase.from("mini_dendrite_assessments")
    .select("id, product_id, input, result, algorithm_version, created_at")
    .eq("id", searchParams.id).eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/account/orders");
  const result = data.result as {
    titleZh: string; titleEn: string; insightZh: string; insightEn: string;
    nodes: Array<{ id: string; zh: string; en: string; score: number }>;
    dominant: Array<{ id: string; zh: string; en: string; score: number }>;
    chapters?: Array<{ id: string; titleZh: string; titleEn: string; bodyZh: string; bodyEn: string }>;
    evidence?: { answered: number; total: number; historyProducts: number; sourceZh: string; sourceEn: string };
    archetypeCardIndexes?: number[]; cardRolesZh?: string[]; cardRolesEn?: string[];
  };
  const cards = (result.archetypeCardIndexes ?? []).map((index) => LIFE_SIGNS[index]).filter(Boolean).map((card) => ({
    index: card.index, nameZh: card.nameZh, nameEn: card.nameEn,
  }));
  const fallbackRolesZh = data.product_id === "qian-reading" ? ["源流签", "灵魂签", "行者签"] : data.product_id === "life-archetype" ? ["当前原型"] : [];
  const fallbackRolesEn = data.product_id === "qian-reading" ? ["Source Sign", "Soul Sign", "Wayfarer Sign"] : data.product_id === "life-archetype" ? ["Current Archetype"] : [];
  return <MiniDendriteReport productName={getProduct(data.product_id)?.name ?? data.product_id} createdAt={data.created_at} result={result} cards={cards} cardRolesZh={result.cardRolesZh ?? fallbackRolesZh} cardRolesEn={result.cardRolesEn ?? fallbackRolesEn} />;
}
