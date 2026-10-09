import{test,expect}from"playwright/test";
import{legacyTaskStateToUnified,unifiedTaskStateToLegacy}from"../../lib/sasi/core/task";

test("legacy SASI task states map cleanly into the shared lifecycle",()=>{
 expect(legacyTaskStateToUnified("planned")).toBe("planning");
 expect(legacyTaskStateToUnified("repairing")).toBe("retrying");
 expect(legacyTaskStateToUnified("completed")).toBe("succeeded");
 expect(unifiedTaskStateToLegacy("queued")).toBe("planned");
 expect(unifiedTaskStateToLegacy("retrying")).toBe("repairing");
 expect(unifiedTaskStateToLegacy("succeeded")).toBe("completed");
 expect(unifiedTaskStateToLegacy("expired")).toBe("failed");
});
