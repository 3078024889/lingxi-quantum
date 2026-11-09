-- SASI presentation media slots. Existing orders, archived images and purchases remain untouched.
-- Atomic advisory lock prevents two parallel presigned uploads from claiming the only cover slot.
CREATE OR REPLACE FUNCTION public.sasi_market_limit_media_slots()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  slot_limit integer;
  occupied integer;
BEGIN
  IF NEW.kind NOT IN ('cover','detail') THEN
    RAISE EXCEPTION 'INVALID_MEDIA_KIND' USING ERRCODE='23514';
  END IF;
  IF NEW.status = 'rejected' THEN RETURN NEW; END IF;
  -- An approved/pending image changing its review status does not consume a second slot.
  IF TG_OP = 'UPDATE'
     AND OLD.listing_id = NEW.listing_id
     AND OLD.kind = NEW.kind
     AND OLD.status <> 'rejected'
  THEN RETURN NEW; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(20261109,pg_catalog.hashtext(NEW.listing_id::text));
  slot_limit := CASE WHEN NEW.kind='cover' THEN 1 ELSE 4 END;
  SELECT pg_catalog.count(*) INTO occupied
  FROM public.sasi_market_media
  WHERE listing_id=NEW.listing_id AND kind=NEW.kind
    AND status <> 'rejected' AND id <> NEW.id;
  IF occupied >= slot_limit THEN
    RAISE EXCEPTION 'SASI_MEDIA_SLOT_LIMIT_REACHED_%',NEW.kind
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sasi_market_limit_media_slots() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_limit_media_slots() TO service_role;
DROP TRIGGER IF EXISTS trg_sasi_market_limit_media_slots ON public.sasi_market_media;
CREATE TRIGGER trg_sasi_market_limit_media_slots
BEFORE INSERT OR UPDATE OF listing_id,kind,status ON public.sasi_market_media
FOR EACH ROW EXECUTE FUNCTION public.sasi_market_limit_media_slots();
COMMENT ON FUNCTION public.sasi_market_limit_media_slots() IS
  'Limits newly reserved media to one non-rejected main image and four optional detail images per listing. Existing approved records remain preserved.';
