const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const src=ts.transpileModule(fs.readFileSync("app/api/cron/privacy-cleanup/route.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function scenario(mode,expected){
 const stats={r2:[],noteDelete:0,marked:0};
 const admin={
  from(table){
   let action="",filters=[],q={
    select(){return q},or(){return q},limit(){return q},
    eq(k,v){filters.push([k,v]);return q},lt(){return q},is(){return q},
    delete(){action="delete";return q},update(){action="update";return q},
    then(resolve){
     if(table==="burn_notes"&&action==="delete"){stats.noteDelete++;return Promise.resolve({error:mode==="db-delete-fail"?{code:"FAIL"}:null}).then(resolve)}
     if(table==="tool_temp_files"&&action==="update"){stats.marked++;return Promise.resolve({error:mode==="temp-update-fail"?{code:"FAIL"}:null}).then(resolve)}
     if(table==="burn_notes")return Promise.resolve({data:mode==="note-backlog"?Array.from({length:101},(_,i)=>({id:"note-"+i})):[{id:"note"}],error:mode==="note-query-fail"?{code:"FAIL"}:null}).then(resolve);
     if(table==="burn_files")return Promise.resolve({data:[{object_key:"burn/note/file"}],error:mode==="file-query-fail"?{code:"FAIL"}:null}).then(resolve);
     if(table==="tool_temp_files")return Promise.resolve({data:mode==="temp-backlog"?Array.from({length:101},(_,i)=>({id:"temp-"+i,object_key:"temp/file-"+i})):[{id:"temp",object_key:"temp/file"}],error:mode==="temp-query-fail"?{code:"FAIL"}:null}).then(resolve);
     throw Error("UNKNOWN_TABLE:"+table);
    }
   };return q;
  },
  rpc:async()=>{if(mode==="rpc-throw")throw Error("RPC_OFFLINE");return {data:1,error:mode==="rpc-fail"?{code:"FAIL"}:null}}
 };
 const mockModules={
  "next/server":{NextResponse:{json:(body,opts={})=>({status:opts.status||200,body,headers:opts.headers})}},
  "@/lib/supabase/admin":{createAdminClient:()=>admin},
  "@/lib/r2-private":{r2Delete:async key=>{stats.r2.push(key);if(mode==="r2-delete-fail"&&key.startsWith("burn/"))return false;if(mode==="temp-delete-fail"&&key.startsWith("temp/"))return false;return true}}
 };
 const mockExports={};
 vm.runInNewContext(src,{exports:mockExports,require:key=>{if(!mockModules[key])throw Error("UNEXPECTED_MODULE:"+key);return mockModules[key]},Date,process:{env:{CRON_SECRET:"only-for-isolated-fixture"}},console});
 const unauthorized=await mockExports.GET({headers:new Headers({authorization:"Bearer wrong"})});
 assert.equal(unauthorized.status,401);
 const result=await mockExports.GET({headers:new Headers({authorization:"Bearer only-for-isolated-fixture"})});
 assert.equal(result.status,expected,mode);
 assert.equal(result.body.ok,expected===200,mode);
 if(expected===503)assert.equal(result.headers["Cache-Control"],"no-store");
 if(["file-query-fail","r2-delete-fail"].includes(mode))assert.equal(stats.noteDelete,0,"never discard R2 reference before successful object deletion");
 if(mode==="r2-delete-fail")assert.equal(result.body.deferredNotes,1);
 if(mode==="temp-update-fail")assert.equal(result.body.deletedToolTemp,0,"failed DB mark cannot count as cleanup");
 if(mode==="note-backlog")assert.equal(result.body.notesBacklog,true,"101st expired note must not silently disappear from cleanup report");
 if(mode==="temp-backlog")assert.equal(result.body.tempBacklog,true,"101st expired temporary file must trigger partial cleanup");
}
(async()=>{
 for(const [mode,status] of [
  ["normal",200],["r2-delete-fail",503],["db-delete-fail",503],["file-query-fail",503],
  ["temp-query-fail",503],["temp-delete-fail",503],["temp-update-fail",503],["note-backlog",503],["temp-backlog",503],
  ["rpc-fail",503],["rpc-throw",503],["note-query-fail",503]
 ])await scenario(mode,status);
 console.log("PRIVACY_CLEANUP_TRUTH_V142=PASS: private-object deletion and metadata lifecycle fail visibly; note references never dropped on R2 failures; temp/DB failures cannot return success; cron auth denied. No R2 or production DB operations.");
})().catch(e=>{console.error(e);process.exitCode=1});
