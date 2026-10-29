import type {Metadata} from "next";
import Link from "next/link";
import {fetchCatalogPreview} from "../../../../lib/ai-discovery/catalog-preview";
import {filterDiscovery,marketProviders,safeNumericFilter} from "../../../../lib/ai-discovery/market-discovery";
import {displayMarketPrice} from "../../../../lib/ai-discovery/model-market-view";
import MarketSelection from "../discovery-filters";
import styles from "../../discovery.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"AI Model Discovery Filters Preview | LINGXIFIELD",robots:{index:false,follow:false}};
type Params={q?:string|string[];provider?:string|string[];input?:string|string[];output?:string|string[];maxInput?:string|string[];minContext?:string|string[]};
const one=(v:string|string[]|undefined)=>typeof v==="string"?v:Array.isArray(v)?v[0]??"":"";
export default async function Explore({searchParams}:{searchParams:Promise<Params>}){
 const enabled=process.env.AI_MARKET_PREVIEW_ENABLED==="true",p=await searchParams;
 const catalog=enabled?await fetchCatalogPreview():null;
 const q=one(p.q).slice(0,100),provider=one(p.provider).slice(0,100),input=one(p.input).slice(0,30),output=one(p.output).slice(0,30);
 const maxInput=safeNumericFilter(one(p.maxInput),1_000_000),minContext=safeNumericFilter(one(p.minContext),100_000_000);
 const all=catalog?.status==="ok"?catalog.models:[];
 const providers=marketProviders(all);
 const matched=filterDiscovery(all,{q,provider:providers.includes(provider)?provider:"",input,output,maxInput,minContext});
 const rows=matched.slice(0,80);
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link><nav><Link href="/ai/market-preview">Market</Link><Link href="/ai/market-preview/compare">Compare</Link></nav></header>
 <section className={styles.hero} style={{paddingBottom:25}}><span className={styles.eyebrow}>INTERNAL SOURCE-LINKED PREVIEW</span><h1>Discover <em>AI models</em></h1><p>Filter actual provider-catalog metadata by capabilities and reported routing prices. Unknown fields never count as a match for numeric thresholds.</p></section>
 {!enabled?<section className={styles.section}><h2>Preview disabled</h2><p>Enable only after licensing and internal review.</p></section>:catalog?.status!=="ok"?<section className={styles.section}><h2>Provider data unavailable</h2><p>Search is temporarily unavailable; no synthetic results are shown.</p></section>:
 <section className={styles.section}><p className={styles.muted}>Observed {catalog.observedAt} · {matched.length} matching of {catalog.count} models · <a href={catalog.source} target="_blank" rel="noopener noreferrer">Original source</a></p>
 <form className={styles.filters} action="/ai/market-preview/explore">
 <input name="q" aria-label="Search model" defaultValue={q} placeholder="Model name or ID"/>
 <select name="provider" aria-label="Provider" defaultValue={providers.includes(provider)?provider:""}><option value="">All providers</option>{providers.map(v=><option key={v} value={v}>{v}</option>)}</select>
 <select name="input" aria-label="Input modality" defaultValue={input}><option value="">Any input</option>{["text","image","audio","video"].map(v=><option key={v} value={v}>{v}</option>)}</select>
 <select name="output" aria-label="Output modality" defaultValue={output}><option value="">Any output</option>{["text","image","audio","video"].map(v=><option key={v} value={v}>{v}</option>)}</select>
 <input name="maxInput" aria-label="Maximum input price in USD per million tokens" type="number" min="0" step="any" placeholder="Max input $ / 1M" defaultValue={maxInput}/>
 <input name="minContext" aria-label="Minimum context tokens" type="number" min="0" step="1" placeholder="Min context tokens" defaultValue={minContext}/>
 <button type="submit">Filter</button></form>
 <MarketSelection models={rows.map(m=>({id:m.id,name:m.name}))}/>
 <div style={{overflowX:"auto",border:"1px solid #dfe3e8",borderRadius:12,background:"#fff"}}><table style={{width:"100%",minWidth:820,borderCollapse:"collapse",textAlign:"left",fontSize:13}}><thead><tr>{["Model","Context","Input modalities","Output modalities","Input $ / 1M","Output $ / 1M"].map(h=><th key={h} scope="col" style={{padding:12,background:"#edf1f6"}}>{h}</th>)}</tr></thead><tbody>{rows.map(m=><tr key={m.id} style={{borderTop:"1px solid #e9edf1"}}><td style={{padding:12}}><strong>{m.name}</strong><div className={styles.muted}>{m.id}</div></td><td style={{padding:12}}>{m.contextTokens?.toLocaleString("en-US")??"Unknown"}</td><td style={{padding:12}}>{m.inputModalities.join(", ")||"Unknown"}</td><td style={{padding:12}}>{m.outputModalities.join(", ")||"Unknown"}</td><td style={{padding:12}}>{displayMarketPrice(m.promptUsdPerMillion)}</td><td style={{padding:12}}>{displayMarketPrice(m.completionUsdPerMillion)}</td></tr>)}</tbody></table></div>
 <p className={styles.muted}>Showing at most 80 results. Provider routing prices are not official vendor-direct prices. Feature support, region availability, taxes and rate limits require independent verification.</p></section>}
 <footer className={styles.footer}><Link href="/ai">← AI directory</Link></footer></div></main>;
}
