const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
module.exports=function readV86Baseline(name){
 const directory=path.resolve(__dirname,'../../tests/fixtures/regression-v86');
 const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
 const entry=manifest.files.find(file=>file.name===name);assert(entry,'Unknown regression baseline');
 const source=fs.readFileSync(path.join(directory,entry.file),'utf8');
 assert.equal(crypto.createHash('sha256').update(source).digest('hex'),entry.sha256,'Historical baseline fixture changed');
 return source;
};
