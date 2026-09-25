import fs from "node:fs";
const path="app/api/sasi/jobs/route.ts";
let s=fs.readFileSync(path,"utf8");

if(s.includes("applySasiSkill") && s.includes("approved.skillId")){
  console.log("PATCH_SASI_JOBS_V14651=ALREADY_APPLIED");
  process.exit(0);
}

const im='import { isSameOriginMutation } from "@/lib/sasi/request-security";';
if(!s.includes(im)){console.error("JOBS_IMPORT_MARKER_NOT_FOUND");process.exit(41)}
s=s.replace(im,im+'\nimport {applySasiSkill,normalizeSkillSelection,resolveSasiSkill} from "@/lib/sasi/skill-runtime";');

const pref=/(\s*const preferredProvider:[\s\S]*?\n\s*: null;)/;
const pm=s.match(pref);
if(!pm){console.error("JOBS_PROVIDER_MARKER_NOT_FOUND");process.exit(42)}
s=s.replace(pref,`$1
  const skillSelection=normalizeSkillSelection(body.skillSource??"platform",body.skillId??"story-rhythm");
  if(!skillSelection)return NextResponse.json({error:"INVALID_SKILL_SELECTION"},{status:400});`);

s=s.replace(/try \{ quote = quoteVideoTask\(selection,\s*duration\); \}/,'try { quote = quoteVideoTask(selection,duration,Date.now(),skillSelection.source); }');

const cmp=/\|\| approved\.provider !== selection\.provider \|\| approved\.model !== selection\.model \|\| approved\.amountFen !== quote\.amountFen \|\| approved\.rateVersion !== quote\.rateVersion \|\| approved\.retailFenPerSecond !== quote\.retailFenPerSecond\) \{/;
if(!cmp.test(s)){console.error("JOBS_QUOTE_COMPARE_NOT_FOUND");process.exit(43)}
s=s.replace(cmp,`|| approved.provider !== selection.provider || approved.model !== selection.model
    || approved.amountFen !== quote.amountFen || approved.amountUsdCents !== quote.amountUsdCents
    || approved.rateVersion !== quote.rateVersion || approved.retailFenPerSecond !== quote.retailFenPerSecond
    || approved.skillSource !== skillSelection.source || approved.skillId !== skillSelection.id) {`);

const memory=/(\s*try \{ productionPrompt=applyProjectMemory\(productionPrompt,memory\.active\); \}\s*\n\s*catch\{return NextResponse\.json\(\{error:"PROJECT_CONTEXT_TOO_LARGE"\},\{status:422\}\);\})/;
if(!memory.test(s)){console.error("JOBS_MEMORY_MARKER_NOT_FOUND");process.exit(44)}
s=s.replace(memory,`$1
  const selectedSkill=await resolveSasiSkill(admin,user.id,skillSelection);
  if(!selectedSkill)return NextResponse.json({error:"SKILL_NOT_FOUND"},{status:404});
  productionPrompt=applySasiSkill(productionPrompt,selectedSkill,4000);`);

const inp=/(\s*approvedAmountFen:\s*quote\.amountFen,\s*\n)(\s*retailFenPerSecond:\s*quote\.retailFenPerSecond,)/;
if(!inp.test(s)){console.error("JOBS_INPUT_MARKER_NOT_FOUND");process.exit(45)}
s=s.replace(inp,`$1      approvedAmountUsdCents: quote.amountUsdCents,
      skillSource:selectedSkill.source,
      skillId:selectedSkill.id,
      skillTitle:selectedSkill.titleZh,
$2`);

fs.writeFileSync(path,s,"utf8");
console.log("PATCH_SASI_JOBS_V14651=PASS");
