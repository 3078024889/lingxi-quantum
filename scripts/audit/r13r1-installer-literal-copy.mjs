import fs from"node:fs";
import path from"node:path";

const installerArg=process.argv[2];
if(!installerArg)throw new Error("R13R2_INSTALLER_PATH_ARG_REQUIRED");
const installerPath=path.resolve(installerArg);
if(!fs.existsSync(installerPath))throw new Error("R13R2_INSTALLER_NOT_FOUND:"+installerPath);

const ps=fs.readFileSync(installerPath,"utf8");
for(const marker of [
 "function Copy-VerifiedLiteralFile",
 "[System.IO.File]::Copy(",
 "Test-Path -LiteralPath $dst -PathType Leaf",
 "Get-FileHash -LiteralPath $src",
 "Get-FileHash -LiteralPath $dst",
 "PAYLOAD_COPY_HASH_MISMATCH",
 "PAYLOAD_DESTINATION_MISSING"
]) if(!ps.includes(marker)) throw new Error("R13R2_INSTALLER_LITERAL_COPY_MISSING:"+marker);

for(const p of [
 "app\\api\\sasi\\runs\\[runId]\\events\\route.ts",
 "app\\api\\sasi\\runs\\[runId]\\snapshot\\route.ts"
]) if(!ps.includes(p)) throw new Error("R13R2_DYNAMIC_ROUTE_NOT_IN_PAYLOAD:"+p);

if(/Copy-Item\s+\$src\s+\$dst/.test(ps))throw new Error("R13R2_WILDCARD_COPY_STILL_PRESENT");

console.log("R13R2_INSTALLER_PATH_EXPLICIT=PASS");
console.log("R13R2_LITERAL_PATH_COPY=PASS");
console.log("R13R2_DYNAMIC_ROUTE_BRACKETS_SAFE=PASS");
console.log("R13R2_COPY_HASH_VERIFICATION=PASS");
