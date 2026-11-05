import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {
  buildFivePosts,buildPost,singaporeDay,slotAtHour,SLOT_HOURS,TELEGRAM_SLOTS,trackedLink,
} from "../lib/telegram/editorial.ts";

test("five distinct daily Telegram and QQ posts",()=>{
 const date=new Date("2026-11-05T01:05:00.000Z");
 const posts=buildFivePosts(date,"telegram"), qq=buildFivePosts(date,"qq");
 assert.equal(posts.length,5); assert.equal(qq.length,5);
 assert.equal(new Set(posts.map(p=>p.slot)).size,5);
 for(let i=0;i<5;i++){
  assert.notEqual(posts[i].text,qq[i].text);
  assert.ok(posts[i].text.length<4096);
  assert.ok(qq[i].text.length<4096);
  assert.match(posts[i].text,/utm_source=telegram/);
  assert.match(qq[i].text,/utm_source=qq/);
  assert.match(qq[i].text,/https:\/\/t\.me\/globalsiai/);
  assert.match(qq[i].text,/lingxifield\.com/);
 }
});
test("content rotation uses seven actual weekday variants",()=>{
 const titles=new Set();
 for(let d=1;d<=7;d++){
  const date=new Date(`2026-11-${String(d).padStart(2,"0")}T04:00:00Z`);
  for(const p of buildFivePosts(date,"telegram")){
   const title=p.text.split("\n").find(line=>line.startsWith("【"));
   assert.ok(title);titles.add(title);
  }
 }
 assert.equal(titles.size,35);
});
test("Asian local hour slots keep five separate windows",()=>{
 for(const [slot,hour] of Object.entries(SLOT_HOURS)){
  const date=new Date(`2026-11-05T${String((hour+16)%24).padStart(2,"0")}:05:00Z`);
  assert.equal(slotAtHour(date),slot);
 }
 assert.equal(slotAtHour(new Date("2026-11-05T05:30:00Z")),null); // 13:30 SGT
 assert.equal(singaporeDay(new Date("2026-11-05T23:30:00Z")),"2026-11-06");
});
test("tracking attributes link clicks to the correct community",()=>{
 const qq=new URL(trackedLink("/tools","pdf","tutorial","qq"));
 const telegram=new URL(trackedLink("/tools","pdf","tutorial","telegram"));
 assert.equal(qq.searchParams.get("utm_source"),"qq");
 assert.equal(telegram.searchParams.get("utm_source"),"telegram");
 assert.equal(telegram.searchParams.get("utm_content"),"tutorial");
});
test("legacy Vercel Telegram crons are disabled in favour of independent free Supabase cron",()=>{
 const conf=JSON.parse(readFileSync(new URL("../vercel.json",import.meta.url)));
 assert.equal(conf.crons.filter(c=>c.path.startsWith("/api/cron/telegram-")).length,0);
 assert.ok(conf.crons.some(c=>c.path==="/api/cron/privacy-cleanup"));
 assert.ok(conf.crons.some(c=>c.path==="/api/cron/withdrawal-reconcile"));
 assert.ok(conf.crons.some(c=>c.path==="/api/cron/sasi-v5-radar"));
});
test("public QQ workbench is noindex and client uses browser-only clipboard",()=>{
 const page=readFileSync(new URL("../app/community/share-kit/page.tsx",import.meta.url),"utf8");
 const client=readFileSync(new URL("../app/community/share-kit/share-kit-client.tsx",import.meta.url),"utf8");
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(client,/navigator\.clipboard\.writeText/);
 assert.match(client,/import Link from "next\/link"/);
 assert.doesNotMatch(client,/<a href="\/siai"/);
 assert.doesNotMatch(client,/TELEGRAM_BOT_TOKEN|SUPABASE_SERVICE_ROLE_KEY/);
});

test("Telegram and QQ attribution is bounded and respects privacy controls",()=>{
 const tracker=readFileSync(new URL("../components/SiteVisitTracker.tsx",import.meta.url),"utf8");
 const api=readFileSync(new URL("../app/api/analytics/visit/route.ts",import.meta.url),"utf8");
 assert.match(tracker,/utm_source/);
 assert.match(tracker,/doNotTrack/);
 assert.match(tracker,/globalPrivacyControl/);
 assert.match(api,/utm_source:source/);
 assert.match(api,/source===\"telegram\"\|\|b.source===\"qq\"/);
 assert.match(api,/isSameOriginMutation/);
});
test("community join landing is voluntary and searchable",()=>{
 const page=readFileSync(new URL("../app/community/page.tsx",import.meta.url),"utf8");
 assert.match(page,/https:\/\/t\.me\/globalsiai/);
 assert.match(page,/无需为入群支付费用/);
 assert.match(page,/index:true,follow:true/);
});

test("private operations report authenticates before reading the database",()=>{
 const api=readFileSync(new URL("../app/api/account/telegram-operations/route.ts",import.meta.url),"utf8");
 const ui=readFileSync(new URL("../app/community/operations/page.tsx",import.meta.url),"utf8");
 assert.match(api,/if\(!await moneyAdministrator\(\)\)/);
 assert.ok(api.indexOf("moneyAdministrator()")<api.indexOf("createAdminClient()"));
 assert.match(api,/private, no-store/);
 assert.match(ui,/index:false,follow:false/);
 assert.doesNotMatch(api,/TELEGRAM_BOT_TOKEN|TELEGRAM_WEBHOOK_SECRET/);
});

test("commercial publishing remains explicitly disabled by default",()=>{
 const publisher=readFileSync(new URL("../lib/telegram/publisher.ts",import.meta.url),"utf8");
 assert.match(publisher,/TELEGRAM_PUBLISH_ENABLED/);
 assert.match(publisher,/PUBLISHING_NOT_ENABLED/);
 assert.ok(publisher.indexOf("TELEGRAM_PUBLISH_ENABLED")<publisher.indexOf('telegramApi(token,"setWebhook"'));
});
