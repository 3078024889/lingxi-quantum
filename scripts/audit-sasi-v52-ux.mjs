import fs from "node:fs";

const required=[
 "components/SasiChatCreationStudio.tsx",
 "app/sasi/drama/page.tsx",
 "app/sasi/build/page.tsx",
 "lib/sasi/assets.ts",
 "lib/sasi/document-extract.ts",
 "app/api/sasi/assets/[id]/inspect/route.ts",
 "app/sasi/ConnectionCenter.tsx"
];
for(const f of required)if(!fs.existsSync(f))throw new Error(`SASI_V52_MISSING:${f}`);

const studio=fs.readFileSync("components/SasiChatCreationStudio.tsx","utf8");
const semanticGuards=[
 "VIDEO_RESOLUTIONS","VIDEO_RATIOS","uploadSasiAsset",
 "/api/sasi/v5/feedback","website.scaffold.local","/api/sasi/quote",
 "/api/sasi/byok/video","/api/sasi/byok/text"
];
for(const n of semanticGuards)if(!studio.includes(n))throw new Error(`SASI_V52_STUDIO_GUARD_MISSING:${n}`);

const hasLocalizedCreationControl=
 studio.includes('ct("creationSettings")') ||
 (studio.includes("composerText") && studio.includes("creationSettings")) ||
 studio.includes("<SasiFunctionMenu");
if(!hasLocalizedCreationControl)throw new Error("SASI_V52_CREATION_CONTROL_MISSING");

if(!studio.includes('"720p","1080p","2K","4K"'))throw new Error("SASI_V52_RESOLUTION_SET_INVALID");
for(const ratio of ["9:16","16:9","1:1","4:3","3:4","3:2","2:3","21:9"]){
 if(!studio.includes(`"${ratio}"`))throw new Error(`SASI_V52_RATIO_MISSING:${ratio}`);
}

const conn=fs.readFileSync("app/sasi/ConnectionCenter.tsx","utf8");
if(!conn.includes('JSON.stringify({ provider: selected.id, apiKey })'))throw new Error("SASI_V52_CONNECTION_SAVE_CONTRACT");
if(!conn.includes('JSON.stringify({ provider: selected.id })'))throw new Error("SASI_V52_CONNECTION_TEST_CONTRACT");
if(!conn.includes('?provider=${encodeURIComponent(selected.id)}'))throw new Error("SASI_V52_CONNECTION_DELETE_CONTRACT");

const assets=fs.readFileSync("lib/sasi/assets.ts","utf8");
for(const ext of ["pptx","xlsx","epub","odt"])if(!assets.includes(`${ext}:`))throw new Error(`SASI_V52_ASSET_FORMAT_MISSING:${ext}`);

const inspect=fs.readFileSync("app/api/sasi/assets/[id]/inspect/route.ts","utf8");
if(!inspect.includes("extractStructuredDocument"))throw new Error("SASI_V52_DOCUMENT_EXTRACT_NOT_WIRED");

console.log("SASI_V52_UX_AUDIT=PASS");
