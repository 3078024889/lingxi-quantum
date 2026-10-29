import test from 'node:test';import assert from 'node:assert/strict';import{normalizeLiveHub,getLiveHub}from'./live-hub.mjs';
test('official public records mapped accurately',()=>assert.equal(normalizeLiveHub([{id:'org/model'}],'models')[0].officialUrl,'https://huggingface.co/org/model'));
test('private models not exposed',()=>assert.equal(normalizeLiveHub([{id:'org/private',private:true}],'models').length,0));
test('invalid malformed IDs rejected',()=>assert.equal(normalizeLiveHub([{id:'../secret'}],'models').length,0));
test('official feed never labeled independent ranking',async()=>{
 const v=await getLiveHub('models',{fetcher:async()=>({ok:true,json:async()=>[{id:'team/model'}]})});
 assert.equal(v.isRanking,false);assert.equal(v.records[0].verification,'public_repository_not_verified_product');
});
test('upstream error is not masked as empty verified result',async()=>await assert.rejects(getLiveHub('models',{fetcher:async()=>({ok:false,status:429})}),/UPSTREAM_429/));
test('kind allowlist blocks SSRF',async()=>await assert.rejects(getLiveHub('https://evil.example'),/INVALID_KIND/));

test('official Hub search forwards bounded keyword without changing source',async()=>{
 let url='';
 const feed=await getLiveHub('spaces',{search:'video subtitle',fetcher:async u=>{url=String(u);return {ok:true,json:async()=>[{id:'owner/subtitles'}]};}});
 assert.equal(new URL(url).searchParams.get('search'),'video subtitle');
 assert.equal(feed.records[0].verification,'public_repository_not_verified_product');
 assert.equal(feed.isRanking,false);
});
test('reject control characters and oversized queries',async()=>{
 await assert.rejects(getLiveHub('models',{search:'a\\u0000b'}),/INVALID_SEARCH/);
 await assert.rejects(getLiveHub('models',{search:'a'.repeat(101)}),/INVALID_SEARCH/);
});
