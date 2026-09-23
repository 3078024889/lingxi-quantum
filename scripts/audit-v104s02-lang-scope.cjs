const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const rel="app/life-map/full/FullReportView.tsx";
const p=path.join(root,rel);
const s=fs.readFileSync(p,"utf8");

// Catch the exact class of regression that broke the latest build:
const sig='function NumberEnergyChart({ items }: { items: { label: string; total: number }[] }) {';
const idx=s.indexOf(sig);
const end=s.indexOf("\n}",idx);
if(idx<0||end<0){console.error("NumberEnergyChart not found");process.exit(1)}
const block=s.slice(idx,end+2);
if(/\blang\b/.test(block)&&!block.includes("const { lang } = useLingxiLang();")){
  console.error("NumberEnergyChart references lang without local useLingxiLang()");
  process.exit(1);
}
console.log("PASS lifemap language-scope audit.");
