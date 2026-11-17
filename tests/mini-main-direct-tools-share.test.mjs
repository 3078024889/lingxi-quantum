import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

function loadNativePage(path,wx){
 let page;
 vm.runInNewContext(read(path),{
  Page:definition=>{page=definition;},wx,console,
  require:p=>{
   if(p.endsWith("share")){const mod={exports:{}};vm.runInNewContext(read("miniapp/utils/share.js"),{module:mod,exports:mod.exports,wx},{timeout:1500});return mod.exports;}
   if(p.endsWith("app-profile"))return require("../miniapp/utils/app-profile.js");
   throw Error("UNEXPECTED_REQUIRE:"+p);
  }
 },{timeout:1500});
 page.setData=patch=>{page.data={...page.data,...patch};};
 return page;
}
function fakeWx(){
 const calls={to:[],redirects:[],shareMenu:0};
 return {calls,getStorageSync:()=>"",showShareMenu:()=>{calls.shareMenu++;},
  navigateTo:({url})=>calls.to.push(url),redirectTo:({url})=>calls.redirects.push(url),
  showModal:()=>{},showToast:()=>{}};
}

test("main mini-program opens the website homepage and has no retired portal route",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.equal(app.pages[0],"pages/web/index");
 assert.ok(!app.pages.includes("pages/portal/index"));
 assert.ok(!app.pages.includes("pages/balance/index"));
 assert.ok(!app.pages.includes("pages/recharge/index"));
 assert.ok(app.pages.includes("pages/share/index"));
 assert.equal(app.tabBar,undefined);
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 page.onLoad({});
 assert.equal(page.data.path,"/");
 assert.equal(page.data.src,"https://lingxifield.cn/?mini=1&ads=0&currency=CNY");
 assert.ok(wx.calls.shareMenu>0);
 assert.match(read("miniapp/pages/web/index.wxml"),/<web-view/);
});

test("native WeChat friend and timeline shares preserve public routes without private query data",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 page.onLoad({path:encodeURIComponent("/siai?token=secret&user=123")});
 assert.equal(page.data.path,"/siai?token=secret&user=123");
 assert.equal(page.onShareAppMessage().path,"/pages/web/index?path="+encodeURIComponent("/siai"));
 assert.equal(page.onShareTimeline().query,"path="+encodeURIComponent("/siai"));
 page.onLoad({path:encodeURIComponent("/tools/pdf-editor?invoice=private")});
 assert.equal(page.onShareAppMessage().path,"/pages/web/index?path="+encodeURIComponent("/tools/pdf-editor"));
 page.onLoad({path:encodeURIComponent("/account/orders?token=SECRET")});
 assert.equal(page.onShareAppMessage().path,"/pages/web/index?path="+encodeURIComponent("/"));
});

test("reject web-view path attacks and keep external URLs out of sharing",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 for(const hostile of ["//evil.example/x","https://evil.example/tools","/../../account","/bad//path"]){
  page.onLoad({path:encodeURIComponent(hostile)});
  assert.equal(page.data.failed,true,hostile);
 }
});

test("native share page has friend and timeline handlers without web-view",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/share/index.js",wx);
 page.onLoad({path:encodeURIComponent("/siai?token=SECRET"),title:encodeURIComponent("全球SIAI排行榜")});
 assert.equal(page.data.webPath,"/siai");
 assert.equal(page.onShareAppMessage().path,"/pages/web/index?path=%2Fsiai");
 assert.equal(page.onShareTimeline().query,"path=%2Fsiai");
 assert.ok(read("miniapp/pages/share/index.wxml").includes('open-type="share"'));
 assert.ok(!read("miniapp/pages/share/index.wxml").includes("<web-view"));
});

test("website native-share entry is restricted to supported public Mini Program routes",()=>{
 const c=read("components/MiniProgramShareEntry.tsx"),wrapper=read("components/MiniEmbedMode.tsx");
 assert.ok(c.includes("isMiniProgramContext()"));
 assert.ok(c.includes("openMiniShare(title)"));
 assert.ok(c.includes("PUBLIC_ROUTE"));
 assert.ok(c.includes("mini-native-share-entry"));
 assert.ok(c.includes("mini-siai-quick-link"));
 assert.ok(c.includes('isRanking?"/tools":"/siai"'));
 assert.ok(c.includes("mini=1&ads=0&currency="));
 assert.ok(wrapper.includes("<MiniProgramShareEntry/>"));
 assert.ok(read("lib/mini/share-client.ts").includes("/pages/share/index?path="));
});

test("main Mini Program retains its original AppID and account identity",()=>{
 const p=require("../miniapp/utils/app-profile.js");
 assert.equal(p.kind,"main");
 assert.equal(p.website,"https://lingxifield.cn");
 assert.equal(p.sessionMode,"native");
});
