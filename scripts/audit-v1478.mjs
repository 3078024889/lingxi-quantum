import fs from "node:fs";
const fail=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const icon=fs.readFileSync("components/LingxiMiniIcon.tsx","utf8");
const glyph=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");
const nav=fs.readFileSync("components/Nav.tsx","utf8");
const account=fs.readFileSync("app/account/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");

c(icon.includes('pdf:{glyph:"📄",tone:"pdf",badge:"PDF"}'),"PDF uses pictogram + tiny badge");
c(icon.includes('document:{glyph:"📝",tone:"paper",badge:"TXT"}'),"TXT uses pictogram + tiny badge");
c(icon.includes('ocr:{glyph:"🔎",tone:"ocr",badge:"OCR"}'),"OCR uses pictogram + tiny badge");
c(icon.includes('excel:{glyph:"📊",tone:"green",badge:"XLS"}'),"Excel uses pictogram + tiny badge");
c(!icon.includes('glyph:"PDF",tone:"pdf"')&&!icon.includes('glyph:"TXT",tone:"paper"')&&!icon.includes('glyph:"OCR",tone:"ocr"'),"large text glyphs removed");
c(glyph.includes('"pdf-ocr":"ocr"')&&glyph.includes('"docx-to-txt":"document"'),"tool mappings preserved");
c(account.match(/lx-account-entry/g)?.length===5,"five account cards use spaced layout");
c(account.match(/size="title"/g)?.length>=5,"account card icons reduced");
c(nav.includes('name="account" size="tiny"')&&nav.includes('name="orders" size="tiny"'),"account menu has mini icons");
c(nav.includes('name="switch" size="tiny"')&&nav.includes('name="signout" size="tiny"'),"account menu actions have mini icons");
c(css.includes("V14.78 icon/account refine"),"refine CSS installed");
c(css.includes("grid-template-columns:38px minmax(0,1fr)"),"account icon/title spacing installed");
c(!nav.includes('<span>AC</span>')&&!nav.includes('<span>OR</span>'),"mobile raw account abbreviations removed");

if(fail.length){console.error(`V14.78_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.78_AUDIT=PASS");
