import assert from "node:assert/strict";
import worker from "../workers/com-admin-facade/src/index.mjs";
const req=(path,opts={})=>new Request("https://lingxifield.com"+path,opts);
const bad=await worker.fetch(req("/api/pay/wechat/create"));
assert.equal(bad.status,404,"no gateway/payment data through admin facade");
assert.equal((await worker.fetch(req("/api/account/money-admin",{method:"DELETE"}))).status,405);
assert.equal((await worker.fetch(req("/api/account/money-admin",{method:"POST",headers:{"origin":"https://attacker.example","content-type":"application/json"},body:"{}"}))).status,403);
assert.equal((await worker.fetch(req("/api/account/money-admin",{method:"POST",headers:{"origin":"https://lingxifield.com","content-type":"text/plain"},body:"x"}))).status,415);
const cookieSafety=await worker.fetch(req("/api/account/money-admin/access",{headers:{"Cookie":"my-private-token=do-not-proxy"}}));
assert.ok([200,403,502,503].includes(cookieSafety.status));
const fetchOriginal=globalThis.fetch;
const captures=[];
globalThis.fetch=async(url,options)=>{
 captures.push({url,options});
 return new Response('{"isAdmin":false}',{status:200,headers:{"content-type":"application/json","set-cookie":"session=evil; Domain=lingxifield.cn"}});
};
try{
 const res=await worker.fetch(req("/api/account/money-admin/access",{headers:{"Cookie":"sb-project-auth-token=opaque; path=/","Authorization":"Bearer attacker"}}));
 assert.equal(res.status,200);assert.equal(res.headers.get("set-cookie"),null);
 assert.equal(captures[0].url,"https://lingxifield.cn/api/account/money-admin/access");
 assert.equal(captures[0].options.headers.get("cookie"),"sb-project-auth-token=opaque");
 assert.equal(captures[0].options.headers.get("authorization"),null);
 const write=await worker.fetch(req("/api/account/money-admin",{method:"POST",headers:{"origin":"https://lingxifield.com","content-type":"application/json","Cookie":"sid=cookie"},body:'{"action":"retry"}'}));
 assert.equal(write.status,200);
 assert.equal(captures[1].options.headers.get("origin"),"https://lingxifield.cn");
 assert.equal(captures[1].options.headers.get("cookie"),"sid=cookie");
 const news=await worker.fetch(req("/api/site-announcements"));
 assert.equal(news.status,200);
 assert.equal(captures[2].url,"https://lingxifield.cn/api/site-announcements");
 const oversized=await worker.fetch(req("/api/account/money-admin",{method:"POST",headers:{"origin":"https://lingxifield.com","content-type":"application/json"},body:"x".repeat(16385)}));
 assert.equal(oversized.status,413);

}finally{globalThis.fetch=fetchOriginal}
console.log("COM_MONEY_ADMIN_SAME_ORIGIN_COOKIE_PROXY_SECURITY_CONTRACT_PASS");
