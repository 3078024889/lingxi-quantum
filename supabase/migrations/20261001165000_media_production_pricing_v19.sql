begin;

insert into public.tool_pricing(
 tool_id,billing_type,unit_name,
 base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,
 base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled
) values
 ('video-dubbing','per_minute','minute',0,2.99,2.99,199.00,'{}'::jsonb,0,0.79,0.79,49.00,'{}'::jsonb,true),
 ('video-transcription','per_minute','minute',0,0.99,0.99,99.00,'{}'::jsonb,0,0.29,0.29,29.00,'{}'::jsonb,true),
 ('audio-transcription','per_minute','minute',0,0.79,0.79,79.00,'{}'::jsonb,0,0.25,0.25,25.00,'{}'::jsonb,true),
 ('image-translator','per_image','image',0,0.99,0.99,99.00,'{}'::jsonb,0,0.29,0.29,29.00,'{}'::jsonb,true),
 ('image-watermark-remover','per_image','image',0,0.60,0.60,60.00,'{}'::jsonb,0,0.19,0.19,19.00,'{}'::jsonb,true),
 ('batch-image-watermark-remover','per_image','image',0,0.50,1.00,100.00,'{}'::jsonb,0,0.15,0.30,30.00,'{}'::jsonb,true),
 ('video-watermark-remover','per_minute','minute',0,1.20,1.20,99.00,'{}'::jsonb,0,0.39,0.39,29.00,'{}'::jsonb,true)
on conflict(tool_id) do update set
 billing_type=excluded.billing_type,unit_name=excluded.unit_name,
 base_price_rmb=excluded.base_price_rmb,unit_price_rmb=excluded.unit_price_rmb,min_price_rmb=excluded.min_price_rmb,max_price_rmb=excluded.max_price_rmb,pricing_json=excluded.pricing_json,
 base_price_usd=excluded.base_price_usd,unit_price_usd=excluded.unit_price_usd,min_price_usd=excluded.min_price_usd,max_price_usd=excluded.max_price_usd,pricing_json_usd=excluded.pricing_json_usd,
 enabled=true;

commit;
