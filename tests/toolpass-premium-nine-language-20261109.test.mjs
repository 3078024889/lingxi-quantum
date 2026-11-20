import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
test("premium ToolPass UI and checkout have all nine language bindings without changing real prices",()=>{
 const page=read("app/tools/pass/page.tsx");
 const copy=read("lib/tools/commerce/toolpass-premium-copy.ts");
 const catalog=read("lib/tools/commerce/all-tools-pass.ts");
 const layout=read("app/tools/pass/ToolPassPremium.module.css");
 const footer=read("app/siai-home.css");
 assert.match(layout, /\.root\{[^}]*width:100%;max-width:1500px/);
 assert.match(layout, /\.plans\{[^}]*margin:14px 0 0[^}]*gap:12px/);
 assert.match(layout, /\.plan\{[^}]*min-height:164px/);
 assert.match(layout, /\.lowerPanels\{[^}]*gap:14px;margin-top:14px/);
 assert.match(layout, /\.lowerCard\{[^}]*padding:18px/);
 assert.match(layout, /\.balanceBody\{[^}]*min-height:74px/);
 assert.match(layout, /\.noticeRow\{[^}]*padding:9px 0/);
 assert.match(footer, /\.lx-footer-v3 \.lx-footer-v3-showcase\{\s*max-width:1500px/);
 assert.match(footer, /\.lx-footer-v3 \.lx-footer-v3-sasi\{max-width:1500px/);
 assert.match(page,/toolPassUiText\(lang,/);
 assert.match(page,/COPY\[\(lang in COPY\?lang:"en"\)/);
 for(const locale of ["ja","ko","fr","de","es","pt","ar"])assert.match(copy,new RegExp("\\b"+locale+":"));
 assert.doesNotMatch(page,/zh\?"[^"]+":"[^"]+"/);
 for(const key of ["Unlock 100+ practical tools. One membership, more possibilities.","Payment methods open after merchant verification.","ToolPass membership","Balance & top up","Pay now","Try it for a week"]){
  assert.ok(copy.includes(JSON.stringify(key)),"translation "+key);
 }
 for(const [days,price] of [[7,29],[30,99],[90,269],[365,899]])assert.ok(catalog.includes(`days:${days},price:${price}`));
 assert.match(page,/\/api\/money\/summary/);
 assert.match(page,/setWalletBalanceMinor\(null\)/);
 assert.match(page,/providers\.wechat/);
 assert.match(page,/providers\.alipay/);
 assert.match(page,/providers\.paypal/);
 assert.match(page,/role="dialog"/);
 assert.match(page,/aria-modal="true"/);
});
