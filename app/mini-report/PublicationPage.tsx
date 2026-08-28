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
    <section className="lx-pdf-page relative mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden bg-[#f0edf6] text-[#292638] shadow-[0_24px_90px_rgba(16,20,45,.3)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art} alt="" className={`absolute object-cover ${cover || full ? "inset-0 h-full w-full" : "inset-x-0 top-0 h-[39%] w-full"}`} />
      <div className={`absolute inset-0 ${cover ? "bg-gradient-to-b from-[#101936]/20 via-[#101936]/36 to-[#101936]/90" : full ? "bg-gradient-to-b from-[#eef0f6]/5 via-[#eef0f6]/40 to-[#eef0f6]/96" : "bg-gradient-to-b from-transparent via-transparent to-[#f0edf6]"}`} />
      <div className={`relative z-10 flex h-full flex-col px-[7%] py-[6%] ${cover ? "text-white" : ""}`}>
        <header className="flex items-start justify-between gap-6 text-[10px] uppercase tracking-[.28em]">
          <span className={cover ? "text-[#bff8ec]" : "text-[#5a7b83]"}>{eyebrow}</span>
          <span className={cover ? "text-white/65" : "text-[#777083]"}>{String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </header>
        <div className={`${cover ? "mt-auto" : full ? "mt-auto" : "mt-[38%]"}`}>
          <h2 className={`font-display text-[30px] font-light leading-tight sm:text-[38px] ${cover ? "text-white" : "text-[#292638]"}`}>{title}</h2>
          <div className={`mt-5 ${cover || full ? "rounded-sm border border-white/35 bg-[#101936]/72 p-6 text-white backdrop-blur-sm" : "rounded-sm border border-[#4c4966]/15 bg-white/55 p-6"}`}>{children}</div>
        </div>
        <footer className={`mt-auto flex items-center justify-between border-t pt-3 text-[9px] tracking-[.18em] ${cover ? "border-white/20 text-white/60" : "border-[#4c4966]/15 text-[#777083]"}`}>
          <span>LINGXIFIELD ORIGINAL ARCHIVE</span><span>lingxifield.com</span>
        </footer>
      </div>
    </section>
  );
}

export function PublicationCopy({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <p className={`text-[13px] leading-[1.8] sm:text-[15px] sm:leading-[1.9] ${muted ? "opacity-75" : ""}`}>{children}</p>;
}

export function PublicationLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[.22em] text-[#6f8f94]">{children}</p>;
}
