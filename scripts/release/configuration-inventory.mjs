import fs from "node:fs";
import path from "node:path";
const roots=["app","lib","workers","infra"];
const found=new Map();
const register=(name,file)=>{if(!/^[A-Z][A-Z0-9_]+$/.test(name))return;const refs=found.get(name)||new Set();refs.add(file);found.set(name,refs)};
function scan(dir){if(!fs.existsSync(dir))return;for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 if(item.isSymbolicLink()||["node_modules",".git",".next","tmp",".wrangler"].includes(item.name))continue;
 const file=path.join(dir,item.name).replaceAll("\\","/");if(item.isDirectory()){scan(file);continue}
 if(!/\.(?:ts|tsx|js|mjs|cjs|yaml|yml|toml)$/.test(item.name))continue;
 const text=fs.readFileSync(file,"utf8");
 for(const m of text.matchAll(/(?:process\.env|env)\.([A-Z][A-Z0-9_]+)/g))register(m[1],file);
 for(const m of text.matchAll(/(?:process\.env|env)\[\s*["']([A-Z][A-Z0-9_]+)["']\s*\]/g))register(m[1],file);
 for(const m of text.matchAll(/(?:yes|val|num|tasks|envFlag|envValue|envNumber)\(\s*["']([A-Z][A-Z0-9_]+)["']/g))register(m[1],file);
 if(/\.(yaml|yml|toml)$/.test(file))for(const m of text.matchAll(/\$\{([A-Z][A-Z0-9_]+)(?::[^}]*)?\}/g))register(m[1],file);
}}
for(const root of roots)scan(root);
const defaults=new Map();for(const line of fs.readFileSync('.env.example','utf8').split(/\r?\n/)){const m=line.match(/^([A-Z][A-Z0-9_]+)=(.*)$/);if(m){register(m[1],'.env.example');defaults.set(m[1],m[2])}}
const automatic=new Set(['NODE_ENV','VERCEL','VERCEL_ENV','VERCEL_REGION','VERCEL_URL','VERCEL_PROJECT_PRODUCTION_URL','VERCEL_GIT_COMMIT_SHA','VERCEL_GIT_COMMIT_REF','PORT','CI']);
const core=new Set(['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_SITE_URL','SASI_BYOK_ENCRYPTION_KEY','CRON_SECRET']);
function group(name){if(automatic.has(name))return '平台自动提供';if(core.has(name))return '基础配置';if(/EXPERIENCE/.test(name))return '体验模型池';if(/TAVILY|RESEARCH/.test(name))return '网络研究';if(/WECHAT|ALIPAY|PAYPAL|MONEY|REFUND|WITHDRAW|USD_BALANCE/.test(name))return '支付退款';if(/SUPPORT|RESEND|EMAIL|MAIL/.test(name))return '邮件与临时邮箱';if(/R2|S3|STORAGE|UPLOAD|ASSET/.test(name))return '文件存储';if(/DOCUMENT|GOTENBERG|CONVERT/.test(name))return '文档转换';if(/OCR|VISION|VIDEO|AUDIO|IMAGE|DUB|TRANSLAT|MEDIA|TOOL_/.test(name))return '媒体与在线工具';if(/SASI|ARK|OPENAI|GEMINI|XAI|DASHSCOPE|ZHIPU|LUMA|DEEPSEEK/.test(name))return 'SASI与连接';return '其他可选配置'}
const rows=[...found].sort(([a],[b])=>group(a).localeCompare(group(b),'zh')||a.localeCompare(b)).map(([name,files])=>({name,group:group(name),visibility:name.startsWith('NEXT_PUBLIC_')?'公开配置':'仅服务端',requirement:automatic.has(name)?'不要手动添加':core.has(name)?'基础功能需要':'仅启用对应功能时配置',example:defaults.get(name)||'',references:[...files].sort()}));
const out='docs/operations/configuration-20261006';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/variables.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:roots,notice:'按当前源码命名引用汇总；别名和可选项不等于全部必填。不包含任何真实环境变量值。动态名称家族以 .env.example 为准。',variables:rows},null,2));
const quote=v=>'"'+String(v).replaceAll('"','""')+'"';
fs.writeFileSync(out+'/variables.csv','\uFEFF'+[['变量','分组','可见性','何时配置','示例默认值','代码引用'],...rows.map(r=>[r.name,r.group,r.visibility,r.requirement,r.example,r.references.join('; ')])].map(row=>row.map(quote).join(',')).join('\r\n'));
fs.writeFileSync(out+'/all-variable-names.env',rows.filter(r=>!automatic.has(r.name)).map(r=>`# ${r.group} / ${r.requirement}\n${r.name}=${r.example}`).join('\n\n')+'\n');
console.log(`CONFIGURATION_INVENTORY=${rows.length}; no live secrets read or emitted`);
