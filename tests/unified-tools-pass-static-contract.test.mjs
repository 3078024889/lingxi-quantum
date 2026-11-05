import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261105193000_one_free_tool_use_and_all_tools_pass.sql");
const catalog=read("lib/tools/commerce/all-tools-pass.ts");
const client=read("lib/tools/commerce/tool-start-client.ts");
const access=read("app/api/tools/access/route.ts");
const purchase=read("app/api/tools/pass/route.ts");
const page=read("app/tools/pass/page.tsx");
test("four exact durations and same-number independent prices",()=>{
 for(const [days,price] of [[7,29],[30,99],[90,269],[365,899]]){
  assert.match(catalog,new RegExp("tool_pass_"+days+"d"));
  assert.match(catalog,new RegExp("days:"+days+",price:"+price));
  assert.match(sql,new RegExp("when 'tool_pass_"+days+"d' then v_amount:="+price+"00;v_days:="+days));
 }
 assert.match(sql,/p_currency not in \('CNY','USD'\)/);
 assert.match(sql,/charge_sasi_usage_v49/);
 assert.match(sql,/tool-pass:'\|\|p_request_id/);
});
test("free claim atomically protects both account and trusted IP each Shanghai day",()=>{
 assert.match(sql,/Asia\/Shanghai/);
 assert.match(sql,/pg_advisory_xact_lock/);
 assert.match(sql,/v_account_count>=1 or v_ip_count>=1/);
 assert.match(sql,/if p_units<>1/);
 assert.match(sql,/request_id uuid primary key/);
 assert.match(access,/trustedClientIp/);
 assert.match(access,/LINGXIFIELD_PRIVACY_HASH_SECRET/);
 assert.match(access,/getTool/);
});
test("payment can't trust user-supplied price and only uses user-approved action",()=>{
 assert.doesNotMatch(purchase,/input\?\.amount|input\.price/);
 assert.match(purchase,/isSameOriginMutation/);
 assert.match(purchase,/auth\.getUser\(\)/);
 assert.match(sql,/perform pg_advisory_xact_lock/);
 assert.match(sql,/insert into public\.orders/);
 assert.match(sql,/insert into public\.lingxi_tool_passes/);
});
test("feature remains gated until all tool surfaces/old checkout are migrated",()=>{
 assert.match(client,/NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true"/);
 assert.match(page,/\bzh:/);assert.match(page,/\ben:/);assert.match(page,/\bja:/);
 assert.match(page,/\bko:/);assert.match(page,/\bfr:/);assert.match(page,/\bde:/);
 assert.match(page,/\bes:/);assert.match(page,/\bpt:/);assert.match(page,/\bar:/);
});
