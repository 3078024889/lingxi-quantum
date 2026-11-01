#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),ts=require("typescript");
const src=fs.readFileSync("lib/sasi/website/builder.ts","utf8");
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,URL,Error,Set,console});
const {buildStaticSite}=m.exports;
const site={projectId:"fixture",name:"Demo",goal:"An actual usable static site",locales:["en"],revision:1,features:[],brand:{name:"Demo",tone:"clear",tokens:{}},seo:{title:"Demo",description:"A & B <test>"},pages:[
 {path:"/",title:"Home",sections:[{type:"hero",heading:"Hello",body:"Usable <content>",cta:"View about",ctaHref:"/about"},{type:"feature",heading:"Unlinked CTA",cta:"Learn more"}]},
 {path:"/about",title:"About",sections:[{type:"hero",heading:"About us",cta:"Home",ctaHref:"/"},{type:"contact",heading:"Contact",cta:"Contact us",ctaHref:"mailto:hello@example.com"}]},
 {path:"/shop/item",title:"Item",sections:[{type:"hero",heading:"Item",cta:"Back home",ctaHref:"/"},{type:"feature",cta:"Open terms",ctaHref:"https://example.com/terms"}]}
]};
const result=buildStaticSite(site);
assert.equal(result.files.length,3);
const home=result.files.find(x=>x.path==="/").html,about=result.files.find(x=>x.path==="/about").html,item=result.files.find(x=>x.path==="/shop/item").html;
assert.match(home,/href="about\/index.html"/);
assert.match(about,/href="\.\.\/index.html"/);
assert.match(item,/href="\.\.\/\.\.\/index.html"/);
assert.match(home,/class="site-cta-note">Learn more<\/p>/);
assert.doesNotMatch(home,/<button\b/i,"No dead buttons");
assert.match(home,/<h1>Hello<\/h1>/);assert.match(home,/<h2>Unlinked CTA<\/h2>/);
assert.match(home,/Usable &lt;content&gt;/);assert.match(home,/A &amp; B &lt;test&gt;/);
assert.match(home,/meta name="viewport"/);assert.match(home,/max-width:1100px/);
assert.match(about,/href="mailto:hello@example.com"/);
assert.match(item,/href="https:\/\/example.com\/terms"/);
for(const href of ["javascript:alert(1)","//evil.invalid","http://example.com","ftp://example.com/a","/missing","/../admin","https://user:pass@example.com"]){
 const bad={...site,pages:site.pages.map((p,i)=>i? p:{...p,sections:[{type:"hero",heading:"Bad",cta:"Open",ctaHref:href}]})};
 assert.throws(()=>buildStaticSite(bad),/SITE_CTA_/,"Unsafe or nonexistent target "+href);
}
console.log("SASI_FUNCTIONAL_WEBSITE_GATE=PASS: offline navigation, no fake buttons, safe destinations, responsive HTML and escaped content");
