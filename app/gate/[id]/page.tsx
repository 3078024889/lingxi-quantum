import SubconsciousExplorer from "@/components/SubconsciousExplorer";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateVisual from "@/components/GateVisual";
import GateInvitations from "./GateInvitations";
import { gates, getGate } from "@/lib/gates";
import Bi from "@/components/Bi";

export function generateStaticParams() {
  return gates.map((g) => ({ id: g.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const gate = getGate(params.id);
  return { title: gate ? `${gate.title} ${gate.titleEn} · 重塑潜意识 Rewrite the Subconscious | 灵犀场 LingxiField` : "灵犀场 LingxiField" };
}

export default function GatePage({ params }: { params: { id: string } }) {
  const gate = getGate(params.id);
  if (!gate) notFound();

  return (
    <>
      <Nav />
      <main className="gate-workspace"><Link href="/subconscious"><Bi zh="返回重塑潜意识" en="Back to Rewrite the Subconscious" /> →</Link><SubconsciousExplorer initialGate={gate.id} /></main>
      <Footer />
    </>
  );
}
