import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Link from "next/link";
import {aiTools,toolBySlug} from "../../../lib/ai-discovery/catalog";
import ProductDetail from "../product-detail";
import {latestFacts} from "../../../lib/ai-discovery/product-facts";
import styles from "../discovery.module.css";
import terminal from "../terminal.module.css";
export function generateStaticParams(){return aiTools.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const t=toolBySlug(slug);return t?{title:`${t.name} 免费额度、价格与使用条件｜灵犀场`,description:latestFacts(slug)?.facts.purpose?.text||t.description,alternates:{canonical:`https://lingxifield.com/ai/${t.slug}`}}:{title:"未找到产品"};}
export default async function ToolPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const t=toolBySlug(slug);if(!t)notFound();const alternatives=aiTools.filter(x=>x.category===t.category&&x.slug!==slug).slice(0,4);
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD AI</Link><Link href="/ai">返回找工具</Link></header><section className={terminal.workbench}><h1>{t.name}</h1><p>{latestFacts(slug)?.facts.purpose?.text||`${t.provider} 的产品`}</p><ProductDetail tool={t}/>{alternatives.length>0&&<aside><h2>同类工具，一起比较</h2>{alternatives.map(a=><p key={a.slug}><Link href={`/ai/compare?products=${encodeURIComponent(t.slug+","+a.slug)}`}>{t.name} 与 {a.name} →</Link></p>)}</aside>}</section></div></main>;
}
