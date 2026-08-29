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
    <section className={`lx-pdf-page lx-archive-publication-page relative mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden text-[#f7f4ff] shadow-[0_24px_90px_rgba(3,8,28,.42)] ${cover ? "lx-archive-publication-cover" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className={`absolute inset-0 ${cover ? "bg-gradient-to-b from-[#07132d]/12 via-[#07132d]/28 to-[#07132d]/78" : full ? "bg-gradient-to-b from-[#07132d]/12 via-[#07132d]/34 to-[#07132d]/72" : "bg-gradient-to-br from-[#07132d]/24 via-[#10193c]/20 to-[#07132d]/54"}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,.18),transparent_34%),radial-gradient(circle_at_88%_84%,rgba(111,239,222,.10),transparent_31%)]" />
      <div className="relative z-10 flex h-full flex-col px-[7%] py-[6%] text-white">
        <header className="flex items-start justify-between gap-6 text-[10px] uppercase tracking-[.28em]">
          <span className="text-[#bff8ec]">{eyebrow}</span>
          <span className="text-white/70">{String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </header>
        <div className={cover || full ? "mt-auto" : "my-auto"}>
          <h2 className="font-display text-[32px] font-light leading-tight text-white drop-shadow-[0_2px_14px_rgba(2,8,28,.72)] sm:text-[42px]">{title}</h2>
          <div className="lx-archive-glass mt-5 p-7 sm:p-9">{children}</div>
        </div>
        <footer className="mt-auto flex items-center justify-between border-t border-white/20 pt-3 text-[9px] tracking-[.18em] text-white/65">
          <span>LINGXIFIELD ORIGINAL ARCHIVE</span><span>lingxifield.com</span>
        </footer>
      </div>
    </section>
  );
}

export function PublicationCopy({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <p className={`lx-archive-copy ${muted ? "opacity-82" : ""}`}>{children}</p>;
}

export function PublicationLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#9cf3df]">{children}</p>;
}
