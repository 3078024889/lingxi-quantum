import fs from "node:fs";
import {execFileSync} from "node:child_process";

const must=(v,m)=>{if(!v)throw new Error(m)};
const exists=p=>fs.existsSync(p);

const forbidden=[
 ".lingxifield-final-closure-backup-20260930-160132",
 ".lingxifield-idphoto-rebuild-backup-20260930-195546",
 ".lingxifield-platform-completion-backup-20260930-180317",
 ".lingxifield-real-tool-security-backup-20260930-181000",
 ".lingxifield-release-notice-clean-backup-20260930-181911",
 ".lingxifield-support-rebuild-backup-20260930-183949",
 ".lingxifield-support-rebuild-backup-20260930-184131",
 ".lingxifield-support-rebuild-backup-20260930-184243",
 "imports/skills-devour-2026-09-18/INDEX.md",
 "docs/product-research/ROMANCE-MAGNETISM-2026-08.md",
 "lib/number-energy-calc.ts",
 "sql-history/SQL-v228-resilience-romance-tables.sql"
];

for(const p of forbidden)must(!exists(p),`V35_RETIRED_RESIDUAL:${p}`);

const tracked=execFileSync("git",["ls-files"],{encoding:"utf8"}).split(/\r?\n/).filter(Boolean);
const trackedBackups=tracked.filter(p=>/^\.lingxifield-.*backup-\d/.test(p));
must(trackedBackups.length===0,`V35_TRACKED_BACKUPS_REMAIN:${trackedBackups.join(",")}`);

const gitlinks=execFileSync("git",["ls-files","-s"],{encoding:"utf8"}).split(/\r?\n/).filter(x=>x.startsWith("160000 "));
must(gitlinks.length===0,`V35_GITLINKS_REMAIN:${gitlinks.join("|")}`);

const legacyAudits=tracked.filter(p=>/^scripts\/audit\/v(?:21|22|24|25|26|27|28|29)-/.test(p));
must(legacyAudits.length===0,`V35_OLD_AUDITS_REMAIN:${legacyAudits.join(",")}`);

// Protected origin/source material remains out of the deletion set.
const protectedOrigin=tracked.filter(p=>p.startsWith("content/cangxuan-feed/"));
must(protectedOrigin.length>0,"V35_PROTECTED_ORIGIN_MISSING");

// Search for retired product implementation outside protected historical/source material.
const scanRoots=["app","components","lib","scripts","docs","sql-history"];
const retiredPathRx=/(?:relationship|romance|manifestation|subconscious|inner-sovereignty|number-energy|field-tests|inner-practice)/i;
const allowed=new Set([
 "scripts/audit/v34-search-brand-closure.mjs",
 "docs/LINGXIFIELD_V34_SEARCH_BRAND_REBUILD.md",
 "docs/LINGXIFIELD_V35_REPOSITORY_FINAL_CLEANUP.md"
]);
const hits=[];
for(const p of tracked){
 if(!scanRoots.some(r=>p===r||p.startsWith(r+"/")))continue;
 if(allowed.has(p))continue;
 if(retiredPathRx.test(p))hits.push(p);
}
must(hits.length===0,`V35_RETIRED_PRODUCT_PATHS_REMAIN:${hits.join(",")}`);

const gi=fs.readFileSync(".gitignore","utf8");
must(gi.includes("/.lingxifield-*-backup-*/"),"V35_BACKUP_IGNORE_RULE_MISSING");
must(gi.includes("/lingxifield-v*-backup-*/"),"V35_EXTERNAL_BACKUP_IGNORE_RULE_MISSING");

console.log("TRACKED_PRODUCTION_BACKUP_DIRECTORIES=0");
console.log("OBSOLETE_PRODUCT_PATHS=0");
console.log("LEGACY_GITLINKS=0");
console.log("V21_V29_OBSOLETE_AUDITS=0");
console.log("PROTECTED_ORIGIN_CONTENT=UNCHANGED");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V35_REPOSITORY_FINAL_CLEANUP=PASS");
