import fs from"node:fs";
const c=fs.readFileSync("lib/sasi/core/simple-surface-contract.ts","utf8");
for(const marker of[
 'principle:"one-conversation-one-composer"',
 'primaryPrompt:"你想做什么？"',
 '"attach","library","research","web","create-image"',
 '"provider","api","model-id","run-id","queue","lease","workflow-version"',
 'progressPresentation:"human-readable-status"',
 'technicalStatePresentation:"progressive-disclosure"'
])if(!c.includes(marker))throw new Error("R15R1_SIMPLE_SURFACE_CONTRACT_MISSING:"+marker);
console.log("R15R1_ONE_COMPOSER_SURFACE_CONTRACT=PASS");
console.log("R15R1_TECHNICAL_COMPLEXITY_HIDDEN=PASS");
console.log("R15R1_PROGRESSIVE_DISCLOSURE=PASS");
