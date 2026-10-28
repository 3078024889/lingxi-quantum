import Link from "next/link";
import {evidenceLabels, vendorEnquiryHref} from "../../lib/ai-discovery/evidence-status";

export default function InformationStatus({product}: {product: string}) {
  return <section aria-label={`Information coverage for ${product}`}>
    <h3>What still needs confirmation?</h3>
    <p>{evidenceLabels.unknown} — we have not yet verified this product’s current plans, free allowance or regional access. This does not mean the product lacks these features.</p>
    <ul>
      <li>Price: current plan, currency and billing period.</li>
      <li>Free allowance: amount, reset period and trial restrictions.</li>
      <li>Regional access: supported country, registration and payment conditions.</li>
    </ul>
    <p>No verification date is available. A catalog description is not an independent test.</p>
    <p><a href={vendorEnquiryHref(product, "correction")}>Provide an official source — free</a> · <Link href="/ai/vendors">Manage or promote your product</Link></p>
    <p>Corrections are reviewed without payment. Paid visibility does not change factual findings or organic rankings.</p>
  </section>;
}
