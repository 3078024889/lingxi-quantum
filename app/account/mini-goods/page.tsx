import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MiniGoodsAdmin from "@/components/MiniGoodsAdmin";
import { moneyAdministrator } from "@/lib/money/operator-settings";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "小程序商品道具｜灵犀场", robots: { index: false, follow: false } };
export default async function Page() {
  if (!await moneyAdministrator()) notFound();
  return <><Nav/><MiniGoodsAdmin/></>;
}
