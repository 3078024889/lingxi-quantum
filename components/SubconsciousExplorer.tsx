"use client";
import { useState } from "react";
import Link from "next/link";
import Bi from "./Bi";
import GateVisual from "./GateVisual";
import { gates } from "@/lib/gates";
import GateInvitations from "@/app/gate/[id]/GateInvitations";
import "./subconscious-explorer.css";

export default function SubconsciousExplorer({ initialGate = "health" }: { initialGate?: string }) {
  const [selected, setSelected] = useState(initialGate);
  const gate = gates.find(item => item.id === selected) || gates[0];
  return <div className="subconscious-explorer">
    <nav className="subconscious-gates" aria-label="六道观察入口">{gates.map((item, index) => <button key={item.id} aria-pressed={gate.id === item.id} onClick={() => setSelected(item.id)}>
      <div className="subconscious-gate-art"><GateVisual id={item.id} className="h-full w-full" /></div>
      <div><small>FREE · 0{index + 1}</small><h3><Bi zh={item.title} en={item.titleEn} /></h3><p><Bi zh={item.line} en={item.lineEn} /></p><span aria-hidden>→</span></div>
    </button>)}</nav>
    <section className="subconscious-reading" aria-label={`${gate.title} · 观察与练习`}>
      <header><div className="subconscious-reading-art"><GateVisual id={gate.id} className="h-full w-full" /></div><div><small>REFLECTION · FREE</small><h2><Bi zh={gate.title} en={gate.titleEn} /></h2><p><Bi zh={gate.line} en={gate.lineEn} /></p></div></header>
      <div className="subconscious-reading-body"><p><Bi zh={gate.intro} en={gate.introEn} /></p>
        <GateInvitations key={gate.id} gateId={gate.id} gateTitle={gate.title} gateLine={gate.line} pool={gate.prompts} poolEn={gate.promptsEn} />
        <div className="subconscious-actions"><Link href="/live-as"><Bi zh="带着它进入现实回路" en="Carry it into the Reality Loop" /> →</Link><Link href={`/gate/${gate.id}`}><Bi zh="单独阅读这个入口" en="Read this gate separately" /> →</Link></div>
      </div>
    </section>
  </div>;
}
