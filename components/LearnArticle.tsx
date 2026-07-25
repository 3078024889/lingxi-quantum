import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export type Section = { hZh: string; hEn: string; pZh: string; pEn: string };
export type Faq = { q: string; a: string; qEn?: string; aEn?: string };
export type ArticleData = {
  slug: string;
  eyebrowZh: string;
  eyebrowEn: string;
  titleZh: string;
  titleEn: string;
  defZh: string;
  defEn: string;
  sections: Section[];
  faq: Faq[];
  cta: { titleZh: string; titleEn: string; descZh: string; descEn: string; href: string; btnZh: string; btnEn: string };
  related?: { href: string; zh: string; en: string }[];
  note?: string; // 可选的温柔提示（如健康相关）
  noteEn?: string;
};

export default function LearnArticle({ data }: { data: ArticleData }) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.titleZh,
    alternativeHeadline: data.titleEn,
    description: data.defZh,
    inLanguage: ["zh-CN", "en"],
    image: "https://lingxifield.com/og.png",
    author: { "@type": "Organization", name: "灵犀场 LingxiField", url: "https://lingxifield.com" },
    publisher: {
      "@type": "Organization",
      name: "灵犀场 LingxiField",
      logo: { "@type": "ImageObject", url: "https://lingxifield.com/icon-512.png" },
    },
    mainEntityOfPage: `https://lingxifield.com/learn/${data.slug}`,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "灵犀场 LingxiField", item: "https://lingxifield.com" },
      { "@type": "ListItem", position: 2, name: "学习 Learn", item: "https://lingxifield.com/learn" },
      { "@type": "ListItem", position: 3, name: data.titleZh, item: `https://lingxifield.com/learn/${data.slug}` },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-2xl">
          <div className="bg-reading-glass rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh={data.eyebrowZh} en={data.eyebrowEn} />
          </p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh={data.titleZh} en={data.titleEn} />
          </h1>

          <div className="mt-8 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-lg leading-9 text-bone"><Bi zh={data.defZh} en={data.defEn} /></p>
          </div>

          <div className="mt-10 space-y-6 text-lg leading-9 text-bone-dim">
            {data.sections.map((s, i) => (
              <div key={i} className="space-y-4">
                <h2 className="font-display text-2xl font-light text-bone"><Bi zh={s.hZh} en={s.hEn} /></h2>
                <p><Bi zh={s.pZh} en={s.pEn} /></p>
              </div>
            ))}
          </div>

          {data.note && <p className="mt-8 rounded-sm border border-white/10 bg-void-deep p-5 text-sm leading-7 text-bone-dim/80">{data.noteEn ? <Bi zh={data.note} en={data.noteEn} /> : data.note}</p>}
          </div>

          <div className="mt-14">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="常见问题" en="FAQ" /></h2>
            <div className="mt-6 space-y-5">
              {data.faq.map((f, i) => (
                <div key={i} className="rounded-sm border border-white/10 bg-void-deep p-6">
                  <p className="font-display text-lg text-bone">{f.qEn ? <Bi zh={f.q} en={f.qEn} /> : f.q}</p>
                  <p className="mt-3 leading-8 text-bone-dim">{f.aEn ? <Bi zh={f.a} en={f.aEn} /> : f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-sm border border-lattice/20 bg-lattice/5 p-7 text-center">
            <p className="font-display text-xl text-bone"><Bi zh={data.cta.titleZh} en={data.cta.titleEn} /></p>
            <p className="mt-3 leading-8 text-bone-dim"><Bi zh={data.cta.descZh} en={data.cta.descEn} /></p>
            <Link href={data.cta.href} className="mt-6 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">
              <Bi zh={data.cta.btnZh} en={data.cta.btnEn} />
            </Link>
          </div>

          {data.related && data.related.length > 0 && (
            <p className="bg-void-deep mt-10 rounded-sm px-6 py-4 text-sm text-bone-dim">
              <Bi zh="延伸：" en="Related: " />
              {data.related.map((r, i) => (
                <span key={r.href}>
                  {i > 0 && " · "}
                  <Link href={r.href} className="text-lattice hover:text-amber"><Bi zh={r.zh} en={r.en} /></Link>
                </span>
              ))}
            </p>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
