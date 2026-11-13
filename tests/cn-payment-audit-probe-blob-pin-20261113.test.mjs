import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const source=readFileSync("scripts/ops/cn-payment-activate-3194-20261110.sh","utf8");

test("embedded PayPal live probe Git blob pin matches the exact heredoc bytes",()=>{
  const match=source.match(/cat > "\$PROBE\.part" <<'PAYPAL_PROBE'\n([\s\S]*?)\nPAYPAL_PROBE\n/);
  assert.ok(match,"PAYPAL_PROBE heredoc must exist");
  const payload=Buffer.from(match[1]+"\n","utf8");
  const blob=Buffer.concat([Buffer.from("blob "+payload.length+"\0","ascii"),payload]);
  const actual=createHash("sha1").update(blob).digest("hex");
  const expected=source.match(/PROBE_SHA="([a-f0-9]{40})"/)?.[1];
  assert.equal(expected,actual,"stale embedded probe pin must fail CI before production audit");
  assert.equal(actual,"10481e05605177e6bd65485d5a9484ca5f8441bd");
});
