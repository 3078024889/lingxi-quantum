import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const path=new URL('../',import.meta.url);
const file=p=>readFileSync(new URL(p,path),'utf8');
test('nine statically generated languages are root layouts, not a Chinese-only shared root',()=>{
 assert.equal(existsSync(new URL('app/layout.tsx',path)),false);
 const lang=file('app/[lang]/layout.tsx');
 assert.match(lang,/marketLocales\.map\(lang=>\(\{lang\}\)\)/);
 assert.match(lang,/lang===\x27zh\x27\?\x27zh-CN\x27:lang/);
 assert.match(lang,/lang===\x27ar\x27\?\x27rtl\x27:\x27ltr\x27/);
 assert.match(file('app/(default)/layout.tsx'),/<html lang="zh-CN"/);
});
test('non-localized routes remain addressable in their unchanged path group',()=>{
 for(const p of ['page.tsx','apps/page.tsx','models/page.tsx','methodology/page.tsx','platform/[id]/page.tsx','vendor/claim/page.tsx']){
 assert.equal(existsSync(new URL('app/(default)/'+p,path)),true,p);
 }
});
