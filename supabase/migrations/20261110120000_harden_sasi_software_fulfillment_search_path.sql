-- Pin SECURITY DEFINER software fulfillment RPCs to an empty search_path.
-- Every relation and auth helper in the function bodies is schema-qualified.
ALTER FUNCTION public.sasi_grant_software_delivery(uuid) SET search_path TO '';
ALTER FUNCTION public.sasi_claim_software_download(uuid,uuid) SET search_path TO '';
