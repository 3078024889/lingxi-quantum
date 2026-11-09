import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const script=readFileSync("scripts/ops/cn3194-static-deploy-20261109.sh","utf8");
const worker=readFileSync("workers/cn-immutable-static-release/index.mjs","utf8");
const workflow=readFileSync(".github/workflows/cn-celestial-static-release-20261109.yml","utf8");
test("exact 5054d6 archive and 56-block manifests are pinned",()=>{
 assert.match(script,/5054d6f492c14c7f476acbfb3152a28b1a308a30/);
 assert.match(script,/4368bd5956dd2f68f6aa46a564ffeef5751fb68d78903182f754831d352602ea/);
 assert.match(script,/454674344/);
 assert.match(script,/3ff2145b270f90091e49c6cdd7f7da4d5b9ff757fd8aa5e61376b77578845f21/);
 assert.match(script,/1a23455c3505c0da4fa9166fc357e56e6618649062cda824ca1a1c34437f2c1d/);
 assert.match(script,/len\(m\)==56/);
 assert.match(script,/CN3194_EXACT_454MB_ARCHIVE_SHA256_PASS/);
});
test("ECS uses isolated static Worker rather than failing GitHub raw or release downloads",()=>{
 assert.match(script,/lingxifield-cn-static-celestial-20261109\.3078024889\.workers\.dev/);
 assert.doesNotMatch(script,/raw\.githubusercontent\.com/);
 assert.doesNotMatch(script,/github\.com\/3078024889\/lingxi-quantum\/releases\/download/);
});
test("upgrade and payment controllers are pinned by Git blob SHA",()=>{
 assert.match(script,/5e509aab527228332b179fc44341c81817ba290c/);
 assert.match(script,/897a38e8b90c93168396181555a7a008e01c0e24/);
});
test("3194 stage gates precede promotion and 3193 remains rollback baseline",()=>{
 assert.ok(script.indexOf('bash "$UPGRADE" --plan "$TAG"')<script.indexOf('bash "$UPGRADE" --stage-local "$TAG"'));
 assert.ok(script.indexOf('bash "$UPGRADE" --stage-local "$TAG"')<script.indexOf('bash "$UPGRADE" --verify-stage "$TAG"'));
 assert.ok(script.indexOf('bash "$UPGRADE" --verify-stage "$TAG"')<script.indexOf('bash "$UPGRADE" --promote "$TAG"'));
 assert.match(script,/OLD_3193_SERVICE_RETAINED_FOR_ROLLBACK/);
});
test("CNY channels require signed no-charge merchant preflight; PayPal remains off on CN",()=>{
 assert.ok(script.indexOf('if bash "$PAYMENT" --audit "$TAG"; then')<script.indexOf('bash "$PAYMENT" --enable "$TAG"'));
 assert.match(script,/CN3194_CNY_PAYMENT_REMAINS_CLOSED_MERCHANT_SIGNATURE_NOT_VERIFIED/);
 assert.match(script,/PAYPAL_REMAINS_DISABLED_ON_CN/);
});
test("Worker only serves explicit static assets over GET/HEAD",()=>{
 assert.match(worker,/cn3194-static-deploy-20261109\.sh/);
 assert.match(worker,/ecs-cn3194-unified-standalone-upgrade-20261109\.sh/);
 assert.match(worker,/cn-payment-activate-3194-20261109\.sh/);
 assert.match(worker,/\["GET","HEAD"\]/);
});
test("workflow fetches and verifies exact 3194 controller blobs",()=>{
 assert.match(workflow,/CN3194_SOURCE_REF/);
 assert.match(workflow,/CN3194_UPGRADE_BLOB_SHA/);
 assert.match(workflow,/CN3194_PAYMENT_BLOB_SHA/);
 assert.match(workflow,/CN3194_STATIC_ASSETS_AND_BOOTSTRAP_PASS/);
});
