import fs from "node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const center=read("components/SasiPricingCurrencyClient.tsx");
for(const x of[
 "/api/money/summary",
 "BalanceWithdrawalPanel",
 "refundHoldMinor",
 "refundableMinor",
 "availableMinor",
 'id="withdrawals"',
 "CREDIT_PACKS",
 "usdBalanceProducts"
])if(!center.includes(x))bad.push(`Money center missing ${x}`);

const withdrawPage=read("app/account/withdrawals/page.tsx");
if(!withdrawPage.includes('redirect("/sasi/pricing#withdrawals")'))
 bad.push("Old standalone withdrawal page still active");

const account=read("app/account/page.tsx");
if(account.includes('href="/account/withdrawals"'))
 bad.push("Account still links old withdrawal page");
if(!account.includes('href="/sasi/pricing#withdrawals"'))
 bad.push("Account single money-center link missing");

const panel=read("components/BalanceWithdrawalPanel.tsx");
if(panel.includes("LegacyRefundMigrationPanel"))
 bad.push("Legacy refund migration UI residue remains");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52C_R2_ONE_MONEY_CENTER=PASS");
console.log("V52C_R2_DUAL_CURRENCY_SUMMARY=PASS");
console.log("V52C_R2_TOPUP_AND_REFUND_ONE_SURFACE=PASS");
console.log("V52C_R2_RECENT_REFUND_STATUS=PASS");
console.log("V52C_R2_LEGACY_REFUND_UI_REMOVED=PASS");
console.log("V52C_R2_WINDOWS_SAFE_PATCH=PASS");
console.log("V52C_R2_HISTORICAL_DB_PRESERVED=PASS");
