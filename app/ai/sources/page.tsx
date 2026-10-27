import {marketSources} from "../../../lib/ai-discovery/source-registry";
import styles from "../discovery.module.css";
export default function SourcesPage(){
 return <main className={styles.page}><div className={styles.shell}>
 <section className={styles.hero}><span className={styles.eyebrow}>DATA PROVENANCE</span><h1>Market data <em>sources</em></h1><p>Registered public data providers and their measurement limitations. Listing a source does not mean its data is already ingested or licensed for redistribution.</p></section>
 <section className={styles.section}><h2>Source registry</h2><div className={styles.infoGrid}>
 {marketSources.map(s=><article key={s.id} className={styles.infoPanel}><h3>{s.name}</h3><p><strong>Category:</strong> {s.kind}</p><p><strong>Potential metrics:</strong> {s.measures.join(", ")}</p><p><strong>Reuse review:</strong> {s.licenseReviewRequired?"Required":"Not required"}</p><p>{s.restrictions}</p><p><a href={s.officialDocs} target="_blank" rel="noopener noreferrer">Official documentation</a></p></article>)}
 </div></section></div></main>;
}
