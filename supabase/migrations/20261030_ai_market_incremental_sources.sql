-- AI market source snapshots; append-only evidence and transactional materialization.
-- Independent tables. No modification to users, tools, payments or legacy catalog.
CREATE TABLE IF NOT EXISTS public.ai_market_source_items (
 source text NOT NULL CHECK (source IN ('hf-models','hf-spaces','modelsdev','openrouter')),
 upstream_id text NOT NULL CHECK (char_length(upstream_id) BETWEEN 1 AND 280),
 display_name text NOT NULL,
 source_url text NOT NULL CHECK (source_url ~ '^https://'),
 source_class text NOT NULL CHECK (source_class IN ('official_repository_api','independent_aggregator','reseller_official_api')),
 content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
 upstream_updated_at timestamptz,
 payload jsonb NOT NULL CHECK (jsonb_typeof(payload)='object'),
 first_seen_at timestamptz NOT NULL DEFAULT now(),
 last_seen_at timestamptz NOT NULL DEFAULT now(),
 needs_review boolean NOT NULL DEFAULT true,
 PRIMARY KEY (source,upstream_id)
);
CREATE TABLE IF NOT EXISTS public.ai_market_source_history (
 source text NOT NULL,
 upstream_id text NOT NULL,
 content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
 previous_sha256 text,
 captured_at timestamptz NOT NULL DEFAULT now(),
 source_url text NOT NULL,
 payload jsonb NOT NULL,
 PRIMARY KEY (source,upstream_id,content_sha256),
 FOREIGN KEY (source,upstream_id) REFERENCES public.ai_market_source_items(source,upstream_id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS public.ai_market_source_sync_runs (
 run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 source text NOT NULL,
 started_at timestamptz NOT NULL DEFAULT now(),
 seen integer NOT NULL DEFAULT 0 CHECK (seen>=0),
 inserted integer NOT NULL DEFAULT 0 CHECK (inserted>=0),
 changed integer NOT NULL DEFAULT 0 CHECK (changed>=0),
 unchanged integer NOT NULL DEFAULT 0 CHECK (unchanged>=0),
 publication_approved boolean NOT NULL DEFAULT false,
 CHECK (seen=inserted+changed+unchanged)
);
CREATE INDEX IF NOT EXISTS ai_market_source_items_latest ON public.ai_market_source_items(source,last_seen_at DESC);
CREATE INDEX IF NOT EXISTS ai_market_source_items_review ON public.ai_market_source_items(needs_review,source);
CREATE INDEX IF NOT EXISTS ai_market_source_history_time ON public.ai_market_source_history(source,captured_at DESC);
CREATE INDEX IF NOT EXISTS ai_market_source_sync_runs_time ON public.ai_market_source_sync_runs(source,started_at DESC);
ALTER TABLE public.ai_market_source_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_market_source_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_market_source_sync_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_source_items,public.ai_market_source_history,public.ai_market_source_sync_runs FROM public,anon,authenticated;
-- The endpoint is callable only by service_role. Each batch is atomic.
CREATE OR REPLACE FUNCTION public.ai_market_apply_source_batch(p_source text,p_records jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 v record;
 rec jsonb;
 key text;
 digest text;
 url text;
 prior text;
 inserted_count integer :=0;
 changed_count integer :=0;
 unchanged_count integer :=0;
 count_records integer :=0;
 allowed_prefix text;
 BEGIN
 IF current_setting('request.jwt.claim.role',true) IS DISTINCT FROM 'service_role'
 THEN RAISE EXCEPTION 'SERVICE_ROLE_REQUIRED' USING ERRCODE='42501'; END IF;
 IF p_source NOT IN ('hf-models','hf-spaces','modelsdev','openrouter') THEN RAISE EXCEPTION 'INVALID_SOURCE'; END IF;
 IF jsonb_typeof(p_records) IS DISTINCT FROM 'array' OR jsonb_array_length(p_records)>100
 THEN RAISE EXCEPTION 'INVALID_BATCH'; END IF;
 allowed_prefix:=CASE WHEN p_source IN ('hf-models','hf-spaces') THEN 'https://huggingface.co/'
 WHEN p_source='modelsdev' THEN 'https://models.dev/' ELSE 'https://openrouter.ai/models/' END;
 FOR rec IN SELECT value FROM jsonb_array_elements(p_records)
 LOOP
  key:=rec->>'upstreamId'; digest:=rec->>'contentSha256'; url:=rec->>'sourceUrl';
  IF key IS NULL OR char_length(key) NOT BETWEEN 1 AND 280
   OR digest IS NULL OR digest !~ '^[0-9a-f]{64}$'
   OR url IS NULL OR left(url,length(allowed_prefix))<>allowed_prefix
   OR rec->>'source' IS DISTINCT FROM p_source
   OR coalesce(rec->>'reviewStatus','')<>'candidate'
   OR jsonb_typeof(rec->'facts')<>'object'
  THEN RAISE EXCEPTION 'INVALID_RECORD'; END IF;
  SELECT i.content_sha256 INTO prior
   FROM public.ai_market_source_items i
   WHERE i.source=p_source AND i.upstream_id=key FOR UPDATE;
  IF NOT FOUND THEN
   INSERT INTO public.ai_market_source_items(source,upstream_id,display_name,source_url,source_class,content_sha256,upstream_updated_at,payload)
   VALUES (p_source,key,rec->>'name',url,rec->>'sourceClass',digest,
    NULLIF(rec->>'upstreamUpdatedAt','')::timestamptz,rec);
   inserted_count:=inserted_count+1;
  ELSIF prior IS DISTINCT FROM digest THEN
   UPDATE public.ai_market_source_items SET display_name=rec->>'name',source_url=url,
    source_class=rec->>'sourceClass',content_sha256=digest,
    upstream_updated_at=NULLIF(rec->>'upstreamUpdatedAt','')::timestamptz,
    payload=rec,last_seen_at=now(),needs_review=true
   WHERE source=p_source AND upstream_id=key;
   changed_count:=changed_count+1;
  ELSE
   UPDATE public.ai_market_source_items SET last_seen_at=now()
   WHERE source=p_source AND upstream_id=key;
   unchanged_count:=unchanged_count+1;
  END IF;
  INSERT INTO public.ai_market_source_history(source,upstream_id,content_sha256,previous_sha256,source_url,payload)
   VALUES(p_source,key,digest,prior,url,rec)
   ON CONFLICT(source,upstream_id,content_sha256) DO NOTHING;
  count_records:=count_records+1;
 END LOOP;
 INSERT INTO public.ai_market_source_sync_runs(source,seen,inserted,changed,unchanged)
 VALUES(p_source,count_records,inserted_count,changed_count,unchanged_count);
 RETURN jsonb_build_object('source',p_source,'seen',count_records,'inserted',inserted_count,
  'changed',changed_count,'unchanged',unchanged_count,'publicationApproved',false);
END $$;
REVOKE ALL ON FUNCTION public.ai_market_apply_source_batch(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ai_market_apply_source_batch(text,jsonb) TO service_role;
