"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Bi from "./Bi";

const portalNodes = [
  {
    href: "/life-map",
    eyebrow: "Life Map",
    title: "Six-Layer Compass Core",
    body: "A living compass that gathers timing, structure, and life rhythm into one responsive field.",
  },
  {
    href: "/dream",
    eyebrow: "Dream Intelligence",
    title: "Dream Galaxy Gate",
    body: "Capture dreams, decode symbols, and connect recurring symbols into a readable night map.",
  },
  {
    href: "/practice",
    eyebrow: "Practice Space",
    title: "Consciousness Chamber",
    body: "Breath, flow, intuition, and reset become portals into state, not a lesson list.",
  },
];

const orbitNodes = [
  { label: "Life Map", top: "12%", left: "60%" },
  { label: "Dream", top: "38%", left: "84%" },
  { label: "Practice", top: "74%", left: "64%" },
  { label: "Manifest", top: "72%", left: "14%" },
  { label: "Narrative", top: "26%", left: "12%" },
];

export default function LivingFieldHero() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const updatePointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.background = `
        radial-gradient(circle at ${x}% ${y}%, rgba(255, 214, 120, 0.14), transparent 18%),
        radial-gradient(circle at 18% 18%, rgba(120, 235, 255, 0.18), transparent 24%),
        radial-gradient(circle at 84% 16%, rgba(234, 129, 255, 0.18), transparent 22%),
        radial-gradient(circle at 50% 82%, rgba(127, 239, 224, 0.14), transparent 26%)
      `;
    };

    window.addEventListener("pointermove", updatePointer);
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden px-6 pb-24 pt-32 sm:pb-28 sm:pt-36">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#08111e_0%,#0c1e35_28%,#16274b_52%,#0f2241_72%,#09121d_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(120,235,255,0.16),transparent_24%),radial-gradient(circle_at_80%_16%,rgba(234,129,255,0.16),transparent_22%),radial-gradient(circle_at_50%_84%,rgba(127,239,224,0.14),transparent_24%)]" />
      <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black_36%,transparent_84%)]" />
      <div className="absolute left-1/2 top-16 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative">
          <div className="lx-glass max-w-3xl p-8 sm:p-10">
            <p className="font-display text-xs uppercase tracking-widest2 text-lattice sm:text-sm">
              <Bi zh="Lingxi Field | New Quantum Manifestation OS" en="Lingxi Field | New Quantum Manifestation OS" />
            </p>
            <h1 className="mt-6 font-display text-5xl font-light leading-[0.95] text-bone sm:text-7xl xl:text-[5.6rem]">
              <Bi zh="Enter a living digital field" en="Enter a living digital field" />
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-bone-dim sm:text-lg sm:leading-9">
              <Bi
                zh="This is the entry layer of the Lingxi Universe, where life mapping, dream intelligence, practice, and manifestation operate inside one living field."
                en="This is the entry layer of the Lingxi Universe, where life mapping, dream intelligence, practice, and manifestation operate inside one living field."
              />
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/life-map" className="lx-portal-btn inline-flex items-center justify-center px-8 py-4 font-display text-sm uppercase tracking-widest2">
                <Bi zh="Enter The Life Map Core" en="Enter The Life Map Core" />
              </Link>
              <Link href="/dream" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 font-display text-sm uppercase tracking-widest2 text-bone transition hover:border-lattice/60 hover:text-lattice">
                <Bi zh="Open Dream Galaxy" en="Open Dream Galaxy" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="font-display text-3xl text-lattice">06</p>
                <p className="mt-2 text-sm leading-6 text-bone-dim">Concentric Life Map layers</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="font-display text-3xl text-amber">03</p>
                <p className="mt-2 text-sm leading-6 text-bone-dim">Primary portal worlds</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="font-display text-3xl text-bone">INF</p>
                <p className="mt-2 text-sm leading-6 text-bone-dim">Endlessly evolving field narrative</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 text-xs uppercase tracking-[0.28em] text-bone-soft sm:max-w-2xl sm:grid-cols-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center">Pointer shifts the light current</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center">Longer dwell increases brightness</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center">Every route should feel planetary</div>
          </div>
        </div>

        <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full lx-orb-core">
            <div className="absolute inset-4 rounded-full border border-white/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-display text-xs uppercase tracking-widest2 text-void">Lingxi Core</p>
              <p className="mt-2 font-display text-2xl text-void">Lingxi</p>
            </div>
          </div>

          {orbitNodes.map((node) => (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[rgba(10,18,36,0.52)] px-4 py-3 font-display text-xs uppercase tracking-[0.22em] text-bone shadow-[0_0_24px_rgba(127,239,224,0.12)] backdrop-blur-xl"
              style={{ top: node.top, left: node.left }}
            >
              {node.label}
            </div>
          ))}

          <div className="absolute left-6 top-6 max-w-[15rem] rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="font-display text-xs uppercase tracking-widest2 text-lattice">Field Status</p>
            <p className="mt-3 font-display text-2xl text-bone">Resonance Active</p>
            <p className="mt-3 text-sm leading-6 text-bone-dim">Light currents, orbital rhythm, and particle density respond continuously to interaction.</p>
          </div>

          <div className="absolute bottom-6 right-6 max-w-[16rem] rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="font-display text-xs uppercase tracking-widest2 text-amber">Next Evolution</p>
            <p className="mt-3 font-display text-2xl text-bone">Living Field Engine</p>
            <p className="mt-3 text-sm leading-6 text-bone-dim">Pointer, scroll, and dwell time should feed a shared field state layer across the product.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl">
        <p className="font-display text-xs uppercase tracking-widest2 text-lattice">Portal Constellation</p>
        <h2 className="mt-3 font-display text-3xl text-bone sm:text-4xl">Upgrade navigation into planetary portals</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {portalNodes.map((node, index) => (
            <Link
              key={node.href}
              href={node.href}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(6,18,34,0.68),rgba(22,36,70,0.48))] p-7 shadow-[0_24px_60px_rgba(5,10,24,0.28)] backdrop-blur-xl transition hover:-translate-y-2 hover:border-lattice/40"
            >
              <div className="absolute right-6 top-6 font-display text-5xl text-white/10">{`0${index + 1}`}</div>
              <p className="font-display text-xs uppercase tracking-widest2 text-lattice">{node.eyebrow}</p>
              <h3 className="mt-6 max-w-xs font-display text-3xl text-bone">{node.title}</h3>
              <p className="mt-5 max-w-md text-sm leading-7 text-bone-dim">{node.body}</p>
              <div className="mt-10 flex items-center gap-3 text-sm uppercase tracking-[0.22em] text-amber">
                <span>Enter Portal</span>
                <span aria-hidden="true" className="transition group-hover:translate-x-1">-&gt;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}