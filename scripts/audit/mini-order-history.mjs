import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let page, destination;
vm.runInNewContext(fs.readFileSync('miniapp/pages/orders/index.js','utf8'),{Page:p=>page=p,wx:{redirectTo:({url})=>destination=url},encodeURIComponent});
page.onLoad();assert.equal(destination,'/pages/web/index?path='+encodeURIComponent('/account/orders'));
assert.equal(fs.existsSync('miniapp/utils/order-history.js'),false);
console.log('PASS: legacy orders open the shared account order page; obsolete archive storage removed.');
