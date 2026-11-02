import rawCatalog from '../data/catalog.json';
import { validCatalogEntry } from './catalog-engine.mjs';
import type { CatalogEntry } from './catalog-engine.mjs';

// JSON imports are unknown at trust boundaries. Validate at runtime before use.
const input: unknown = rawCatalog;
if (!Array.isArray(input)) {
  throw new Error('CATALOG_DATA_NOT_ARRAY');
}
const invalidIndex = input.findIndex((entry: unknown) => !validCatalogEntry(entry));
if (invalidIndex !== -1) {
  throw new Error(`INVALID_CATALOG_ENTRY_AT_${invalidIndex}`);
}
export const entries: CatalogEntry[] = input;
