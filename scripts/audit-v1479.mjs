import fs from "node:fs";
const fail=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const home=fs.readFileSync("components/HomeProblemHub.tsx","utf8");
const sasi=fs.readFileSync("components/SasiCommandCenter.tsx","utf8");
const conn=fs.readFileSync("app/sasi/ConnectionCenter.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");

c(home.includes('name="tools" size="card"')&&home.includes('name="sasi" size="card"'),"home secondary cards share icon system");
c(!home.includes("留在浏览器里")&&!home.includes("stays in the browser"),"home hides implementation wording");
c(sasi.includes("lx-sasi-center")&&sasi.includes("lx-sasi-entry-card"),"SASI visual hierarchy installed");
c(conn.includes('t("连接设置","Connection setup")'),"connection setup is user-facing");
c(!conn.includes("服务端环境变量")&&!conn.includes("Server environment variable"),"env variable UI removed");
c(!conn.includes("保险箱当前不可用")&&!conn.includes("database migrations")&&!conn.includes("server encryption key"),"backend failure wording removed");
c(!conn.includes("浏览器或 Git")&&!conn.includes("browser or Git"),"implementation storage wording removed");
c(conn.includes('t("保存并连接", "Save & connect")'),"connection action is user-facing");
c(conn.includes('t("未验证的连接暂不可使用", "Unverified connections cannot be used yet")'),"connection state wording is user-facing");
c(css.includes("V14.79 remaining visual surfaces"),"remaining visual CSS installed");

if(fail.length){console.error(`V14.79_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.79_AUDIT=PASS");
