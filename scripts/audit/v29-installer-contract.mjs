import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const install=fs.readFileSync(process.argv[2]||"INSTALL.ps1","utf8");
const required=[
 "function Stop-RepoNodeProcesses",
 "function Copy-FileResilient",
 "function Remove-PathResilient",
 'foreach($generated in @(".next","test-results","playwright-report"))',
 "Remove-PathResilient -Path $p",
 'foreach($old in @("public\\vendor\\transformers","public\\onnxruntime"))',
 "Remove-PathResilient -Path $old"
];
for(const needle of required)must(install.includes(needle),`INSTALL_CONTRACT_MISSING:${needle}`);
must(!install.includes("Copy-Item $src $dst -Force"),"FRAGILE_PAYLOAD_COPY_RETURNED");
must(!install.includes("Copy-Item $old"),"FRAGILE_OLD_RUNTIME_COPY_RETURNED");
console.log("GENERATED_RESIDUE_CLEANUP_CONTRACT=PASS");
console.log("RETIRED_RUNTIME_DELETE_CONTRACT=PASS");
console.log("INSTALLER_BEHAVIOR_AUDIT=PASS");
console.log("V29_INSTALLER_CONTRACT_AUDIT=PASS");
