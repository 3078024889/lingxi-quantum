const fs=require('node:fs'),{spawnSync}=require('node:child_process');
async function main(){
 const inventory=spawnSync(process.execPath,['scripts/audit/tool-function-inventory-v83.cjs'],{encoding:'utf8',windowsHide:true});if(inventory.status!==0)throw Error(inventory.stderr||inventory.stdout);
 const tools=JSON.parse(fs.readFileSync('_local/handoff/tool-audit-v83/inventory.json','utf8')).rows;
 const bases=process.argv.slice(2).length?process.argv.slice(2):['https://lingxifield.com','https://lingxifield.cn'];
 const tasks=bases.flatMap(base=>[...tools.map(tool=>({base,path:'/tools/'+tool.slug,kind:'tool'})),...['zh','en','ja','ko','fr','de','es','pt','ar'].map(lang=>({base,path:(lang==='zh'?'':'/'+lang)+'/tools',kind:'locale',lang}))]);
 const rows=[];
 for(let start=0;start<tasks.length;start+=4){await Promise.all(tasks.slice(start,start+4).map(async task=>{
  const began=Date.now();try{const response=await fetch(task.base+task.path,{signal:AbortSignal.timeout(20000)}),body=await response.text();const expectedLang=task.lang==='zh'?'zh-CN':task.lang;const serverHtmlLang=body.match(/<html[^>]*lang="([^"]+)"/)?.[1];const localeOk=!expectedLang||body.includes('href="https://lingxifield.com'+task.path+'"');rows.push({...task,status:response.status,serverHtmlLang,languageAttributeMatchesServerHtml:!expectedLang||serverHtmlLang===expectedLang,pass:response.status===200&&/<title>[^<]+<\/title>/.test(body)&&!body.includes('Internal Server Error')&&localeOk,elapsedMs:Date.now()-began})}catch(error){rows.push({...task,pass:false,error:error.message,elapsedMs:Date.now()-began})}
 }));if((start+4)%40===0)console.log('Checked',Math.min(start+4,tasks.length),'of',tasks.length)}
 const report={at:new Date().toISOString(),tools:tools.length,scope:'Public HTTP/title/canonical availability only. Raw server HTML language is separately recorded; the existing head bootstrap sets browser language/direction. Does not assert functional output, account or model delivery.',checks:rows,pass:rows.every(row=>row.pass)};
 const directory=process.env.TOOL_RUNTIME_EVIDENCE||'_local/handoff/tool-runtime-20261015';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(directory+'/live-http.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:rows.length,pass:rows.filter(x=>x.pass).length,failures:rows.filter(x=>!x.pass)}));if(!report.pass)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1});
