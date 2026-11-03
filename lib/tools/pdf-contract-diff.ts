/** PDF compare works on extractable PDF.js text, never pixels or secure redactions.
 * Defensive contract-oriented summary; not a legal interpretation.
 */
type Match={page:number;value:string};
function uniqueMatches(pages:string[],pattern:RegExp):Match[]{
 const values:Match[]=[];const seen=new Set<string>();
 for(let i=0;i<pages.length;i++){
  const text=(pages[i]||"").replace(/\s+/g," ").trim();
  pattern.lastIndex=0;
  for(const hit of text.matchAll(pattern)){
   const value=hit[0].replace(/\s+/g," ").trim().slice(0,160);
   if(!value)continue;
   const key=(i+1)+":"+value;
   if(seen.has(key))continue;seen.add(key);
   values.push({page:i+1,value});if(values.length>=80)return values;
  }
 }
 return values;
}
function section(title:string,a:Match[],b:Match[]):string{
 const fa=a.map(x=>"Page "+x.page+": "+x.value),fb=b.map(x=>"Page "+x.page+": "+x.value);
 if(JSON.stringify(fa)===JSON.stringify(fb))return "";
 const show=(v:string[])=>v.length?v.slice(0,25).map(x=>"- "+x).join("\n"):"- None extracted";
 return "### "+title+"\n\n**Document A**\n"+show(fa)+"\n\n**Document B**\n"+show(fb)+"\n";
}
const amountRe=/(?:\b(?:USD|CNY|RMB|EUR|GBP|HKD|SGD)\b|[¥￥$€£])\s*\d[\d,]*(?:\.\d{1,2})?/gi;
const dateRe=/(?:\b20\d{2}[-\/.](?:0?[1-9]|1[012])[-\/.](?:0?[1-9]|[12]\d|3[01])\b|\b20\d{2}年(?:0?[1-9]|1[012])月(?:0?[1-9]|[12]\d|3[01])日)/gi;
const clauseRe=/(?:\b(?:Clause|Section|Article)\s+\d+(?:\.\d+)*|第[\d一二三四五六七八九十百]+条)\s*[:：.\-]?\s*.{0,125}/gi;
export function comparePdfTextLayers(a:string[],b:string[]):string{
 if(!Array.isArray(a)||!Array.isArray(b)||!a.length||!b.length||a.every(p=>!p?.trim())||b.every(p=>!p?.trim()))throw Error("PDF_COMPARE_OCR_REQUIRED");
 const intro="# PDF text-layer differences\n\nThis checks extracted text only, not scanned imagery, rendered pixel changes, signature validity or contractual meaning. Review all clauses in the original PDFs.\n\n";
 const sections=[
 section("Amounts / 金额",uniqueMatches(a,amountRe),uniqueMatches(b,amountRe)),
 section("Dates / 日期",uniqueMatches(a,dateRe),uniqueMatches(b,dateRe)),
 section("Clauses / 条款",uniqueMatches(a,clauseRe),uniqueMatches(b,clauseRe))
 ].filter(Boolean);
 const pages:string[]=[];
 for(let i=0;i<Math.max(a.length,b.length);i++){
  if((a[i]||"")!==(b[i]||""))pages.push("### Page "+(i+1)+"\n\n**A**\n"+(a[i]||"[No extractable text]")+"\n\n**B**\n"+(b[i]||"[No extractable text]")+"\n");
 }
 const partial=a.some(x=>!x?.trim())||b.some(x=>!x?.trim());
 return intro+(partial?"> Some pages have no extractable text. A scan may require OCR before comparing.\n\n":"")+
  (sections.length?"## Key differences\n\n"+sections.join("\n")+"\n":"")+
  "## Page-by-page comparison\n\n"+
  (pages.length?pages.join("\n"):"No text-layer differences detected. This does not prove the PDFs look identical.");
}
