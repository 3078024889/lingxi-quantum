#!/usr/bin/env node
import {readdir,readFile,stat} from "node:fs/promises";
import {join,relative} from "node:path";
const root=".open-next";
const found=[];
async function walk(dir){
 for(const e of await readdir(dir,{withFileTypes:true})){
   const p=join(dir,e.name);
   if(e.isDirectory())await walk(p);
   else if(e.isFile()){
     const size=(await stat(p)).size;
     found.push({path:relative(".",p),size});
   }
 }
}
await walk(root);
console.log("LARGEST_OPENNEXT_FILES");
console.log(JSON.stringify(found.sort((a,b)=>b.size-a.size).slice(0,35),null,2));
for(const file of found.filter(x=>x.path.endsWith(".meta.json")&&x.size>150000)){
 try{
   const data=JSON.parse(await readFile(file.path,"utf8"));
   const counted=[];
   for(const [name,o] of Object.entries(data.outputs||{})){
     for(const [input,v] of Object.entries(o.inputs||{}))counted.push({input,output:name,bytes:v.bytesInOutput||0});
   }
   counted.sort((a,b)=>b.bytes-a.bytes);
   console.log("META_INPUT_RANK:"+file.path+" "+counted.length);
   console.log(JSON.stringify(counted.slice(0,45),null,2));
 }catch(e){console.log("META_PARSE_FAILED:"+file.path+":"+(e?.message||"unknown"))}
}
