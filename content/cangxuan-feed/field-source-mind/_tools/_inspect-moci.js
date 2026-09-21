const fs=require('fs');
const cat=fs.readFileSync('_tools/_thin-refetch/moci_show_3b.txt','utf8');
console.log('=== moci cat3 len', cat.length);
console.log(cat.slice(0,2000));
console.log('---');
// check existing raw html for moci show
const rawDir='_tools/_raw-html';
for (const f of fs.readdirSync(rawDir).filter(x=>/moci/i.test(x))) {
  console.log('raw', f, fs.statSync(rawDir+'/'+f).size);
}
