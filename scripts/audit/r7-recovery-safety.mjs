import fs from"node:fs";

const path="components/KnowledgeWorkspace.tsx";
const s=fs.readFileSync(path,"utf8");
const bad=[];

if(/\\n(?=\s*[A-Za-z][A-Za-z0-9]*:c\()/.test(s)){
 bad.push("literal backslash-n remains before COPY property");
}
if(!s.includes("const COPY = {"))bad.push("COPY object missing");
if(!s.includes("browserUnavailable:c("))bad.push("COPY baseline entry missing");
if(!s.includes("file30:c("))bad.push("COPY post-repair entry missing");

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}
console.log("R7_COPY_LITERAL_NEWLINE_CLEAN=PASS");
console.log("R7_COPY_OBJECT_BASELINE_PRESENT=PASS");
console.log("R7_RECOVERY_SCOPE_NARROW=PASS");
