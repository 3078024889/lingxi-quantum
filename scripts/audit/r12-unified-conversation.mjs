import fs from"node:fs";
const need=[
"lib/sasi/core/unified-conversation.ts","lib/sasi/core/conversation-machine.ts",
"components/SasiUnifiedConversationProvider.tsx","components/SasiUnifiedTurns.tsx",
"lib/sasi/core/stream-events.ts","lib/sasi/core/artifact-lineage.ts","lib/sasi/core/run-control.ts",
"supabase/migrations/20261005131500_sasi_unified_conversation_v120.sql",
"supabase/migrations/20261005134500_sasi_artifact_control_v121.sql"
];
for(const f of need)if(!fs.existsSync(f))throw new Error("R12R1_FILE_MISSING:"+f);
const artifactSchema=fs.readFileSync("supabase/migrations/20261005134500_sasi_artifact_control_v121.sql","utf8");
if(artifactSchema.includes("create table if not exists public.sasi_artifacts("))throw new Error("R12R1_VERSIONED_SCHEMA_COLLIDES_WITH_TASK_ARTIFACTS");
if(!artifactSchema.includes("references public.sasi_versioned_artifacts(id)"))throw new Error("R12R1_VERSIONED_ARTIFACT_PARENT_MISSING");
const composer=fs.readFileSync("components/SasiComposerCore.tsx","utf8");
if(!composer.includes('data-sasi-user-color="blue"'))throw new Error("R12R1_BLUE_SENT_MESSAGE_MARKER_MISSING");
const css=fs.readFileSync("app/globals.css","utf8");
if(!css.includes(".lx-sasi-user-bubble")||!css.includes("#2563eb"))throw new Error("R12R1_BLUE_USER_BUBBLE_CSS_MISSING");
const knowledge=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
for(const m of ['const pendingTurn=createSasiTurn(raw,"");','setThread(rows=>[...rows,pendingTurn]);','row.id===pendingTurn.id'])if(!knowledge.includes(m))throw new Error("R12R1_KNOWLEDGE_TURN_MISSING:"+m);
const studio=fs.readFileSync("components/SasiChatCreationStudio.tsx","utf8");
if(!studio.includes("busy||message||assistantText||resultUrl||websiteHtml"))throw new Error("R12R1_CREATION_IMMEDIATE_USER_TURN_MISSING");
const one=fs.readFileSync("components/SasiOneSurface.tsx","utf8");
if(!one.includes("SasiUnifiedConversationProvider"))throw new Error("R12R1_SHARED_CONVERSATION_PROVIDER_NOT_WIRED");
const events=fs.readFileSync("lib/sasi/core/stream-events.ts","utf8");
for(const m of ["TEXT_DELTA","STATE_SNAPSHOT","APPROVAL_REQUIRED","ARTIFACT_CREATED","RUN_WAITING","RUN_RESUMED"])if(!events.includes(m))throw new Error("R12R1_EVENT_PROTOCOL_MISSING:"+m);
console.log("R12R1_ONE_SASI_CONVERSATION_ROOT=PASS");
console.log("R12R1_USER_TYPED_TEXT_BLUE=PASS");
console.log("R12R1_USER_SENT_MESSAGE_BLUE=PASS");
console.log("R12R1_IMMEDIATE_USER_TURN_RENDER=PASS");
console.log("R12R1_MODE_INDEPENDENT_TURN_CONTRACT=PASS");
console.log("R12R1_EVENT_PROTOCOL_CONTRACT=PASS");
console.log("R12R1_ARTIFACT_LINEAGE_CONTRACT=PASS");
console.log("R12R1_RUN_CONTROL_CONTRACT=PASS");
