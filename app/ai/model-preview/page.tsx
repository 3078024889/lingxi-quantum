import type {Metadata} from "next";
import Link from "next/link";
import {fetchCatalogPreview} from "../../../lib/ai-discovery/catalog-preview";
import styles from "../discovery.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"AI Model Data Preview | LINGXIFIELD",robots:{index:false,follow:false}};
export default async function ModelPreview(){
 const enabled=process.env.AI_MARKET_PREVIEW_ENABLED==="true";
 const snapshot=enabled?await fetchCatalogPreview():null;
 const models=snapshot?.status==="ok"?snapshot.models.slice(0,100):[];
 return <main className={styles.page}><div className={styles.shell}>
 <header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link><nav><Link href="/ai/rankings">Market watchlist</Link></nav></header>
 <section className={styles.hero}><span className={styles.eyebrow}>EXPERIMENTAL / NOINDEX</span><h1>Model catalog <em>preview</em></h1>
 <p>Isolated upstream data preview. Pricing is reported by an aggregator and is not an independently verified provider quote.</p></section>
 <section className={styles.section}>
 {!enabled?<p>Preview disabled until review and validation are complete.</p>:
 snapshot?.status!=="ok"?<p>Upstream catalog unavailable. No fallback prices will be invented.</p>:
 <><p>Observed at {snapshot.observedAt}. Showing {models.length} of {snapshot.count} models. Source: <a href={snapshot.source} rel="noopener noreferrer" target="_blank">OpenRouter API</a>.</p>
 <div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:750,textAlign:"left",borderCollapse:"collapse"}}>
 <thead><tr><th>Model</th><th>Context tokens</th><th>Input USD / 1M tokens</th><th>Output USD / 1M tokens</th></tr></thead>
 <tbody>{models.map(m=><tr key={m.id}><td style={{padding:8,borderTop:"1px solid #ddd"}}>{m.name} ({m.id})</td>
 <td>{m.contextTokens??"Unknown"}</td><td>{m.promptUsdPerMillion??"Unknown"}</td><td>{m.completionUsdPerMillion??"Unknown"}</td></tr>)}</tbody></table></div></>}
 <p className={styles.muted}>Do not use this preview for billing or automated purchasing. Source licensing and commercial redistribution require review.</p>
 </section></div></main>;
}
