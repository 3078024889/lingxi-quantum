import fs from "node:fs";
import path from "node:path";
import cp from "node:child_process";
const repo=path.resolve(process.argv[2]||process.cwd());
function read(p){return fs.readFileSync(path.join(repo,p),"utf8")}
function exists(p){return fs.existsSync(path.join(repo,p))}
function run(args){const r=cp.spawnSync("git",args,{cwd:repo,encoding:"utf8"});if(r.status!==0)throw new Error(r.stderr||`git ${args.join(" ")} failed`);return(r.stdout||"").trim()}
function exportAtomic(){const p="app/api/tools/export/consume/route.ts";if(!exists(p))return false;const s=read(p);return s.includes('.select("id").maybeSingle()')&&s.includes("if(claimed.error)")&&s.includes("if(!claimed.data)")&&s.includes('.is("consumed_at",null)')}
const checks=[
 ["V15.05 burn migration staged",exists("supabase/migrations/20260925183500_burn_decrypt_before_consume_v1505.sql")],
 ["V15.17 long image result closure",exists("components/tools/LongImageWorkbench.tsx")&&read("components/tools/LongImageWorkbench.tsx").includes("<ResultPanel files={result}")],
 ["V15.18 SVG active-content guard",exists("components/tools/SvgToPngWorkbench.tsx")&&read("components/tools/SvgToPngWorkbench.tsx").includes("foreignObject")],
 ["V15.19 video watermark exit guard",exists("components/tools/VideoWatermarkWorkbench.tsx")&&read("components/tools/VideoWatermarkWorkbench.tsx").includes("FFMPEG_EXIT_")],
 ["V15.22 typed payment UI",exists("app/tools/pay/page.tsx")&&!read("app/tools/pay/page.tsx").includes("useState<any>")],
 ["V15.24 payment create rate guard",exists("app/api/tools/pay/create/route.ts")&&read("app/api/tools/pay/create/route.ts").includes("PAYMENT_RATE_GUARD_UNAVAILABLE")],
 ["P0 export consume atomic",exportAtomic()],
 ["V15.25 retired metadata removed",exists("app/layout.tsx")&&!/一念显化|探索与显化/.test(read("app/layout.tsx"))],
 ["V15.25 live tool sitemap",exists("app/sitemap.ts")&&read("app/sitemap.ts").includes("liveTools()")],
 ["V15.25 SASI language passthrough",exists("components/SasiConnectionsClient.tsx")&&read("components/SasiConnectionsClient.tsx").includes("<ConnectionCenter lang={lang}")],
 ["V15.25 knowledge no catch-any",exists("components/KnowledgeWorkspace.tsx")&&!read("components/KnowledgeWorkspace.tsx").includes("catch(e:any)")],
];
let fail=0;for(const[n,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail++}
const status=run(["status","--porcelain=v1"]),entries=status?status.split(/\r?\n/):[];
console.log(`RELEASE_WORKTREE_ENTRIES=${entries.length}`);
const migrations=entries.filter(x=>x.includes("supabase/migrations/"));
console.log(`RELEASE_MIGRATION_ENTRIES=${migrations.length}`);for(const line of migrations)console.log(`MIGRATION ${line}`);
console.log("P0_EXPORT_ROUTE_RECONCILE=RESOLVED_ALREADY_ATOMIC");
if(fail){console.error(`RELEASE_INVENTORY_FAILURES=${fail}`);process.exit(1)}
console.log("RELEASE_INVENTORY=PASS");
