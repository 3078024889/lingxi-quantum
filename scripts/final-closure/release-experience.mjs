import fs from"node:fs";
const files=["lib/release/version.ts","app/api/version/route.ts","app/api/wechat/mini/release/route.ts","app/release/page.tsx","app/api/wechat/mini/notifications/route.ts"];
let ok=true;for(const f of files){const e=fs.existsSync(f);console.log(`RELEASE_FILE_${f.replaceAll("/","_")}=${e?"PASS":"FAIL"}`);ok&&=e;}
const v=fs.readFileSync("lib/release/version.ts","utf8");
const web=/website:\s*"([^"]+)"/.exec(v)?.[1]||"",mini=/miniProgram:\s*"([^"]+)"/.exec(v)?.[1]||"";
for(const[k,x]of[["WEBSITE_VERSION",web],["MINI_VERSION",mini],["SLOGAN","一键创造，一念即达。"]]){const pass=Boolean(x)&&v.includes(x);console.log(`${k}=${pass?"PASS":"FAIL"}${pass&&k!=="SLOGAN"?` (${x})`:""}`);ok&&=pass;}
const semWeb=/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(web),semMini=/^\d+\.\d+\.\d+$/.test(mini);console.log(`WEBSITE_VERSION_FORMAT=${semWeb?"PASS":"FAIL"}`);console.log(`MINI_VERSION_FORMAT=${semMini?"PASS":"FAIL"}`);ok&&=semWeb&&semMini;
const footer=fs.readFileSync("components/Footer.tsx","utf8"),fp=footer.includes("LINGXIFIELD_RELEASE")&&footer.includes("/release");console.log(`VISIBLE_VERSION_FOOTER=${fp?"PASS":"FAIL"}`);ok&&=fp;
process.exit(ok?0:1);