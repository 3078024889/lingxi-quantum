#!/usr/bin/env node
/**
 * Read-only, reproducible completeness audit for all reviewed AI platform answers.
 * Publisher silence is reported as missing evidence, never described as positive support.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const facts=read('lib/market-researched-facts.ts');
const prefix='export const RESEARCHED_FACTS:Readonly<Record<string,MarketResearchFact>>=';
const start=facts.indexOf(prefix);
const stop=facts.indexOf(';\nexport const MARKET_RESEARCH_CHECKED_AT',start);
if(start<0||stop<0)throw Error('FACTS_PARSE_ERROR');
const records=JSON.parse(facts.slice(start+prefix.length,stop));
const expected=['free','price','models','region','commercial','payments'];
const fields=['free','price','models','region','commercial'];
const rows=Object.entries(records).map(([id,f])=>{
 const missing=fields.filter(k=>!(typeof f[k]==='string'&&f[k].trim().length>0&&typeof f[k+'Source']==='string'&&f[k+'Source'].startsWith('https://')));
 if(!Array.isArray(f.payments)||f.payments.length===0||!f.paymentSource)missing.push('payments');
 const present=expected.filter(k=>!missing.includes(k));
 return {id,present,missing,answerCount:present.length};
}).sort((a,b)=>a.id.localeCompare(b.id));
const filenames=['app/market-workbench.tsx','app/market-matrix-row.tsx','lib/offer-guide.ts'];
const placeholderPattern=/(待核验|暂无|查看官网|以官网为准|not verified|see vendor checkout|payment depends on vendor checkout|以结算页为准)/ig;
const placeholders=filenames.flatMap(name=>read(name).split('\n').flatMap((line,i)=>{
 const hits=[...line.matchAll(placeholderPattern)];
 return hits.length?[{file:name,line:i+1,count:hits.length,examples:[...new Set(hits.map(x=>x[0]))].slice(0,7)}]:[];
}));
const result={schema:'lingxifield_answer_coverage_v1',published:false,reviewOnly:true,
 totalProducts:rows.length,fieldsPerProduct:expected.length,verifiedAnswerCells:rows.reduce((n,r)=>n+r.answerCount,0),
 missingAnswerCells:rows.reduce((n,r)=>n+r.missing.length,0),
 coverageByField:Object.fromEntries(expected.map(f=>[f,{answered:rows.filter(x=>x.present.includes(f)).length,missingIds:rows.filter(x=>x.missing.includes(f)).map(x=>x.id)}])),
 placeholdersInSource:placeholders,products:rows,
 rule:'Unverified evidence is not a positive answer. An official link is supporting proof, not a substitute for the displayed answer.'
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
