const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const [target,mode='compile',version]=process.argv.slice(2);
if(!['main','temp-mail'].includes(target)||!['compile','upload'].includes(mode)||!/^\d+\.\d+(?:\.\d+)?$/.test(version||''))throw Error('Expected target, compile/upload and a numeric version');
const build=JSON.parse(fs.readFileSync('_local/handoff/mini-build-v80/'+target+'-latest.json','utf8'));
const expected=target==='main'?'wxbf4ae90406e7e26b':'wx3330b29f4613a08e';if(build.appId!==expected)throw Error('Wrong AppID');
const key=process.env.LINGXI_MINI_PRIVATE_KEY_PATH||('D:/程序代码生成密钥private.'+expected+'.key');
if(!path.basename(key).includes(expected)||!fs.existsSync(key))throw Error('App-specific upload key is missing; never substitute another program key');
const ci=require(path.resolve('_local/mini-ci-runtime/node_modules/miniprogram-ci'));
const root=path.resolve('_local/handoff/mini-ci-v80');fs.mkdirSync(root,{recursive:true});
if(mode==='upload'){
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
 const release=JSON.parse(fs.readFileSync('_local/handoff/v80-web-release.json','utf8'));
 if(build.sourceDirty!==false||build.sourceSha!==head||release.sha!==head||release.state!=='READY'||release.smokePassed!==true)throw Error('Committed source and verified web deployment must precede Mini Program upload');
}
const project=new ci.Project({appid:expected,type:'miniProgram',projectPath:build.projectPath,privateKeyPath:key,ignores:['node_modules/**/*','project.private.config.json']});
const options={project,version,desc:target==='main'?'修复数字输入、SASI对话恢复与文件交付，新增可分享首页、消息及工具入口':'临时邮箱、实用工具、账户公告、主小程序及官网充值入口',setting:{useProjectConfig:true},robot:1,threads:2,onProgressUpdate:()=>{}};
(async()=>{
 const data=mode==='compile'?await ci.getCompiledResult(options,path.join(root,target+'-'+version+'-compiled.zip')):await ci.upload(options);
 const receipt={at:new Date().toISOString(),target,appId:expected,version,mode,sourceSha:build.sourceSha,success:true,files:mode==='compile'?Object.keys(data):undefined};
 fs.writeFileSync(path.join(root,target+'-'+version+'-'+mode+'.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
})().catch(error=>{console.error(String(error.message||error).slice(0,700));process.exitCode=1});
