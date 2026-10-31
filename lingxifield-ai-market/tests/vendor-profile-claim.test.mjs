import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateVendorSubmission} from '../lib/vendor-submission.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const valid={requestType:'claim',projectId:'claude',productName:'Claude',officialSite:'https://claude.com',workEmail:'owner@claude.com',submitterName:'Owner',evidenceUrl:'https://claude.com/download',xUrl:'https://x.com/AnthropicAI'};
test('vendor claim intake is free but never grants identity or publication',()=>{
 const r=validateVendorSubmission(valid);
 assert.equal(r.status,'pending_identity_check');
 assert.equal(r.verified_domain,false);
 assert.equal(r.project_id,'claude');
 assert.equal(r.domainMatches,true);
 assert.equal(r.proposed_data.x,'https://x.com/AnthropicAI');
});
test('unrelated email is allowed only as pending manual verification, not approved',()=>{
 const x=validateVendorSubmission({...valid,workEmail:'applicant@external.org'});
 assert.equal(x.domainMatches,false);
 assert.equal(x.status,'pending_identity_check');
});
test('reject javascript URL, HTTP, empty proof and malformed request',()=>{
 assert.equal(validateVendorSubmission({...valid,officialSite:'http://claude.com'}),null);
 assert.equal(validateVendorSubmission({...valid,xUrl:'javascript:alert(1)'}),null);
 assert.equal(validateVendorSubmission({...valid,evidenceUrl:''}),null);
 assert.equal(validateVendorSubmission({...valid,requestType:'approve'}),null);
});
test('all publisher links are genuine curated HTTPS entries',async()=>{
 const src=await read('lib/official-platform-links.ts');
 const ts=await read('app/product-access-links.tsx');
 assert.ok(src.includes('https://chatgpt.com/download/'));
 assert.ok(src.includes('https://claude.com/download'));
 assert.ok(src.includes('https://ollama.com/download'));
 assert.ok(ts.includes('platformLinks(platform.id)'));
 assert.ok(ts.includes('verified.map('));
});
test('both homepage and product detail give free vendor correction entry',async()=>{
 const home=await read('app/market-workbench.tsx');
 const form=await read('app/vendor/claim/page.tsx');
 const api=await read('app/api/vendor/submit/route.ts');
 assert.ok(home.includes('hc.vendorClaim'));
 assert.ok(home.includes('MARKET_VENDOR_TRANSLATIONS[language]'));
 assert.ok(form.includes('免费提交申请'));
 assert.ok(api.includes('INVALID_ORIGIN'));
 assert.ok(api.includes('SUBMISSION_NOT_AVAILABLE'));
 assert.ok(!api.includes("status:'approved'"));
});
