-- Editorial evidence quality rules; no public write access is added.
alter table public.ai_directory_evidence
 add constraint ai_evidence_metric_known check (metric_key in ('website_visits','app_downloads','monthly_active_users','benchmark_score','user_rating')),
 add constraint ai_evidence_source_name_nonempty check (length(btrim(source_name)) between 1 and 160),
 add constraint ai_evidence_source_https check (source_url ~ '^https://[^/[:space:]]+'),
 add constraint ai_evidence_approved_requires_measurement check (review_status <> 'approved' or (metric_value is not null and metric_unit is not null and geography is not null and period_start is not null and period_end is not null and reviewed_at is not null)),
 add constraint ai_evidence_review_consistency check (review_status <> 'pending' or reviewed_at is null);
create index if not exists ai_evidence_published_metric_idx on public.ai_directory_evidence(metric_key,period_end desc,geography) where review_status='approved';
comment on table public.ai_directory_evidence is 'Reviewed metric observations only; sponsorship must not change ranking order.';
