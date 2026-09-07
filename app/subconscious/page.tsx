import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateVisual from "@/components/GateVisual";
import Bi from "@/components/Bi";
import { gates } from "@/lib/gates";

export const metadata: Metadata = {
  title: "重塑潜意识 FREE｜灵犀场 LINGXIFIELD",
  description: "通过六道自我观察入口，看见反复出现的信念、关系与选择模式。",
  alternates: { canonical: "/subconscious" },
};

export default function SubconsciousPage() {
  return <><Nav /><main className="min-h-screen px-6 pb-28 pt-32"><section className="mx-auto max-w-6xl"><p className="font-display text-sm uppercase tracking-widest2 text-lattice">SUBCONSCIOUS · FREE</p><h1 className="mt-5 font-display text-5xl font-light text-bone sm:text-7xl"><Bi zh="重塑潜意识" en="Rewrite the Subconscious" /></h1><p className="mt-6 max-w-2xl text-base leading-8 text-bone-dim"><Bi zh="不是删除过去，而是看见曾经形成的模式，并在理解之后重新选择。全部入口免费开放。" en="Not erasing the past, but seeing the patterns it formed and choosing again after understanding. Every gate is free." /></p><div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{gates.map((gate) => <Link key={gate.id} href={`/gate/${gate.id}`} className="group overflow-hidden rounded-sm border border-white/10 bg-void-deep"><div className="h-56 overflow-hidden"><GateVisual id={gate.id} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="p-6"><span className="font-display text-3xl text-lattice">{gate.glyph}</span><h2 className="mt-2 font-display text-2xl text-bone"><Bi zh={gate.title} en={gate.titleEn} /></h2><p className="mt-3 text-sm leading-6 text-bone-dim"><Bi zh={gate.line} en={gate.lineEn} /></p></div></Link>)}</div><Link href="/" className="mt-12 inline-block border border-lattice/40 px-6 py-3 text-sm text-lattice"><Bi zh="返回 SASI" en="Back to SASI" /></Link></section></main><Footer /></>;
}
