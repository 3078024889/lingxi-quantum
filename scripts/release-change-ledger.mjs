import cp from "node:child_process";
import path from "node:path";
const repo=path.resolve(process.argv[2]||process.cwd());
function git(args){const r=cp.spawnSync("git",args,{cwd:repo,encoding:"utf8"});if(r.status!==0)throw new Error(r.stderr||"git failed");return(r.stdout||"").trim()}
const raw=git(["status","--porcelain=v1"]);
const lines=raw?raw.split(/\r?\n/):[];
const groups={migrations:[],app:[],components:[],lib:[],scripts:[],docs:[],other:[]};
for(const line of lines){
 const file=line.slice(3).trim().replace(/^"|"$/g,"");
 const key=file.startsWith("supabase/migrations/")?"migrations":file.startsWith("app/")?"app":file.startsWith("components/")?"components":file.startsWith("lib/")?"lib":file.startsWith("scripts/")?"scripts":file.startsWith("docs/")?"docs":"other";
 groups[key].push(line);
}
console.log(`RELEASE_CHANGE_LEDGER_TOTAL=${lines.length}`);
for(const [k,v] of Object.entries(groups)){console.log(`RELEASE_CHANGE_LEDGER_${k.toUpperCase()}=${v.length}`);for(const x of v)console.log(`${k.toUpperCase()} ${x}`)}
console.log("RELEASE_CHANGE_LEDGER=PASS");
console.log("NOTE=Read-only. Nothing is staged, committed, pushed, deployed, deleted, or db-pushed.");
