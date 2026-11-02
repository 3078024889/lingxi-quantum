import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeHome,languages} from '../scripts/verify-public-seo.mjs';

const page=(lang,dir,robots,extras='')=>`<!doctype html><html lang="${lang}" dir="${dir}"><head><meta name="robots" content="${robots}"/>${extras}</head><body><main>LINGXIFIELD</main></body></html>`;
test('public SEO probe protects nine-language nonindex previews and RTL',()=>{
 assert.equal(languages.length,9);
 for(const l of languages){
  const issues=analyzeHome(page(l==='zh'?'zh-CN':l,l==='ar'?'rtl':'ltr','noindex,nofollow'),l);
  assert.deepEqual(issues,[],l);
 }
 assert.ok(analyzeHome(page('zh-CN','ltr','index,follow'),'zh').includes('PREVIEW_MUST_BE_NOINDEX'));
 assert.ok(analyzeHome(page('zh-CN','ltr','noindex'),'ar').includes('ROOT_LANG_MISMATCH'));
 assert.ok(analyzeHome(page('ar','ltr','noindex'),'ar').includes('ROOT_DIRECTION_MISMATCH'));
});
test('production SEO probe requires index, correct canonical, hreflang',()=>{
 const origin='https://ai.lingxifield.com';
 const good=page('en','ltr','index,follow',`<link rel="canonical" href="${origin}/en/ai"/><link rel="alternate" hreflang="en" href="${origin}/en/ai"/>`);
 assert.deepEqual(analyzeHome(good,'en',{indexed:true,canonicalOrigin:origin}),[]);
 assert.ok(analyzeHome(page('en','ltr','noindex'),'en',{indexed:true,canonicalOrigin:origin}).includes('NOINDEX_ON_PUBLISHED_PAGE'));
 assert.ok(analyzeHome(page('en','ltr','index'),'en',{indexed:true,canonicalOrigin:origin}).includes('CANONICAL_MISSING_OR_WRONG'));
 assert.ok(analyzeHome(page('en','ltr','index',`<link rel="canonical" href="${origin}/en/ai"/>`),'en',{indexed:true,canonicalOrigin:origin}).includes('HREFLANG_MISSING'));
});
