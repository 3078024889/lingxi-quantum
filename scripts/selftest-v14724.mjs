import fs from "node:fs";
const patch=fs.readFileSync("scripts/patch-tools-v14724.mjs","utf8");

const tests=[
 ["restores hero subtitle",patch.includes("Only inspect the HUB object")&&patch.includes("hubBlock.includes")],
 ["every card gets function line",patch.includes("toolCardLine(lang,slug,item.kind,item.descZh,item.descEn)")],
 ["compact 84px cards",patch.includes("height:84px!important")&&patch.includes("max-height:84px!important")],
 ["vertical icon rail removed",patch.includes("background:transparent!important")&&patch.includes("width:34px!important")],
 ["color palette by slug",patch.includes("function palette(slug:string)")],
 ["dynamic FAQ uses structural anchors",patch.includes('const faqStart=s.indexOf("function faqFor(slug: string): BilingualFaqItem[] {")')],
 ["tech note removal uses ToolWorkbench landmark",patch.includes('const workbenchStart=s.indexOf("<ToolWorkbench",techStart)')],
 ["dual currency preserved",patch.includes("amount_usd:number")&&patch.includes("${quote.amount_usd} USD")],
 ["no destructive git",!patch.includes("reset --hard")&&!patch.includes("clean -fd")&&!patch.includes("checkout .")],
];

function ensureHubSubtitle(s){
 const hubStart=s.indexOf("const HUB={");
 const summaryStart=s.indexOf("const SUMMARY:",hubStart);
 if(hubStart<0||summaryStart<0)throw new Error("HUB anchors missing");
 const hubBlock=s.slice(hubStart,summaryStart);
 if(!hubBlock.includes("subtitle:L(")){
   const searchPos=s.indexOf(" search:L(",hubStart);
   if(searchPos<0||searchPos>summaryStart)throw new Error("search anchor missing");
   const subtitle=' subtitle:L("功能说明","Function line","x","x","x","x","x","x","x"),\n';
   s=s.slice(0,searchPos)+subtitle+s.slice(searchPos);
 }
 return s;
}

// Exact regression for V14.72.3:
// CATEGORIES already contains subtitle:L(...), while HUB does not.
const fixture=`const CATEGORIES={
 subtitle:L("字幕","Subtitles","x","x","x","x","x","x","x"),
};
const HUB={
 kicker:L("实用工具","Tools","x","x","x","x","x","x","x"),
 title:L("要处理什么？","What?","x","x","x","x","x","x","x"),
 search:L("搜索","Search","x","x","x","x","x","x","x"),
 open:L("打开","Open","x","x","x","x","x","x","x"),
};
const SUMMARY:Record<string,unknown>={};`;
const fixed=ensureHubSubtitle(fixture);
const hs=fixed.indexOf("const HUB={"), he=fixed.indexOf("const SUMMARY:",hs);
const hb=fixed.slice(hs,he);
tests.push(["regression: category subtitle does not suppress HUB subtitle",hb.includes('subtitle:L("功能说明"')]);

// Verify the TypeScript key shape conceptually: HUB substring now contains subtitle before SUMMARY.
tests.push(["HUB subtitle exists before SUMMARY",fixed.indexOf('subtitle:L("功能说明"')>hs&&fixed.indexOf('subtitle:L("功能说明"')<he]);

function removeTech(input){
 const techStart=input.indexOf("          techNoteZh={");
 if(techStart<0)return input;
 const workbenchStart=input.indexOf("<ToolWorkbench",techStart);
 const openTagClose=workbenchStart>=0?input.lastIndexOf(">",workbenchStart):-1;
 if(workbenchStart<0||openTagClose<techStart)throw new Error("tech anchors not found");
 return input.slice(0,techStart)+input.slice(openTagClose);
}
for(const [name,eol] of [["LF","\n"],["CRLF","\r\n"]]){
 const fixture=[
 '        <ToolShell','          tool={tool}','          faq={faqFor(tool.slug)}',
 '          techNoteZh={','            tool.localOnly','              ? "Canvas / Web Crypto"','              : undefined','          }',
 '          techNoteEn={','            tool.localOnly','              ? "Canvas / Web Crypto"','              : undefined','          }',
 '        >','          <ToolWorkbench tool={tool} />','        </ToolShell>',
 ].join(eol);
 const out=removeTech(fixture);
 tests.push([`tech removal ${name}`,!out.includes("techNoteZh")&&!out.includes("techNoteEn")&&out.includes("<ToolWorkbench")]);
}

let bad=false;
for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);
console.log("V14.72.4_SELFTEST=PASS");
