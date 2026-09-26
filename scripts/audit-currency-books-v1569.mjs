import fs from "node:fs";
import path from "node:path";
const repo=process.cwd(),read=p=>fs.readFileSync(path.join(repo,p),"utf8"),assert=(v,m)=>{if(!v)throw new Error(m)};

const pricing=read("lib/tools/pricing-server.ts");
assert(pricing.includes("pricing_json_usd"),"USD_PRICE_BOOK_TIERS_MISSING");
assert(pricing.includes("base_price_usd"),"USD_PRICE_BOOK_BASE_MISSING");
assert(!pricing.includes("amountRmb*0.5")&&!pricing.includes("amountRmb * 0.5"),"FX_STYLE_DERIVATION_REMAINS");

const quote=read("app/api/tools/quote/route.ts");
assert(quote.includes("pricing_currency"),"QUOTE_CURRENCY_LOCK_MISSING");
assert(quote.includes("amountForCurrency"),"QUOTE_SINGLE_CURRENCY_DISPLAY_MISSING");
assert(quote.includes("body.currency"),"USER_CURRENCY_CHOICE_MISSING");

const pref=read("components/CurrencyPreferenceProvider.tsx");
assert(pref.includes('account || local || cookie || recommended || "USD"'),"CURRENCY_PRIORITY_MISSING");
assert(pref.includes("lingxifield:preferred-currency"),"LOCAL_CURRENCY_PERSISTENCE_MISSING");

const selector=read("components/CurrencySelector.tsx");
assert(selector.includes("不同币种采用独立定价"),"INDEPENDENT_PRICING_COPY_MISSING");

const button=read("components/tools/PaidActionButton.tsx");
assert(button.includes("usePreferredCurrency"),"TOOL_GLOBAL_CURRENCY_MISSING");
assert(button.includes("currency,metadata"),"TOOL_QUOTE_CURRENCY_NOT_SENT");

const pay=read("app/tools/pay/page.tsx");
assert(pay.includes('q.currency==="CNY"'),"CNY_CHECKOUT_LOCK_MISSING");
assert(pay.includes('q.currency==="USD"'),"USD_CHECKOUT_LOCK_MISSING");

const sasi=read("components/SasiPricingCurrencyClient.tsx");
assert(sasi.includes('currency==="CNY"'),"SASI_SINGLE_CURRENCY_VIEW_MISSING");

const wallet=read("components/AiWalletPanel.tsx");
assert(wallet.includes("CurrencySelector"),"WALLET_GLOBAL_CURRENCY_SELECTOR_MISSING");

const orders=read("components/AccountOrdersHistory.tsx");
assert(orders.includes('currency:"CNY"|"USD"|null'),"ORDER_CURRENCY_RENDER_MISSING");

const migration=read("supabase/migrations/20260926071000_currency_price_books_v1569.sql");
assert(migration.includes("preferred_currency"),"PROFILE_CURRENCY_MIGRATION_MISSING");
assert(migration.includes("alter table public.orders"),"ORDER_CURRENCY_MIGRATION_MISSING");
assert(migration.includes("alter table public.tool_payment_quotes"),"QUOTE_CURRENCY_MIGRATION_MISSING");
assert(migration.includes("unit_price_rmb = 1.00"),"FOOD_CNY_PRICE_MISSING");
assert(migration.includes("unit_price_usd = 0.50"),"FOOD_USD_PRICE_MISSING");

console.log("INDEPENDENT_PRICE_BOOKS_AUDIT=PASS");
console.log("USER_CURRENCY_CHOICE_AUDIT=PASS");
console.log("CHECKOUT_CURRENCY_LOCK_AUDIT=PASS");
console.log("ORDER_CURRENCY_PERSISTENCE_AUDIT=PASS");
console.log("FOOD_PRICE_BOOK_AUDIT=PASS");
console.log("V15.69_CURRENCY_ARCHITECTURE_AUDIT=PASS");
