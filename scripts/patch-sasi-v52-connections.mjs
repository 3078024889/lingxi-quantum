import fs from "node:fs";

const file="app/sasi/ConnectionCenter.tsx";
let src=fs.readFileSync(file,"utf8");
const before=src;

src=src.replace(
  'body: JSON.stringify({ service: selected.id, apiKey })',
  'body: JSON.stringify({ provider: selected.id, apiKey })'
);
src=src.replace(
  'body: JSON.stringify({ service: selected.id })',
  'body: JSON.stringify({ provider: selected.id })'
);
src=src.replace(
  '`/api/sasi/connections?service=${encodeURIComponent(selected.id)}`',
  '`/api/sasi/connections?provider=${encodeURIComponent(selected.id)}`'
);

if(src===before)throw new Error("SASI_V52_CONNECTION_PATCH_NOT_APPLIED");
for(const bad of [
  'JSON.stringify({ service: selected.id, apiKey })',
  'JSON.stringify({ service: selected.id })',
  '/api/sasi/connections?service='
]){
  if(src.includes(bad))throw new Error(`SASI_V52_CONNECTION_OLD_CONTRACT_REMAINS:${bad}`);
}
fs.writeFileSync(file,src,"utf8");
console.log("SASI_V52_CONNECTION_PATCH=PASS");
