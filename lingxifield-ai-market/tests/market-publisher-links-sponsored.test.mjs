import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publisherLinkCopy,publisherLinkLabel,LINK_LOCALES} from '../lib/market-link-copy.mjs';
import {visibleSponsored} from '../lib/market-sponsored-guard.mjs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('all nine locales present official, app, repository, source and limitation labels',()=>{
 assert.deepEqual([...LINK_LOCALES].sort(),['ar','de','en','es','fr','ja','ko','pt','zh']);
 for(const lang of LINK_LOCALES){
  const c=publisherLinkCopy(lang);
  for(const key of ['official','repository','documentation','desktop','ios','android','x','news','team','github','reviews','web','aria','repoNote','docsNote'])assert.ok(c[key]?.length>=4,lang+':'+key);
  assert.equal(publisherLinkLabel('github',lang),c.github);
  assert.equal(publisherLinkLabel('repository',lang),c.repository);
 }
 assert.notEqual(publisherLinkLabel('official','zh'),publisherLinkLabel('official','ar'));
 const ui=src('app/product-access-links.tsx');
 assert.match(ui,/language='zh'/);
 assert.match(ui,/publisherLinkLabel\(link.kind,language\)/);
 assert.match(ui,/dir=\{language==='ar'\?'rtl':'ltr'\}/);
 assert.match(src('app/market-workbench.tsx'),/<ProductAccessLinks platform=\{target\} language=\{language\}/);
 assert.match(src('app/globals.css'),/\.productLinks>a\{min-height:44px/);
});
test('sponsored slots reject expired or off-catalog content and prevent duplicates without affecting organic rank',()=>{
 const now=new Date('2026-11-02T00:00:00Z');
 const item=(id,changes={})=>({project_id:id,label:'Official sponsored slot',placement:'home_feature',target_url:'https://vendor.example/product',ends_at:'2026-11-03T00:00:00Z',...changes});
 const rows=[item('runway'),item('runway'),item('kling',{ends_at:'2026-11-01T00:00:00Z'}),item('openai',{target_url:'javascript:alert(1)'}),item('suno')];
 const selected=visibleSponsored(rows,['runway','kling','suno','openai'],now);
 assert.deepEqual(selected.map(x=>x.projectId),['runway','suno']);
 assert.ok(selected.every(x=>x.sponsored===true));
 assert.deepEqual(visibleSponsored([item('runway')],[],now),[]);
 assert.deepEqual(visibleSponsored([item('runway',{target_url:'https://ok.example:8080'})],['runway'],now),[]);
 const endpoint=src('app/api/v1/sponsored/route.ts');
 assert.match(endpoint,/visibleSponsored\(rows,\[\.\.\.MARKET_API_PRODUCTS\]\)/);
 assert.match(endpoint,/ends_at','gt\.'/);
 assert.match(endpoint,/affectsOrganicRank:false/);
});

test('Runway official origin and direct creative web app are distinct approved entrypoints',()=>{
 const data=src('lib/data.ts'),links=src('lib/official-platform-links.ts');
 assert.match(data,/domain:'runway\.com'/);
 assert.match(data,/website:'https:\/\/runway\.com'/);
 assert.match(links,/url:'https:\/\/app\.runwayml\.com\/',kind:'web'/);
 assert.match(links,/reviews\|web/);
});
