const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const target=process.argv[2];if(!['main','temp-mail'].includes(target))throw Error('Expected main or temp-mail');
const root=process.cwd(),source=path.resolve(root,'miniapp'),base=path.resolve(root,'_local/handoff/mini-build-v80');
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const out=path.join(base,target+'-'+sha.slice(0,8)+'-'+Date.now());
if(!out.startsWith(base+path.sep)||fs.existsSync(out))throw Error('Unexpected output path');
const tempPages=new Set(['mail-home','web','share','balance','recharge']),tempUtils=new Set(['app-profile.js','share.js','i18n.js']),mainPages=new Set(JSON.parse(fs.readFileSync(path.join(source,'app.json'),'utf8')).pages.map(p=>p.split('/')[1]));
fs.mkdirSync(base,{recursive:true});fs.cpSync(source,out,{recursive:true,filter:p=>{
 if(['project.private.config.json','node_modules'].includes(path.basename(p)))return false;
 if(target==='main'){const rel=path.relative(source,p).replaceAll('\\','/');return !rel.startsWith('pages/')||mainPages.has(rel.split('/')[1]);}
 const rel=path.relative(source,p).replaceAll('\\','/');if(!rel)return true;
 if(rel==='pages'||rel==='utils'||rel==='assets')return true;
 if(rel.startsWith('pages/'))return tempPages.has(rel.split('/')[1]);
 if(rel.startsWith('utils/'))return tempUtils.has(rel.split('/')[1]);
 if(rel.startsWith('assets/'))return rel==='assets/share-lingxifield-20260928.png';
 return ['app.js','app.json','app.wxss','share.wxss','project.config.json','sitemap.json'].includes(rel);
}});
const appId=target==='main'?'wxbf4ae90406e7e26b':'wx3330b29f4613a08e';
const configFile=path.join(out,'project.config.json'),config=JSON.parse(fs.readFileSync(configFile,'utf8'));
config.appid=appId;config.projectname=target==='main'?'lingxi-field':'lingxi-temp-mail';fs.writeFileSync(configFile,JSON.stringify(config,null,2));
if(target==='temp-mail'){
 const ts=require('typescript'),appSource=fs.readFileSync(path.join(out,'app.js'),'utf8'),parsed=ts.createSourceFile('app.js',appSource,ts.ScriptTarget.ES2022,true,ts.ScriptKind.JS);
 const transformed=ts.transform(parsed,[context=>{const visit=node=>{
  if(ts.isPropertyAssignment(node)&&node.name.getText(parsed)==='apiBase')return ts.factory.updatePropertyAssignment(node,node.name,ts.factory.createStringLiteral(''));
  if(ts.isMethodDeclaration(node)&&node.name.getText(parsed)==='onLaunch'){
   const stop=node.body.statements.findIndex(s=>ts.isIfStatement(s)&&s.expression.getText(parsed).includes("profile.sessionMode==='website'"));if(stop<0)throw Error('Website startup boundary not found');
   return ts.factory.updateMethodDeclaration(node,node.modifiers,node.asteriskToken,node.name,node.questionToken,node.typeParameters,node.parameters,node.type,ts.factory.updateBlock(node.body,node.body.statements.slice(0,stop+1)));
  }
  return ts.visitEachChild(node,visit,context);
 };return node=>ts.visitNode(node,visit)}]);
 const specialized=ts.createPrinter().printFile(transformed.transformed[0]);transformed.dispose();if(specialized.includes("require('./utils/api')")||specialized.includes('login()'))throw Error('Main native login remained in secondary package');fs.writeFileSync(path.join(out,'app.js'),specialized);
 const profile={kind:'temp-mail',title:'灵犀场10分临时邮箱',homePath:'/tools/temp-mail',mainAppId:'wxbf4ae90406e7e26b',tempMailAppId:appId,website:'https://lingxifield.cn',sessionMode:'website'};
 fs.writeFileSync(path.join(out,'utils/app-profile.js'),'module.exports='+JSON.stringify(profile)+'\n');
 const appFile=path.join(out,'app.json'),app=JSON.parse(fs.readFileSync(appFile,'utf8'));app.pages=['pages/mail-home/index','pages/web/index','pages/share/index','pages/balance/index','pages/recharge/index'];fs.writeFileSync(appFile,JSON.stringify(app,null,2));
 fs.writeFileSync(path.join(out,'pages/balance/index.js'),"Page({onLoad(){wx.redirectTo({url:'/pages/recharge/index'})}})\n");
 fs.writeFileSync(path.join(out,'pages/balance/index.wxml'),'<view>正在打开账户充值</view>');
 fs.writeFileSync(path.join(out,'sitemap.json'),JSON.stringify({rules:[{action:'allow',page:'pages/mail-home/index'},{action:'disallow',page:'*'}]},null,2));
}
const sourceDirty=Boolean(execFileSync('git',['status','--porcelain','--','miniapp'],{encoding:'utf8',windowsHide:true}).trim());
const receipt={at:new Date().toISOString(),target,appId,sourceSha:sha,sourceDirty,projectPath:out,mode:target==='temp-mail'?'website session; existing main-program WeChat recharge; existing website Alipay checkout':'existing native session and payment',credentialsCopied:false};
fs.writeFileSync(path.join(base,target+'-latest.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
