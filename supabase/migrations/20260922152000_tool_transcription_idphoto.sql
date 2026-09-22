insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,enabled)
values
('audio-transcription','per_minute','minute',0,0.80,0.80,199.00,'{}'::jsonb,true),
('video-transcription','per_minute','minute',0,1.00,1.00,299.00,'{}'::jsonb,true),
('subtitle-translate','per_file','file',0,1.90,1.90,19.00,'{}'::jsonb,true),
('id-photo-ai','per_image','image',0,2.90,2.90,29.00,'{}'::jsonb,true)
on conflict(tool_id) do update set
 billing_type=excluded.billing_type,
 unit_name=excluded.unit_name,
 base_price_rmb=excluded.base_price_rmb,
 unit_price_rmb=excluded.unit_price_rmb,
 min_price_rmb=excluded.min_price_rmb,
 max_price_rmb=excluded.max_price_rmb,
 pricing_json=excluded.pricing_json,
 enabled=excluded.enabled,
 updated_at=now();
