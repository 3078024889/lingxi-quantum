-- SASI licensed software, staged migration. NOT auto-applied to production.
-- All file objects live in Supabase Storage bucket 'sasi-software-delivery' (PRIVATE).
-- The operator must upload and verify actual signed packages before setting sale_ready.
BEGIN;
CREATE TABLE IF NOT EXISTS public.sasi_software_packages(
 product_id text PRIMARY KEY,
 title text NOT NULL,
 price_cny numeric(12,2) NOT NULL CHECK (price_cny>0),
 price_usd numeric(12,2) NOT NULL CHECK (price_usd>0),
 bucket text NOT NULL DEFAULT 'sasi-software-delivery' CHECK (bucket='sasi-software-delivery'),
 object_path text NOT NULL CHECK (length(object_path)>4 AND object_path NOT LIKE '/%' AND object_path NOT LIKE '%..%' AND object_path NOT LIKE '%\\%'),
 sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
 sale_ready boolean NOT NULL DEFAULT false,
 verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT sasi_software_sale_verified CHECK (NOT sale_ready OR verified_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS public.sasi_software_entitlements(
 order_id uuid PRIMARY KEY REFERENCES public.orders(id),
 user_id uuid NOT NULL,
 product_id text NOT NULL REFERENCES public.sasi_software_packages(product_id),
 issued_at timestamptz NOT NULL DEFAULT now(),
 downloads integer NOT NULL DEFAULT 0 CHECK(downloads>=0),
 max_downloads integer NOT NULL DEFAULT 10 CHECK(max_downloads BETWEEN 1 AND 50),
 UNIQUE(order_id,user_id)
);
CREATE INDEX IF NOT EXISTS sasi_software_entitlements_user_id_idx ON public.sasi_software_entitlements(user_id);
ALTER TABLE public.sasi_software_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sasi_software_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sasi_software_packages FROM anon,authenticated,PUBLIC;
REVOKE ALL ON public.sasi_software_entitlements FROM anon,authenticated,PUBLIC;
GRANT SELECT,INSERT,UPDATE ON public.sasi_software_packages TO service_role;
GRANT SELECT,INSERT,UPDATE ON public.sasi_software_entitlements TO service_role;
INSERT INTO public.sasi_software_packages(product_id,title,price_cny,price_usd,object_path,sha256,sale_ready)
VALUES
 ('sasi-copernicus-si95-mt5','哥白尼 SI 9.5 MT5',2888,2888,'not-uploaded/copernicus-si95-mt5.zip',repeat('0',64),false),
 ('sasi-copernicus-si95-source','哥白尼 SI 9.5 源码版',6900,6900,'not-uploaded/copernicus-si95-source.zip',repeat('0',64),false)
ON CONFLICT(product_id) DO NOTHING;
-- Called by verified payment notifications only (server-only service_role).
CREATE OR REPLACE FUNCTION public.sasi_grant_software_delivery(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE o public.orders%ROWTYPE; p public.sasi_software_packages%ROWTYPE;
BEGIN
 IF auth.role() <> 'service_role' THEN RETURN jsonb_build_object('ok',false,'error','FORBIDDEN'); END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); END IF;
 SELECT * INTO p FROM public.sasi_software_packages WHERE product_id=o.product_id;
 IF NOT FOUND OR NOT p.sale_ready OR p.verified_at IS NULL OR p.sha256=repeat('0',64)
 THEN RETURN jsonb_build_object('ok',false,'error','PACKAGE_UNAVAILABLE'); END IF;
 IF o.provider NOT IN ('wechat','alipay') OR o.provider_payment_id IS NULL
   OR abs(coalesce(o.amount_rmb,0)-p.price_cny)>0.001
   OR o.status NOT IN ('pending','paid')
 THEN RETURN jsonb_build_object('ok',false,'error','ORDER_INVALID'); END IF;
 IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id=p.bucket AND name=p.object_path)
 THEN RETURN jsonb_build_object('ok',false,'error','FILE_NOT_UPLOADED'); END IF;
 INSERT INTO public.sasi_software_entitlements(order_id,user_id,product_id)
 VALUES (o.id,o.user_id,p.product_id)
 ON CONFLICT (order_id) DO NOTHING;
 UPDATE public.orders SET status='paid',paid_at=coalesce(paid_at,now()) WHERE id=o.id;
 RETURN jsonb_build_object('ok',true,'alreadyPaid',o.status='paid');
END $$;
REVOKE ALL ON FUNCTION public.sasi_grant_software_delivery(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_grant_software_delivery(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.sasi_claim_software_download(p_order_id uuid,p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE ent public.sasi_software_entitlements%ROWTYPE;
BEGIN
 IF auth.role()<>'service_role' THEN RETURN jsonb_build_object('ok',false,'error','FORBIDDEN'); END IF;
 SELECT * INTO ent FROM public.sasi_software_entitlements WHERE order_id=p_order_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_ENTITLED'); END IF;
 IF NOT EXISTS (SELECT 1 FROM public.orders WHERE id=ent.order_id AND user_id=ent.user_id AND status='paid')
 THEN RETURN jsonb_build_object('ok',false,'error','ORDER_NOT_PAID'); END IF;
 IF ent.downloads>=ent.max_downloads THEN RETURN jsonb_build_object('ok',false,'error','DOWNLOAD_LIMIT_REACHED'); END IF;
 UPDATE public.sasi_software_entitlements SET downloads=downloads+1 WHERE order_id=ent.order_id;
 RETURN jsonb_build_object('ok',true,'remaining',ent.max_downloads-ent.downloads-1);
END $$;
REVOKE ALL ON FUNCTION public.sasi_claim_software_download(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_claim_software_download(uuid,uuid) TO service_role;
COMMIT;
