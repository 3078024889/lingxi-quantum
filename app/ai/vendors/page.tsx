import type {Metadata} from "next";
import Link from "next/link";
import {vendorEnquiryHref} from "../../../lib/ai-discovery/evidence-status";
import styles from "../discovery.module.css";

export const metadata: Metadata = {
  title: "Product information and visibility | LINGXIFIELD",
  description: "Submit product evidence for free or enquire about clearly labelled brand and sponsored placements.",
  alternates: {canonical: "https://lingxifield.com/ai/vendors"},
};
export default function Vendors() {
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.topbar}><Link className={styles.brand} href="/ai">LINGXIFIELD AI</Link><Link href="/ai">Back to AI market</Link></header>
    <section className={styles.section}><h1>Help customers understand your product</h1>
      <p>Start with accurate information. If you need more visibility, ask about a clearly labelled commercial placement.</p>
      <div className={styles.infoGrid}>
        <article className={styles.infoPanel}><h2>Complete your information</h2><p>Submit official pricing, free allowance, supported regions and product updates for review. Corrections and evidence submissions are free.</p><a href={vendorEnquiryHref("your product", "correction")}>Submit official information</a></article>
        <article className={styles.infoPanel}><h2>Brand showcase</h2><p>Enquire about richer product presentations with images, videos and use cases. This does not purchase a verification badge or recommendation.</p><a href={vendorEnquiryHref("your product", "promotion")}>Enquire about brand visibility</a></article>
        <article className={styles.infoPanel}><h2>Sponsored placement</h2><p>A separately labelled position for an agreed category and period, subject to available inventory. Sponsorship does not override a user’s requirements or change organic results.</p><a href={vendorEnquiryHref("your product", "promotion")}>Enquire about available placements</a></article>
      </div>
      <h2>Clear terms before any purchase</h2><p>Self-service claims and checkout are not yet available here. The planned basic allowance is three managed products per verified company with free annual confirmation. Additional management slots and display services will have their currency, price, duration and delivery terms shown before checkout.</p>
      <p>No payment is taken on this page. An enquiry does not reserve inventory, activate benefits or authorize recurring charges. We do not guarantee rankings, clicks or sales.</p>
      <p>Email links open your mail app. Nothing is sent until you choose to send it. Please do not include credentials or customer data.</p>
    </section>
  </div></main>;
}
