import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8").replace(/\r\n/g,"\n");
const must=(v,m)=>{if(!v)throw new Error(m)};
const s=read("lib/tools/payment-recovery.ts");
const checks={
 camelTool:/toolId\s*:\s*q\.tool_id/,
 snakeTool:/tool_id\s*:\s*q\.tool_id/,
 camelExpiry:/expiresAt\s*:\s*q\.expires_at/,
 snakeExpiry:/expires_at\s*:\s*q\.expires_at/,
 snakeRmb:/amount_rmb\s*:\s*amountRmb/,
 snakeUsd:/amount_usd\s*:\s*amountUsd/,
 display:/display_amount\s*:/,
 quoteSelect:/select\("id,user_id,tool_id,status,expires_at,quantity,unit_name,amount_rmb,amount_usd,currency,metadata"\)/
};
for(const [k,re] of Object.entries(checks))must(re.test(s),`V45R4_PAYMENT_RECOVERY_CONTRACT:${k}`);
const food=read("app/api/tools/food/analysis/[id]/route.ts");
// Semantic check: food-calorie still validates payment.quote.toolId, independent of whitespace/quotes.
must(/payment\.quote\?\.toolId\s*!==\s*["']food-calorie["']/.test(food),"V45R4_FOOD_CONSUMER_CONTRACT_DRIFT");
must(/recoverToolQuotePayment\s*\(\s*\{\s*userId\s*:\s*user\.id\s*,\s*quoteId\s*\}\s*\)/s.test(food),"V45R4_FOOD_RECOVERY_CALL_MISSING");
console.log("V45R4_CAMEL_CASE_CONSUMERS=PASS");
console.log("V45R4_SNAKE_CASE_PAYMENT_UI=PASS");
console.log("V45R4_FOOD_PAYMENT_CONTRACT=PASS");
console.log("LINGXIFIELD_V45R4_COMPAT_AUDIT=PASS");
