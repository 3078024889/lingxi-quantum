import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseCnyMinorUnits} from "../lib/alipay.ts";

test("CNY amounts parse into exact integer fen without float rounding",()=>{
 assert.equal(parseCnyMinorUnits("0.01"),1);
 assert.equal(parseCnyMinorUnits("12.3"),1230);
 assert.equal(parseCnyMinorUnits("12.30"),1230);
 assert.equal(parseCnyMinorUnits(12.3),1230);
 assert.equal(parseCnyMinorUnits("90071992547409.91"),9007199254740991);
});

test("CNY parser rejects ambiguous, over-precision and unsafe values",()=>{
 for(const value of ["01.00","1.001","1.005","1e2"," 1.00","1.00 ","+1.00","-1.00","NaN","Infinity", "90071992547409.92", null, {}, Number.NaN, Number.POSITIVE_INFINITY])
  assert.equal(parseCnyMinorUnits(value),null,String(value));
});

test("Alipay creation and callback use the same exact minor-unit parser",()=>{
 const lib=readFileSync("lib/alipay.ts","utf8");
 const notify=readFileSync("app/api/pay/alipay/notify/route.ts","utf8");
 assert.match(lib,/total_amount: formatCnyMinorUnits\(amountMinor\)/);
 assert.match(lib,/parseCnyMinorUnits\(data\.total_amount\)/);
 assert.match(notify,/parseCnyMinorUnits\(order\?\.amount_rmb\)/);
 assert.match(notify,/parseCnyMinorUnits\(params\.total_amount\)/);
 assert.doesNotMatch(notify,/Math\.round\(Number\(params\.total_amount\)/);
});
