import {
  assertExternalPaidCallAllowed,
} from "../../lib/sasi/execution/trigger.ts";
import {
  paidIntentPolicy,
} from "../../lib/sasi/execution/intent-policy.ts";
import {
  createPendingExternalWork,
  mayExecutePendingWork,
} from "../../lib/sasi/execution/pending-work.ts";

let backgroundBlocked = false;
try {
  assertExternalPaidCallAllowed({
    trigger: "background",
    requestId: "fixture",
    initiatedAt: new Date().toISOString(),
    interactive: false,
  });
} catch {
  backgroundBlocked = true;
}
if (!backgroundBlocked) throw new Error("BACKGROUND_PAID_CALL_NOT_BLOCKED");

let testBlocked = false;
try {
  assertExternalPaidCallAllowed({
    trigger: "system-test",
    requestId: "fixture",
    initiatedAt: new Date().toISOString(),
    interactive: false,
  });
} catch {
  testBlocked = true;
}
if (!testBlocked) throw new Error("TEST_PAID_CALL_NOT_BLOCKED");

assertExternalPaidCallAllowed({
  trigger: "user-action",
  userId: "user-a",
  requestId: "fixture-user",
  initiatedAt: new Date().toISOString(),
  interactive: true,
});

const codePolicy = paidIntentPolicy("code-author");
if (codePolicy.maxProviderCalls !== 1) {
  throw new Error("CODE_AUTHOR_CALL_COUNT_NOT_ONE");
}
if (!codePolicy.userBalanceRequired) {
  throw new Error("CODE_AUTHOR_USER_BALANCE_REQUIRED");
}

const work = createPendingExternalWork({
  id: "work-fixture",
  userId: "user-a",
  intent: "teacher-review",
  reason: "Need external review after a user-submitted task.",
});

if (!mayExecutePendingWork({ work, triggeringUserId: "user-a" })) {
  throw new Error("OWNER_TRIGGER_EXPECTED");
}

let ownerBlocked = false;
try {
  mayExecutePendingWork({ work, triggeringUserId: "user-b" });
} catch {
  ownerBlocked = true;
}
if (!ownerBlocked) throw new Error("CROSS_USER_TRIGGER_NOT_BLOCKED");

console.log(JSON.stringify({
  version:"v10.80",
  pass:true,
  backgroundPaidCallsBlocked:true,
  systemTestPaidCallsBlocked:true,
  userActionAllowed:true,
  oneProviderCallPerIntent:true,
  userBalanceRequired:true,
  crossUserPendingWorkBlocked:true,
  providerCalls:0,
  providerSpend:0
}, null, 2));
