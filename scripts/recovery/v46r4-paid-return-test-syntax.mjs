import fs from "node:fs";
import path from "node:path";

const repo=process.argv[2]||process.cwd();
const target=path.join(repo,"tests/final-closure/paid-return-v45.spec.ts");
if(!fs.existsSync(target))throw new Error("V46R4_TEST_NOT_FOUND");

let s=fs.readFileSync(target,"utf8");
const bad='page.getByText(/上传 PDF / DOC / DOCX|Upload PDF / DOC / DOCX/i).first()';
const good='page.getByText(/上传 PDF \\/ DOC \\/ DOCX|Upload PDF \\/ DOC \\/ DOCX/i).first()';

if(s.includes(bad)){
  s=s.replace(bad,good);
  fs.writeFileSync(target,s,"utf8");
  console.log("V46R4_PAID_RETURN_REGEX_ESCAPED=PASS");
}else if(s.includes(good)){
  console.log("V46R4_PAID_RETURN_REGEX_ALREADY_FIXED=PASS");
}else{
  // Structural fallback for whitespace variants on the same assertion.
  const re=/page\.getByText\(\/上传 PDF\s*\/\s*DOC\s*\/\s*DOCX\|Upload PDF\s*\/\s*DOC\s*\/\s*DOCX\/i\)\.first\(\)/;
  if(!re.test(s))throw new Error("V46R4_TARGET_ASSERTION_NOT_FOUND");
  s=s.replace(re,good);
  fs.writeFileSync(target,s,"utf8");
  console.log("V46R4_PAID_RETURN_REGEX_ESCAPED=PASS");
}
