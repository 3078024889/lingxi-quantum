import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('eleven decision columns always visible, no accordion duplication',async()=>{
 const row=await read('app/market-matrix-row.tsx');
 const home=await read('app/market-workbench.tsx');
 assert.match(row,/export const V36_COL_COUNT=11/);
 assert.equal((row.match(/<td\b/g)||[]).length,11);
 assert.doesNotMatch(row,/setExpanded|marketOverviewDetailsRow|marketOverviewDetailsCompact/);
 assert.match(home,/marketRowTitles\(language\)\.map/);
 assert.match(home,/marketV36FilterChips/);
 assert.match(home,/filter:marketFilter,payment:paymentFilter,sort:marketSort,region/);
});
test('short film capabilities are source-linked, not guessed from marketing rankings',async()=>{
 const s=await read('lib/market-v36-screening.ts');
 for(const id of ['kling','jimeng','runway','luma'])assert.match(s,new RegExp(' '+id+':'));
 assert.match(s,/No verified film capability/);
 assert.match(s,/not independent quality or cost testing/i);
 assert.match(s,/Boolean\(shortDramaEvidence\(p\.id\)\)/);
 assert.doesNotMatch(s,/fakeRating|fabricatedScore|5\.0 stars/);
});
test('all nine locales provide filters and eleven product headings',async()=>{
 const filters=await read('lib/market-v36-screening.ts');
 const headings=await read('app/market-matrix-row.tsx');
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.match(filters,new RegExp('\\b'+lang+':\\{filters:'));
  assert.match(headings,new RegExp('\\b'+lang+':\\['));
 }
 assert.match(headings,/shortDramaEvidence\(p\.id\)/);
 assert.match(headings,/globalRegionFact\(p\.id,region\)/);
 assert.match(headings,/region==='GLOBAL'\?regionCopy\(language\)\.global/);
});
test('new reviews really auto-publish when server-signed SQL classifier approves; guest cannot approve directly',async()=>{
 const sql=await read('../supabase/migrations/20261030214500_ai_market_auto_publish.sql');
 const api=await read('app/api/v1/feedback/route.ts');
 const view=await read('app/visitor-feedback.tsx');
 assert.match(sql,/private\.ai_market_feedback_auto_safe\(v_body,v_nick\)/);
 assert.match(sql,/case when v_auto then 'approved' else 'pending' end/);
 assert.match(sql,/grant execute on function public\.ai_market_submit_visitor_feedback\(jsonb,text\) to anon,authenticated/);
 assert.match(sql,/v_expected<>p_signature/);
 assert.match(sql,/FEEDBACK_RATE_LIMITED/);
 assert.match(sql,/revoke all on function private\.ai_market_feedback_auto_safe\(text,text\) from public,anon,authenticated/);
 assert.match(api,/published:saved\.published===true/);
 assert.match(api,/'Cache-Control':'private, no-store'/);
 assert.match(view,/result\.published\?t\.published:t\.pending/);
 assert.match(view,/setItems\(Array\.isArray\(data\?\.items\)\?data\.items:\[\]\)/);
});
test('visitor region is independent of site language and user selection overrides geo guess',async()=>{
 const api=await read('app/api/v1/visitor-region/route.ts');
 const home=await read('app/market-workbench.tsx');
 assert.match(api,/x-vercel-ip-country/);
 assert.match(home,/lingxifield_market_selected_country/);
 assert.match(home,/setRegion\(current=>current==='GLOBAL'/);
 assert.doesNotMatch(api,/precise|latitude.*longitude/);
});
