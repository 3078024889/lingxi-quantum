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

test("no future-use information must not imply cancellation saving",()=>{
 const r=diagnoseAiSpend({currency:"CNY",items:[{name:"Unused AI",monthlyPrice:199,usedPerMonth:0}]});
 assert.equal(r.potentialMonthlySavings,0);
 assert.equal(r.findings[0].status,"review");
});
test("separate CNY and USD inputs cannot be merged",()=>{
 const r=diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:9.99,usedPerMonth:1}]});
 assert.equal(r.currency,"USD");
 assert.equal(r.monthlySpend,9.99);
});
test("reject NaN and negative alternative price",()=>{
 assert.throws(()=>diagnoseAiSpend({currency:"CNY",items:[{name:"A",monthlyPrice:NaN,usedPerMonth:1}]}));
 assert.throws(()=>diagnoseAiSpend({currency:"CNY",items:[{name:"A",monthlyPrice:20,usedPerMonth:1,alternativeMonthlyPrice:-1}]}));
});

test("quota shortage uses only explicit projected demand and monthly quota",()=>{
 const r=diagnoseAiSpend({currency:"USD",items:[{name:"Video credits",monthlyPrice:30,usedPerMonth:8,expectedPerMonth:30,monthlyQuota:12}]});
 assert.equal(r.findings[0].quotaShortfall,18);
 assert.equal(r.potentialMonthlySavings,0);
});
test("quota shortage remains unknown when future demand or quota is missing",()=>{
 const a=diagnoseAiSpend({currency:"CNY",items:[{name:"Video credits",monthlyPrice:30,usedPerMonth:8,monthlyQuota:12}]});
 const b=diagnoseAiSpend({currency:"CNY",items:[{name:"Video credits",monthlyPrice:30,usedPerMonth:8,expectedPerMonth:30}]});
 assert.equal(a.findings[0].quotaShortfall,null);
 assert.equal(b.findings[0].quotaShortfall,null);
});
test("zero and invalid quota boundary",()=>{
 const good=diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:20,usedPerMonth:0,expectedPerMonth:0,monthlyQuota:0}]});
 assert.equal(good.findings[0].quotaShortfall,0);
 assert.throws(()=>diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:20,usedPerMonth:0,monthlyQuota:-1}]}));
 assert.throws(()=>diagnoseAiSpend({currency:"USD",items:[{name:"A",monthlyPrice:20,usedPerMonth:0,monthlyQuota:1.5}]}));
});
