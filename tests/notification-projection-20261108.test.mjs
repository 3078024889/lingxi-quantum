import test from "node:test";
import assert from "node:assert/strict";
import {mergeUnifiedNotices} from "../lib/notifications/unified-public-feed.ts";
const published="2024-05-01T12:00:00.000Z";
const announcement={id:"123e4567-e89b-42d3-a456-426614174000",titleZh:"公告内容",titleEn:"Platform notice",bodyZh:"运营消息",bodyEn:"Release update",publishedAt:published,platform:"web"};
test("Public notices reach anonymous users while private payments never appear",()=>{
 const rows=mergeUnifiedNotices([], [announcement], "zh");
 assert.equal(rows.length,1);
 assert.equal(rows[0].title,"公告内容");
 assert.equal(rows[0].kind,"announcement");
 assert.equal(rows[0].href,"/announcements");
});
test("Authenticated read receipts take precedence over duplicate public announcements",()=>{
 const id="announcement:"+announcement.id;
 const rows=mergeUnifiedNotices([{id,eventKey:id,kind:"announcement",title:"原有通知",body:"通知正文",createdAt:published,read:true,href:"/account/notifications"}],[announcement],"zh");
 assert.equal(rows.length,1);
 assert.equal(rows[0].title,"原有通知");
 assert.equal(rows[0].read,true);
});
test("Do not expose miniapp-only, future or invalid announcements",()=>{
 const future="2999-01-01T00:00:00Z";
 const rows=mergeUnifiedNotices([],[
  {...announcement,platform:"miniapp"},
  {...announcement,id:"new",publishedAt:future},
  {...announcement,id:"bad",publishedAt:"invalid"}
 ],"en");
 assert.deepEqual(rows,[]);
});
test("Public message read state can use local timestamp without changing private records",()=>{
 const rows=mergeUnifiedNotices([],[announcement],"en","2024-05-02T00:00:00Z");
 assert.equal(rows[0].read,true);
 assert.equal(rows[0].title,"Platform notice");
});
test("Private deep links are restricted to same-origin paths",()=>{
 const rows=mergeUnifiedNotices([
  {id:"item",eventKey:"payment:item",kind:"payment",title:"Payment",body:"",createdAt:published,href:"https://example.org/redirect"}
 ],[],"en");
 assert.equal(rows[0].href,null);
});
