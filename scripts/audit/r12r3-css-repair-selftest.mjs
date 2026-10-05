import assert from"node:assert/strict";
import{repairSasiIdentityCss,sasiIdentityBlock}from"./r12r3-css-repair-lib.mjs";

const base='@tailwind base;\n.foo{color:red;}\n';
const badR12R1=base+'/* R12R1 SASI conversation identity — user text stays blue before and after send. */\n.lx-sasi-user-bubble{color:#2563eb!important;}\\n.lx-sasi-reference-textarea{caret-color:#2563eb!important;}\\n';
const badR12R2=base+'/* R12R2 SASI conversation identity */\\n.lx-sasi-user-bubble[data-sasi-user-color="blue"]{\\ncolor:#2563eb!important;\\n}\\n';

for(const sample of [base,badR12R1,badR12R2]){
 const repaired=repairSasiIdentityCss(sample);
 assert.ok(repaired.startsWith(base.trimEnd()+"\n"),"BASE_CSS_NOT_PRESERVED");
 assert.ok(repaired.includes("/* R12R3 SASI conversation identity */"),"R12R3_MARKER_MISSING");
 assert.ok(!repaired.slice(repaired.indexOf("/* R12R3")).includes("\\\\n"),"OWNED_TAIL_LITERAL_BACKSLASH_N");
 assert.equal(repairSasiIdentityCss(repaired),repaired,"CSS_REPAIR_NOT_IDEMPOTENT");
}
assert.ok(sasiIdentityBlock().includes("\n.lx-sasi-reference-textarea"),"REAL_NEWLINE_NOT_EMITTED");
console.log("R12R3_CSS_REPAIR_FIXTURE=PASS");
console.log("R12R3_CSS_REPAIR_IDEMPOTENT=PASS");
console.log("R12R3_BASE_CSS_PRESERVED=PASS");
