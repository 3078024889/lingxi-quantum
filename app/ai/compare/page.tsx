import type {Metadata} from "next";
import Link from "next/link";
import {aiTools} from "../../../lib/ai-discovery/catalog";
import {selectedProductIds} from "../../../lib/ai-discovery/terminal-selection";
import {singleQueryValue} from "../../../lib/ai-discovery/query";
import styles from "../discovery.module.css";
import tableStyles from "../terminal.module.css";
export const metadata:Metadata={title:"Compare AI Products | LINGXIFIELD",description:"Compare two to five AI products with official links and transparent information gaps.",alternates:{canonical:"https://lingxifield.com/ai/compare"}};
type Params={a?:string|string[];b?:string|string[];products?:string|string[]};
export default async function Compare({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const raw=typeof p.products==="string"?singleQueryValue(p.products,500).split(","):[singleQueryValue(p.a,80),singleQueryValue(p.b,80)];
 const ids=selectedProductIds(raw,aiTools.map(t=>t.slug));
 const rows=ids.map(id=>aiTools.find(t=>t.slug===id)!);
 const fields=[{label:"Company",value:(t:typeof aiTools[number])=>t.provider},{label:"Category",value:(t:typeof aiTools[number])=>t.category},{label:"Intended use",value:(t:typeof aiTools[number])=>t.description},{label:"Price / free allowance",value:()=>"Not yet verified"},{label:"Regional access",value:()=>"Confirm with provider"},{label:"Independent test",value:()=>"Not yet available"}];
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link className={styles.brand} href="/ai">LINGXIFIELD AI</Link><Link href="/ai">Choose products</Link></header><section className={tableStyles.workbench}><h1>Compare your choices</h1><p>Compare 2–5 products. Share this page’s URL to share your selection.</p>{rows.length<2?<div className={styles.empty}><h2>Select at least two different products</h2><Link href="/ai">Choose products →</Link></div>:<div className={tableStyles.tableScroll} tabIndex={0} role="region" aria-label="Product comparison"><table><caption className={tableStyles.srOnly}>Side-by-side product comparison</caption><thead><tr><th scope="col">What matters to you</th>{rows.map(t=><th scope="col" key={t.slug}><Link href={"/ai/"+t.slug}>{t.name}</Link></th>)}</tr></thead><tbody>{fields.map(f=><tr key={f.label}><th scope="row">{f.label}</th>{rows.map(t=><td key={t.slug}>{f.value(t)}</td>)}</tr>)}<tr><th scope="row">Ask the provider</th>{rows.map(t=><td key={t.slug}><a href={t.url} target="_blank" rel="noopener noreferrer">Official website ↗</a></td>)}</tr></tbody></table></div>}<aside className={tableStyles.help}><p>Need help deciding? Tell us your task, budget and region.</p><Link href="/ai/help">Submit a question →</Link></aside></section></div></main>;
}
