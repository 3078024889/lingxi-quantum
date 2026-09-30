import fs from"node:fs";import path from"node:path";
const copy=[
 ["payload/lib/tools/experience-registry.ts","lib/tools/experience-registry.ts"],
 ["payload/components/tools/AdvancedToolPage.tsx","components/tools/AdvancedToolPage.tsx"],
];
for(const [src,dst]of copy){if(!fs.existsSync(src))continue;fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);console.log("INSTALLED="+dst)}
// Delete superseded construction-only directories after their changes have been integrated.
for(const d of["scripts/master-v16","scripts/release-v17","scripts/v18"]){if(fs.existsSync(d)){fs.rmSync(d,{recursive:true,force:true});console.log("REMOVED_CONSTRUCTION_DIR="+d)}}
// Remove stale preexisting backups, never normal source or real migration .sql.
let removed=0;for(const base of["app","components","lib","scripts","supabase"]){if(!fs.existsSync(base))continue;const st=[base];while(st.length){const p=st.pop();for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory()){if(!/node_modules|\.next|\.git/.test(f))st.push(f)}else if(/\.v\d+(?:_\d+)?-preexisting$/i.test(e.name)){fs.rmSync(f,{force:true});removed++}}}}
console.log("STALE_PREEXISTING_BACKUPS_REMOVED="+removed);
