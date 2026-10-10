import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MiniGoodsAdmin from "@/components/MiniGoodsAdmin";
export const metadata: Metadata = { title: "小程序商品道具｜灵犀场", robots: { index: false, follow: false } };
export default function Page() { return <><Nav/><MiniGoodsAdmin/></>; }
