import raw from "./reviewed-evidence.json";
import type {ReviewedEvidence} from "./ranking";
/** Checked-in reviewed evidence only. Empty by default: never invent market metrics. */
export const publishedEvidence:readonly ReviewedEvidence[]=raw as ReviewedEvidence[];
