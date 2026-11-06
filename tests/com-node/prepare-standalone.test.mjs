import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync,existsSync,lstatSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {prepareNodeBundle} from "../../scripts/com-node/prepare-standalone.mjs";
function write(file,content){mkdirSync(join(file,".."),{recursive:true});writeFileSync(file,content)}
function fixture(){
 const base=mkdtempSync(join(tmpdir(),"com-node-fixture-")),root=join(base,"repo");
 write(join(root,".next/standalone/server.js"),"console.log('safe')\n");
 write(join(root,".next/standalone/node_modules/.pnpm/dep/index.js"),"module.exports=42\n");
 write(join(root,".next/standalone/node_modules/next/package.json"),JSON.stringify({name:"next",version:"15.5.27"}));
 write(join(root,"node_modules/next/package.json"),JSON.stringify({name:"next",version:"15.5.27",dependencies:{"styled-jsx":"5.1.0"}}));
 write(join(root,"node_modules/styled-jsx/package.json"),JSON.stringify({name:"styled-jsx",version:"5.1.0",dependencies:{"client-only":"0.0.1"}}));
 write(join(root,"node_modules/styled-jsx/index.js"),"module.exports=1");
 write(join(root,"node_modules/client-only/package.json"),JSON.stringify({name:"client-only",version:"0.0.1"}));
 write(join(root,"node_modules/client-only/index.js"),"module.exports=1");
 write(join(root,"node_modules/react/package.json"),JSON.stringify({name:"react",version:"18.3.1"}));
 write(join(root,"node_modules/react-dom/package.json"),JSON.stringify({name:"react-dom",version:"18.3.1"}));
 mkdirSync(join(root,".next/standalone/node_modules"),{recursive:true});
 symlinkSync(".pnpm/dep",join(root,".next/standalone/node_modules/dep"),"dir");
 write(join(root,".next/static/app.js"),"STATIC\n");
 write(join(root,"public/favicon.ico"),"ICON\n");
 return{root,base,dest:join(base,"isolated")};
}
test("copies Next standalone with pnpm package links fully dereferenced",()=>{
 const {root,base,dest}=fixture();
 try{
  const report=prepareNodeBundle({projectRoot:root,outputRoot:dest});
  assert.equal(report.isolation,true);
  assert.equal(report.productionReady,false);
  assert.equal(existsSync(join(dest,"server.js")),true);
  assert.equal(existsSync(join(dest,"node_modules/dep/index.js")),true);
  assert.equal(existsSync(join(dest,"node_modules/styled-jsx/package.json")),true);
  assert.equal(existsSync(join(dest,"node_modules/client-only/package.json")),true);
  assert.equal(report.runtimeDependenciesMaterialized.includes("styled-jsx"),true);
  assert.equal(lstatSync(join(dest,"node_modules/dep")).isSymbolicLink(),false);
  assert.equal(existsSync(join(dest,".next/static/app.js")),true);
  assert.equal(existsSync(join(dest,"public/favicon.ico")),true);
 }finally{rmSync(base,{recursive:true,force:true})}
});
test("rejects symlinks escaping the source project before copying",()=>{
 const {root,base,dest}=fixture();
 try{
  symlinkSync("/etc/passwd",join(root,".next/standalone/node_modules/secret"));
  assert.throws(()=>prepareNodeBundle({projectRoot:root,outputRoot:dest}),/STANDALONE_SYMLINK_ESCAPE/);
  assert.equal(existsSync(dest),false);
 }finally{rmSync(base,{recursive:true,force:true})}
});
test("rejects output under the original project or a second packaging attempt",()=>{
 const {root,base,dest}=fixture();
 try{
  assert.throws(()=>prepareNodeBundle({projectRoot:root,outputRoot:join(root,"release")}),/MUST_BE_ISOLATED/);
  prepareNodeBundle({projectRoot:root,outputRoot:dest});
  assert.throws(()=>prepareNodeBundle({projectRoot:root,outputRoot:dest}),/ALREADY_EXISTS/);
 }finally{rmSync(base,{recursive:true,force:true})}
});
