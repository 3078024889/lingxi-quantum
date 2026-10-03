import fs from "node:fs";
const bad=[];

function must(p,x,label=x){
 const s=fs.readFileSync(p,"utf8");
 if(!s.includes(x))bad.push(`${p}: missing ${label}`);
}
function mustNot(p,x){
 const s=fs.readFileSync(p,"utf8");
 if(s.includes(x))bad.push(`${p}: forbidden ${x}`);
}

mustNot("components/Nav.tsx",'href: "/ai-knowledge"');
mustNot("components/Nav.tsx",'href: "/ai-learning"');
mustNot("components/Nav.tsx",'href: "/ai-research"');
must("components/Nav.tsx",'href: "/sasi", key: "studio"');

for(const [p,x] of [
 ["app/ai-knowledge/page.tsx",'redirect("/sasi?mode=book")'],
 ["app/ai-learning/page.tsx",'redirect("/sasi?mode=learning")'],
 ["app/ai-research/page.tsx",'redirect("/sasi?mode=research")'],
 ["app/sasi/drama/page.tsx",'redirect("/sasi?mode=drama")'],
 ["app/sasi/build/page.tsx",'redirect("/sasi?mode=website")'],
]) must(p,x);

for(const x of ['id:"drama"','id:"website"','id:"book"','id:"learning"','id:"research"'])
 must("components/SasiOneSurface.tsx",x);

must("components/SasiOneSurface.tsx","fixed bottom-5");
must("components/SasiChatCreationStudio.tsx","idleSurface");
must("components/SasiChatCreationStudio.tsx",'idleSurface?"justify-center":"justify-start"');

must("app/sasi/ConnectionCenter.tsx","BUILD_CONNECTORS");
for(const x of ["GitHub","Vercel","Supabase","Cloudflare"]) must("lib/sasi/integration-catalog.ts",x);
must("components/SasiFunctionMenu.tsx",'href="/sasi/connections#tools"');

const kw=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
for(const x of [
 "费用由对应服务商直接结算","provider bills","facturation vient directement",
 "Abrechnung erfolgt direkt","proveedor factura directamente","cobrança é feita diretamente",
 "تتم الفوترة مباشرة","资料检索与基础问答免费","does not deduct creation balance"
])if(kw.toLowerCase().includes(x.toLowerCase()))bad.push(`components/KnowledgeWorkspace.tsx: ${x}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V51_SINGLE_WORKSPACE=PASS");
console.log("V51_SIDEBAR_LEGACY_MODES_REMOVED=PASS");
console.log("V51_COMPOSER_ALIGNMENT=PASS");
console.log("V51_TOOL_CONNECTION_ENTRY=PASS");
console.log("V51_KNOWLEDGE_UI_CLEAN=PASS");
