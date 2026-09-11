import type { AllowlistSource } from "./types";

/** Whitelisted OpenData sources. HTTP fetch is optional later; skeleton uses fixtures only. */
export const ALLOWLIST_SOURCES: AllowlistSource[] = [
  {
    id: "gutendex",
    name: "Gutendex (Project Gutenberg mirror API)",
    fetchMode: "fixture",
    notes: "Public-domain books; fixture until http client is wired",
  },
  {
    id: "openlibrary",
    name: "Open Library",
    fetchMode: "fixture",
    notes: "Open bibliographic data; fixture until http client is wired",
  },
  {
    id: "wikidata",
    name: "Wikidata",
    fetchMode: "fixture",
    notes: "CC0 structured data; fixture until http client is wired",
  },
];

/** Master switch — default OFF. Set SASI_OPENDATA_INGEST_ENABLED=true to allow runs. */
export function isOpendataIngestEnabled(): boolean {
  return process.env.SASI_OPENDATA_INGEST_ENABLED === "true";
}

/**
 * Dry-run defaults ON for safety when the job is enabled.
 * Only writes when SASI_OPENDATA_INGEST_DRY_RUN is explicitly set to "false".
 */
export function isDryRun(): boolean {
  return process.env.SASI_OPENDATA_INGEST_DRY_RUN !== "false";
}
