import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const script=readFileSync("scripts/cloudflare/com-provision-merchant-secrets-20261108.mjs","utf8");
const workflow=readFileSync(".github/workflows/com-merchant-secret-provision-20261108.yml","utf8");

test("Cloudflare merchant secret provision is manual and never enables payments or changes routes",()=>{
 assert.match(script,/const scriptName="lingxifield-com-unified-20261108"/);
 assert.match(script,/if\(mode==="audit"\)/);
 assert.match(script,/if\(missing.length\)throw Error\("COM_PROVISION_STOP_MISSING_GITHUB_SECRET_NAMES_"/);
 assert.match(script,/method:"PUT"/);
 assert.match(script,/type:"secret_text"/);
 assert.match(script,/const active=flags.filter/);
 assert.match(script,/COM_SECRETS_ENCRYPTED_PROVISION_PASS_PAYMENT_FLAGS_STILL_OFF/);
 assert.doesNotMatch(script,/workers\/routes/);
 assert.doesNotMatch(script,/process\.env\[[^\]]+\]\s*=\s*"true"/);
 assert.match(workflow,/workflow_dispatch:/);
 assert.match(workflow,/options: \[audit, provision\]/);
 assert.match(workflow,/default: audit/);
 assert.match(workflow,/environment: cloudflare-production/);
 assert.doesNotMatch(workflow,/\bwrangler\s+deploy\b/);
});
test("invalid request is rejected before secrets or Cloudflare network use",()=>{
 const r=spawnSync(process.execPath,["scripts/cloudflare/com-provision-merchant-secrets-20261108.mjs"],{
  encoding:"utf8",timeout:5000,
  env:{...process.env,COM_PROVISION_MODE:"provision",COM_PROVISION_GROUP:"not-a-valid-group"}
 });
 assert.notEqual(r.status,0);
 assert.match(r.stderr,/COM_PROVISION_INPUT_INVALID/);
});
