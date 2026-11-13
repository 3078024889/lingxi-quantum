import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {buildFivePosts,buildGroupPosts,QQ_GROUPS,slotAtHour,trackedLink,trackedCNLink,TELEGRAM_SLOTS} from "../supabase/functions/globalsiai-bot/editorial.ts";

const index=fs.readFileSync(new URL("../supabase/functions/globalsiai-bot/index.ts",import.meta.url),"utf8");
const cron=fs.readFileSync(new URL("../supabase/migrations/20261105120000_globalsiai_free_crons.sql",import.meta.url),"utf8");

test("seven distinct weekdays × five useful Telegram posts with safe links",()=>{
 const titles=new Set();
 for(let day=1;day<=7;day++){
  const d=new Date(`2026-11-${String(day).padStart(2,"0")}T03:00:00Z`);
  const items=buildFivePosts(d,"telegram");
  assert.equal(items.length,5);
  for(const item of items){
   assert.ok(item.text.length>50&&item.text.length<4096);
   assert.match(item.text,/lingxifield\.com/);
   assert.match(item.text,/utm_source=telegram/);
   titles.add(item.text.match(/【[^】]+】/)?.[0]);
  }
 }
 assert.equal(titles.size,35);
});
test("QQ uses separate source attribution and preserves official group invite",()=>{
 const list=buildFivePosts(new Date("2026-11-05T04:00:00Z"),"qq");
 assert.equal(list.length,5);
 for(const item of list){
  assert.match(item.text,/utm_source=qq/);
  if(item.slot==="community")assert.match(item.text,/t\.me\/globalsiai/);
  else assert.doesNotMatch(item.text,/t\.me\/globalsiai/);
 }
 assert.equal(new URL(trackedLink("/tools","test","tutorial","qq")).searchParams.get("utm_source"),"qq");
});
test("cron schedules map to five non-overlapping Singapore hour windows",()=>{
 const spec={discovery:"5 1 * * *",tutorial:"5 3 * * *",comparison:"5 6 * * *",creation:"5 9 * * *",community:"5 12 * * *"};
 for(const [slot,schedule] of Object.entries(spec)){
   const marker=`'globalsiai-${slot}'`; const at=cron.indexOf(marker);
   assert.ok(at>=0,`missing cron for ${slot}`);
   assert.ok(cron.slice(at,at+120).includes(`'${schedule}'`),`wrong schedule for ${slot}`);
 }
 assert.equal((cron.match(/select cron\.schedule\(/g)||[]).length,5);
 assert.match(cron,/vault\.decrypted_secrets/);
 assert.doesNotMatch(cron,/TELEGRAM_BOT_TOKEN|[0-9]{8,}:[A-Za-z0-9_-]{30,}/);
 assert.equal(slotAtHour(new Date("2026-11-05T01:05:00Z")),"discovery");
 assert.equal(slotAtHour(new Date("2026-11-05T03:05:00Z")),"tutorial");
 assert.equal(slotAtHour(new Date("2026-11-05T06:05:00Z")),"comparison");
 assert.equal(slotAtHour(new Date("2026-11-05T09:05:00Z")),"creation");
 assert.equal(slotAtHour(new Date("2026-11-05T12:05:00Z")),"community");
});
test("edge worker rejects unsafe calls, scopes to real group and keeps secrets out of source",()=>{
 assert.match(index,/SCHEDULER_KEY_SHA256/);
 assert.match(index,/x-lx-schedule-key/);
 assert.match(index,/x-telegram-bot-api-secret-token/);
 assert.match(index,/BOT_SECRET_NOT_CONFIGURED/);
 assert.match(index,/await claim\(ctx,key,"daily"\)/);
 assert.match(index,/chat\.username\?\.toLowerCase\(\)==="globalsiai"/);
 assert.doesNotMatch(index,/\/functions\/v1\/globalsiai-bot\?token=|[0-9]{8,}:[A-Za-z0-9_-]{30,}/);
});
test("edge health works, unauthorized posts fail closed without any secret",async()=>{
 const vars={};
 let callback;
 const prevDeno=globalThis.Deno;
 globalThis.Deno={env:{get:key=>vars[key]},serve:fn=>{callback=fn}};
 try{
  await import("../supabase/functions/globalsiai-bot/index.ts");
  assert.equal(typeof callback,"function");
  const health=await callback(new Request("https://example.org/",{method:"GET"}));
  assert.equal(health.status,200);
  const absent=await callback(new Request("https://example.org/",{method:"POST",body:"{}"}));
  assert.equal(absent.status,503);
  vars.TELEGRAM_BOT_TOKEN="12345678:"+("A".repeat(35));
  vars.SUPABASE_URL="https://example.supabase.co";
  vars.SUPABASE_SERVICE_ROLE_KEY="dummy-for-test";
  const denied=await callback(new Request("https://example.org/",{method:"POST",headers:{"x-lx-schedule-key":"wrong"},body:'{"slot":"discovery"}'}));
  assert.equal(denied.status,401);
 } finally{globalThis.Deno=prevDeno}
});

test("all five daily posts contain working paired .com and .cn domains",()=>{
 for(const channel of ["telegram","qq"]){
  for(let day=1;day<=7;day++){
   const posts=buildFivePosts(new Date(`2026-11-${String(day).padStart(2,"0")}T04:00:00Z`),channel);
   for(const post of posts){
    assert.match(post.text,/https:\/\/lingxifield\.com\//);
    assert.match(post.text,/https:\/\/lingxifield\.cn\//);
    assert.match(post.text,/utm_source=(?:telegram|qq)/);
    assert.match(post.text,/国际站：/);
    assert.match(post.text,/国内站：/);
    assert.ok(post.text.length<4096);
   }
  }
 }
 const cn=new URL(trackedCNLink("/siai","siai_comparison","comparison","telegram"));
 assert.equal(cn.hostname,"lingxifield.cn");
 assert.equal(cn.searchParams.get("utm_source"),"telegram");
});

test("QQ 3 official groups have separate traceable campaigns and correct content",()=>{
 assert.deepEqual(QQ_GROUPS.map(x=>x.id),["1074475201","1072178710","601549887"]);
 const date=new Date("2026-11-05T04:00:00Z");
 for(const group of QQ_GROUPS){
  const posts=buildGroupPosts(date,group.id);
  assert.equal(posts.length,5);
  for(const post of posts){
   assert.match(post.text,new RegExp("qq_"+group.id+"_"+post.slot));
   assert.match(post.text,/lingxifield\.com/);
   assert.match(post.text,/lingxifield\.cn/);
   assert.ok(post.text.length<4096);
  }
 }
 assert.match(buildGroupPosts(date,"601549887")[0].text,/全球 SIAI 排行榜/);
});

test("Telegram /help and welcome render links to both verified domains",()=>{
 assert.match(index,/trackedCNLink/);
 assert.match(index,/pairLinks\("\/siai","bot_ranking"\)/);
 assert.match(index,/pairLinks\("\/","welcome"\)/);
});

test("QQ groups publish 420 distinct messages across 28 days; no duplicate between groups or consecutive dates",()=>{
 const messages=new Set();
 const titles=new Set();
 for(let day=0;day<28;day++){
  const date=new Date(Date.UTC(2026,10,5+day,4));
  const perDay=[];
  for(const group of QQ_GROUPS){
   const posts=buildGroupPosts(date,group.id);
   assert.equal(posts.length,5);
   for(const p of posts){
    assert.match(p.text,/国际站：https:\/\/lingxifield\.com/);
    assert.match(p.text,/国内站：https:\/\/lingxifield\.cn/);
    assert.match(p.text,new RegExp(`utm_campaign=qq_${group.id}_${p.slot}`));
    assert.ok(p.text.length<=4096);
    const headline=p.text.match(/【[^】]+】/)?.[0];
    assert.ok(headline);
    perDay.push(headline);
    messages.add(p.text);
    titles.add(headline);
   }
  }
  assert.equal(perDay.length,15);
  assert.equal(new Set(perDay).size,15,"same headline across QQ groups on same day");
 }
 assert.equal(messages.size,420);
 assert.equal(titles.size,420);
});

test("all four communities keep 560 different titles and messages for 28 consecutive days",()=>{
 const seenTitles=new Set(), seenMessages=new Set();
 for(let offset=0;offset<28;offset++){
  const date=new Date(Date.UTC(2026,10,5+offset,4));
  const groups=[
   {group:"telegram",posts:buildFivePosts(date,"telegram")},
   ...QQ_GROUPS.map(group=>({group:group.id,posts:buildGroupPosts(date,group.id)})),
  ];
  const daily=new Set();
  for(const group of groups){
   assert.equal(group.posts.length,5);
   for(const post of group.posts){
    const title=post.text.match(/【[^】]+】/)?.[0];
    assert.ok(title);
    assert.ok(!daily.has(title),`cross-community duplicate on offset ${offset}: ${title}`);
    daily.add(title);
    assert.ok(!seenTitles.has(title),`repeated headline across 28 days: ${title}`);
    assert.ok(!seenMessages.has(post.text),"repeated full post");
    assert.doesNotMatch(post.text,/群友|各位群友|欢迎大家/,"publish content must not address group members");
    seenTitles.add(title);seenMessages.add(post.text);
    assert.match(post.text,/国际站：https:\/\/lingxifield\.com/);
    assert.match(post.text,/国内站：https:\/\/lingxifield\.cn/);
   }
  }
  assert.equal(daily.size,20);
 }
 assert.equal(seenTitles.size,560);
 assert.equal(seenMessages.size,560);
});
