import type { ReactNode } from "react";

export function PublicationPage({
  index,
  total,
  eyebrow,
  title,
  art,
  children,
  layout = "split",
}: {
  index: number;
  total: number;
  eyebrow: string;
  title: ReactNode;
  art: string;
  children: ReactNode;
  layout?: "cover" | "split" | "full";
}) {
  const cover = layout === "cover";
  const full = layout === "full";
  return (
    <section className="lx-pdf-page lx-publication-page lx-report-tone-light relative mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden bg-[#eef0f6] text-[#292638] shadow-[0_24px_90px_rgba(16,20,45,.3)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 flex h-full flex-col px-[8.06%] py-[6%]">
        <header className="flex items-start justify-between gap-6 text-[10px] uppercase tracking-[.28em]">
          <span className="font-semibold text-[#557f79]">{eyebrow}</span>
          <span className="text-[#696473]">{String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </header>
        <div className={cover || full ? "mt-auto" : "my-auto"}>
          <h2 className="font-display text-[32px] font-light leading-tight text-[#302941] drop-shadow-[0_1px_8px_rgba(255,255,255,.96)] sm:text-[42px]">{title}</h2>
          <div className="lx-report-glass lx-report-glass-readable mt-5 p-7 sm:p-9">{children}</div>
        </div>
        <footer className="mt-auto flex items-center justify-between border-t border-[#4c4966]/18 pt-3 text-[9px] tracking-[.18em] text-[#696473]">
          <span>LINGXIFIELD ORIGINAL ARCHIVE</span><span>lingxifield.com</span>
        </footer>
      </div>
    </section>
  );
}

export function PublicationCopy({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <p className={`lx-publication-copy mt-3 text-[#454151] ${muted ? "opacity-80" : ""}`}>{children}</p>;
}

export function PublicationLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#557f79]">{children}</p>;
}
