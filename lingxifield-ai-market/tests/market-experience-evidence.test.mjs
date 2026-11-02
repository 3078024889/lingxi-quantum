import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const entries=JSON.parse(read('data/user-experiences.json'));

test('user experiences have dated individual source links, not invented review scores or universal claims',()=>{
 assert.ok(entries.length>=5);
 const ids=new Set();
 for(const e of entries){
  assert.ok(!ids.has(e.id)); ids.add(e.id);
  assert.match(e.sourceUrl,/^https:\/\/www\.reddit\.com\/r\/[A-Za-z0-9_]+\/comments\/[a-z0-9]+\//);
  assert.match(e.publishedOn,/^20\d{2}-\d{2}-\d{2}$/);
  assert.ok(Date.parse(e.publishedOn)<=Date.parse('2026-11-02'));
  assert.equal(e.kind,'reddit_firsthand_report');
  assert.equal(e.status,'verified');
  assert.ok(e.summary.length>25&&e.summaryEn?.length>25);
  assert.ok(!Object.hasOwn(e,'rating')&&!Object.hasOwn(e,'score')&&!Object.hasOwn(e,'rank'));
  assert.equal(e.region,'unspecified');
 }
});
test('nine-language reader provides English fallback outside Chinese instead of mixing unreviewed Chinese into SEO',()=>{
 const src=read('app/api/v1/experiences/route.ts');
 assert.match(src,/\['zh','en','ja','ko','fr','de','es','pt','ar'\]/);
 assert.ok(src.includes('summaryEn||x.summary'));
 assert.ok(src.includes('original experiences were not reproduced'));
});
