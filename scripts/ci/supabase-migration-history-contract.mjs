import fs from"node:fs";

const snapshotPath="supabase/remote-migration-history-r15r5.json";
if(!fs.existsSync(snapshotPath)){
 console.error("SUPABASE_REMOTE_HISTORY_SNAPSHOT_MISSING");
 process.exit(1);
}

const snapshot=JSON.parse(fs.readFileSync(snapshotPath,"utf8"));
const dir="supabase/migrations";
const files=fs.readdirSync(dir).filter(x=>x.endsWith(".sql"));
const byVersion=new Map();

for(const file of files){
 const version=file.slice(0,14);
 const list=byVersion.get(version)??[];
 list.push(file);
 byVersion.set(version,list);
}

const required=(snapshot.requiredRemoteOnly||[]).map(x=>String(x.version));
const requiredSet=new Set(required);

const missing=required.filter(v=>!byVersion.has(v));
if(missing.length){
 console.error("SUPABASE_REMOTE_HISTORY_LOCAL_MISSING",missing.join(","));
 process.exit(1);
}

const requiredDuplicates=required.filter(v=>(byVersion.get(v)?.length??0)!==1);
if(requiredDuplicates.length){
 console.error("SUPABASE_REQUIRED_REMOTE_VERSION_NOT_UNIQUE",JSON.stringify(
  requiredDuplicates.map(v=>[v,byVersion.get(v)])
 ));
 process.exit(1);
}

// Existing local-only timestamp collisions are historical repository debt.
// They are not the current Supabase Preview error ("Remote migration versions
// not found in local migrations directory"), so do not convert them into a new
// blocker here. Report them explicitly for a separate migration normalization
// task. Never silently ignore a collision involving required remote history.
const localOnlyDuplicates=[...byVersion.entries()]
 .filter(([version,list])=>list.length>1&&!requiredSet.has(version))
 .map(([version,list])=>[version,list]);

if(localOnlyDuplicates.length){
 console.warn("SUPABASE_LOCAL_ONLY_DUPLICATE_TIMESTAMPS_DEFERRED",JSON.stringify(localOnlyDuplicates));
}

console.log(`R15R11_SUPABASE_REQUIRED_REMOTE_HISTORY_PARITY=PASS:${required.length}`);
console.log(`R15R11_SUPABASE_LOCAL_ONLY_DUPLICATE_GROUPS=${localOnlyDuplicates.length}`);
console.log("R15R11_SUPABASE_PREVIEW_BLOCKER_SCOPE=REMOTE_HISTORY_ONLY");
