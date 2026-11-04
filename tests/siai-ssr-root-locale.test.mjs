import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("SSR SEO keeps static RootLayout and sends allowlisted language response headers",()=>{
 const root=read("app/layout.tsx"),mid=read("middleware.ts");
 assert.match(root,/<html lang="zh-CN" dir="ltr" suppressHydrationWarning>/);
 assert.doesNotMatch(root,/await headers\(\)/);
 assert.match(mid,/pathname\.match\(PUBLIC_LOCALE_PREFIX\)/);
 assert.match(mid,/response\.headers\.set\("Content-Language",localeTag\)/);
 assert.match(mid,/PUBLIC_LOCALE_PREFIX=\/\^/);
 assert.match(mid,/if\(pathname\.startsWith\("\/api\/"\)\)/);
});
