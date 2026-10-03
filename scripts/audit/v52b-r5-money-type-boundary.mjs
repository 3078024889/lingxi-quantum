import fs from "node:fs";
const p="lib/money/provider-adapters.ts";
const s=fs.readFileSync(p,"utf8");
const bad=[];

if(!s.includes('import type{MoneyRefundProviderAdapter}from"./provider-adapter";'))
 bad.push("MoneyRefundProviderAdapter import missing");
if(!s.includes('import type{ProviderRefundObservation,ProviderRefundRequest}from"./types";'))
 bad.push("Provider refund types must come from ./types");
if(s.includes('MoneyRefundProviderAdapter,ProviderRefundObservation'))
 bad.push("provider-adapter import still incorrectly includes refund types");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52B_R5_PROVIDER_TYPE_BOUNDARY=PASS");
