-- Store fulltext body on Foundry sources (owner/private reference materials).
-- character_count remains the authoritative size signal; content is optional for readers.
begin;

alter table public.cangxuan_sources
  add column if not exists content text;

comment on column public.cangxuan_sources.content is
  'Optional fulltext body for SASI-readable owner materials; length should match character_count when set.';

commit;
