import test from "node:test";
import assert from "node:assert/strict";
import {isVendorSameOrigin} from "../../lingxifield-ai-market/lib/vendor-same-origin.mjs";
function req(url,headers){return {url,headers:new Headers(headers)}}
test("real browser same-origin Host survives Next.js internal host normalization",()=>{
 const url="http://localhost:3000/api/vendor/submit";
 assert.equal(isVendorSameOrigin(req(url,{"host":"127.0.0.1:3000","origin":"http://127.0.0.1:3000","sec-fetch-site":"same-origin"})),true);
});
test("production HTTPS custom domains allow exact same-origin post",()=>{
 assert.equal(isVendorSameOrigin(req("http://localhost:3000/api/vendor/submit",{"host":"lingxifield.com","origin":"https://lingxifield.com","sec-fetch-site":"same-origin"})),true);
 assert.equal(isVendorSameOrigin(req("http://localhost:3000/api/vendor/submit",{"host":"globalsiai.cn","origin":"https://globalsiai.cn"})),true);
});
test("rejects forged cross-origin host even with valid local internal URL",()=>{
 const url="http://localhost:3000/api/vendor/submit";
 assert.equal(isVendorSameOrigin(req(url,{"host":"127.0.0.1:3000","origin":"https://untrusted.example"})),false);
 assert.equal(isVendorSameOrigin(req(url,{"host":"lingxifield.com","origin":"https://evil.example","x-forwarded-host":"evil.example"})),false);
});
test("rejects Fetch Metadata cross-site even with forged Origin and Host",()=>{
 const url="https://lingxifield.com/api/vendor/submit";
 assert.equal(isVendorSameOrigin(req(url,{"host":"lingxifield.com","origin":"https://lingxifield.com","sec-fetch-site":"cross-site"})),false);
 assert.equal(isVendorSameOrigin(req(url,{"host":"lingxifield.com","origin":"https://lingxifield.com","sec-fetch-site":"same-site"})),false);
});
test("rejects absent/null/unsafe Origin, ports and URL path smuggling",()=>{
 const url="https://lingxifield.com/api/vendor/submit";
 for(const origin of [null,"null","https://lingxifield.com.evil.test","https://lingxifield.com/claim","https://lingxifield.com?x=1","http://lingxifield.com","https://lingxifield.com:444","https://user@lingxifield.com"]){
  const headers={"host":"lingxifield.com",...(origin===null?{}:{origin})};
  assert.equal(isVendorSameOrigin(req(url,headers)),false,origin||"missing");
 }
});
test("localhost and IPv6 loopback use HTTP only with matching Host",()=>{
 const url="http://localhost:3000/api/vendor/submit";
 assert.equal(isVendorSameOrigin(req(url,{"host":"localhost:3000","origin":"http://localhost:3000"})),true);
 assert.equal(isVendorSameOrigin(req(url,{"host":"[::1]:3000","origin":"http://[::1]:3000"})),true);
 assert.equal(isVendorSameOrigin(req(url,{"host":"http.example","origin":"http://http.example"})),false);
});
