import type { Metadata } from "next";
import Link from "next/link";
import { aiTools, categories, searchTools } from "../../lib/ai-discovery/catalog";
import styles from "./discovery.module.css";

export const metadata: Metadata = {
  title: "Find the Best AI Tools for Your Needs | LINGXIFIELD",
  description: "Find AI tools for writing, video, images, coding and everyday work. Explore categories, compare options and visit official websites.",
  alternates: { canonical: "https://lingxifield.com/ai" },
};
const tasks = [
  { icon: "✦", title: "Write & research", query: "research", hint: "Ideas, answers, reports" },
  { icon: "▣", title: "Create videos", query: "video", hint: "Short films and clips" },
  { icon: "◈", title: "Design images", query: "design", hint: "Pictures and graphics" },
  { icon: "⌘", title: "Build with AI", query: "coding", hint: "Apps, websites, code" },
  { icon: "◎", title: "Search smarter", query: "search", hint: "Explore and learn" },
  { icon: "▤", title: "Get work done", query: "documents", hint: "Files and daily tasks" },
];
export default async function AIDiscovery({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").slice(0, 100);
  const category = (params.category || "").slice(0, 80);
  const results = searchTools(q, category);
  const data = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: "Find AI tools for your needs", url: "https://lingxifield.com/ai",
    mainEntity: { "@type": "ItemList", itemListElement: aiTools.map((tool, index) => ({
      "@type": "ListItem", position: index + 1, name: tool.name, url: "https://lingxifield.com/ai/" + tool.slug,
    })) },
  };
  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link>
        <nav aria-label="Explore"><a href="#explore">Explore</a><Link href="/ai/compare">Compare</Link><a href="#popular">Popular tools</a></nav>
      </header>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>YOUR GUIDE TO AI</span>
        <h1>What would you like <em>AI to do?</em></h1>
        <p>Tell us your goal. Discover tools that make it easier, faster and more creative.</p>
        <form action="/ai" className={styles.search}>
          <label className={styles.srOnly} htmlFor="ai-search">What do you want to do?</label>
          <input id="ai-search" name="q" defaultValue={q} placeholder="Try: make a video, write an article, build a website..." />
          <button type="submit">Find my AI <span aria-hidden="true">→</span></button>
        </form>
        <div className={styles.quickLinks}><span>Popular searches</span><Link href="/ai?q=video">AI video</Link><Link href="/ai?q=coding">Coding</Link><Link href="/ai?q=research">Research</Link></div>
      </section>
      <section id="explore" className={styles.section}>
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>START WITH YOUR GOAL</span><h2>What do you want to create?</h2></div><span className={styles.muted}>Pick a task to get started</span></div>
        <div className={styles.taskGrid}>{tasks.map(t => <Link href={"/ai?q=" + encodeURIComponent(t.query)} key={t.title} className={styles.task}><span className={styles.taskIcon}>{t.icon}</span><strong>{t.title}</strong><small>{t.hint}</small><span className={styles.arrow}>↗</span></Link>)}</div>
      </section>
      <section id="popular" className={styles.section}>
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>EXPLORE YOUR OPTIONS</span><h2>Find your next favorite AI</h2></div><span className={styles.muted}>{results.length} tools to explore</span></div>
        <form action="/ai" className={styles.filters}>
          <input name="q" defaultValue={q} aria-label="Search tools" placeholder="Search AI tools" />
          <select name="category" aria-label="Choose a category" defaultValue={category}><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button type="submit">Show results</button>
        </form>
        {results.length ? <div className={styles.toolGrid}>{results.map(t => <article key={t.slug} className={styles.tool}>
          <div className={styles.toolTop}><span className={styles.toolMonogram}>{t.name.slice(0, 1)}</span><span className={styles.price}>{t.pricing}</span></div>
          <h3>{t.name}</h3><p>{t.description}</p><span className={styles.category}>{t.category}</span>
          <Link href={"/ai/" + t.slug} className={styles.toolLink}>Explore {t.name} <span aria-hidden="true">↗</span></Link>
        </article>)}</div> : <div className={styles.empty}><h3>No matches yet</h3><p>Try another word or explore all tools.</p><Link href="/ai">See all AI tools →</Link></div>}
      </section>
      <section className={styles.bottom}><div><span className={styles.eyebrow}>MAKE A CONFIDENT CHOICE</span><h2>Two tools on your mind?</h2><p>See their strengths side by side and decide which fits your needs.</p></div><Link href="/ai/compare">Compare AI tools →</Link></section>
      <footer className={styles.footer}>Discover with confidence. Visit official websites for the latest plans and availability. <Link href="/tools">Explore LINGXIFIELD tools</Link></footer>
    </div>
  </main>;
}