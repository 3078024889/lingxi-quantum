-- Applied to production after verifying schema `extensions` exists and search_path includes it.
alter extension pg_trgm set schema extensions;
