begin;
insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled) values
('pdf-ocr','per_page','page',0,0,0,null,'{"tiers":[{"max":1,"price":0}],"after":1,"block":1,"blockPrice":1}'::jsonb,0,0,0,null,'{"tiers":[{"max":1,"price":0}],"after":1,"block":1,"blockPrice":1}'::jsonb,true),
('handwriting-ocr','per_page','page',0,1,1,null,'{}'::jsonb,0,1,1,null,'{}'::jsonb,true),
('pdf-to-word','per_page','page',0,0,1,null,'{"tiers":[{"max":1,"price":1}],"after":1,"block":1,"blockPrice":0.3}'::jsonb,0,0,1,null,'{"tiers":[{"max":1,"price":1}],"after":1,"block":1,"blockPrice":0.3}'::jsonb,true),
('pdf-editor','per_file','file',0,2,2,null,'{}'::jsonb,0,2,2,null,'{}'::jsonb,true),
('pdf-redact','per_file','file',0,2,2,null,'{}'::jsonb,0,2,2,null,'{}'::jsonb,true),
('e-sign-pdf','per_file','file',0,2,2,null,'{}'::jsonb,0,2,2,null,'{}'::jsonb,true),
('cross-page-stamp','per_file','file',0,2,2,null,'{}'::jsonb,0,2,2,null,'{}'::jsonb,true),
('batch-pdf','per_batch','batch',0,3,3,null,'{}'::jsonb,0,3,3,null,'{}'::jsonb,false),
('reverse-video','per_minute','minute',0,1,1,null,'{"rounding":"started_minute","quantity_basis":"source_duration"}'::jsonb,0,1,1,null,'{"rounding":"started_minute","quantity_basis":"source_duration"}'::jsonb,true),
('loop-video','per_minute','minute',0,1,1,null,'{"rounding":"started_minute","quantity_basis":"source_duration","ignore_output_loop_multiplier":true}'::jsonb,0,1,1,null,'{"rounding":"started_minute","quantity_basis":"source_duration","ignore_output_loop_multiplier":true}'::jsonb,true),
('stop-motion-video','per_minute','minute',0,0.5,1,null,'{"rounding":"started_minute","quantity_basis":"source_duration","boomerang_same_price":true}'::jsonb,0,0.5,1,null,'{"rounding":"started_minute","quantity_basis":"source_duration","boomerang_same_price":true}'::jsonb,true),
('audio-cleanup','per_minute','minute',0,0.5,1,null,'{"rounding":"started_minute","free_preview_seconds":30}'::jsonb,0,0.5,1,null,'{"rounding":"started_minute","free_preview_seconds":30}'::jsonb,true),
('video-transcription','per_minute','minute',0,0.5,0.5,null,'{"rounding":"started_minute"}'::jsonb,0,0.5,0.5,null,'{"rounding":"started_minute"}'::jsonb,true),
('audio-transcription','per_minute','minute',0,0.5,0.5,null,'{"rounding":"started_minute"}'::jsonb,0,0.5,0.5,null,'{"rounding":"started_minute"}'::jsonb,true),
('subtitle-translate','per_character','character',0,0,1,null,'{"tiers":[{"max":5000,"price":1}],"after":5000,"block":5000,"blockPrice":1}'::jsonb,0,0,1,null,'{"tiers":[{"max":5000,"price":1}],"after":5000,"block":5000,"blockPrice":1}'::jsonb,true),
('video-dubbing','per_minute','minute',0,1,1,null,'{"rounding":"started_minute","quality_gate_required":true}'::jsonb,0,1,1,null,'{"rounding":"started_minute","quality_gate_required":true}'::jsonb,false),
('video-dubbing-premium','per_minute','minute',0,3,3,null,'{"requires":["voice_clone","character_consistency","lip_sync"]}'::jsonb,0,3,3,null,'{"requires":["voice_clone","character_consistency","lip_sync"]}'::jsonb,false),
('video-translate','per_minute','minute',0,1.5,1.5,null,'{"rounding":"started_minute","target_language_multiplier":true}'::jsonb,0,1.5,1.5,null,'{"rounding":"started_minute","target_language_multiplier":true}'::jsonb,true)
on conflict(tool_id) do update set billing_type=excluded.billing_type,unit_name=excluded.unit_name,base_price_rmb=excluded.base_price_rmb,unit_price_rmb=excluded.unit_price_rmb,min_price_rmb=excluded.min_price_rmb,max_price_rmb=excluded.max_price_rmb,pricing_json=excluded.pricing_json,base_price_usd=excluded.base_price_usd,unit_price_usd=excluded.unit_price_usd,min_price_usd=excluded.min_price_usd,max_price_usd=excluded.max_price_usd,pricing_json_usd=excluded.pricing_json_usd,enabled=excluded.enabled;
commit;
