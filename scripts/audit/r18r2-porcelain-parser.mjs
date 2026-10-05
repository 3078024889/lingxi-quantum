import fs from"node:fs";

export function parsePorcelainV1Line(line){
 if(typeof line!=="string"||line.length<3)return null;
 const x=line[0],y=line[1];
 let path=line.slice(3).trim();
 if(path.startsWith('"')&&path.endsWith('"'))path=path.slice(1,-1);
 path=path.replaceAll("\\","/");
 return {x,y,path};
}

const fixtures=[
 ["D  .mini-v5-backup-20261004-101944/components/MobileBottomNav.tsx",
  {x:"D",y:" ",path:".mini-v5-backup-20261004-101944/components/MobileBottomNav.tsx"}],
 [" M components/SasiOneSurface.tsx",
  {x:" ",y:"M",path:"components/SasiOneSurface.tsx"}],
 ["?? components/SasiUnifiedLauncher.tsx",
  {x:"?",y:"?",path:"components/SasiUnifiedLauncher.tsx"}],
 ["A  docs/R18_GLOBAL_TOTAL_UNIFICATION_RESEARCH.md",
  {x:"A",y:" ",path:"docs/R18_GLOBAL_TOTAL_UNIFICATION_RESEARCH.md"}]
];

for(const [raw,expected] of fixtures){
 const got=parsePorcelainV1Line(raw);
 if(!got||got.x!==expected.x||got.y!==expected.y||got.path!==expected.path){
  throw new Error("R18R2_PORCELAIN_PARSE_FAILED:"+raw+":"+JSON.stringify(got));
 }
}
console.log("R18R2_PORCELAIN_V1_PARSER_FIXTURES=PASS");
