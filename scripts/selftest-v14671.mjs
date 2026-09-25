function replaceCore(source,before,after){
  if(after!=="" && source.includes(after)) return {source,state:"already"};
  if(!source.includes(before)){
    if(after==="") return {source,state:"already"};
    return {source,state:"missing"};
  }
  return {source:source.replace(before,after),state:"changed"};
}

let x=`type Category = "all" | "qr" | "field";
const categoryLabels = {
  qr: { zh: "二维码", en: "QR" },
  field: { zh: "场域小工具", en: "Field tools" },
};
function registryCategory(category: string){
  if (category === "field") return "field";
  return "utility";
}
const categories: Category[] = ["all", "qr", "field"];`;

let out=replaceCore(x,'type Category = "all" | "qr" | "field";','type Category = "all" | "qr";');
if(out.state==="missing") throw new Error("type replacement missing");
x=out.source;

out=replaceCore(x,`  field: { zh: "场域小工具", en: "Field tools" },
`,"");
if(out.state==="missing") throw new Error("label replacement missing");
x=out.source;

out=replaceCore(x,`  if (category === "field") return "field";
`,"");
if(out.state==="missing") throw new Error("mapping replacement missing");
x=out.source;

out=replaceCore(x,'const categories: Category[] = ["all", "qr", "field"];','const categories: Category[] = ["all", "qr"];');
if(out.state==="missing") throw new Error("categories replacement missing");
x=out.source;

const tests=[
 ["empty-string replacement really deletes",!x.includes("场域小工具")],
 ["field mapping really deletes",!x.includes('category === "field"')],
 ["field type really deletes",!/type Category =[^\n]*"field"/.test(x)],
 ["field button really deletes",!x.includes('"qr", "field"')],
];
let failed=false;
for(const [name,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${name}`);if(!ok)failed=true}
if(failed)process.exit(1);
console.log("V14.67.2_SELFTEST=PASS");
