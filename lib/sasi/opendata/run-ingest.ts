import "server-only";

import { normalizeFoundryText, sha256 } from "@/lib/sasi/cangxuan-foundry";
import { ALLOWLIST_SOURCES, isDryRun, isOpendataIngestEnabled } from "./allowlist";
import { loadFixtureRecords } from "./fetch-fixture";
import type { BronzeRecord, IngestRunReport } from "./types";
import { assertLicenseOk, assertUtf8Text } from "./validate";

export type RunOpendataIngestOpts = {
  userId?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function emptyDisabledReport(): IngestRunReport {
  return {
    enabled: false,
    mode: "disabled",
    fetched: 0,
    accepted: 0,
    rejected: 0,
    reasons: ["SASI_OPENDATA_INGEST_ENABLED is not true"],
    at: nowIso(),
  };
}

function validateRecord(record: BronzeRecord): { ok: boolean; reason?: string } {
  const utf8 = assertUtf8Text(record.content);
  if (!utf8.ok) return { ok: false, reason: `utf8:${utf8.reason ?? "fail"}` };
  if (!assertLicenseOk(record.license)) {
    return { ok: false, reason: `license_not_allowlisted:${record.license}` };
  }
  const normalized = normalizeFoundryText(record.content);
  if (normalized.length < 20) return { ok: false, reason: "content_too_short" };
  // Keep hash path aligned with foundry (sha256 of content); fixture already hashes raw content.
  void sha256(normalized);
  return { ok: true };
}

/**
 * One-shot OpenData ingest (line B self-forage).
 * Default: disabled. When enabled, dry-run defaults ON (no DB writes unless DRY_RUN=false).
 *
 * Write path TODO: when !dryRun && userId, call Foundry import with fields:
 *   title, sourceType: "licensed_open", rightsScope: "open_licensed",
 *   content (normalized), licenseMetadata: { license, sourceId, url },
 * reusing extractDirectorKnowledge / sha256 / trainabilityFor from cangxuan-foundry
 * and the same cangxuan_sources + cangxuan_knowledge_items insert pattern as
 * app/api/sasi/foundry/route.ts action=import. Extracting that into a shared helper
 * was deferred to avoid breaking the existing Foundry API in this skeleton.
 */
export async function runOpendataIngestOnce(opts: RunOpendataIngestOpts = {}): Promise<IngestRunReport> {
  if (!isOpendataIngestEnabled()) {
    return emptyDisabledReport();
  }

  const dryRun = isDryRun();
  const reasons: string[] = [];
  const fixtureSources = ALLOWLIST_SOURCES.filter((s) => s.fetchMode === "fixture").map((s) => s.id);
  const records = loadFixtureRecords(fixtureSources.includes("gutendex") ? ["gutendex"] : []);

  let accepted = 0;
  let rejected = 0;

  for (const record of records) {
    const check = validateRecord(record);
    if (!check.ok) {
      rejected += 1;
      reasons.push(`reject:${record.id}:${check.reason ?? "unknown"}`);
      continue;
    }
    accepted += 1;
    reasons.push(`accept:${record.id}:license=${record.license}:hash=${record.contentHash.slice(0, 12)}`);
  }

  if (dryRun) {
    reasons.push("dry_run:no_db_write");
    return {
      enabled: true,
      mode: "dry-run",
      fetched: records.length,
      accepted,
      rejected,
      reasons,
      at: nowIso(),
    };
  }

  // Non-dry-run write path — skeleton stops short of DB mutation.
  if (!opts.userId) {
    reasons.push("write_skipped:missing_userId");
    return {
      enabled: true,
      mode: "write",
      fetched: records.length,
      accepted: 0,
      rejected: records.length,
      reasons,
      at: nowIso(),
    };
  }

  reasons.push(
    "TODO:write_path_not_wired — call foundry import (title, sourceType licensed_open, rightsScope open_licensed) when shared helper is extracted",
  );
  return {
    enabled: true,
    mode: "write",
    fetched: records.length,
    accepted: 0,
    rejected: 0,
    reasons,
    at: nowIso(),
  };
}
