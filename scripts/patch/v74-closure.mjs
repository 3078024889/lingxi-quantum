import fs from "node:fs";import path from "node:path";
const root=path.resolve(process.argv[2]||".");const pre=process.argv.includes("--preflight");
function read(rel){return fs.readFileSync(path.join(root,rel),"utf8")}
function write(rel,s){fs.writeFileSync(path.join(root,rel),s)}
function requireFile(rel){if(!fs.existsSync(path.join(root,rel)))throw new Error(`V74_MISSING:${rel}`)}
for(const f of ["lib/seo/global-seo.ts","app/layout.tsx","app/sitemap.ts","app/robots.ts","middleware.ts","lib/tools/commerce/pricing-policy.json","lib/pricing/tool-policy-data.ts","lib/pricing/tool-policy-public.ts","lib/tools/commerce/v67-pricing-contract.ts"])requireFile(f);
if(pre){console.log("V74_PATCH_PREFLIGHT=PASS");process.exit(0)}
let seo=read("lib/seo/global-seo.ts");
if(!seo.includes('from "./site-domains"')&&!seo.includes("from './site-domains'")){
 seo=seo.replace('import {toolFacts} from \'./product-facts\';',`import {toolFacts} from './product-facts';\nimport {PRIMARY_SITE} from "./site-domains";`);
}
seo=seo.replace(/export const SITE\s*=\s*["']https:\/\/lingxifield\.com["'];?/,"export const SITE=PRIMARY_SITE;");
if(!seo.includes("export const SITE=PRIMARY_SITE"))throw new Error("V74_SITE_PATCH_SHAPE");write("lib/seo/global-seo.ts",seo);
let layout=read("app/layout.tsx");
if(!layout.includes('@/lib/seo/site-domains'))layout=layout.replace('import LingxifieldFeedback from "@/components/support/LingxifieldFeedback";', 'import LingxifieldFeedback from "@/components/support/LingxifieldFeedback";\nimport {PRIMARY_SITE} from "@/lib/seo/site-domains";');
layout=layout.replace(/const SITE=["']https:\/\/lingxifield\.com["'];/,"const SITE=PRIMARY_SITE;");
if(!layout.includes("alternates:{canonical:SITE}"))layout=layout.replace(' applicationName:"灵犀场｜PDF、图片与实用工具",',' applicationName:"灵犀场｜PDF、图片与实用工具",\n alternates:{canonical:SITE},');
if(!layout.includes("const SITE=PRIMARY_SITE"))throw new Error("V74_LAYOUT_DOMAIN_PATCH_SHAPE");write("app/layout.tsx",layout);
fs.copyFileSync(path.join(root,"scripts/patch/v74-app-sitemap.ts"),path.join(root,"app/sitemap.ts"));
fs.copyFileSync(path.join(root,"scripts/patch/v74-app-robots.ts"),path.join(root,"app/robots.ts"));
let pub=read("lib/pricing/tool-policy-public.ts");
const replacement=`import {allToolBillingPolicies,toolBillingPolicy,type ToolBillingPolicy} from "./tool-policy-data";\nexport type PublicExecutionMode="local"|"connected_service"|"server";\nexport type PublicBillingClass="PAID_TOOL"|"SASI_BALANCE"|"SUPPLIER_DIRECT_ONLY"|"DISABLED";\nexport type PublicToolBillingPolicy={toolId:string;billingClass:PublicBillingClass;executionMode:PublicExecutionMode;reason:string};\nfunction publicShape(p:ToolBillingPolicy):PublicToolBillingPolicy{return {toolId:p.toolId,billingClass:p.billingClass,executionMode:p.executionMode,reason:p.reason}}\nexport function publicToolBillingPolicy(toolId:string):PublicToolBillingPolicy{return publicShape(toolBillingPolicy(toolId))}\nexport function allPublicToolBillingPolicies(){return allToolBillingPolicies().map(publicShape)}\n`;
pub=replacement;write("lib/pricing/tool-policy-public.ts",pub);
console.log("V74_CLOSURE_PATCH=PASS");
