import fs from"node:fs";import path from"node:path";
const dir="supabase/migrations";let count=0;
for(const name of fs.readdirSync(dir).filter(x=>x.endsWith(".sql"))){
 const b=fs.readFileSync(path.join(dir,name));count++;
 if(b.length>=3&&b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF)throw new Error("R16_SQL_UTF8_BOM:"+name);
 if(b.length>=2&&((b[0]===0xFF&&b[1]===0xFE)||(b[0]===0xFE&&b[1]===0xFF)))throw new Error("R16_SQL_UTF16_BOM:"+name);
}
console.log("R16_SQL_MIGRATIONS_SCANNED="+count);
console.log("R16_SQL_MIGRATION_ENCODING=PASS");
