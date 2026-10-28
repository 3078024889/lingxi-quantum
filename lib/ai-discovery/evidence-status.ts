/** Missing evidence is not evidence of a missing product capability. */
export type EvidenceState = "unknown" | "stale" | "conflicting" | "documented" | "tested";
export const evidenceLabels: Record<EvidenceState, string> = {
  unknown: "Awaiting confirmation",
  stale: "Needs a fresh check",
  conflicting: "Sources disagree",
  documented: "Source documented",
  tested: "Independently tested",
};
export function vendorEnquiryHref(product: string, purpose: "correction" | "promotion") {
  product = product.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").slice(0, 160);
  const subject = purpose === "correction" ? `Free information update: ${product}` : `Brand or sponsored placement enquiry: ${product}`;
  const body = purpose === "correction"
    ? "Product URL:\nCompany and your role:\nField to update:\nOfficial evidence URL:\nApplicable plan, region and date:\n\nPlease do not include passwords or customer information. Submitting evidence does not verify ownership or guarantee approval."
    : "Product URL:\nCompany and your role:\nPreferred category and dates:\n\nI would like information about clearly labelled placements. This enquiry is not an order or payment authorization.";
  return `mailto:business@lingxifield.com?${new URLSearchParams({subject, body}).toString()}`;
}

