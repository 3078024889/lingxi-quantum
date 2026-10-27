import type {Metadata} from "next";
import Link from "next/link";
import {fetchCatalogPreview} from "../../../lib/ai-discovery/catalog-preview";
import {safeMarketSort,filterMarketModels,displayMarketPrice} from "../../../lib/ai-discovery/model-market-view";
import styles from "../discovery.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"AI Model Market Data Preview | LINGXIFIELD",robots:{index:false,follow:false},description:"Source-attributed, provisional model metadata preview; not a global popularity ranking."};
type Params={q?:string|string[];sort?:string|string[]};
const one=(v:string|string[]|undefined)=>typeof v==="string"?v:Array.isArray(v)?v[0]??"":"";
export default async function ModelMarketPreview({searchParams}:{searchParams:Promise<Params>}){
 const enabled=process.env.AI_MARKET_PREVIEW_ENABLED==="true";
 const params=await searchParams;
 const q=one(params.q).slice(0,100),sort=safeMarketSort(one(params.sort));
 const catalog=enabled?await fetchCatalogPreview():null;
 const data=catalog?.status==="ok"?filterMarketModels(catalog.models,q,sort):{total:0,rows:[]};
 return <main className={styles.page}><div className={styles.shell}>
 <header className={styles.topbar}><Link className={styles.brand} href="/ai">LINGXIFIELD <span>AI</span></Link><nav><Link href="/ai/rankings">Watchlist</Link><Link href="/ai/sources">Sources</Link></nav></header>
 <section className={styles.hero} style={{paddingBottom:30}}><span className={styles.eyebrow}>INTERNAL MARKET DATA PREVIEW</span><h1>AI model <em>price explorer</em></h1><p>Reported OpenRouter routing prices, not vendor-direct prices. Data is provisional, may change and must pass licensing review before public release.</p></section>
 {!enabled?<section className={styles.section}><h2>Preview disabled</h2><p>This feature is not enabled for public release.</p></section>:
 catalog?.status!=="ok"?<section className={styles.section}><h2>Data unavailable</h2><p>Unable to validate the current provider catalog. No estimated or cached prices are substituted.</p></section>:
 <section className={styles.section}>
 <p className={styles.muted}>Observed {catalog.observedAt} · {catalog.count} source models · {data.total} matching · <a href={catalog.source} rel="noopener noreferrer" target="_blank">OpenRouter catalog source</a></p>
 <form className={styles.filters} action="/ai/market-preview"><input name="q" aria-label="Find model" placeholder="Search model name or ID" defaultValue={q}/><select name="sort" aria-label="Sort models" defaultValue={sort}><option value="name">Model name</option><option value="prompt-low">Input price: lowest first</option><option value="completion-low">Output price: lowest first</option><option value="context-high">Context: highest first</option></select><button type="submit">Apply</button></form>
 <div style={{overflowX:"auto",border:"1px solid #dfe3e8",borderRadius:12,background:"#fff"}}><table style={{borderCollapse:"collapse",width:"100%",minWidth:820,textAlign:"left",fontSize:13}}><thead><tr>{["Model","Context tokens","Input USD / 1M tokens","Output USD / 1M tokens","Source"].map(x=><th key={x} scope="col" style={{padding:12,background:"#edf1f6"}}>{x}</th>)}</tr></thead><tbody>{data.rows.map(m=><tr key={m.id} style={{borderTop:"1px solid #e9edf1"}}><td style={{padding:12}}><strong>{m.name}</strong><div className={styles.muted}>{m.id}</div></td><td style={{padding:12}}>{m.contextTokens?.toLocaleString("en-US")??"Unknown"}</td><td style={{padding:12}}>{displayMarketPrice(m.promptUsdPerMillion)}</td><td style={{padding:12}}>{displayMarketPrice(m.completionUsdPerMillion)}</td><td style={{padding:12}}>OpenRouter</td></tr>)}</tbody></table></div>
 <p className={styles.muted}>Showing up to 100 matching models. Unknown prices sort last, not as free. No quality, traffic or popularity claims.</p></section>}
 <footer className={styles.footer}><Link href="/ai">← AI directory</Link></footer></div></main>;
}
