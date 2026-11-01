import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateVisitorFeedback,pickStarNickname,FEEDBACK_LOCALES} from '../lib/visitor-feedback.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('nine-language free text, custom names, actual post only (never fake user reviews)',()=>{
 assert.deepEqual(FEEDBACK_LOCALES,['zh','en','ja','ko','fr','de','es','pt','ar']);
 for(const locale of FEEDBACK_LOCALES)assert.ok(pickStarNickname(locale).length>1);
 assert.equal(validateVisitorFeedback({category:'site_experience',locale:'zh',body:'我在这里找到了适合的视频工具，希望改善移动端搜索体验。',nickname:'织女星河'}).nickname,'织女星河');
 assert.equal(validateVisitorFeedback({category:'site_experience',locale:'zh',body:'我在这里找到了适合的视频工具，希望改善移动端搜索体验。',nickname:''}).nickname.length>1,true);
 assert.equal(validateVisitorFeedback({category:'tool_experience',locale:'en',body:'Runway exported my video with unusual timing, please fix it.'}),null);
 assert.equal(validateVisitorFeedback({category:'site_experience',locale:'en',body:'short'}),null);
 assert.equal(validateVisitorFeedback({category:'bug',locale:'en',body:'A link is broken at https://a.com https://b.com https://c.com',nickname:''}),null);
});

test('visitor API uses only guarded signed server RPC; no guest identity, no unrestricted table write',async()=>{
 const api=await read('app/api/v1/feedback/route.ts');
 for(const token of ['INVALID_ORIGIN','AI_MARKET_FEEDBACK_HMAC_KEY','createHmac','randomBytes','AbortSignal.timeout','validateVisitorFeedback','ai_market_submit_visitor_feedback','status','eq.approved'])assert.ok(api.includes(token),token);
 assert.ok(api.includes("if(parsed.productId&&!findPlatform(parsed.productId))"));
 assert.doesNotMatch(api,/service_role|SUPABASE_SERVICE_ROLE_KEY/);
 assert.doesNotMatch(api,/NEXT_PUBLIC_FEEDBACK_HMAC_KEY/);
 assert.match(api,/\^\[a-f0-9\]\{64\}\$/);
 assert.match(api,/x-vercel-forwarded-for/);
 assert.match(api,/x-nf-client-connection-ip/);
 assert.match(api,/isIP\(ip\)/);
 assert.doesNotMatch(api,/x-forwarded-for/);
 const migration=await read('../supabase/migrations/20261030180000_ai_market_public_feedback.sql');
 const hardened=await read('../supabase/migrations/20261101_ai_market_feedback_constant_time_hmac.sql');
 for(const word of ['enable row level security','revoke all on public.ai_market_visitor_feedback','security definer','revoke all on function','grant execute','visitor_hash','request_nonce',"status='approved'"])assert.ok(migration.includes(word),word);
 assert.doesNotMatch(migration,/grant (insert|update|delete) on public.ai_market_visitor_feedback to anon/i);
 assert.match(hardened,/for v_i in 1\.\.64 loop/i);
 assert.match(hardened,/ascii\(pg_catalog\.substr\(v_expected,v_i,1\)\)/i);
 assert.match(hardened,/v_diff<>0/);
 assert.doesNotMatch(hardened,/if v_expected\s*<>\s*p_signature/i);
});

test('nine-language form is wired to actual homepage and product detail',async()=>{
 const home=await read('app/market-workbench.tsx');
 const ui=await read('app/visitor-feedback.tsx');
 const dictionary=await read('lib/visitor-feedback-i18n.ts');
 assert.match(home,/<VisitorFeedback language=\{language\} productId=\{target\?\.id\}\/>/);
 assert.match(ui,/fetch\('\/api\/v1\/feedback'/);
 assert.match(ui,/type="submit"/);
 assert.match(ui,/result\.published\?t\.published:t\.pending/);
 assert.match(ui,/Array\.isArray\(data\?\.items\)/);
 for(const lang of FEEDBACK_LOCALES)assert.ok(dictionary.includes(' '+lang+':{title:'),lang);
 assert.doesNotMatch(ui,/sampleReview|mockReviews|fakeComments/);
});

test('ChatGPT and Claude country lists are explicit and do not automatically include mainland China',async()=>{
 const data=await read('lib/official-country-lists.ts'),region=await read('lib/global-region-market.ts');
 const strings=[...data.matchAll(/countries:parse\('([A-Z ]+)'\)/g)].map(m=>m[1].split(' ')).filter(codes=>codes.length>=145);
 assert.equal(strings.length,2);
 assert.ok(strings[0].length>=160,'ChatGPT countries: source snapshot required');
 assert.ok(strings[1].length>=145,'Claude countries: source snapshot required');
 for(const codes of strings){assert.ok(!codes.includes('CN'));assert.ok(codes.includes('US'));assert.ok(codes.includes('JP'));assert.ok(codes.includes('SG'));}
 assert.match(region,/officialCountrySnapshot\(id\)/);
 assert.match(region,/officialSupportCountries\(id\)/);
 assert.match(region,/midjourney:\{countries/);
 assert.match(region,/PayPal NOT accepted/);
});
