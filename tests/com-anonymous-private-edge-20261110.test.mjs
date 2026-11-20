import {test} from 'node:test';
import assert from 'node:assert/strict';
import {anonymousPrivateApi} from '../scripts/cloudflare/anonymous-private-api.mjs';
const req=(path,init)=>new Request('https://lingxifield.com'+path,init);
test('sessionless private reads fail closed without executing the application',async()=>{
 for(const path of ['/api/money/summary','/api/sasi/account','/api/sasi/marketplace/seller','/api/sasi/marketplace/my-orders']){
  const r=anonymousPrivateApi(req(path)); assert.equal(r.status,401);
  assert.match(r.headers.get('cache-control'),/no-store/);
  assert.deepEqual(await r.json(),{error:'UNAUTHORIZED'});
 }
});
test('all supplied credentials including invalid ones still require server verification',()=>{
 for(const headers of [{cookie:'sb-example-auth-token=invalid'}, {cookie:'sb-example-auth-token.0=chunk'}, {authorization:'Bearer invalid'}, {authorization:''}])
  assert.equal(anonymousPrivateApi(req('/api/money/summary',{headers})),null);
 assert.equal(anonymousPrivateApi(req('/api/money/summary',{headers:{cookie:'theme=light'}})).status,401);
});
test('public paths and writes are untouched; HEAD contains no response body',async()=>{
 assert.equal(anonymousPrivateApi(req('/api/sasi/marketplace/listings')),null);
 assert.equal(anonymousPrivateApi(req('/api/sasi/marketplace/seller',{method:'POST'})),null);
 const r=anonymousPrivateApi(req('/api/money/summary',{method:'HEAD'}));assert.equal(r.status,401);assert.equal(await r.text(),'');
});
