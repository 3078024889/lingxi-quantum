import assert from"node:assert/strict";
import{repairSasiIdentityCss}from"./r12r3-css-repair-lib.mjs";
const poisoned='a{color:red}\n/* R12R2 SASI conversation identity */\\n.foo{color:blue}\\n';
const fixed=repairSasiIdentityCss(poisoned);
assert.ok(!fixed.slice(fixed.indexOf("/* R12R3")).includes("\\\\n"));
assert.ok(fixed.startsWith("a{color:red}\n"));
console.log("R12R3_NEGATIVE_POISONED_CSS_RECOVERY=PASS");
