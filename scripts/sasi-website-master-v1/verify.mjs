import fs from"node:fs";
const checks={
 "CAPABILITY_GRAPH":["lib/sasi-kernel/graph/capability-graph.ts",["SASI_GRAPH_CYCLE","readyNodes","graphProgress"]],
 "TASK_PLAN":["lib/sasi-kernel/graph/task-plan.ts",["website.site-spec","website.package","artifact.validate"]],
 "EXECUTION_STATE":["lib/sasi-kernel/graph/execution-state.ts",["retrying","validating","finishNode"]],
 "SITE_SPEC":["lib/sasi/website-engine/site-spec.ts",["lingxifield-site-spec-v1","responsive","seo"]],
 "SITEMAP":["lib/sasi/website-engine/sitemap.ts",["validateInternalLinks"]],
 "DESIGN_SYSTEM":["lib/sasi/website-engine/design-system.ts",["surfaceElevated","textPrimary","overlay"]],
 "ARTIFACT_BUNDLE":["lib/sasi/website-engine/artifact-bundle.ts",["WEBSITE_UNBACKED_FORM_FORBIDDEN","WEBSITE_SECRET_LIKE_CONTENT"]],
 "PUBLISH_GATE":["lib/sasi/website-engine/publish-gate.ts",["RESPONSIVE_NOT_VERIFIED","FAKE_ACTIONS","SECRET_FINDINGS"]]
};
for(const[n,[p,tokens]]of Object.entries(checks)){if(!fs.existsSync(p))throw new Error(`${n}_MISSING`);const s=fs.readFileSync(p,"utf8");for(const t of tokens)if(!s.includes(t))throw new Error(`${n}_TOKEN_MISSING:${t}`);console.log(`${n}=PASS`)}
console.log("SASI_CAPABILITY_WEBSITE_STATIC_GATE=PASS");
