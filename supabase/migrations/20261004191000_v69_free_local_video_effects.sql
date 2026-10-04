-- V69: browser-local video effects are acquisition tools and no longer require payment.
update public.tool_pricing
set enabled=false, updated_at=now(), pricing_json=coalesce(pricing_json,'{}'::jsonb) || '{"v69":"free_browser_local"}'::jsonb, pricing_json_usd=coalesce(pricing_json_usd,'{}'::jsonb) || '{"v69":"free_browser_local"}'::jsonb
where tool_id in ('reverse-video','loop-video','stop-motion-video');
