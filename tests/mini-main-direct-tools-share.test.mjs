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
  const calls={to:[],redirects:[],shareMenu:0};
  return {calls,
    getStorageSync:()=>"",
    showShareMenu:()=>{calls.shareMenu++},
    navigateTo:({url})=>calls.to.push(url),
    redirectTo:({url})=>calls.redirects.push(url),
    showModal:()=>{},showToast:()=>{},
  };
}

test("main mini-program boots straight to /tools web-view rather than portal",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.equal(app.entryPagePath,"pages/web/index");
 assert(app.pages.includes("pages/portal/index"),"old links remain registered");
 assert(app.pages.includes("pages/share/index"),"native sharing page remains");
 assert.equal(app.tabBar,undefined,"no duplicate native bottom tab");
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/web/index.js",wx);
 page.onLoad({});
 assert.equal(page.data.path,"/tools");
 assert.equal(page.data.src,"https://lingxifield.cn/tools?mini=1&ads=0&currency=CNY");
 assert(wx.calls.shareMenu>0);
 assert.match(read("miniapp/pages/web/index.wxml"),/<web-view/);
});

test("previously shared portal links redirect to real tools without showing old landing",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/portal/index.js",wx);
 page.onLoad({});
 assert.deepEqual(wx.calls.redirects,["/pages/web/index?path=%2Ftools"]);
});

test("native WeChat friend share preserves /tools and /siai without private query",()=>{
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

test("native share page has usable friend and timeline handlers without web-view",()=>{
 const wx=fakeWx(),page=loadNativePage("miniapp/pages/share/index.js",wx);
 page.onLoad({path:encodeURIComponent("/siai?token=SECRET"),title:encodeURIComponent("全球SIAI排行榜")});
 assert.equal(page.data.webPath,"/siai");
 assert.equal(page.onShareAppMessage().path,"/pages/web/index?path=%2Fsiai");
 assert.equal(page.onShareTimeline().query,"path=%2Fsiai");
 assert(read("miniapp/pages/share/index.wxml").includes('open-type="share"'));
 assert(!read("miniapp/pages/share/index.wxml").includes("<web-view"));
});

test("website displays real native-share entry only in mini program public routes",()=>{
 const c=read("components/MiniProgramShareEntry.tsx");
 const wrapper=read("components/MiniEmbedMode.tsx");
 assert(c.includes("isMiniProgramContext()"));
 assert(c.includes("openMiniShare(title)"));
 assert(c.includes("PUBLIC_ROUTE"));
 assert(c.includes("mini-native-share-entry"));
 assert(c.includes("mini-siai-quick-link"));
 assert(c.includes('isRanking?"/tools":"/siai"'));
 assert(c.includes("mini=1&ads=0&currency="));
 assert(wrapper.includes("<MiniProgramShareEntry/>"));
 assert(read("lib/mini/share-client.ts").includes("/pages/share/index?path="));
});

test("main profile retains original miniapp and backend identities, no payment migration",()=>{
 const p=require("../miniapp/utils/app-profile.js");
 assert.equal(p.kind,"main");
 assert.equal(p.website,"https://lingxifield.cn");
 assert.equal(p.sessionMode,"native");
});
