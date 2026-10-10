import{test,expect}from"playwright/test";
import{entitlementSnapshot,nextUtcDay}from"../../lib/tasks/entitlement-contract";

test("unified entitlement contract distinguishes exhausted from unavailable",()=>{
 const available=entitlementSnapshot({limit:180,used:40,reserved:20,resetAt:"2026-10-11T00:00:00.000Z"});
 expect(available.state).toBe("available");
 expect(available.remaining).toBe(120);
 const exhausted=entitlementSnapshot({limit:180,used:180,reserved:0});
 expect(exhausted.state).toBe("exhausted");
 expect(exhausted.remaining).toBe(0);
 const unavailable=entitlementSnapshot({unavailable:true,resetAt:"2026-10-11T00:00:00.000Z"});
 expect(unavailable.state).toBe("unavailable");
 expect(unavailable.remaining).toBeNull();
});

test("daily allowance reset boundary is deterministic UTC",()=>{
 expect(nextUtcDay(new Date("2026-10-10T23:59:59.000Z"))).toBe("2026-10-11T00:00:00.000Z");
});
