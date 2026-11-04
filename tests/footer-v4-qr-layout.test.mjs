import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const footer=read("components/Footer.tsx");
const css=read("app/siai-home.css");

test("four authentic QR codes are compact, with no trailing raw miniapp text",()=>{
 assert(footer.includes('className="lx-footer-v4-qr-grid"'));
 assert.equal((footer.match(/className="lx-footer-v4-qr-card"/g)||[]).length,4);
 assert(footer.includes('/images/lingxifield-wechat-service-qr.jpg'));
 assert(footer.includes('/images/miniapp-qrcode.png'));
 assert(footer.includes('/api/public-social-qr?kind=search'));
 assert(footer.includes('/api/public-social-qr?kind=ranking'));
 assert(!footer.includes('className="lx-footer-wechat-extra"'));
 assert(!footer.includes('className="lx-footer-miniapp-code"'));
 assert(!footer.includes('className="lx-footer-qr-row"'));
 assert(footer.includes('navigator.clipboard.writeText(MINIAPP_COMMANDS[kind])'));
 assert(footer.includes('window.prompt(WECHAT_EXTRA[lang].miniapps,MINIAPP_COMMANDS[kind])'));
 for(const code of ["#小程序://灵犀场/ktKRUjMRoEcPEsE","#小程序://10临时邮箱/p8AACkYNods09Rl"])
  assert(footer.includes(code),code);
});
test("footer follows six-column reference without overflowing mobile",()=>{
 assert(footer.includes('lx-footer-v3-nav lx-footer-v4-nav'));
 assert(footer.includes('lx-footer-v4-qr-grid'));
 assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert(css.includes('@media(max-width:700px)'));
 assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important'));
 assert(css.includes('grid-template-columns:minmax(0,1fr)!important'));
 assert(css.includes('html[data-theme="dark"] .lx-footer-v4 .lx-footer-v4-qr-card'));
 assert(!css.includes('.lx-footer-v4 .lx-footer-wechat-extra[open]'));
});
test("all nine languages have miniapp copy controls, original social profiles remain",()=>{
 for(const key of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert(footer.includes(' '+key+':{one:'),key);
 }
 assert.equal((footer.match(/kind:"(?:share|profile)"/g)||[]).length,10);
 for(const source of ['/terms','/privacy','/refunds','/account/orders','/images/lingxifield-logo.png'])
  assert(footer.includes(source),source);
});
