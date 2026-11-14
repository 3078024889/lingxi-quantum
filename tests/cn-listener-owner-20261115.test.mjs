import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";

test("CN port ownership follows its listening PID, rejecting ambiguous listeners and unrelated services",()=>{
 const source=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh","utf8");
 const fn=source.slice(source.indexOf("find_service_for_port(){"),source.indexOf("\nold_live(){"));
 const root=mkdtempSync(join(tmpdir(),"cn-listener-owner-"));
 try{
  mkdirSync(join(root,"proc","4422"),{recursive:true});
  const cgroup=join(root,"proc","4422","cgroup");
  const unit="lingxifield-cn-release-20261110-fe253a6be0ea-final.service";
  writeFileSync(cgroup,"0::/system.slice/"+unit+"\n");
  const run=(multiple=false)=>spawnSync("bash",["-s"],{encoding:"utf8",input:`set -euo pipefail
fixture='${root.replaceAll("\\","/")}'
ss(){ printf '%s\\n' 'LISTEN 0 511 127.0.0.1:3194 0.0.0.0:* users:(("node",pid=4422,fd=21))' ${multiple?"'LISTEN 0 511 [::1]:3194 [::]:* users:((\"node\",pid=8877,fd=21))'":""}; }
systemctl(){
 if [[ "$1" == is-active ]];then return 0;fi
 if [[ "$1" == show ]];then printf '4422\\n';return 0;fi
 # A staged service may inherit this misleading legacy port setting.
 if [[ "$1" == cat ]];then printf 'Environment=PORT=3194\\n';return 0;fi
 return 1
}
${fn.replaceAll("/proc/","$fixture/proc/")}
find_service_for_port 3194
`});
  const owned=run();assert.equal(owned.status,0,owned.stderr);assert.equal(owned.stdout.trim(),unit);
  assert.notEqual(run(true).status,0,"two listening PIDs must fail closed");
  writeFileSync(cgroup,"0::/system.slice/unrelated.service\n");
  assert.notEqual(run().status,0,"an unrelated process must not be treated as a release");
 }finally{rmSync(root,{recursive:true,force:true});}
});
