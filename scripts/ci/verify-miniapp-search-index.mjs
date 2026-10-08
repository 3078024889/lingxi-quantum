import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root=path.resolve("miniapp");
const app=JSON.parse(fs.readFileSync(path.join(root,"app.json"),"utf8"));
const sitemap=JSON.parse(fs.readFileSync(path.join(root,app.sitemapLocation||"sitemap.json"),"utf8"));
const config=JSON.parse(fs.readFileSync(path.join(root,"project.config.json"),"utf8"));
assert.ok(Array.isArray(app.pages)&&app.pages.length,"MINIAPP_PAGE_LIST_EMPTY");
assert.ok(config.appid&&config.appid!=="touristappid","MINIAPP_APPID_NOT_CONFIGURED");
const rules=sitemap.rules||[];
const allowed=rules.filter(x=>x.action==="allow").map(x=>x.page);
const required=["pages/home/index","pages/tools/index","pages/discover-temp-mail/index","pages/discover-burn-after-read/index","pages/discover-image-watermark-remover/index","pages/discover-e-sign-pdf/index"];
for(const page of required){
 assert.ok(app.pages.includes(page),`MINIAPP_PAGE_NOT_REGISTERED:${page}`);
 assert.ok(allowed.includes(page),`MINIAPP_PAGE_NOT_INDEXABLE:${page}`);
 for(const ext of [".js",".wxml"]) assert.ok(fs.existsSync(path.join(root,page+ext)),`MINIAPP_PAGE_FILE_MISSING:${page+ext}`);
}
assert.ok(rules.some(x=>x.page==="*"&&x.action==="disallow"),"PRIVATE_MINIAPP_PAGES_MUST_REMAIN_EXCLUDED");
console.log(`MINIAPP_INDEX_SOURCE_PASS pages=${required.length} appidConfigured=true`);
console.log("WECHAT_SEARCH_VISIBILITY_NOT_VERIFIED: sitemap permission does not guarantee WeChat indexing or ranking");
