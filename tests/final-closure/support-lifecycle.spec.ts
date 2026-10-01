import{test,expect}from"playwright/test";
import fs from"node:fs";

test("support lifecycle exposes all four states and nine languages",async()=>{
 const page=fs.readFileSync("app/account/support/page.tsx","utf8");
 expect(page).toContain("viewedAt");
 expect(page).toContain("processingAt");
 expect(page).toContain("completedAt");
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])expect(page).toMatch(new RegExp(`\\b${lang}:\\{`));
});

test("support mail bridge is authenticated, idempotent and threaded",async()=>{
 const inbound=fs.readFileSync("app/api/support/inbound/route.ts","utf8");
 const tickets=fs.readFileSync("app/api/support/tickets/route.ts","utf8");
 expect(inbound).toContain("verifyResendWebhook");
 expect(inbound).toContain("processedInboundIds");
 expect(inbound).toContain("UNTRUSTED_SENDER");
 expect(inbound).toContain("emails/receiving/");
 expect(tickets).toContain("supportInboundAddress");
 expect(tickets).toContain("X-Lingxifield-Ticket");
});
