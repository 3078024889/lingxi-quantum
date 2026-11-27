import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("announcement ticker links remotely published items to their exact detail",()=>{
 const ticker=read("components/PublicAnnouncementTicker.tsx");
 assert.match(ticker,/fetch\("\/api\/site-announcements"/);
 assert.match(ticker,/href:"\/announcements#".encodeURIComponent\(item.id\)/);
 assert.match(ticker,/href=\{item.href\}/);
 assert.match(ticker,/publicNoticeItems\(lang\)/);
});
test("announcement feed reveals the correct asynchronously loaded item",()=>{
 const page=read("components/PublicAnnouncementsPage.tsx");
 assert.match(page,/decodeURIComponent\(window.location.hash.slice\(1\)\)/);
 assert.match(page,/items.some\(item=>item.id===id\)/);
 assert.match(page,/document.getElementById\(id\)/);
 assert.match(page,/scrollIntoView\(\{behavior:"smooth",block:"center"\}\)/);
 assert.match(page,/article\?\.focus\(\{preventScroll:true\}\)/);
 assert.match(page,/window.addEventListener\("hashchange",focusAnnouncement\)/);
 assert.match(page,/id=\{item.id\} tabIndex=\{-1\}/);
});
