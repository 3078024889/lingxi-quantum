import fs from "node:fs";
const bad=[];

function text(p){return fs.readFileSync(p,"utf8")}

const nav=text("components/Nav.tsx");
for(const x of ['href: "/ai-knowledge"','href: "/ai-learning"','href: "/ai-research"']){
 if(nav.includes(x))bad.push(`components/Nav.tsx: forbidden ${x}`);
}
for(const x of ['key: "books"','key: "learning"','key: "research"']){
 if(nav.includes(x))bad.push(`components/Nav.tsx: forbidden ${x}`);
}
if(!nav.includes('href: "/sasi", key: "studio"'))bad.push("components/Nav.tsx: SASI entry missing");

const kw=text("components/KnowledgeWorkspace.tsx");
for(const x of [
 "does not deduct creation balance",
 "创作余额",
 "费用由对应服务商直接结算",
 "provider bills you directly",
 "facturation vient directement",
 "Abrechnung erfolgt direkt",
 "proveedor factura directamente",
 "cobrança é feita diretamente",
 "تتم الفوترة مباشرة"
]){
 if(kw.toLowerCase().includes(x.toLowerCase()))bad.push(`components/KnowledgeWorkspace.tsx: forbidden ${x}`);
}

const one=text("components/SasiOneSurface.tsx");
for(const x of ['id:"drama"','id:"website"','id:"book"','id:"learning"','id:"research"']){
 if(!one.includes(x))bad.push(`components/SasiOneSurface.tsx: missing ${x}`);
}

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V51R1_NAV_LEGACY_REMOVED=PASS");
console.log("V51R1_KNOWLEDGE_COPY_CLEAN=PASS");
console.log("V51R1_ONE_SURFACE_PRESERVED=PASS");
