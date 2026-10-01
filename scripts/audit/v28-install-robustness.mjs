import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const install=fs.readFileSync(process.argv[2]||"INSTALL.ps1","utf8");

must(install.includes("Stop-RepoNodeProcesses"),"INSTALL_REPO_NODE_STOP_MISSING");
must(install.includes("Copy-FileResilient"),"INSTALL_RESILIENT_COPY_MISSING");
must(install.includes("Remove-PathResilient"),"INSTALL_RESILIENT_DELETE_MISSING");
must(install.includes("COPY_RETRY"),"INSTALL_COPY_RETRY_MARKER_MISSING");
must(install.includes("COPY_FILE="),"INSTALL_COPY_FILE_DIAGNOSTIC_MISSING");
must(install.includes("LOCKED_FILE="),"INSTALL_LOCK_DIAGNOSTIC_MISSING");

for(const generated of [".next","test-results","playwright-report"]){
 must(install.includes(`"${generated}"`),`INSTALL_GENERATED_CLEANUP_MISSING:${generated}`);
}
must(
 install.includes('foreach($generated in @(".next","test-results","playwright-report"))') &&
 install.includes("Remove-PathResilient -Path $p"),
 "INSTALL_GENERATED_CLEANUP_CONTRACT_MISSING"
);

must(!install.includes("Copy-Item $src $dst -Force"),"OLD_FRAGILE_PAYLOAD_COPY_REMAINS");
must(!install.includes("Copy-Item $old"),"OLD_FRAGILE_RETIRED_RUNTIME_BACKUP_REMAINS");

console.log("REPO_SCOPED_NODE_STOP=PASS");
console.log("RESILIENT_FILE_COPY=PASS");
console.log("RESILIENT_PATH_DELETE=PASS");
console.log("COPY_LOCK_DIAGNOSTICS=PASS");
console.log("NEXT_BUILD_RESIDUE_CLEANUP=PASS");
console.log("TEST_RESULT_RESIDUE_CLEANUP=PASS");
console.log("OLD_FRAGILE_PAYLOAD_COPY=0");
console.log("OLD_FRAGILE_RETIRED_RUNTIME_BACKUP=0");
console.log("V28_INSTALL_ROBUSTNESS_AUDIT=PASS");
