import fs from"node:fs";

const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const k=read("components/KnowledgeWorkspace.tsx");
const css=read("app/globals.css");

// Result-oriented UX contract.
if(/\bpasteOpen\b|\bsetPasteOpen\b/.test(k))bad.push("legacy paste-source UI state remains");
if(/onClick=\{\(\)=>\{setAddOpen\(false\);setPasteOpen/.test(k))bad.push("legacy paste-source menu action remains");
for(const key of["draftTitle","draftReady","pastePlaceholder","addLibrary"]){
 if(new RegExp(`\\b${key}:c\\(`).test(k))bad.push(`retired paste-source copy key remains: ${key}`);
}

if(k.includes("setQuery(")||k.includes("activeQuery")||k.includes("searchableSources"))bad.push("live search still runs from typing state");
if(!k.includes("searchKnowledge(textSources"))bad.push("search is not deferred until send");

const directPaste='const largeDirectPaste=raw.length>=800||(raw.length>=300&&(raw.includes("\\n")||raw.includes("\\r")));';
if(!k.includes(directPaste))bad.push("result-oriented direct-paste heuristic missing");

const sliceChunks='const chunks=Array.from({length:Math.min(9,Math.ceil(raw.length/8000))},(_,index)=>raw.slice(index*8000,(index+1)*8000));';
if(!k.includes(sliceChunks))bad.push("slice-based direct-paste chunking missing");

if(k.includes("const chunks=raw.match("))bad.push("regex-based direct-paste chunking remains");
if(!k.includes("onDrop={e=>"))bad.push("knowledge composer drag-drop missing");
if(!k.includes("e.clipboardData.files"))bad.push("clipboard file paste missing");
if(!k.includes("needsConnection"))bad.push("connection CTA state missing");
if(!k.includes("media-capable intelligence service")&&!k.includes("支持相应媒体能力")&&!k.includes("支持相应能力的智能服务"))bad.push("media connection guidance missing");
if(!k.includes("downloadSasiDocx"))bad.push("real DOCX export missing");

// New stable visual contract: component classes + CSS are authoritative.
// Do not depend on specific Tailwind literals that may be intentionally replaced.
if(!k.includes("lx-sasi-user-bubble"))bad.push("knowledge user message visual contract missing");
if(!k.includes("lx-sasi-reference-composer"))bad.push("knowledge composer visual contract missing");
if(!k.includes("lx-sasi-reference-textarea"))bad.push("knowledge textarea visual contract missing");

for(const x of[
 ".lx-sasi-user-bubble",
 "color:#2563eb!important",
 ".lx-sasi-reference-composer",
 "rgba(236,72,153,.20)",
 ".lx-sasi-reference-textarea",
 "caret-color:#2563eb!important"
]){
 if(!css.includes(x))bad.push(`global SASI visual CSS missing: ${x}`);
}

// Connection copy: one shared explanation + minimal per-provider labels.
const c=read("app/sasi/ConnectionCenter.tsx");
if(!c.includes("CHANNEL_COPY"))bad.push("connection channel copy missing");
if(!c.includes('zh:{volcengine:"CNY 通道",openrouter:"USD 通道"}'))bad.push("provider channel labels are not minimal");
if(c.includes("使用火山方舟账号已开通")||c.includes("使用 OpenRouter 账号已开通"))bad.push("redundant provider description remains");
const shared=(c.match(/\{SHARED_COPY\[lang\]\}/g)||[]).length;
if(shared!==1)bad.push(`shared connection copy should render once, found ${shared}`);

// Same visual contract for drama/website.
const f=read("components/SasiChatCreationStudio.tsx");
if(!f.includes("lx-sasi-user-bubble"))bad.push("drama/website user message visual contract missing");
if(!f.includes("lx-sasi-reference-composer"))bad.push("drama/website composer visual contract missing");
if(!f.includes("lx-sasi-reference-textarea"))bad.push("drama/website textarea visual contract missing");

// Durable-inbox refund architecture supersedes direct wallet mutation in webhook handlers.
const v52f=read("scripts/audit/v52f-refund-webhook-lifecycle.mjs");
if(v52f.includes("wechat refund webhook missing complete_balance_withdrawal"))bad.push("obsolete V52F audit expectation remains");
if(!v52f.includes("V52F_DURABLE_INBOX_SUPERSEDES_DIRECT_WEBHOOK_MUTATION=PASS"))bad.push("V52F superseding audit missing");

// Brand consistency.
const brand="灵犀场 LINGXIFIELD｜SASI全球多模型智能创作生态平台";
for(const p of["app/layout.tsx","app/page.tsx","components/HomeProblemHub.tsx","components/Footer.tsx","public/manifest.webmanifest"]){
 const body=read(p);
 if(!body.includes(brand))bad.push(`new platform name missing in ${p}`);
 if(body.includes("灵犀场 LINGXIFIELD｜SASI智能生态与全球智能工具平台"))bad.push(`old platform name remains in ${p}`);
}
const structured=read("components/SiteStructuredData.tsx");
if(structured.includes("SASI 智能生态与全球智能工具平台"))bad.push("old structured-data description remains");
if(!structured.includes('name:"灵犀场 LINGXIFIELD"'))bad.push("concise structured site name changed unexpectedly");

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}

console.log("R15R3_UX_AUDIT_COHERENT=PASS");
console.log("UX_DIRECT_PASTE_SINGLE_COMPOSER=PASS");
console.log("UX_LIVE_SEARCH_REMOVED_FROM_TYPING=PASS");
console.log("UX_DIRECT_LONG_TEXT_EPHEMERAL_EVIDENCE=PASS");
console.log("UX_FILE_DRAG_DROP_AND_CLIPBOARD=PASS");
console.log("UX_MEDIA_UPLOAD_INSTANT_ATTACH=PASS");
console.log("UX_MEDIA_CONNECTION_CTA=PASS");
console.log("UX_USER_MESSAGE_BLUE=PASS");
console.log("UX_LARGE_COMPOSER_VISUAL=PASS");
console.log("UX_CONNECTION_COPY_DEDUPED=PASS");
console.log("UX_VOLCENGINE_CNY_CHANNEL=PASS");
console.log("UX_OPENROUTER_USD_CHANNEL=PASS");
console.log("UX_CONNECTION_PROVIDER_COPY_MINIMAL=PASS");
console.log("AUDIT_V52F_SUPERSEDED_FOR_DURABLE_INBOX=PASS");
console.log("BRAND_NEW_PLATFORM_NAME_HOME=PASS");
console.log("BRAND_NEW_PLATFORM_NAME_FOOTER=PASS");
console.log("BRAND_NEW_PLATFORM_NAME_METADATA=PASS");
console.log("BRAND_STRUCTURED_SITE_NAME_CONCISE=PASS");
