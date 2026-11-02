import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('placement proof is service-only, paid order and approved vendor tied, with immutable window',()=>{
 const s=file('supabase/migrations/20261102130000_ai_market_promotion_placement_lifecycle.sql');
 for(const target of ['ai_market_promotion_settlement_evidence','ai_market_promotion_entitlements',
  'ai_market_promotion_refund_evidence','UNLINKED_OR_CHANGED_PROMOTION','PAID_ORDER_NOT_VERIFIED',
  'SIGNED_SETTLEMENT_PROOF_REQUIRED','APPROVED_VENDOR_REQUIRED','ENTITLEMENT_IMMUTABLE'])
 assert.ok(s.includes(target),target);
 assert.match(s,/o\.status<>'paid'/);
 assert.match(s,/REVOKE ALL ON public\.ai_market_promotion_entitlements FROM PUBLIC,anon,authenticated/);
 assert.match(s,/REVOKE ALL ON public\.ai_market_promotion_refund_evidence FROM PUBLIC,anon,authenticated/);
 assert.doesNotMatch(s,/GRANT (?:INSERT|UPDATE|DELETE) .*TO authenticated/);
});
test('refund revokes placement and cannot cumulatively exceed paid amount',()=>{
 const s=file('supabase/migrations/20261102130000_ai_market_promotion_placement_lifecycle.sql');
 assert.match(s,/total_refunded\+NEW\.amount_minor>proof\.amount_minor/);
 assert.match(s,/SET status='revoked'/);
 assert.match(s,/revocation_reason='provider_refund'/);
 assert.match(s,/revocation_reason='vendor_claim_revoked'/);
 assert.match(s,/UNIQUE\(provider,provider_event_ref\)/);
 assert.match(s,/ends_at>starts_at/);
 const pipeline=file('.github/workflows/ai-market-postgres-isolated.yml');
 for(const issue of ['PLACEMENT_GRANTED_WITHOUT_SIGNED_PROOF','CROSS_VENDOR_SETTLEMENT_ACCEPTED',
 'DUPLICATE_SETTLEMENT_EVENT_ACCEPTED','OVER_REFUND_ACCEPTED','REFUNDED_PLACEMENT_STILL_ACTIVE'])
 assert.ok(pipeline.includes(issue),issue);
});
