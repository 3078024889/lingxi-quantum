import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";

test("CN public gate waits for nginx to serve all three new pages and rejects old HTTP 200 bodies",()=>{
 const source=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh","utf8");
 const fn=source.slice(source.indexOf("probe_public_design(){"),source.indexOf("\nrollback_to_3193(){"));
 const root=mkdtempSync(join(tmpdir(),"cn-public-design-"));
 const counter=join(root,"calls");
 try{
  const run=oldOnly=>{
   writeFileSync(counter,"0");
   return spawnSync("bash",["-s"],{encoding:"utf8",input:`set -euo pipefail
counter='${counter.replaceAll("\\","/")}'
sleep(){ :; }
curl(){
 n=$(cat "$counter");n=$((n+1));printf '%s' "$n" > "$counter"
 if [[ "$n" == 1 || '${oldOnly}' == true ]];then printf '<main>old page with HTTP 200</main>'
 else printf '<main data-release-design="20261114-afternoon-three-pages">new page</main>';fi
}
${fn}
probe_public_design
`});
  };
  const ready=run(false);assert.equal(ready.status,0,ready.stderr);assert.match(ready.stdout,/WAIT attempt=1 path=\//);
  assert.match(ready.stdout,/CN_PUBLIC_THREE_NEW_DESIGNS_PASS/);assert.equal(readFileSync(counter,"utf8"),"4");
  const stale=run(true);assert.notEqual(stale.status,0);assert.match(stale.stderr,/CN_PUBLIC_THREE_NEW_DESIGNS_FAILED/);
  assert.equal(readFileSync(counter,"utf8"),"30");
 }finally{rmSync(root,{recursive:true,force:true});}
});
