import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
test('each vendor payment method retains the corresponding official source, not a merged unrelated link',()=>{
 const f=read('lib/market-payment-facts.ts');
 const ui=read('app/market-verified-answers.tsx');
 for(const s of ["methodEvidence:PaymentMethodEvidence[]","origin:'regional'|'vendor_policy'|'research'","append(snapshot.payments.methods","append(access?.payment||[]","append(research?.payments||[]","const source=proof[0]?.source||null"])
  assert.ok(f.includes(s),s);
 assert.ok(ui.includes('pay.methodEvidence.map'));
 assert.ok(ui.includes('href={x.source}'));
 assert.ok(ui.includes('localizedPaymentName(x.method,language)'));
 assert.ok(!ui.includes("row.key==='payments'&&pay.source"));
});
test('compact payment cell does not show repetitive local checkout disclaimers',()=>{
 const row=read('app/market-matrix-row.tsx');
 assert.match(row,/const paymentScope=paymentFact\.scope==='unsupported'/);
 assert.ok(!row.includes('官网列有渠道，该地区结算未核实'));
 assert.ok(!row.includes('以结算页为准'));
 assert.ok(row.includes('Boolean(paymentScope)'));
});
