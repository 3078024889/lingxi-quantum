import fs from "node:fs";
const fail=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const kw=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
const research=fs.readFileSync("app/ai-research/page.tsx","utf8");
const wallet=fs.readFileSync("components/AiWalletPanel.tsx","utf8");
const notif=fs.readFileSync("components/NotificationBell.tsx","utf8");
const wd=fs.readFileSync("components/BalanceWithdrawalPanel.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");

c(kw.includes("lx-knowledge-workspace")&&kw.includes("lx-knowledge-panel-title"),"knowledge workspace visual classes installed");
c(kw.includes('myLocal:c("我的资料","My sources"'),"knowledge local label removed");
c(kw.includes('saved:c("资料已加入。现在可以直接提问。"'),"knowledge browser save wording removed");
c(kw.includes('aiPrivacy:c("回答只使用与本次问题相关的资料内容'),"knowledge privacy copy user-facing");
c(!research.includes("先在本地命中证据")&&!research.includes("matched locally"),"research lead hides implementation");
c(wallet.includes("lx-wallet-currency-card")&&wallet.includes('name="wallet" size="title"'),"wallet visual anchors installed");
c(notif.includes('LingxiMiniIcon name="sparkles" size="tiny"'),"notification icon unified");
c(wd.includes("lx-state-card is-loading")&&wd.includes("lx-state-card is-empty"),"withdrawal states styled");
c(css.includes("V14.80 knowledge wallet state visual"),"visual CSS installed");

if(fail.length){console.error(`V14.80_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.80_AUDIT=PASS");
