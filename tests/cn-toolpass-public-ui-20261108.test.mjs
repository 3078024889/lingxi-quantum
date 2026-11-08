import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("four priced offers with one buyer entry per card",()=>{
 const page=read("app/tools/pass/page.tsx");
 const catalog=read("lib/tools/commerce/all-tools-pass.ts");
 assert.match(page,/ALL_TOOLS_PASS_CATALOG\.map\(\(offer,i\)/);
 assert.match(page,/onClick=\{\(\)=>openOffer\(offer\)\}/);
 assert.doesNotMatch(page,/微信／支付宝直接购买|PayPal 直接购买/);
 assert.match(page,/100\+ 实用工具，一次开通/);
 for(const [days,price] of [[7,29],[30,99],[90,269],[365,899]]){
  assert.match(catalog,new RegExp("days:"+days+",price:"+price));
 }
 const jsx=page.split("type Currency=")[1];
 assert.doesNotMatch(jsx,/每个账户、每个 IP|IP 双重计次|处于上线验收/);
});

test("plan choice always leads to an explicit payment choice and preserved consent",()=>{
 const page=read("app/tools/pass/page.tsx");
 const api=read("app/api/tools/pass/route.ts");
 const provider=read("app/api/pay/providers/route.ts");
 assert.match(page,/method===\"wechat\"\|\|method===\"alipay\"/);
 assert.match(page,/method===\"paypal\"/);
 assert.match(page,/method===\"wallet\"/);
 assert.match(page,/selectedChoice\?\.ready/);
 assert.match(page,/role="dialog" aria-modal="true"/);
 assert.match(page,/credentials:"same-origin"/);
 assert.match(page,/productId:selected\.sku/);
 assert.match(page,/requestId:id/);
 assert.match(api,/TOOL_PASS_COMMERCE_READY/);
 assert.match(api,/isSameOriginMutation/);
 assert.match(provider,/wechat,alipay,paypal/);
 const checkout=read("app/checkout/page.tsx");
 assert.match(checkout,/params\.get\("method"\)===\"alipay\"/);
});

test("free-use guard is in API/DB and upgrade prompt, not pricing cards",()=>{
 const api=read("app/api/tools/access/route.ts");
 const sql=read("supabase/migrations/20261105193000_one_free_tool_use_and_all_tools_pass.sql");
 const messages=read("lib/tools/commerce/tool-start-client.ts");
 assert.match(api,/trustedClientIp/);
 assert.match(api,/lingxi_claim_tool_use/);
 assert.match(sql,/v_account_count>=1 or v_ip_count>=1/);
 assert.match(sql,/p_units<>1/);
 assert.match(sql,/Asia\/Shanghai/);
 assert.match(messages,/今天这项工具的免费体验已用完/);
 assert.match(messages,/100\+ 实用工具随心用，新工具也包含/);
});

test("upgrade popup, ticker and archive use one published announcement feed",()=>{
 const modal=read("components/PublicUpgradeAnnouncementModal.tsx");
 const ticker=read("components/PublicAnnouncementTicker.tsx");
 const page=read("components/PublicAnnouncementsPage.tsx");
 const api=read("app/api/site-announcements/route.ts");
 const layout=read("app/layout.tsx");
 assert.match(modal,/fetch\("\/api\/site-announcements"/);
 assert.match(modal,/web-cn-upgrade-20261108/);
 assert.match(modal,/localStorage\.setItem\(storageKey,"closed"\)/);
 assert.match(modal,/aria-modal="true"/);
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])
   assert.match(modal,new RegExp(" "+lang+":"));
 assert.match(ticker,/fetch\("\/api\/site-announcements"/);
 assert.match(page,/fetch\("\/api\/site-announcements"/);
 assert.match(api,/\.eq\("is_active",true\)/);
 assert.match(layout,/<PublicUpgradeAnnouncementModal \/>/);
});
