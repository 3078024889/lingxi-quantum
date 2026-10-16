import { searchFaqIntro, searchFaqTitle, searchIntentFaq } from "@/lib/seo/search-intent-faq";
import type { SeoLocale } from "@/lib/seo/global-seo";

export default function SearchIntentFaq({ slug, locale }: { slug: string; locale: SeoLocale }) {
  const items = searchIntentFaq(slug, locale);
  if (!items.length) return null;
  return (
    <section aria-labelledby={`search-faq-${slug}`} style={{ marginTop: 44, paddingTop: 28, borderTop: "1px solid rgba(120,100,70,.14)" }}>
      <h2 id={`search-faq-${slug}`} style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 650, margin: 0 }}>
        {searchFaqTitle(locale)}
      </h2>
      <p style={{ margin: "10px 0 18px", color: "var(--lx-muted)", lineHeight: 1.7, fontSize: 14 }}>
        {searchFaqIntro(locale)}
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, index) => (
          <details key={`${slug}-${index}`} style={{ border: "1px solid rgba(120,100,70,.12)", borderRadius: 12, padding: "12px 16px", background: "rgba(255,255,255,.38)" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, lineHeight: 1.6 }}>
              {item.q}
            </summary>
            <p style={{ margin: "10px 0 2px", lineHeight: 1.75, color: "var(--lx-muted)" }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
