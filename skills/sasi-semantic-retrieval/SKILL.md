---
name: sasi-semantic-retrieval
description: Use when SASI must retrieve the smallest relevant evidence set from a larger knowledge collection.
license: internal-instructions
compatibility: Agent Skills style manifest
---

# sasi-semantic-retrieval

Retrieve before generation. Keep source identifiers with excerpts. Prefer PostgreSQL/pgvector first because LINGXIFIELD already uses Supabase/Postgres; evaluate Qdrant only when scale or hybrid-search requirements justify another service.

## LINGXIFIELD boundary

This skill is native LINGXIFIELD procedure text. It borrows architecture ideas from public open-source/open-standard projects but does not vendor or copy their implementation.
