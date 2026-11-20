-- Restored verbatim from production migration history.
-- Version 20261110124412 is already applied to the production Supabase project.
-- This file mirrors that exact applied migration; it must not be replayed manually.
BEGIN;

CREATE OR REPLACE FUNCTION public.sasi_market_seller_balance_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_balances jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'LOGIN_REQUIRED';
  END IF;

  WITH currencies(currency) AS (
    VALUES ('CNY'::text),('USD'::text)
  ),
  sales AS (
    SELECT
      s.currency,
      COALESCE(sum(s.gross_minor) FILTER (WHERE s.status NOT IN ('refunded','chargeback')),0)::bigint AS gross_minor,
      COALESCE(sum(s.platform_fee_minor) FILTER (WHERE s.status NOT IN ('refunded','chargeback')),0)::bigint AS platform_fee_minor,
      COALESCE(sum(s.seller_net_minor) FILTER (WHERE s.status='held' AND o.status='paid'),0)::bigint AS held_minor,
      COALESCE(sum(s.seller_net_minor) FILTER (
        WHERE s.status='available' AND s.available_at<=now() AND o.status='paid'
      ),0)::bigint AS settled_minor,
      COALESCE(sum(s.seller_net_minor) FILTER (WHERE s.status='frozen' AND o.status='paid'),0)::bigint AS frozen_minor,
      COALESCE(sum(s.seller_net_minor) FILTER (WHERE s.status IN ('refunded','chargeback')),0)::bigint AS reversed_minor
    FROM public.sasi_market_sales s
    JOIN public.orders o ON o.id=s.order_id
    WHERE s.seller_id=v_user_id
    GROUP BY s.currency
  ),
  payouts AS (
    SELECT
      p.currency,
      COALESCE(sum(p.amount_minor) FILTER (WHERE p.status IN ('requested','processing','submitted')),0)::bigint AS pending_payout_minor,
      COALESCE(sum(p.amount_minor) FILTER (WHERE p.status='paid'),0)::bigint AS paid_out_minor
    FROM public.sasi_market_payouts p
    WHERE p.seller_id=v_user_id
    GROUP BY p.currency
  )
  SELECT jsonb_object_agg(c.currency,jsonb_build_object(
    'grossMinor',COALESCE(s.gross_minor,0),
    'platformFeeMinor',COALESCE(s.platform_fee_minor,0),
    'heldMinor',COALESCE(s.held_minor,0),
    'settledMinor',COALESCE(s.settled_minor,0),
    'frozenMinor',COALESCE(s.frozen_minor,0),
    'reversedMinor',COALESCE(s.reversed_minor,0),
    'pendingPayoutMinor',COALESCE(p.pending_payout_minor,0),
    'paidOutMinor',COALESCE(p.paid_out_minor,0),
    'availableMinor',GREATEST(
      0,
      COALESCE(s.settled_minor,0)-COALESCE(p.pending_payout_minor,0)-COALESCE(p.paid_out_minor,0)
    ),
    'balanceDeficitMinor',GREATEST(
      0,
      COALESCE(p.pending_payout_minor,0)+COALESCE(p.paid_out_minor,0)-COALESCE(s.settled_minor,0)
    )
  ))
  INTO v_balances
  FROM currencies c
  LEFT JOIN sales s ON s.currency=c.currency
  LEFT JOIN payouts p ON p.currency=c.currency;

  RETURN jsonb_build_object('ok',true,'balances',COALESCE(v_balances,'{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.sasi_market_seller_balance_snapshot() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sasi_market_seller_balance_snapshot() TO authenticated,service_role;

ALTER FUNCTION public.sasi_market_request_payout(bigint,text,uuid) SET search_path='';
REVOKE ALL ON FUNCTION public.sasi_market_request_payout(bigint,text,uuid) FROM PUBLIC,anon,authenticated,service_role;

COMMIT;
