import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("PayPal merchant review About page shows real products in all nine languages",()=>{
 const page=read("app/about/page.tsx");
 const about=read("components/AboutBusinessClient.tsx");
 for(const locale of ["zh","en","ja","ko","fr","de","es","pt","ar"])
  assert.match(about,new RegExp('\\b'+locale+':\\s*\\{'));
 for(const route of ["/tools/pass","/sasi/marketplace","/siai","/terms","/refunds","/privacy"])
  assert.ok(about.includes(route),"missing public business route "+route);
 assert.ok(about.includes("support@lingxifield.com"));
 assert.ok(about.includes("dir={lang===\"ar\"?\"rtl\":\"ltr\"}"));
 assert.doesNotMatch(about,/已经完成真实支付|Guaranteed returns|支付成功率100%|模拟订单/);
 assert.doesNotMatch(page,/短剧|导演|SASI 创作与构建/);
 assert.match(page,/metadata:Metadata/);
 assert.match(page,/AboutBusinessClient/);
});
