import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = JSON.parse(fs.readFileSync('miniapp/app.json', 'utf8'));
const sitemap = JSON.parse(fs.readFileSync(`miniapp/${app.sitemapLocation}`, 'utf8'));
const isIndexed = page => sitemap.rules.find(rule => rule.page === page || rule.page === '*')?.action === 'allow';
const routes = {
  '/tools/temp-mail': '/pages/discover-temp-mail/index',
  '/tools/burn-after-read': '/pages/discover-burn-after-read/index',
  '/tools/image-watermark-remover': '/pages/discover-image-watermark-remover/index',
  '/tools/e-sign-pdf': '/pages/discover-e-sign-pdf/index',
};
let currentPage;
const navigations = [];
const wx = {
  getStorageSync: () => '', showShareMenu() {},
  navigateTo: options => navigations.push(options.url),
};
globalThis.wx = wx;
try {
  vm.runInNewContext(fs.readFileSync('miniapp/pages/tools/index.js', 'utf8'), {
    wx, Page: page => { currentPage = page; },
    require: name => require(`../../miniapp/utils/${name.split('/').at(-1)}.js`),
  });
  currentPage.setData = data => { currentPage.data = { ...currentPage.data, ...data }; };
  const { SUPPORTED } = require('../../miniapp/utils/i18n.js');
  for (const { id } of SUPPORTED) {
    currentPage.refreshLanguage(id);
    const before = currentPage.data.tools.length;
    currentPage.refreshLanguage(id);
    assert.equal(currentPage.data.tools.length, before, `Duplicate tool after refresh: ${id}`);
    for (const [tool, nativePage] of Object.entries(routes)) {
      const index = currentPage.data.tools.findIndex(item => item.path === tool);
      assert.ok(index >= 0, `Missing discovery entry: ${id} ${tool}`);
      currentPage.open({ currentTarget: { dataset: { index } } });
      assert.equal(navigations.at(-1), nativePage);
      assert.ok(app.pages.includes(nativePage.slice(1)));
      assert.ok(isIndexed(nativePage.slice(1)));
    }
  }
  currentPage.open({ currentTarget: { dataset: { index: -1 } } });
  assert.equal(navigations.at(-1), '/pages/discover-e-sign-pdf/index');
  for (const route of ['pages/home/index', 'pages/tools/index']) assert.ok(isIndexed(route));
  for (const route of ['pages/profile/index', 'pages/pay/index', 'pages/orders/index',
    'pages/balance/index', 'pages/share/index', 'pages/web/index']) {
    assert.equal(isIndexed(route), false, `Private/dynamic route indexed: ${route}`);
  }
  for (const nativePage of Object.values(routes)) {
    vm.runInNewContext(fs.readFileSync(`miniapp${nativePage}.js`, 'utf8'), {
      wx, Page: page => { currentPage = page; },
      require: name => require(`../../miniapp/utils/${name.split('/').at(-1)}.js`),
    });
    const share = currentPage.onShareAppMessage();
    assert.equal(share.path, nativePage);
    currentPage.openTool();
    assert.ok(navigations.at(-1).startsWith('/pages/web/index?path=%2Ftools%2F'));
  }
  console.log('PASS: native introductions reachable in all 9 languages; tool and share routes work without login.');
  console.log('PASS: actual sitemap rule evaluation allows public pages and excludes account/payment/dynamic pages.');
  console.log('NOTE: these tests do not verify WeChat account search eligibility or live search results.');
} finally {
  delete globalThis.wx;
}
