import type {Metadata} from "next";
import Link from "next/link";
import {fetchCatalogPreview} from "../../../../lib/ai-discovery/catalog-preview";
import {parseWorkload,compareModels,formatRoutingCost} from "../../../../lib/ai-discovery/model-cost";
import styles from "../../discovery.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"AI Model Workload Cost Comparison Preview | LINGXIFIELD",robots:{index:false,follow:false}};
type Query={model?:string|string[];input?:string|string[];output?:string|string[];requests?:string|string[]};
const first=(v:string|string[]|undefined)=>typeof v==="string"?v:Array.isArray(v)?v[0]??"":"";
export default async function CompareMarketModels({searchParams}:{searchParams:Promise<Query>}){
 const enabled=process.env.AI_MARKET_PREVIEW_ENABLED==="true";
 const p=await searchParams;
 const ids=(Array.isArray(p.model)?p.model:[p.model??""]).flatMap(v=>v.split(",")).map(v=>v.trim().slice(0,180)).filter(Boolean).slice(0,4);
 const workload=parseWorkload({input:first(p.input),output:first(p.output),requests:first(p.requests)});
 const catalog=enabled?await fetchCatalogPreview():null;
 const rows=catalog?.status==="ok"?compareModels(catalog.models,ids,workload):[];
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link><nav><Link href="/ai/market-preview">Market preview</Link></nav></header>
 <section className={styles.hero} style={{paddingBottom:28}}><span className={styles.eyebrow}>SOURCE-LINKED ESTIMATES</span><h1>Model cost <em>comparison</em></h1><p>Compare up to four models for the same workload. These are indicative OpenRouter routing costs, not vendor quotes, invoices or guaranteed total costs.</p></section>
 {!enabled?<section className={styles.section}><h2>Preview disabled</h2><p>This comparison is not enabled for public release.</p></section>:catalog?.status!=="ok"?<section className={styles.section}><h2>Source unavailable</h2><p>Cannot calculate a current estimate without validated model metadata.</p></section>:
 <section className={styles.section}>
 <form className={styles.filters} action="/ai/market-preview/compare">
 <input name="model" aria-label="Model IDs separated by commas" defaultValue={ids.join(",")} placeholder="model-id-1, model-id-2"/>
 <input name="input" aria-label="Input tokens per request" type="number" min="0" max="1000000" defaultValue={workload.inputTokens}/>
 <input name="output" aria-label="Output tokens per request" type="number" min="0" max="1000000" defaultValue={workload.outputTokens}/>
 <input name="requests" aria-label="Number of requests" type="number" min="0" max="100000" defaultValue={workload.requests}/>
 <button type="submit">Compare</button></form>
 <p className={styles.muted}>Input/output tokens are per request. Prices are USD per million tokens. Observed {catalog.observedAt}. <a href={catalog.source} target="_blank" rel="noopener noreferrer">Original source</a>.</p>
 <div style={{overflowX:"auto",background:"#fff",border:"1px solid #dfe3e8",borderRadius:12}}><table style={{width:"100%",minWidth:760,borderCollapse:"collapse",textAlign:"left"}}><thead><tr>{["Model","Input / 1M","Output / 1M","Estimated workload cost","Context tokens"].map(h=><th key={h} scope="col" style={{padding:12,background:"#edf1f6"}}>{h}</th>)}</tr></thead><tbody>{rows.map(({model,cost})=><tr key={model.id} style={{borderTop:"1px solid #e9edf1"}}><td style={{padding:12}}><strong>{model.name}</strong><div className={styles.muted}>{model.id}</div></td><td style={{padding:12}}>{model.promptUsdPerMillion??"Unknown"}</td><td style={{padding:12}}>{model.completionUsdPerMillion??"Unknown"}</td><td style={{padding:12}}>{formatRoutingCost(cost)}</td><td style={{padding:12}}>{model.contextTokens??"Unknown"}</td></tr>)}</tbody></table></div>
 {rows.length===0?<p role="status">Enter exact model IDs from the <Link href="/ai/market-preview">model explorer</Link>. Unknown IDs are not assigned prices.</p>:null}
 <p className={styles.muted}>Excludes provider-specific fees, cache pricing, multimodal billing, taxes, discounts and request minimums. Missing rates remain Unknown; results are not ranked by model quality.</p></section>}
 <footer className={styles.footer}><Link href="/ai/market-preview">← Model explorer</Link></footer></div></main>;
}
