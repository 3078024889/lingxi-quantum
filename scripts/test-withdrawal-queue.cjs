const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

async function scenario(status, configured, paymentReference) {
  const updates = [];
  const withdrawal = { id: 'request', user_id: 'owner', order_id: 'order', provider: 'wechat', status, updated_at: '2026-01-01T00:00:00Z' };
  const admin = { from(table) {
    let update;
    const filters = [];
    const query = {
      select() { return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      single: async () => ({ data: table === 'balance_withdrawals' ? withdrawal : paymentReference ? {provider_payment_id: 'paid'} : null }),
      update(value) { update = value; return query; },
      then(resolve) { updates.push({table, update, filters}); return Promise.resolve({error: null}).then(resolve); },
    };
    return query;
  }};
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('lib/payments/withdrawal-processing.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (name === 'server-only') return {};
    if (name === '@/lib/supabase/admin') return {createAdminClient: () => admin};
    if (name === '@/lib/payment-refunds') return {
      refundProviderConfigured: () => configured,
      executeProviderRefund: () => { throw new Error('must not submit payment'); },
      queryProviderRefund: () => { throw new Error('must not query without payment reference'); },
    };
    throw new Error(name);
  }, mod, mod.exports);
  const result = await mod.exports.refreshWithdrawal('request', 'owner');
  assert.equal(result.status, status);
  assert.equal(result.needsSupport, true);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].update.failure_code, configured ? 'PAYMENT_REFERENCE_REQUIRED' : 'PROVIDER_CONFIGURATION_REQUIRED');
  assert(Date.now() - Date.parse(updates[0].update.updated_at) < 5000);
  assert.deepEqual(updates[0].filters, [['id', 'request'], ['status', status]]);
  assert.equal(updates[0].update.status, undefined, 'never invent payment completion');
}

(async () => {
  await scenario('requested', false, true);
  await scenario('requested', true, false);
  await scenario('processing', true, false);
  console.log('PASS: blocked refunds rotate out of the oldest-first batch without changing holds or inventing completion; updates retain status race guards.');
})().catch(error => { console.error(error); process.exitCode = 1; });
