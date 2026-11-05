#!/usr/bin/env node
/**
 * Server-side cost and permission audit for all-tools pass launch.
 * Deliberately fails until externally reachable processing endpoints validate
 * an authenticated, one-task receipt. Client-side dropzones are NOT sufficient.
 */
import {existsSync,readFileSync} from "node:fs";
import {join,resolve} from "node:path";
const root=resolve(process.cwd());
const read=p=>readFileSync(join(root,p),"utf8");
const CRITICAL={
 "document-translate":"document-translate",
 "document/normalize":"office-conversion",
 "document/ticket":"office-conversion",
 "media-import":"media-import",
 "media/transcribe":"video-transcription",
 "media/translate":"video-translate",
 "media/tts":"video-dubbing",
 "media/free-dubbing-preview":"video-dubbing",
 "promotion-source":"url-to-video",
 "website-diagnose":"website-diagnose",
 "food/analysis":"food-calorie",
 "food/analysis/[id]":"food-calorie",
 "food/session":"food-calorie",
 "food/calculate":"food-calorie",
 "food/manual-calculate":"food-calorie",
 "temp-mail/create":"temp-mail",
 "temp-mail/batch":"temp-mail",
 "burn-after-read/create":"burn-after-read",
 "burn-after-read/file/prepare":"burn-after-read",
 "burn-after-read/file/complete":"burn-after-read",
 "mobile-file":"mobile-file"
};
const rows=Object.entries(CRITICAL).map(([route,tool])=>{
 const file="app/api/tools/"+route+"/route.ts";
 if(!existsSync(join(root,file)))return {route,tool,covered:false,reason:"MISSING_ROUTE"};
 const code=read(file);
 const hasPost=/export\s+(?:async\s+)?function\s+POST\s*\(/.test(code);
 const ready=code.includes("toolPassBackendReady");
 const proof=/redeemToolStart\s*\(|lingxi_consume_food_pass_v1|lingxi_create_pass_burn_note/.test(code);
 // All server tools must actually require the new authenticated receipt on
 // the activated path, NOT merely import old quote guards.
 return {route,tool,covered:hasPost&&ready&&proof,reason:!hasPost?"NO_POST":!ready?"NO_UNIFIED_BACKEND_BRANCH":!proof?"NO_TASK_BOUND_PROOF":"VERIFIED_SOURCE_GATE"};
});
const missing=rows.filter(x=>!x.covered);
const output={criticalRoutes:rows.length,staticallyGuarded:rows.length-missing.length,
 missing,pass:missing.length===0,
 warning:"Static guard detection is not a replacement for direct API replay and browser E2E tests."};
console.log(JSON.stringify(output,null,2));
if(missing.length)process.exitCode=1;
