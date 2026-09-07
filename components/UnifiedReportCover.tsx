import Bi from "@/components/Bi";

export default function UnifiedReportCover({
  art,
  eyebrow,
  titleZh,
  titleEn,
  archiveZh,
  archiveEn,
  statementZh,
  statementEn,
  subject,
  createdAt,
  className = "",
}: {
  art: string;
  eyebrow: string;
  titleZh: string;
  titleEn: string;
  archiveZh: string;
  archiveEn: string;
  statementZh: string;
  statementEn: string;
  subject?: string | null;
  createdAt?: string | Date | null;
  className?: string;
}) {
  const date = createdAt ? new Date(createdAt) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return (
    <section
      className={`lx-publication-page lx-publication-cover relative flex items-center justify-center overflow-hidden rounded-sm px-5 py-10 text-center ${className}`}
      style={{ backgroundImage: `url(${art})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="lx-report-glass lx-report-glass-readable mx-auto w-full max-w-[650px] px-7 py-11 sm:px-12 sm:py-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="mx-auto h-16 w-16 rounded-sm" />
        <p className="mt-5 font-display text-[10px] uppercase tracking-[.34em] text-[#557f79] sm:text-xs">{eyebrow}</p>
        <h1 className="mt-5 font-display text-3xl font-light leading-tight tracking-[.06em] text-[#302941] sm:text-5xl">
          <Bi zh={titleZh} en={titleEn} />
        </h1>
        <p className="mt-2 font-display text-sm tracking-[.12em] text-[#557f79]">
          <Bi zh={archiveZh} en={archiveEn} />
        </p>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#454151]">
          <Bi zh={statementZh} en={statementEn} />
        </p>
        <div className="mx-auto mt-8 w-16 border-t border-[#557f79]/35" />
        <p className="mt-5 text-xs tracking-[.12em] text-[#454151]">
          <Bi zh={`档案主体 · ${subject?.trim() || "未署名"}`} en={`ARCHIVE SUBJECT · ${subject?.trim() || "UNNAMED"}`} />
        </p>
        <p className="mt-2 text-[11px] tracking-[.1em] text-[#696473]">
          {validDate.toLocaleDateString("zh-CN")} · lingxifield.cn
        </p>
      </div>
    </section>
  );
}
