import styles from "../discovery.module.css";
const checks=[
 ["Regional access","Supported countries, sign-up and phone verification"],
 ["Payment requirements","Accepted cards, payment methods and billing currencies"],
 ["Free allowance","Free credits, daily limits and quota reset timezone"],
 ["Failed generations","Charges and refunds for errors, timeouts and cancellations"],
 ["Video and image limits","Maximum duration, resolution and outputs per request"],
 ["Export and sharing","Original files, watermarks, editable exports and mobile saving"],
 ["Commercial rights","License, copyright, consent and training policy"],
 ["Real task cost","Per-output credits, retries, taxes and export charges"]
];
export default function BuyerChecklist(){
 return <section className={styles.section} aria-label="Buying decision checklist">
 <h2>Before you subscribe</h2>
 <p className={styles.muted}>Important plan-specific facts still require verified sources. Unknown does not mean free, supported or unlimited.</p>
 <div className={styles.infoGrid}>{checks.map(([name,detail])=><article key={name} className={styles.infoPanel}>
 <h3>{name}</h3><p>{detail}</p><p><strong>Current status:</strong> Not independently verified for this plan.</p>
 </article>)}</div>
 </section>;
}
