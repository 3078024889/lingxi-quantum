-- Media tools: first five seconds are preview; full exports bill exact whole seconds at ¥0.10 / $0.10 per second.
update public.tool_pricing
set billing_type='per_second', unit_name='second',
    base_price_rmb=0, unit_price_rmb=0.10, min_price_rmb=0,
    base_price_usd=0, unit_price_usd=0.10, min_price_usd=0,
    pricing_json=jsonb_build_object('preview_seconds',5,'rounding','whole_second'),
    pricing_json_usd=jsonb_build_object('preview_seconds',5,'rounding','whole_second'),
    enabled=true
where tool_id in ('audio-transcription','video-transcription','video-dubbing','video-translate');