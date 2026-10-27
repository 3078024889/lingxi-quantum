import {notFound} from "next/navigation";
import BuyerChecklist from "../buyer-checklist";
import type {Metadata} from "next";
import Link from "next/link";
import {aiTools,toolBySlug} from "../../../lib/ai-discovery/catalog";
import styles from "../discovery.module.css";
export function generateStaticParams(){return aiTools.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const t=toolBySlug(slug);return t?{title:`${t.name} — Features and Alternatives | LINGXIFIELD`,description:t.description,alternates:{canonical:`https://lingxifield.com/ai/${t.slug}`}}:{title:"AI platform not found"};}
export default async function ToolPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const t=toolBySlug(slug);if(!t)notFound();const alternatives=aiTools.filter(x=>x.category===t.category&&x.slug!==slug).slice(0,4);
return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link><nav><Link href="/ai/compare">Compare</Link><Link href="/ai/rankings">Rankings</Link></nav></header>
<section className={styles.hero} style={{paddingBottom:38}}><span className={styles.eyebrow}>{t.category.toUpperCase()}</span><h1>{t.name}</h1><p>{t.description}</p><a href={t.url} target="_blank" rel="noopener noreferrer" className={styles.primaryLink}>Visit official website ↗</a></section>
<section className={styles.section}><div className={styles.infoGrid}><article className={styles.infoPanel}><h2>At a glance</h2><dl><dt>Provider</dt><dd>{t.provider}</dd><dt>Category</dt><dd>{t.category}</dd><dt>Useful for</dt><dd>{t.tags.join(", ")}</dd><dt>Pricing</dt><dd>Check official site for current plans</dd></dl></article><article className={styles.infoPanel}><h2>What to check before choosing</h2><p>Confirm current features, language availability, regional access, commercial-use terms and pricing directly with the provider.</p><p><strong>Verification status:</strong> Catalog listing only; no independent hands-on benchmark or market-share evidence is published for this entry.</p><Link href={`/ai/compare?a=${encodeURIComponent(t.slug)}&b=${encodeURIComponent(alternatives[0]?.slug||"chatgpt")}`}>Compare with an alternative →</Link></article></div></section>
<BuyerChecklist/>
{alternatives.length>0&&<section className={styles.section}><h2>Explore similar tools</h2><div className={styles.toolGrid}>{alternatives.map(a=><article key={a.slug} className={styles.tool}><h3>{a.name}</h3><p>{a.description}</p><Link href={"/ai/"+a.slug} className={styles.toolLink}>View details →</Link></article>)}</div></section>}
<footer className={styles.footer}><Link href="/ai">← Back to AI directory</Link> · Editorial listing, not an endorsement.</footer></div></main>;}
