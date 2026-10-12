const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
(async()=>{
 const secret='isolated-native-signature-test-key-32',records=[],exports={};
 const testProcess={...process,env:{...process.env,SASI_NATIVE_COMPUTE_URL:'http://127.0.0.1:9999',SASI_NATIVE_COMPUTE_SECRET:secret}};
 const imports={'server-only':{},'node:crypto':require('node:crypto'),'./protocol':{isNativeJobPublic:()=>true,SASI_COMPUTE_PROTOCOL_VERSION:'test'},'@/lib/sasi-kernel/models/catalog':{assertCommercialNativeModel:()=>{}}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi-kernel/compute/native-client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,process:testProcess,require:n=>imports[n],URL,Date,AbortSignal,fetch:async(url,options)=>{records.push({target:new URL(url).pathname+new URL(url).search,method:options.method,headers:options.headers,body:options.body||''});return{ok:true,json:async()=>({job:{},ok:true})}}});
 const id='11111111-1111-4111-8111-111111111111';
 await exports.getNativeJob(id,'owner@example.test');await exports.cancelNativeJob(id,'owner@example.test');await exports.submitNativeJob({taskId:id,ownerId:'owner',kind:'reason',input:{prompt:'test'}});
 assert.equal(records.length,3);
 const python=process.env.SASI_SIGNATURE_TEST_PYTHON||'D:/lingxi-quantum/_local/r64-db-runtime/python-test/python.exe';
 const result=spawnSync(python,['scripts/test-native-signature.py'],{input:JSON.stringify({secret,records}),encoding:'utf8',windowsHide:true,timeout:15000});
 if(result.status!==0)throw Error(result.stderr||result.stdout||'PYTHON_SIGNATURE_TEST_FAILED');console.log(result.stdout.trim());
})().catch(e=>{console.error(e);process.exitCode=1});
