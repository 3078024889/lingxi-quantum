import fs from"node:fs";
import{repairSasiIdentityCss}from"./r12r3-css-repair-lib.mjs";

function rw(file,fn){
 const before=fs.readFileSync(file,"utf8");
 const after=fn(before);
 if(after===before){console.log("R12R1_ALREADY_CURRENT="+file);return}
 fs.writeFileSync(file,after,"utf8");
 console.log("R12R1_UPDATED="+file);
}

function must(src,marker,code){
 if(!src.includes(marker))throw new Error(code);
}

// Root provider: tolerate already-patched state.
rw("components/SasiOneSurface.tsx",src=>{
 if(src.includes("SasiUnifiedConversationProvider")&&src.includes("<SasiUnifiedConversationProvider>"))return src;
 if(!src.includes("SasiUnifiedConversationProvider")){
  const importRe=/import\s+SasiModeHost\s+from\s+["']@\/components\/SasiModeHost["'];?/;
  if(!importRe.test(src))throw new Error("R12R1_ONE_SURFACE_IMPORT_DRIFT");
  src=src.replace(importRe,m=>`${m}\nimport{SasiUnifiedConversationProvider}from"@/components/SasiUnifiedConversationProvider";`);
 }
 if(src.includes("<SasiUnifiedConversationProvider>"))return src;
 const hostRe=/<SasiModeHost\s+mode=\{mode\}\s+modeBar=\{modeBar\}\s*\/>/;
 if(!hostRe.test(src))throw new Error("R12R1_ONE_SURFACE_HOST_DRIFT");
 return src.replace(hostRe,'<SasiUnifiedConversationProvider><SasiModeHost mode={mode} modeBar={modeBar}/></SasiUnifiedConversationProvider>');
});

// User bubble contract: patch opening tag only; formatting can vary.
rw("components/SasiComposerCore.tsx",src=>{
 if(src.includes('data-sasi-role="user"')&&src.includes('data-sasi-user-color="blue"'))return src;
 const re=/<div\s+className=\{`lx-sasi-user-bubble\b/;
 if(!re.test(src))throw new Error("R12R1_USER_BUBBLE_DRIFT");
 return src.replace(re,'<div data-sasi-role="user" data-sasi-user-color="blue" className={`lx-sasi-user-bubble');
});

// Assistant role marker.
rw("components/SasiResultCore.tsx",src=>{
 if(src.includes('data-sasi-role="assistant"'))return src;
 const re=/<article\s+data-sasi-result-kind="text"/;
 if(!re.test(src))throw new Error("R12R1_ASSISTANT_RESULT_DRIFT");
 return src.replace(re,'<article data-sasi-role="assistant" data-sasi-result-kind="text"');
});

// Creation surface: message is visible as soon as the request is in-flight.
// Accept old, R12-partial, or whitespace-varied form.
rw("components/SasiChatCreationStudio.tsx",src=>{
 if(src.includes("busy||message||assistantText||resultUrl||websiteHtml"))return src;
 const re=/\{prompt\.trim\(\)\s*&&\s*\(\s*assistantText\s*\|\|\s*resultUrl\s*\|\|\s*websiteHtml\s*\)\s*&&\s*<SasiUserMessage([^>]*)>\{prompt\}<\/SasiUserMessage>\}/;
 if(!re.test(src))throw new Error("R12R1_CREATION_USER_MESSAGE_DRIFT");
 return src.replace(re,'{prompt.trim()&&(busy||message||assistantText||resultUrl||websiteHtml)&&<SasiUserMessage$1>{prompt}</SasiUserMessage>}');
});

// Knowledge surface: robustly anchor inside ask() instead of matching one exact line.
// 1) insert pending turn before the first setAskBusy(true)
// 2) replace append-new-turn completion with update-of-pending-turn
// 3) keep the user's message after send by clearing the textarea immediately
rw("components/KnowledgeWorkspace.tsx",src=>{
 const askStart=src.indexOf("async function ask()");
 if(askStart<0)throw new Error("R12R1_KNOWLEDGE_ASK_NOT_FOUND");
 const nextFn=src.indexOf("\n  async function ",askStart+20);
 const end=nextFn>askStart?nextFn:src.length;
 let head=src.slice(0,askStart),body=src.slice(askStart,end),tail=src.slice(end);

 if(!body.includes('const pendingTurn=createSasiTurn(raw,"");')){
  const busyRe=/(\s*)setAskBusy\(true\);/;
  if(!busyRe.test(body))throw new Error("R12R1_KNOWLEDGE_BUSY_ANCHOR_DRIFT");
  body=body.replace(busyRe,(m,indent)=>`${indent}const pendingTurn=createSasiTurn(raw,"");\n${indent}setThread(rows=>[...rows,pendingTurn]);\n${indent}setQuestion("");\n${indent}setAskBusy(true);`);
 }

 if(!body.includes("row.id===pendingTurn.id")){
  const appendRe=/setThread\(\s*rows\s*=>\s*\[\s*\.\.\.rows\s*,\s*createSasiTurn\(\s*raw\s*,\s*String\(\s*data\.answer\s*\|\|\s*""\s*\)\s*\)\s*\]\s*\);/;
  if(!appendRe.test(body))throw new Error("R12R1_KNOWLEDGE_COMPLETE_ANCHOR_DRIFT");
  body=body.replace(appendRe,'setThread(rows=>rows.map(row=>row.id===pendingTurn.id?{...row,assistant:String(data.answer||"")}:row));');
 }

 // Remove only the success-path textarea clear after we already clear at submit.
 // This is cosmetic/idempotent and deliberately non-fatal.
 body=body.replace(/setNotice\(tr\(lang,"done"\)\);\s*setQuestion\(""\);/,'setNotice(tr(lang,"done"));');

 // Verify the behavior, not formatting.
 must(body,'const pendingTurn=createSasiTurn(raw,"");',"R12R1_PENDING_TURN_NOT_ESTABLISHED");
 must(body,'setThread(rows=>[...rows,pendingTurn]);',"R12R1_PENDING_APPEND_NOT_ESTABLISHED");
 must(body,'row.id===pendingTurn.id',"R12R1_PENDING_COMPLETE_NOT_ESTABLISHED");
 return head+body+tail;
});

// Blue identity: append only if missing.
rw("app/globals.css",src=>repairSasiIdentityCss(src));

console.log("R12R3_UNIFIED_CONVERSATION_PATCH=PASS");
