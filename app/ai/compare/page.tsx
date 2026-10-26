import type { Metadata } from "next";
import Link from "next/link";
import { aiTools } from "../../../lib/ai-discovery/catalog";
import styles from "../discovery.module.css";

export const metadata: Metadata = {
  title: "Compare AI Tools Side by Side | LINGXIFIELD",
  description: "Compare AI platforms by what they help you do, pricing model and official website. Choose the best fit for your task.",
  alternates: { canonical: "https://lingxifield.com/ai/compare" },
};
type Props = { searchParams: Promise<{ a?: string; b?: string }> };
const tasks = ["Writing & Research", "Search & Research", "Video Creation", "Design", "Coding", "Documents & Productivity"];
const categoryTasks: Record<string, string[]> = {
  "Writing & Research": ["Writing & Research"],
  "Search & Research": ["Search & Research", "Writing & Research"],
  "Video Creation": ["Video Creation"],
  "Design": ["Design"],
  "Coding": ["Coding"],
  "Documents & Productivity": ["Documents & Productivity"],
};
function find(slug: string | undefined) { return aiTools.find(t => t.slug === slug); }
export default async function CompareAI({ searchParams }: Props) {
  const query = await searchParams;
  const first = find(query.a) || aiTools[0];
  const second = find(query.b) || aiTools.find(t => t.slug !== first.slug)!;
  const same = first.slug === second.slug;
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link><nav><Link href="/ai">All AI tools</Link></nav></header>
    <section className={styles.hero} style={{paddingBottom:35}}>
      <span className={styles.eyebrow}>CHOOSE WITH CONFIDENCE</span>
      <h1>Which AI is <em>right for you?</em></h1>
      <p>Pick two platforms and see their key differences at a glance.</p>
    </section>
    <form action="/ai/compare" className={styles.filters}>
      <label className={styles.srOnly} htmlFor="compare-a">First AI</label>
      <select id="compare-a" name="a" defaultValue={first.slug}>{aiTools.map(t => <option value={t.slug} key={t.slug}>{t.name}</option>)}</select>
      <label className={styles.srOnly} htmlFor="compare-b">Second AI</label>
      <select id="compare-b" name="b" defaultValue={second.slug}>{aiTools.map(t => <option value={t.slug} key={t.slug}>{t.name}</option>)}</select>
      <button type="submit">Compare</button>
    </form>
    {same ? <div className={styles.empty}><h2>Choose two different tools</h2><p>Pick another platform above to compare their strengths.</p></div> :
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14,marginBottom:40}}>
      {[first,second].map(t => <article key={t.slug} className={styles.tool} style={{minWidth:0}}>
        <span className={styles.toolMonogram}>{t.name.charAt(0)}</span>
        <h2 style={{overflowWrap:"anywhere"}}>{t.name}</h2>
        <p>{t.description}</p>
        <span className={styles.category}>Best known for: {t.category}</span>
        <p>Plan options: {t.pricing} — check the official site for current pricing.</p>
        <div style={{marginTop:16}}>
          <strong>Explore by goal</strong>
          <ul style={{paddingLeft:20,lineHeight:1.9}}>
            {tasks.map(task => <li key={task}>{categoryTasks[t.category]?.includes(task) ? "✓ " : "— "}{task}</li>)}
          </ul>
        </div>
        <Link className={styles.toolLink} href={"/ai/"+t.slug}>Read about {t.name} →</Link>
        <a href={t.url} target="_blank" rel="noopener noreferrer" style={{marginTop:12,color:"#203f68"}}>Official website ↗</a>
      </article>)}
    </div>}
    <p className={styles.muted} style={{paddingBottom:60}}>These are broad category matches, not hands-on benchmark results or performance rankings. Features, plans and availability can change; verify details on each provider's official site.</p>
  </div></main>;
}