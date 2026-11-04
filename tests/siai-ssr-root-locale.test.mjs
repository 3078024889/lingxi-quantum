import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("root HTML locale is derived from a validated request header, never hardcoded",()=>{
 const root=read("app/layout.tsx"),mid=read("middleware.ts");
 assert.match(root,/await headers\(\)/);
 assert.match(root,/VALID_SSR_LOCALES\.has\(rawLocale\)/);
 assert.match(root,/lang=\{locale==="zh"\?"zh-CN":locale\}/);
 assert.match(root,/dir=\{locale==="ar"\?"rtl":"ltr"\}/);
 assert.doesNotMatch(root,/<html lang="zh-CN"/);
 assert.match(mid,/ssrLocaleMatch=pathname\.match/);
 assert.match(mid,/localeRequestHeaders\.set\("x-lingxifield-ssr-locale"/);
 assert.match(mid,/NextResponse\.next\(\{request:\{headers:localeRequestHeaders\}\}\)/);
});
