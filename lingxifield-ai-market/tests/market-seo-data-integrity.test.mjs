import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('no fabricated SEO/GEO grades, trend percentages or rating scores in the source catalog',()=>{
 const source=read('lib/data.ts');
 assert.doesNotMatch(source,/seo:'\d+'/);
 assert.doesNotMatch(source,/geo:'\d+'/);
 assert.doesNotMatch(source,/trend:\d+(\.\d+)?/);
 assert.doesNotMatch(source,/score:\d+(\.\d+)?/);
 const repo=read('lib/platform-repository.ts');
 assert.match(repo,/visits:'',downloads:'',seo:'',geo:''/);
 assert.match(repo,/score:null,trend:null/);
 assert.doesNotMatch(repo,/seo:\s*['"][0-9]/);
 assert.doesNotMatch(repo,/geo:\s*['"][0-9]/);
});
test('Search Console own-site analytics must not be reported as independent competitor rankings',()=>{
 const obs=read('lib/seo-geo-observations.ts'),api=read('app/api/v1/seo-geo/route.ts');
 assert.ok(obs.includes("Independent SEO and GEO evidence cannot be inferred from a catalog listing."));
 assert.ok(obs.includes("Search Console only measures LINGXIFIELD's own pages"));
 assert.ok(api.includes("groupedSeoGeo()"));
 assert.ok(api.includes("coverageForSeoGeo()"));
});
