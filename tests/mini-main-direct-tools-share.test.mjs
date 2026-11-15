import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import vm from "node:vm";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

function loadNativePage(path,wx){
  let page;
  vm.runInNewContext(read(path),{
    Page:definition=>{page=definition;},
    wx,console,
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
  const calls={to:[],redirects:[],shareMenu:[]};
  return {calls,getStorageSync:()=>"",
    showShareMenu:value=>calls.shareMenu.push(value||{}),
    navigateTo:({url})=>calls.to.push(url),
    redirectTo:({url})=>calls.redirects.push(url),
    showModal:()=>{},showToast:()=>{},removeStorageSync:()=>{},
  };
}

test("main mini-program launches directly to the website homepage without the legacy portal",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.equal(app.pages[0],"pages/web/index");
 assert.equal(app.entryPagePath,undefined);
 assert(!app.pages.includes("pages/portal/index"));
 assert.equal(app.tabBar,undefined,"no duplicate native bottom tab");
 assert(!existsSync(new URL("../miniapp/pages/portal",import.meta.url)),"legacy portal source directory must be deleted");
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 page.onLoad({});
 assert.equal(page.data.path,"/");
 assert.equal(page.data.src,"https://lingxifield.cn/?mini=1&ads=0&currency=CNY");
 assert(wx.calls.shareMenu.length>0);
 assert.deepEqual(Array.from(wx.calls.shareMenu[0].menus),["shareAppMessage"]);
 const webConfig=JSON.parse(read("miniapp/pages/web/index.json"));
 assert.equal(webConfig.enableShareAppMessage,true);
 assert.equal(webConfig.enableShareTimeline,undefined,"web-view page must not advertise unsupported timeline sharing");
 assert.equal(typeof page.onShareTimeline,"undefined");
 page.openNativeShare();
 assert.match(wx.calls.to[0],/^\/pages\/share\/index\?path=%2F&title=/);
 assert.match(read("miniapp/pages/web/index.wxml"),/cover-view[\s\S]*bindtap="openNativeShare"/);
 assert.ok(read("miniapp/pages/web/index.wxml").includes("wx:if=\"{{path === '/'}}\""));
 assert.match(read("miniapp/pages/web/index.wxml"),/<web-view/);
});

test("friend sharing uses the current web-view URL and strips private query values",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 page.onLoad({path:encodeURIComponent("/")});
 const current={webViewUrl:"https://lingxifield.cn/tools/pdf-editor?mini=1&ads=0&currency=CNY&invoice=private"};
 assert.equal(page.onShareAppMessage(current).path,"/pages/web/index?path="+encodeURIComponent("/tools/pdf-editor"));
 const ranking={webViewUrl:"https://lingxifield.cn/siai?mini=1&ads=0&currency=CNY&token=secret&user=123"};
 assert.equal(page.onShareAppMessage(ranking).path,"/pages/web/index?path="+encodeURIComponent("/siai"));
 const privatePage={webViewUrl:"https://lingxifield.cn/account/orders?token=secret"};
 assert.equal(page.onShareAppMessage(privatePage).path,"/pages/web/index?path=%2F");
});

test("reject web-view path attacks and keep external URLs out of sharing",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 for(const hostile of ["//evil.example/x","https://evil.example/tools","/../../account","/bad//path"]){
   page.onLoad({path:encodeURIComponent(hostile)});
   assert.equal(page.data.failed,true,hostile);
 }
});

test("native share page handles friend and timeline sharing without web-view",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/share/index.js",wx);
 page.onLoad({path:encodeURIComponent("/siai?token=SECRET"),title:encodeURIComponent("全球SIAI排行榜")});
 assert.equal(page.data.webPath,"/siai");
 assert.equal(page.onShareAppMessage().path,"/pages/web/index?path=%2Fsiai");
 assert.equal(page.onShareTimeline().query,"path=%2Fsiai");
 assert.deepEqual(Array.from(wx.calls.shareMenu[0].menus),["shareAppMessage","shareTimeline"]);
 assert(read("miniapp/pages/share/index.wxml").includes('open-type="share"'));
 assert(!read("miniapp/pages/share/index.wxml").includes("<web-view"));
 const config=JSON.parse(read("miniapp/pages/share/index.json"));
 assert.equal(config.enableShareAppMessage,true);
 assert.equal(config.enableShareTimeline,true);
});

test("website exposes the native share entry only on active public mini-program routes",()=>{
 const c=read("components/MiniProgramShareEntry.tsx");
 const wrapper=read("components/MiniEmbedMode.tsx");
 assert(c.includes("isMiniProgramContext()"));
 assert(c.includes("openMiniShare(title)"));
 assert(c.includes("PUBLIC_ROUTE"));
 assert(c.includes("mini-native-share-entry"));
 assert(c.includes("mini-siai-quick-link"));
 assert(c.includes('const landing=(isRanking?"/tools":"/siai")'));
 assert(c.includes('route==="/siai"'));
 assert(c.includes("mini=1&ads=0&currency="));
 assert(!c.includes("ai-knowledge")&&!c.includes("ai-learning")&&!c.includes("ai-research"));
 assert(wrapper.includes("<MiniProgramShareEntry/>"));
 assert(read("lib/mini/share-client.ts").includes("/pages/share/index?path="));
});

test("main profile retains original miniapp and backend identities, no payment migration",()=>{
 const p=require("../miniapp/utils/app-profile.js");
 assert.equal(p.kind,"main");
 assert.equal(p.website,"https://lingxifield.cn");
 assert.equal(p.sessionMode,"native");
});
