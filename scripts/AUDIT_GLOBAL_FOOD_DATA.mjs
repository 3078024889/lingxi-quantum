import fs from "node:fs";
const dir="docs/generated-fooddata";
if(!fs.existsSync(dir)){console.log("GLOBAL_DATA_SQL_PRESENT=NO");process.exit(2)}
const files=fs.readdirSync(dir).filter(x=>/^usda-\d+\.sql$/.test(x));
let bytes=0,inserts=0;for(const f of files){const s=fs.readFileSync(`${dir}/${f}`,"utf8");bytes+=Buffer.byteLength(s);inserts+=(s.match(/insert into public\.nutrition_foods/g)||[]).length}
console.log(`GLOBAL_DATA_SQL_FILES=${files.length}`);console.log(`GLOBAL_DATA_SQL_BYTES=${bytes}`);console.log(`GLOBAL_DATA_FOOD_INSERTS=${inserts}`);
if(!files.length||!inserts)process.exit(3);console.log("GLOBAL_DATA_SQL_AUDIT=PASS");
