import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
const read=name=>fs.readFileSync(name);
const source=name=>read(name).toString("utf8");
const web="public/og-lingxifield-20261105.jpg";
const mini="miniapp/assets/share-lingxifield-20261105.jpg";
const OLD=["public/og-lingxifield-20260928.png","miniapp/assets/share-lingxifield-20260928.png"];
const runtime=[
 "lib/share-image.ts","app/layout.tsx","app/siai/page.tsx",
 "app/[locale]/siai/page.tsx","lib/seo/page-metadata.ts",
 "miniapp/utils/share.js","miniapp/pages/share/index.js"
];
const scanDir="miniapp/pages";
function walk(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(dir+"/"+x.name):[dir+"/"+x.name]).filter(x=>/\.js$/.test(x));
}
test("both official share images are the exact same compressed artwork",()=>{
 assert(fs.existsSync(web));assert(fs.existsSync(mini));
 const a=read(web),c=read(mini);
 assert(a.equals(c),"website and mini-program cards must be identical");
 assert.equal(crypto.createHash("sha256").update(a).digest("hex"),"27bcfe7639d8a9871458cfcf29a30ba01e3e012896612a99a56957287fb59e30");
 assert(a.length>100_000&&a.length<250_000, "optimize both website and mini-program assets");
 assert.equal(a[0],0xff);assert.equal(a[1],0xd8);
 assert.equal(a[a.length-2],0xff);assert.equal(a[a.length-1],0xd9);
});
test("retired 20260928 share bitmaps cannot be served or bundled",()=>{
 for(const path of OLD) assert(!fs.existsSync(path),path+" must have been removed");
 for(const p of [...runtime,...walk(scanDir)])
  assert(!source(p).includes("share-lingxifield-20260928.png")&&!source(p).includes("og-lingxifield-20260928.png"),p+" still references retired artwork");
});
test("root OG, localized SIAI, Twitter and mini-program routes share one image identity",()=>{
 const lib=source("lib/share-image.ts"),root=source("app/layout.tsx");
 assert(lib.includes("/og-lingxifield-20261105.jpg"));
 assert(lib.includes("width: 1200, height: 630"));
 assert(root.includes("images:SHARE_IMAGES"));
 assert(root.includes("images:[SHARE_IMAGE_URL]"));
 for(const p of ["app/siai/page.tsx","app/[locale]/siai/page.tsx"]) {
  const text=source(p);assert(text.includes("images:SHARE_IMAGES"),p+" OG missing");
  assert(text.includes("images:[SHARE_IMAGE_URL]"),p+" Twitter missing");
 }
 const utility=source("miniapp/utils/share.js"),entry=source("miniapp/pages/share/index.js");
 assert(utility.includes('SHARE_IMAGE = "/assets/share-lingxifield-20261105.jpg"'));
 assert(entry.includes("imageUrl:SHARE_IMAGE"));
 assert(source("miniapp/pages/portal/index.js").includes("share.appMessage"));
 assert(source("miniapp/pages/web/index.js").includes("return appMessage("));
});
