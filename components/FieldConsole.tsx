import type { ReactNode } from "react";
import Link from "next/link";
import Bi from "./Bi";

export type FieldFeature = { zh: string; en: string; glyph?: string };

export function FieldConsole({
  eyebrow,
  eyebrowEn,
  title,
  titleEn,
  description,
  descriptionEn,
  features,
  heroImage,
  children,
  aside,
  footer,
}: {
  eyebrow: string;
  eyebrowEn: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  features: FieldFeature[];
  heroImage: string;
  children: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="lx-console-main">
      <section className="lx-console-hero" style={{ "--lx-console-art": `url('${heroImage}')` } as React.CSSProperties}>
        <div className="lx-console-hero-copy">
          <p className="lx-console-eyebrow"><Bi zh={eyebrow} en={eyebrowEn} /></p>
          <h1><Bi zh={title} en={titleEn} /></h1>
          <p className="lx-console-lead"><Bi zh={description} en={descriptionEn} /></p>
          <div className="lx-console-features">
            {features.map((feature) => (
              <span key={feature.en}><b>{feature.glyph || "✦"}</b><Bi zh={feature.zh} en={feature.en} /></span>
            ))}
          </div>
        </div>
        <p className="lx-console-motto"><Bi zh="让每一个想法，都有抵达世界的可能" en="A MORE CREATIVE TOMORROW" /></p>
      </section>

      <div className={`lx-console-layout ${aside ? "has-aside" : ""}`}>
        <div className="min-w-0">{children}</div>
        {aside && <aside className="lx-console-aside">{aside}</aside>}
      </div>
      {footer}
    </main>
  );
}

export function ConsolePanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`lx-console-panel ${className}`}>{children}</section>;
}

export function ConsoleSectionTitle({ zh, en, actionHref, actionZh = "查看全部", actionEn = "View all" }: { zh: string; en: string; actionHref?: string; actionZh?: string; actionEn?: string }) {
  return (
    <div className="lx-console-section-title">
      <h2><span /> <Bi zh={zh} en={en} /></h2>
      {actionHref && <Link href={actionHref}><Bi zh={actionZh} en={actionEn} /> <span aria-hidden="true">→</span></Link>}
    </div>
  );
}

export function ConsoleCard({ href, image, glyph = "✦", title, titleEn, description, descriptionEn, badge }: { href: string; image?: string; glyph?: string; title: string; titleEn: string; description: string; descriptionEn: string; badge?: string }) {
  return (
    <Link href={href} className="lx-console-card group">
      {image ? <div className="lx-console-card-art" style={{ backgroundImage: `url('${image}')` }} /> : <div className="lx-console-card-glyph">{glyph}</div>}
      <div className="lx-console-card-copy">
        {badge && <span className="lx-console-card-badge">{badge}</span>}
        <h3><Bi zh={title} en={titleEn} /></h3>
        <p className="lx-console-card-en">{titleEn}</p>
        <p><Bi zh={description} en={descriptionEn} /></p>
        <span className="lx-console-card-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

export function ConsoleStatus({ glyph = "◎", title, titleEn, children, tone = "violet" }: { glyph?: string; title: string; titleEn: string; children: ReactNode; tone?: "violet" | "cyan" | "gold" }) {
  return (
    <section className={`lx-console-status is-${tone}`}>
      <h2><span>{glyph}</span><Bi zh={title} en={titleEn} /></h2>
      {children}
    </section>
  );
}
