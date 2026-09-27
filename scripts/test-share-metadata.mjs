import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3042';
const image='og-lingxifield-20260928.png';
for(const path of ['/','/tools/food-calorie','/en','/en/tools/text-counter','/paypal']) {
 const r=await fetch(base+path);assert.equal(r.status,200,path);
 const html=await r.text();
 for(const property of ['og:image','twitter:image']) {
  const tag=html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]*>`))?.[0];
  assert(tag?.includes(image),`${path} missing ${property}`);
 }
}
const r=await fetch(`${base}/${image}`);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/image\/png/);
assert(fs.readFileSync(`public/${image}`).equals(fs.readFileSync('miniapp/assets/share-lingxifield-20260928.png')));
assert(!fs.existsSync('public/og-lingxifield-20260927.png'));
assert(!fs.existsSync('miniapp/assets/share-lingxifield-20260927.png'));
console.log('SHARE_METADATA_AND_MINI_ASSET_PASS');
