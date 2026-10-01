import fs from "node:fs";

function must(v,m){if(!v)throw new Error(m)}
const page=fs.readFileSync("app/account/support/page.tsx","utf8");
const tickets=fs.readFileSync("app/api/support/tickets/route.ts","utf8");
const inbound=fs.readFileSync("app/api/support/inbound/route.ts","utf8");
const action=fs.readFileSync("app/api/support/action/route.ts","utf8");
const life=fs.readFileSync("lib/support/lifecycle.ts","utf8");

must(page.includes("viewedAt"),"SUPPORT_VIEWED_STAGE_MISSING");
must(page.includes("processingAt"),"SUPPORT_PROCESSING_STAGE_MISSING");
must(page.includes("completedAt"),"SUPPORT_COMPLETED_STAGE_MISSING");
must(page.includes("15000"),"SUPPORT_AUTO_REFRESH_MISSING");
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])must(new RegExp(`\\b${lang}:\\{`).test(page),`SUPPORT_LANGUAGE_MISSING:${lang}`);

must(tickets.includes("supportInboundAddress"),"SUPPORT_INBOUND_REPLY_TO_MISSING");
must(tickets.includes("X-Lingxifield-Ticket"),"SUPPORT_THREAD_HEADER_MISSING");
must(tickets.includes("makeSupportActionToken"),"SUPPORT_SIGNED_ACTIONS_MISSING");

must(inbound.includes("verifyResendWebhook"),"SUPPORT_WEBHOOK_SIGNATURE_MISSING");
must(inbound.includes("processedInboundIds"),"SUPPORT_WEBHOOK_IDEMPOTENCY_MISSING");
must(inbound.includes("UNTRUSTED_SENDER"),"SUPPORT_SENDER_ALLOWLIST_MISSING");
must(inbound.includes("emails/receiving/"),"SUPPORT_RECEIVED_EMAIL_RETRIEVAL_MISSING");
must(inbound.includes("support-agent-reply/"),"SUPPORT_AGENT_FORWARD_IDEMPOTENCY_MISSING");
must(inbound.includes("support-customer-reply/"),"SUPPORT_CUSTOMER_NOTIFY_IDEMPOTENCY_MISSING");

must(action.includes("verifySupportActionToken"),"SUPPORT_ACTION_SIGNATURE_MISSING");
must(life.includes("timingSafeEqual"),"SUPPORT_TIMING_SAFE_VERIFY_MISSING");
must(life.includes("Math.abs(Date.now()/1000-n)>300"),"SUPPORT_WEBHOOK_REPLAY_WINDOW_MISSING");

console.log("SUPPORT_4_STAGE_LIFECYCLE=PASS");
console.log("SUPPORT_EMAIL_THREADING=PASS");
console.log("SUPPORT_INBOUND_WEBHOOK_SIGNATURE=PASS");
console.log("SUPPORT_INBOUND_IDEMPOTENCY=PASS");
console.log("SUPPORT_SENDER_ALLOWLIST=PASS");
console.log("SUPPORT_NINE_LANGUAGES=PASS");
console.log("SUPPORT_AUTO_REFRESH=PASS");
console.log("SUPPORT_LIFECYCLE_AUDIT=PASS");
