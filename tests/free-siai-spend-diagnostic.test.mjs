import test from "node:test";
import assert from "node:assert/strict";
import {diagnoseAiSpend} from "../lib/siai/free-spend-diagnostic.ts";
test("zero-usage nonessential subscription flags full monthly potential savings",()=>{
 const r=diagnoseAiSpend({currency:"USD",items:[{name:"AI A",monthlyPrice:20,usedPerMonth:0,expectedPerMonth:0}]});
 assert.equal(r.monthlySpend,20);assert.equal(r.potentialMonthlySavings,20);assert.equal(r.annualizedPotentialSavings,240);
 assert.equal(r.findings[0].status,"review");
});
test("essential subscription is not automatically recommended for cancellation",()=>{
 const r=diagnoseAiSpend({currency:"CNY",items:[{name:"AI A",monthlyPrice:99,usedPerMonth:0,expectedPerMonth:0,essential:true}]});
 assert.equal(r.potentialMonthlySavings,0);assert.equal(r.findings[0].status,"keep");
});
test("lower-cost alternative is treated as candidate, not verified equality",()=>{
 const r=diagnoseAiSpend({currency:"USD",items:[{name:"AI A",monthlyPrice:20,usedPerMonth:5,alternativeMonthlyPrice:10}]});
 assert.equal(r.potentialMonthlySavings,10);assert.equal(r.findings[0].costPerUse,4);
 assert.match(r.findings[0].reason,/确认功能/);
});
test("no alternative or clear idle forecast means no invented savings",()=>{
 const r=diagnoseAiSpend({currency:"USD",items:[{name:"AI A",monthlyPrice:20,usedPerMonth:1,expectedPerMonth:2}]});
 assert.equal(r.potentialMonthlySavings,0);
});
test("rejects duplicate names, invalid values, and excessive items",()=>{
 assert.throws(()=>diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:10,usedPerMonth:1},{name:"a",monthlyPrice:15,usedPerMonth:1}]}));
 assert.throws(()=>diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:-1,usedPerMonth:1}]}));
 assert.throws(()=>diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:1,usedPerMonth:1.5}]}));
 assert.throws(()=>diagnoseAiSpend({currency:"USD",items:Array.from({length:31},(_,i)=>({name:String(i),monthlyPrice:1,usedPerMonth:1}))}));
});
