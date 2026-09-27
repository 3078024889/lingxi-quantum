import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');
for (const route of ['ai/referral/code','ai/refund/eligible','ai/wallet','sasi/operator/evidence','sasi/operator/health','sasi/operator/status','tools/analytics/summary','tools/pay/status','tools/temp-mail/recover']) {
  assert.match(read(`app/api/${route}/route.ts`), /export const dynamic = "force-dynamic"/);
}
for (const path of ['app/explore/page.tsx','components/SasiAutonomousDrama.tsx','components/SasiAutonomousVideoStudio.tsx','lib/inquiry-router.ts']) assert.equal(existsSync(path), false, path);
for (const route of ['jobs','quote']) {
  const source=read(`app/api/sasi/${route}/route.ts`);
  assert.match(source, /VIDEO_BYOK_REQUIRED/);
  assert.doesNotMatch(source, /dispatchSasiJob\(|quoteVideoTask\(/);
}
const native=read('app/api/sasi/native/jobs/route.ts');
assert(native.indexOf('VIDEO_BYOK_REQUIRED') < native.indexOf('const entitlement='));
const quotes=read('app/api/tools/quote/route.ts');
assert(quotes.indexOf('VIDEO_BYOK_REQUIRED') < quotes.indexOf('await calculateToolQuote'));
const food=read('components/tools/FoodCalorieWorkbench.tsx');
assert.doesNotMatch(food,/searchFood\(p.label\)/);
assert.match(food,/v!==null&&v!==undefined/);
const byok=read('components/SasiByokVideoStudio.tsx');
assert.match(byok, /Idempotency-Key/);
assert.match(byok, /acceptSupplierBilling: true/);
assert.doesNotMatch(byok, /MediaRecorder|captureStream|\/api\/sasi\/jobs/);
console.log('RETIREMENT_BYOK_REGRESSION_PASS');
