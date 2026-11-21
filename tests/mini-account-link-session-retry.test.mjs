import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

test("refreshes a stale Mini Program session for linking without resending a payment", async()=>{
 const calls=[];
 const storage=new Map([["lx_mini_token","stale-session"],["lx_mini_expires","2099-01-01"]]);
 const module={exports:{}};
 const wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  login:options=>options.success({code:"synthetic-login"}),
  request:options=>{
   const path=new URL(options.url).pathname;
   const token=options.header.Authorization;
   calls.push({path,token});
   if(path.endsWith("/login"))options.success({statusCode:200,data:{token:"fresh-session",expiresAt:"2099-01-01"}});
   else if(path.endsWith("/start")&&token==="Bearer fresh-session")options.success({statusCode:200,data:{path:"/account?miniLink=synthetic"}});
   else options.success({statusCode:401,data:{error:"expired"}});
  },
 };
 vm.runInNewContext(readFileSync(new URL("../miniapp/utils/api.js",import.meta.url),"utf8"),{wx,module});
 const result=await module.exports.request("/api/wechat/mini/account-link/start",{method:"POST",data:{}});
 assert.equal(result.path,"/account?miniLink=synthetic");
 assert.deepEqual(calls.map(call=>call.path.split("/").at(-1)),["start","login","start"]);
 await assert.rejects(module.exports.request("/api/wechat/mini/cny-topup/create",{method:"POST",data:{}}),error=>error.statusCode===401);
 assert.deepEqual(calls.map(call=>call.path.split("/").at(-1)),["start","login","start","create"]);
});

