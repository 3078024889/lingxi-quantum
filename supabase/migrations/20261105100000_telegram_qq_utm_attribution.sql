-- Preserve existing page views, add only allowlisted voluntary campaign tags.
alter table public.site_page_views
  add column if not exists utm_source text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text;
create index if not exists site_page_views_campaign_idx
  on public.site_page_views (utm_source, occurred_at)
  where utm_source is not null;
