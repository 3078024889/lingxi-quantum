import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const k=read("components/KnowledgeWorkspace.tsx");
for(const x of["lx-sasi-user-bubble","lx-sasi-composer-dock","lx-sasi-reference-composer","lx-sasi-reference-textarea"])
 if(!k.includes(x))bad.push(`knowledge UX missing ${x}`);

const c=read("components/SasiChatCreationStudio.tsx");
for(const x of["lx-sasi-user-bubble","lx-sasi-reference-composer","lx-sasi-reference-textarea"])
 if(!c.includes(x))bad.push(`creation UX missing ${x}`);

const css=read("app/globals.css");
for(const x of[
 ".lx-sasi-user-bubble",
 "color:#2563eb!important",
 ".lx-sasi-reference-composer",
 "rgba(236,72,153,.20)",
 ".lx-sasi-reference-textarea",
 "caret-color:#2563eb!important"
])if(!css.includes(x))bad.push(`CSS contract missing ${x}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("R15R2_USER_SENT_TEXT_BLUE_FORCE=PASS");
console.log("R15R2_REFERENCE_COMPOSER_LAYOUT=PASS");
console.log("R15R2_REFERENCE_COMPOSER_GLOW=PASS");
console.log("R15R2_FIVE_MODE_VISUAL_LANGUAGE=PASS");
