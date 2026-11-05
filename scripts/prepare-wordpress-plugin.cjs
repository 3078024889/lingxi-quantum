/**
 * Deterministic first-party WordPress installer. Never packages secrets, accounts,
 * build artifacts or any other files from the monorepo.
 */
const fs=require("node:fs");
const path=require("node:path");
const JSZip=require("jszip");

const root=path.resolve(__dirname,"..");
const folder="lingxifield-widgets";
const sourceRoot=path.join(root,"integrations","wordpress",folder);
const allowed=[
 "lingxifield-widgets.php",
 "readme.txt",
 "README.md",
 "assets/lingxifield-v1.js"
];
const output=path.join(root,"public","downloads","lingxifield-siai-wordpress.zip");

async function build(){
 const zip=new JSZip();
 const canonical=fs.readFileSync(path.join(root,"public","widgets","lingxifield-v1.js"));
 const bundled=fs.readFileSync(path.join(sourceRoot,"assets","lingxifield-v1.js"));
 if(!canonical.equals(bundled))throw Error("WORDPRESS_WIDGET_SOURCE_MISMATCH");
 for(const relative of allowed){
  const absolute=path.resolve(sourceRoot,relative);
  if(!absolute.startsWith(sourceRoot+path.sep))throw Error("WORDPRESS_PLUGIN_PATH_INVALID");
  const bytes=fs.readFileSync(absolute);
  if(bytes.length>200000)throw Error("WORDPRESS_ASSET_TOO_LARGE");
  zip.file(folder+"/"+relative,bytes,{date:new Date("2026-01-01T00:00:00Z"),unixPermissions:0o644});
 }
 const bytes=await zip.generateAsync({type:"nodebuffer",compression:"DEFLATE",compressionOptions:{level:6},platform:"UNIX"});
 if(bytes.length>300000)throw Error("WORDPRESS_PACKAGE_TOO_LARGE");
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,bytes);
 const checked=await JSZip.loadAsync(bytes);
 const members=Object.keys(checked.files).filter(x=>!checked.files[x].dir).sort();
 if(JSON.stringify(members)!==JSON.stringify(allowed.map(x=>folder+"/"+x).sort()))throw Error("WORDPRESS_PACKAGE_CONTENTS_MISMATCH");
 process.stdout.write("LINGXIFIELD_WORDPRESS_INSTALLER_READY bytes="+bytes.length+"\n");
}
build().catch(e=>{console.error(e);process.exitCode=1});
