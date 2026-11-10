import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 advanceWalletLedgerCursor,
 decodeWalletLedgerCursor,
 encodeWalletLedgerCursor,
 mergeWalletLedgerRows,
 walletLedgerAfterFilter
} from "../lib/money/ledger-pagination.ts";

const snapshotAt="2026-11-10T09:00:00.000Z";
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,"0")}`;
const cursor={v:2,currency:"CNY",snapshotAt,sasiAfter:{createdAt:"2026-11-10T08:00:00.000Z",id:id(1)},aiAfter:null};

test("wallet ledger cursor is versioned, currency-scoped and validates every keyset tuple",()=>{
 const encoded=encodeWalletLedgerCursor(cursor);
 assert.deepEqual(decodeWalletLedgerCursor(encoded,"CNY"),cursor);
 assert.equal(decodeWalletLedgerCursor(encoded,"USD"),null);
 assert.equal(decodeWalletLedgerCursor("not-base64!","CNY"),null);
 assert.equal(decodeWalletLedgerCursor(Buffer.from(JSON.stringify({...cursor,v:1})).toString("base64url"),"CNY"),null);
 const future={...cursor,sasiAfter:{createdAt:"2026-11-10T10:00:00.000Z",id:id(2)}};
 assert.equal(decodeWalletLedgerCursor(encodeWalletLedgerCursor(future),"CNY"),null);
 const badId={...cursor,aiAfter:{createdAt:"2026-11-10T08:00:00.000Z",id:"not-a-uuid"}};
 assert.equal(decodeWalletLedgerCursor(encodeWalletLedgerCursor(badId),"CNY"),null);
});

test("merged CNY/USD sources have a deterministic global order for timestamp ties",()=>{
 const time="2026-11-10T08:00:00.000Z";
 const rows=mergeWalletLedgerRows(
  [{id:id(2),created_at:time,sourceKey:"sasi"},{id:id(1),created_at:"2026-11-10T07:00:00.000Z",sourceKey:"sasi"}],
  [{id:id(3),created_at:time,sourceKey:"ai"},{id:id(4),created_at:time,sourceKey:"ai"}]
 );
 assert.deepEqual(rows.map(x=>x.sourceKey+":"+x.id),[
  "sasi:"+id(2),"ai:"+id(4),"ai:"+id(3),"sasi:"+id(1)
 ]);
});

test("next cursor advances each source independently and preserves an unconsumed source",()=>{
 const current={...cursor,aiAfter:{createdAt:"2026-11-10T07:00:00.000Z",id:id(8)}};
 const visible=[
  {id:id(5),created_at:"2026-11-10T08:30:00.000Z",sourceKey:"ai"},
  {id:id(6),created_at:"2026-11-10T08:20:00.000Z",sourceKey:"sasi"},
  {id:id(7),created_at:"2026-11-10T08:10:00.000Z",sourceKey:"ai"}
 ];
 const next=advanceWalletLedgerCursor(current,visible);
 assert.deepEqual(next.sasiAfter,{createdAt:"2026-11-10T08:20:00.000Z",id:id(6)});
 assert.deepEqual(next.aiAfter,{createdAt:"2026-11-10T08:10:00.000Z",id:id(7)});
 const preserved=advanceWalletLedgerCursor(current,[{id:id(9),created_at:"2026-11-10T08:40:00.000Z",sourceKey:"sasi"}]);
 assert.deepEqual(preserved.aiAfter,current.aiAfter);
});

test("PostgREST keyset filter uses the descending (created_at, id) tuple",()=>{
 assert.equal(walletLedgerAfterFilter({createdAt:"2026-11-10T08:00:00.000Z",id:id(1)}),
  `created_at.lt.2026-11-10T08:00:00.000Z,and(created_at.eq.2026-11-10T08:00:00.000Z,id.lt.${id(1)})`);
 const route=readFileSync(new URL("../app/api/account/wallet-ledger/route.ts",import.meta.url),"utf8");
 assert.match(route,/.limit\(PAGE_SIZE\+1\)/);
 assert.match(route,/walletLedgerAfterFilter/);
 assert.doesNotMatch(route,/\.range\(/);
 assert.match(route,/sourceKey:"sasi"/);
 assert.match(route,/sourceKey:"ai"/);
});
