import { sha256 } from "@/lib/sasi/cangxuan-foundry";
import type { BronzeRecord } from "./types";

/**
 * Small bilingual public-domain style sample for gutendex fixture mode.
 * Content is original short prose for ingest pipeline tests — not a verbatim copyrighted excerpt.
 */
export function fetchGutendexFixture(): BronzeRecord {
  const content = [
    "春风过处，柳丝轻扬。Spring breeze stirs the willow silk.",
    "远山如黛，近水含烟。Distant hills are ink-dark; nearby water holds mist.",
    "一行白鹭上青天。A line of egrets rises into the blue sky.",
    "This short paragraph is a public-domain style fixture for SASI OpenData bronze ingest.",
  ].join(" ");

  const fetchedAt = new Date().toISOString();
  return {
    id: "fixture-gutendex-001",
    sourceId: "gutendex",
    url: "fixture://gutendex/sample-001",
    title: "Gutendex fixture · 春风短章 / Spring Breeze Note",
    license: "public-domain",
    rightsScope: "open_licensed",
    content,
    contentHash: sha256(content),
    fetchedAt,
    encodingOk: true,
  };
}

/** Load fixture bronze records for allowlisted sources that are in fixture mode. */
export function loadFixtureRecords(sourceIds: string[] = ["gutendex"]): BronzeRecord[] {
  const out: BronzeRecord[] = [];
  for (const id of sourceIds) {
    if (id === "gutendex") out.push(fetchGutendexFixture());
    // openlibrary / wikidata fixtures can be added later; skeleton only ships gutendex sample.
  }
  return out;
}
