import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";
const source=readFileSync("lib/sasi-marketplace/fees.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exported={};new Function("exports",js)(exported);
const {calculateMarketplaceSplit,marketProductUuid,isMarketProductId,parseMarketplacePayoutMinorUnits}=exported;
for(const [value,fee,net] of [[1,0,1],[100,15,85],[10000,1500,8500],[288800,43320,245480],[690000,103500,586500]]){
 const x=calculateMarketplaceSplit(value);
 assert.deepEqual(x,{grossMinor:value,platformFeeMinor:fee,sellerNetMinor:net});
}
for(let i=1;i<10000;i+=17){
 const x=calculateMarketplaceSplit(i);
 assert.equal(x.grossMinor,x.platformFeeMinor+x.sellerNetMinor);
 assert.equal(x.platformFeeMinor,Math.floor((i*1500+5000)/10000));
}
for(const bad of [-1,0,NaN,Infinity,1.1,Number.MAX_SAFE_INTEGER+3]){
 assert.throws(()=>calculateMarketplaceSplit(bad),/INVALID_MARKET_GROSS_MINOR/);
}
const id="00112233-4455-4666-8777-8899aabbccdd";
assert.equal(isMarketProductId("sasi-market:"+id),true);
assert.equal(marketProductUuid("sasi-market:"+id),id);
assert.equal(isMarketProductId("sasi-market:../escape"),false);
assert.equal(isMarketProductId("sasi-market:fake-id"),false);
console.log("SASI_MARKET_FEES_15_PERCENT_INTEGER_AND_PRODUCT_ID_TEST_PASS");

for(const [raw,expected] of [["0.01",1],["12.3",1230],["12.30",1230],[" 99.99 ",9999],["90071992547409.91",Number.MAX_SAFE_INTEGER]]){
 assert.equal(parseMarketplacePayoutMinorUnits(raw),expected);
}
for(const raw of ["1.001","1.005","1e2","01.00","+1.00","-1.00","90071992547409.92","", "  ",null,123]){
 assert.equal(parseMarketplacePayoutMinorUnits(raw),null,String(raw));
}
