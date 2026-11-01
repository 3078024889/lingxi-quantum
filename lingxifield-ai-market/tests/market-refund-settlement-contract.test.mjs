import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('refund settlement is service-role-only, replay-safe and amount-capped under an order lock',async()=>{
 const sql=await readFile(new URL('../sql/20261101_ai_market_atomic_refund_settlement.sql',import.meta.url),'utf8');
 assert.ok(sql.includes('FOR UPDATE'));
 assert.ok(sql.indexOf("RETURN 'duplicate'") < sql.indexOf("RAISE EXCEPTION 'ORDER_NOT_REFUNDABLE'"));
 assert.ok(sql.includes('REFUND_EXCEEDS_PAID_AMOUNT'));
 assert.ok(sql.includes('REPLAY_EVENT_CONFLICT'));
 assert.ok(sql.includes('DUPLICATE_REFUND_REFERENCE'));
 assert.ok(sql.includes("processing_result='refund_captured'"));
 assert.ok(sql.includes("WHEN v_refunded_after = amount_minor THEN 'refunded'"));
 assert.ok(sql.includes('REVOKE ALL ON FUNCTION'));
 assert.ok(sql.includes('TO service_role'));
 assert.ok(sql.includes('current_setting(\'request.jwt.claim.role\', true) IS DISTINCT FROM \'service_role\''));
 assert.ok(!sql.includes('SECURITY DEFINER'));
});
