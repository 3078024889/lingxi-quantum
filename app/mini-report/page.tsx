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
    archetypeCardIndexes?: number[]; cardRolesZh?: string[]; cardRolesEn?: string[];
  };
  const cards = (result.archetypeCardIndexes ?? []).map((index) => LIFE_SIGNS[index]).filter(Boolean).map((card) => ({
    index: card.index, nameZh: card.nameZh, nameEn: card.nameEn,
  }));
  return <MiniDendriteReport productName={getProduct(data.product_id)?.name ?? data.product_id} createdAt={data.created_at} result={result} cards={cards} cardRolesZh={result.cardRolesZh ?? ["主原型", "隐藏原型", "行动原型"]} cardRolesEn={result.cardRolesEn ?? ["Main Archetype", "Hidden Archetype", "Action Archetype"]} />;
}
