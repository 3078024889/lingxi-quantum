import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
test('preview cannot index; production launch requires explicitly verified owned HTTPS market domain',()=>{
 const source=read('lib/market-index-policy.ts');
 const layout=read('app/layout.tsx');
 const robots=read('app/robots.ts');
 assert.ok(source.includes('AI_MARKET_INDEX_READY'));
 assert.ok(source.includes('AI_MARKET_DOMAIN_VERIFIED'));
 assert.ok(source.includes('AI_MARKET_CANONICAL_ORIGIN'));
 assert.ok(source.includes("process.env.VERCEL_ENV!=='preview'"));
 for(const domain of ['ai.lingxifield.com','ai.lingxifield.cn','market.lingxifield.com','market.lingxifield.cn'])
  assert.ok(source.includes(domain));
 assert.ok(source.includes("u.protocol!=='https:'"));
 assert.ok(source.includes("u.username||u.password||u.port||u.pathname!=='/'"));
 assert.ok(layout.includes('metadataBase:new URL(marketCanonicalOrigin)'));
 assert.ok(robots.includes("if(!mayIndexMarket())"));
});
test('locales and multilingual product sitemap remain strict allowlist, never indexed automatically',()=>{
 const policy=read('lib/market-index-policy.ts');
 const sitemap=read('app/sitemap.ts');
 const detail=read('app/[lang]/platform/[id]/page.tsx');
 assert.ok(policy.includes("marketLocales=['zh','en','ja','ko','fr','de','es','pt','ar']"));
 assert.ok(policy.includes('AI_MARKET_INDEXED_LOCALES'));
 assert.ok(sitemap.includes('indexableMarketLocales()'));
 assert.ok(sitemap.includes('marketCanonicalOrigin'));
 assert.ok(detail.includes('marketCanonicalOrigin'));
});
