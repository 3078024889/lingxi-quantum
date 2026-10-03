import fs from "node:fs";

const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const studio=read("components/SasiChatCreationStudio.tsx");
const declarationCount=(studio.match(/const idleSurface=/g)||[]).length;
if(declarationCount!==1)bad.push(`SasiChatCreationStudio idleSurface declarations=${declarationCount}`);
if(!studio.includes('idleSurface?"justify-center":"justify-start"'))bad.push("composer blank-state centering missing");
if(!studio.includes('sm:text-4xl'))bad.push("composer calmer heading scale missing");

const nav=read("components/Nav.tsx");
for(const x of ['key: "books"','key: "learning"','key: "research"'])if(nav.includes(x))bad.push(`Nav split mode remains: ${x}`);

for(const p of ["components/Nav.tsx","components/MobileBottomNav.tsx","components/HomeProblemHub.tsx","components/SasiCommandCenter.tsx"]){
 if(!fs.existsSync(p))continue;
 const s=read(p);
 for(const x of ["/ai-knowledge","/ai-learning","/ai-research","/sasi/drama","/sasi/build"]){
  if(s.includes(x))bad.push(`${p}: legacy navigation ${x}`);
 }
}

for(const [p,x] of [
 ["app/ai-knowledge/page.tsx",'redirect("/sasi?mode=book")'],
 ["app/ai-learning/page.tsx",'redirect("/sasi?mode=learning")'],
 ["app/ai-research/page.tsx",'redirect("/sasi?mode=research")'],
 ["app/sasi/drama/page.tsx",'redirect("/sasi?mode=drama")'],
 ["app/sasi/build/page.tsx",'redirect("/sasi?mode=website")'],
]){
 if(!read(p).includes(x))bad.push(`${p}: compatibility redirect missing`);
}

const kw=read("components/KnowledgeWorkspace.tsx");
for(const x of [
 "does not deduct creation balance","创作余额",
 "料金は接続先から直接請求されます","요금은 연결한 서비스에서 직접 청구됩니다",
 "La facturation vient directement du fournisseur","Die Abrechnung erfolgt direkt durch den Anbieter",
 "El proveedor factura directamente","A cobrança é feita diretamente pelo provedor",
 "تتم الفوترة مباشرة من مزود الخدمة","资料检索与基础问答免费",
 "Source search and basic Q&A are free"
]){
 if(kw.toLowerCase().includes(x.toLowerCase()))bad.push(`KnowledgeWorkspace: stale copy ${x}`);
}

const one=read("components/SasiOneSurface.tsx");
for(const x of ['id:"drama"','id:"website"','id:"book"','id:"learning"','id:"research"']){
 if(!one.includes(x))bad.push(`SasiOneSurface missing ${x}`);
}
if(!one.includes("fixed bottom-5"))bad.push("single mode dock missing");

if(!read("components/SasiFunctionMenu.tsx").includes('href="/sasi/connections#tools"'))bad.push("Connect tools action missing");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V51R2_IDLE_SURFACE_REPAIR=PASS");
console.log("V51R2_SINGLE_NAVIGATION=PASS");
console.log("V51R2_GLOBAL_COMPOSER_ALIGNMENT=PASS");
console.log("V51R2_KNOWLEDGE_COPY_CLEAN=PASS");
console.log("V51R2_PROGRESSIVE_CONNECTIONS=PASS");
