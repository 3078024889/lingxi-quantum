import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3042';
const image='og-lingxifield-20261115.jpg';
for(const path of ['/','/tools/food-calorie','/en','/en/tools/text-counter','/siai','/sasi','/sasi/seller','/discoveries']) {
 const r=await fetch(base+path);assert.equal(r.status,200,path);
 const html=await r.text();
 for(const property of ['og:image','twitter:image']) {
  const tag=html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]*>`))?.[0];
  assert(tag?.includes(image),`${path} missing ${property} or has stale image`);
 }
}
const r=await fetch(`${base}/${image}`);assert.equal(r.status,200);
assert.match(r.headers.get('content-type'),/image\/jpeg/);
const share=fs.readFileSync('miniapp/utils/share.js','utf8');
assert(share.includes('/assets/share-lingxifield-20261115.jpg'));
assert(!fs.existsSync('public/og-lingxifield-20261113.jpg'));
assert(!fs.existsSync('miniapp/assets/share-lingxifield-20261105.jpg'));
console.log('20261115 OG + MINI SHARE METADATA PASS');
