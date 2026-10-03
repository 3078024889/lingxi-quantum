import fs from"node:fs";

const bad=[];
const rebuildPath="scripts/rebuild-knowledge-workspace-from-head.mjs";
const workspacePath="components/KnowledgeWorkspace.tsx";

if(!fs.existsSync(rebuildPath))bad.push("rebuild helper missing from repository");
if(!fs.existsSync(workspacePath))bad.push("KnowledgeWorkspace.tsx missing");

const rebuild=fs.existsSync(rebuildPath)?fs.readFileSync(rebuildPath,"utf8"):"";
const ws=fs.existsSync(workspacePath)?fs.readFileSync(workspacePath,"utf8"):"";

// Generator contract: range replacement must consume the original end boundary.
if(!rebuild.includes("s.slice(b+end.length)"))bad.push("range helper does not consume original end marker");
if(rebuild.includes("s.slice(0,a)+replacement+s.slice(b);"))bad.push("old duplicate-boundary range helper remains");

// Result contract: validate the generated TSX rather than comparing escape depth
// inside the generator source. The generator necessarily contains double escaping,
// while the generated TSX contains the single escaped form.
const directPaste='const largeDirectPaste=raw.length>=800||(raw.length>=300&&(raw.includes("\\n")||raw.includes("\\r")));';
if(!ws.includes(directPaste))bad.push("escape-safe direct-paste result missing");

const sliceChunk='const chunks=Array.from({length:Math.min(9,Math.ceil(raw.length/8000))},(_,index)=>raw.slice(index*8000,(index+1)*8000));';
if(!ws.includes(sliceChunk))bad.push("slice-based direct-paste chunking missing");

if(ws.includes("const chunks=raw.match("))bad.push("regex-based direct-paste chunking remains");
if(ws.includes("setQuery(")||ws.includes("activeQuery")||ws.includes("searchableSources"))bad.push("live search still connected to typing");
if(ws.includes("pasteOpen")||ws.includes("setPasteOpen"))bad.push("legacy paste-source UI state remains");
if(!ws.includes("onDrop={e=>"))bad.push("composer drag/drop result missing");
if(!ws.includes("e.clipboardData.files"))bad.push("clipboard file-paste result missing");
if(!ws.includes("downloadSasiDocx"))bad.push("real DOCX result missing");

for(const duplicate of[
 "async function importOneFile(file:File){  async function importOneFile",
 "export default function KnowledgeWorkspaceexport default function KnowledgeWorkspace",
 "async function sendFeedback(signal:FeedbackSignal){async function sendFeedback",
 "async function downloadThreadZip(){  async function downloadThreadZip"
]){
 if(ws.includes(duplicate))bad.push(`duplicated boundary remains: ${duplicate.slice(0,48)}`);
}

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}

console.log("R12_RANGE_BOUNDARY_CONSUMED=PASS");
console.log("R12_RESULT_CONTRACT_DIRECT_PASTE=PASS");
console.log("R12_RESULT_CONTRACT_SLICE_CHUNKING=PASS");
console.log("R12_NO_DUPLICATED_REBUILD_BOUNDARIES=PASS");
console.log("R12_LIVE_SEARCH_DEFERRED_TO_SEND=PASS");
console.log("R12_DIRECT_DROP_CLIPBOARD_MODEL=PASS");
console.log("R12_RESULT_CONTRACT=PASS");
