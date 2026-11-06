import test from "node:test";
import assert from "node:assert/strict";

let handler;
const previous=globalThis.Deno;
globalThis.Deno={serve:callback=>handler=callback};
try {await import("../supabase/functions/globalsiai-qq-console/index.ts");}
finally {globalThis.Deno=previous;}

test("all three group pages now return actual UTF-8 text instead of unsupported HTML",async()=>{
  for(const id of ["1074475201","1072178710","601549887"]){
    const r=await handler(new Request(`https://example.supabase.co/functions/v1/globalsiai-qq-console?group=${id}&day=2026-11-05`));
    assert.equal(r.status,200);
    assert.match(r.headers.get("content-type"),/text\/plain; charset=utf-8/);
    const raw=new Uint8Array(await r.arrayBuffer());
    assert.deepEqual(Array.from(raw.slice(0,3)),[0xef,0xbb,0xbf]);
    const body=new TextDecoder("utf-8").decode(raw);
    assert.match(body,new RegExp(id));
    assert.match(body,/国际站：https:\/\/lingxifield\.com/);
    assert.match(body,/国内站：https:\/\/lingxifield\.cn/);
    assert.match(body,/第 1 条/);
    assert.match(body,/第 5 条/);
    assert.doesNotMatch(body,/<article|<html|<pre|&amp;/);
    assert.doesNotMatch(body,/群友|各位群友|欢迎大家/);
  }
});
test("JSON endpoint supports future official QQ bot publishing API",async()=>{
  const ids=["1074475201","1072178710","601549887"];
  const bodies=[];
  for(const id of ids){
    const r=await handler(new Request(`https://example.supabase.co/functions/v1/globalsiai-qq-console?group=${id}&day=2026-11-05&format=json`));
    assert.match(r.headers.get("content-type"),/application\/json/);
    const j=await r.json();
    assert.equal(j.group,id);
    assert.equal(j.posts.length,5);
    assert.match(j.posts[0].text,new RegExp(`utm_campaign=qq_${id}_discovery`));
    bodies.push(j.posts.map(x=>x.text));
  }
  assert.equal(new Set(bodies.flat()).size,15);
});
test("unrecognised groups fall back to a known group, disallow POST",async()=>{
  const x=await handler(new Request("https://example.supabase.co/functions/v1/globalsiai-qq-console?group=other&format=json"));
  assert.equal((await x.json()).group,"1074475201");
  const post=await handler(new Request("https://example.supabase.co/functions/v1/globalsiai-qq-console",{method:"POST"}));
  assert.equal(post.status,405);
});
