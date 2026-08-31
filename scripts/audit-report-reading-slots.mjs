import fs from "node:fs";
const source=fs.readFileSync("lib/mini/report-entry-library.ts","utf8");
const expected=["life-map-report","relationship-resonance:deep","relationship-resonance:business","relationship-resonance:other","resilience-report","romance-report","wealth-report","daily-tide-report","tarot-reading","qian-reading"];
const failures=[];const all=[];
for(const key of expected){const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");const match=source.match(new RegExp(`"${escaped}":names\\("([^"]+)"`));if(!match){failures.push(`${key}: missing`);continue}const titles=match[1].split("|");if(titles.length!==11)failures.push(`${key}: expected 11, got ${titles.length}`);for(const title of titles){if(all.includes(title))failures.push(`${key}: duplicate title ${title}`);all.push(title)}}
for(const key of expected){const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");const match=source.match(new RegExp(`"${escaped}":"([^"]+)"\\.split\\("\\|"\\)`));if(!match){failures.push(`${key}: missing eleven reading briefs`);continue}if(match[1].split("|").length!==11)failures.push(`${key}: expected 11 reading briefs`) }
for(const banned of ["问及“","你选择“","当前解决什么","如何形成判断","现实验证入口"]){if(source.includes(banned))failures.push(`banned user-facing phrase: ${banned}`)}
if(all.length!==110)failures.push(`expected 110 distinct slots, got ${all.length}`);
for(const banned of ["其势以「${primary.zh}」为先","三处异境相参","今试一事：","后遇同类情境"]){if(source.includes(banned))failures.push(`repeated report template remains: ${banned}`)}
if(!source.includes('classicalizeChineseSection'))failures.push('all Mini Program report entries must pass through the shared classical editorial layer');
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("Report reading-slot audit passed: 10 products, 110 distinct readings, no answer-grading prose.");
