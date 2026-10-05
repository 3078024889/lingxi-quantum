import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));

const graph=read("lib/tools/engine/stage-graph.ts");
const seo=read("lib/seo/global-seo.ts");
const registry=read("lib/tools/registry.ts");
const dynamicPage=read("app/tools/[slug]/page.tsx");
const workbench=read("components/tools/ToolWorkbench.tsx");

const slugs=[...new Set([...seo.matchAll(/\{slug:"([^"]+)"/g)].map(x=>x[1]))];
const infrastructure=new Set(["temp-mail","burn-after-read"]);

function registryHasLiveSlug(slug){
  const escaped=slug.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const re1=new RegExp(`slug:\\s*"${escaped}"[\\s\\S]{0,700}?status:\\s*"live"`);
  const re2=new RegExp(`\\["${escaped}",[\\s\\S]{0,400}?\\]\\s*,?`);
  return re1.test(registry)||re2.test(registry);
}
function sharedRouteWired(){
  return dynamicPage.includes('getTool(params.slug)') &&
    dynamicPage.includes('<ToolWorkbench tool={tool}') &&
    dynamicPage.includes('TOOLS.filter((t) => !t.dedicatedRoute)');
}
function handlerEvidence(slug){
  const exact=[
    `tool.slug === "${slug}"`,
    `tool.slug==="${slug}"`,
    `tool.slug === '${slug}'`,
    `tool.slug==='${slug}'`
  ].some(x=>workbench.includes(x));
  if(exact)return true;
  if(slug.startsWith("compress-image-to-") &&
     (workbench.includes('tool.slug.startsWith("compress-image-to-")')||workbench.includes("tool.slug.startsWith('compress-image-to-')")))return true;
  const textFamily=["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode"];
  if(textFamily.includes(slug) && workbench.includes("TextWorkbench"))return true;
  return false;
}

const contractCounts={engine:0,dynamic:0,dedicated:0,infrastructure:0};
const missing=[];
for(const slug of slugs){
  if(infrastructure.has(slug)){
    contractCounts.infrastructure++;
    continue;
  }
  if(graph.includes(`g("${slug}"`)){
    contractCounts.engine++;
    continue;
  }

  const dedicated=`app/tools/${slug}/page.tsx`;
  if(exists(dedicated)){
    contractCounts.dedicated++;
    continue;
  }

  if(sharedRouteWired() && registryHasLiveSlug(slug)){
    // Shared dynamic routes are real routes. For legacy registry tools, also require
    // concrete handler evidence in ToolWorkbench instead of merely trusting metadata.
    if(handlerEvidence(slug)){
      contractCounts.dynamic++;
      continue;
    }
    missing.push(`${slug}:DYNAMIC_ROUTE_WITHOUT_HANDLER`);
    continue;
  }

  missing.push(`${slug}:NO_EXECUTION_ROUTE`);
}

console.log(`GLOBAL_TOOL_CATALOG=${slugs.length}`);
console.log(`ENGINE_GRAPH_CONTRACTS=${contractCounts.engine}`);
console.log(`SHARED_DYNAMIC_ROUTE_CONTRACTS=${contractCounts.dynamic}`);
console.log(`DEDICATED_ROUTE_CONTRACTS=${contractCounts.dedicated}`);
console.log(`INFRASTRUCTURE_CONTRACTS=${contractCounts.infrastructure}`);

if(missing.length){
  console.error("EXECUTION_CONTRACT_MISSING="+missing.join(","));
  process.exit(1);
}
console.log("SHARED_DYNAMIC_ROUTE_WIRING=PASS");
console.log("LEGACY_WORKBENCH_HANDLER_COVERAGE=PASS");
console.log("TOOL_EXECUTION_CONTRACT_COVERAGE=PASS");
