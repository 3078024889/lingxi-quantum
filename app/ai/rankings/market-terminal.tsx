import Link from "next/link";
import {aiTools,categories} from "../../../lib/ai-discovery/catalog";
import {singleQueryValue} from "../../../lib/ai-discovery/query";
import styles from "../discovery.module.css";

type Query={q?:string|string[];category?:string|string[];sort?:string|string[]};
export default async function MarketTerminal({searchParams}:{searchParams:Promise<Query>}){
 const params=await searchParams;
 const q=singleQueryValue(params.q,100).toLowerCase();
 const categoryRaw=singleQueryValue(params.category,60);
 const category=categories.includes(categoryRaw)?categoryRaw:"";
 const sortRaw=singleQueryValue(params.sort,20);
 const sort=["name","vendor","category"].includes(sortRaw)?sortRaw:"name";
 const rows=aiTools.filter(t=>(!category||t.category===category)&&
   (!q||[t.name,t.provider,t.description,...t.tags].join(" ").toLowerCase().includes(q)))
   .sort((a,b)=>(sort==="vendor"?a.provider.localeCompare(b.provider):
     sort==="category"?a.category.localeCompare(b.category):a.name.localeCompare(b.name))||
     a.slug.localeCompare(b.slug));
 const heads=["Platform","Vendor","Category","Monthly visits","Downloads","Active users","Rating","Cost per task","Evidence"];
 return <section className={styles.section}>
  <div className={styles.sectionHead}><div><h2>AI market watchlist</h2><p className={styles.muted}>Directory coverage: {aiTools.length} platforms. {rows.length} match your filters.</p></div></div>
  <form action="/ai/rankings" className={styles.filters}>
   <input name="q" defaultValue={q} placeholder="Search platform or capability" aria-label="Search AI market"/>
   <select name="category" defaultValue={category} aria-label="Category"><option value="">All categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
   <select name="sort" defaultValue={sort} aria-label="Sort alphabetically"><option value="name">Name</option><option value="vendor">Vendor</option><option value="category">Category</option></select>
   <button type="submit">Filter</button>
  </form>
  <div style={{overflowX:"auto",border:"1px solid #dfe3e8",borderRadius:12,background:"#fff"}}>
   <table style={{borderCollapse:"collapse",width:"100%",minWidth:1050,textAlign:"left",fontSize:13}}>
    <thead><tr>{heads.map(h=><th scope="col" key={h} style={{padding:12,background:"#edf1f6",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
    <tbody>{rows.map(t=><tr key={t.slug} style={{borderTop:"1px solid #e9edf1"}}>
     <td style={{padding:12,fontWeight:700}}><Link href={"/ai/"+t.slug}>{t.name}</Link></td>
     <td style={{padding:12}}>{t.provider}</td><td style={{padding:12}}>{t.category}</td>
     {Array.from({length:5},(_,i)=><td key={i} style={{padding:12,color:"#687587"}} title="No verified comparable evidence">Unknown</td>)}
     <td style={{padding:12}}>Unverified</td>
    </tr>)}</tbody>
   </table>
  </div>
  <p className={styles.muted}><Link href="/ai/sources">View data sources and licensing limitations →</Link></p>
  <p className={styles.muted}>This is an alphabetical watchlist, not a popularity ranking. Unknown metrics are not zero. Numerical leaderboards require source-linked comparable observations.</p>
 </section>;
}
