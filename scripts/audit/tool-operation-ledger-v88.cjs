const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require('./tool-function-inventory-v83.cjs');
const inventory=JSON.parse(fs.readFileSync('_local/handoff/tool-audit-v83/inventory.json','utf8'));
const reports=process.argv.slice(2),entries=[],sources=new Map();
const accepted=/^(daily-export-quota|subtitle-translation|heic-output|file-delivery|pdf-to-image-output|remaining-local-output|screenshot-redaction|pdf-redaction-output|batch-pdf-paid-output|paid-local-output|paid-return|additional-tool-output|archive-tools|batch-zip|developer-real-output|function-output|id-generator|image-transparency|json-source|local-tools|ocr-runtime|qr-cron-output|regex-recovery|resize-quality|tool-real-output|document-promotion|pdf-structural-output|c2pa-official-verification)/;
function bodyFor(file,title){
 const full=path.join('tests/final-closure',path.basename(file));if(!fs.existsSync(full))return '';
 if(!sources.has(full))sources.set(full,ts.createSourceFile(full,fs.readFileSync(full,'utf8'),ts.ScriptTarget.Latest,true));const source=sources.get(full);let text='';
 const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function walk(node){if(ts.isCallExpression(node)&&/^test(?:\.only)?$/.test(node.expression.getText(source))){const label=node.arguments[0];let matches=false;if(label&&(ts.isStringLiteral(label)||ts.isNoSubstitutionTemplateLiteral(label)))matches=label.text===title;else if(label&&ts.isTemplateExpression(label)){const pattern='^'+escape(label.head.text)+label.templateSpans.map(span=>'.*?'+escape(span.literal.text)).join('')+'$';matches=new RegExp(pattern).test(title)}if(matches)text=node.arguments.at(-1)?.getText(source)||''}ts.forEachChild(node,walk)}walk(source);return text;
}
for(const report of reports){
 if(!fs.existsSync(report))throw Error('Missing execution report '+report);const data=JSON.parse(fs.readFileSync(report,'utf8'));
 if(Array.isArray(data)){
  for(const row of data)if(row.slug&&row.verified&&!row.error&&!row.unresolved&&!row.blockedPaid&&!row.errors?.length)entries.push({title:row.slug+' — '+row.verified,file:'scripts/audit/free-tool-operations-v88.cjs',project:'desktop-chromium',body:'',report});
  continue;
 }
 function walk(suite){for(const spec of suite.specs||[]){const file=spec.file||suite.file||'';if(!accepted.test(path.basename(file))||spec.title.includes('controls render in'))continue;if(path.basename(file).startsWith('daily-export-quota')&&!spec.title.startsWith('private text notes'))continue;const body=bodyFor(file,spec.title);for(const test of spec.tests||[])if(test.results?.at(-1)?.status==='passed')entries.push({title:spec.title,file,line:spec.line,project:test.projectName,body,report})}for(const child of suite.suites||[])walk(child)}for(const suite of data.suites||[])walk(suite);
}
const known={
 'pdf-remove-metadata':'已修复：原实现遗漏 XMP、日期、自定义属性；封面署名属于正文，保留。',
 'pdf-redact':'已修复：手机滑动误画、半透明预览、单框限制、处理中丢失付款状态；多区域不透明栅格化导出，按文件总页数每页 ¥1 / $1。支付状态隔离，未实际扣款。',
 'screenshot-redact':'已修复同类手机滑动问题；默认浏览，明确框选；黑块完全不透明，模糊处理限制在选区内。',
 'privacy-cleaner':'已修复：PDF 清理曾重新写入软件名；统一清除 Info/XMP。',
 'batch-pdf':'已修复：统一元数据清理；未选择扁平化时不再错误拒绝带表单的文件；处理中保留付款状态，表单、合并与批量输出已实测，支付状态隔离。',
 'pdf-rasterize':'已修复：提高分辨率曾改变纸张物理尺寸。',
 'pdf-attachments':'已修复：本机资源路径、附件文件名冲突、刷新清空结果、无法连续增删；结构读取改用独立解析器。',
 'document-translate':'新增：体验额度翻译与真实文件重建；翻译服务在测试中隔离。复杂 PDF、扫描件、旋转文字、Office 长译文存在明确边界。',
 'url-to-video':'新增：公开网页提取、事实核对、带入 SASI、复用短剧报价；尚未进行付费成片质量验收。',
 'subtitle-translate':'已修复：手机不支持原浏览器翻译接口，新增明确的在线体验预览；保留 WebVTT 元数据、时间轴与样式，缺段拒绝导出。翻译服务与付款隔离，未作实际模型质量结论。',
 'burn-after-read':'已补齐：文字每日按工具/IP/账户五份；付款返回恢复加密草稿，销毁后不能以旧请求重建。附件保持原付费体系；创建 API 与付款在浏览器隔离，数据库另有真实回滚测试。',
};
for(const slug of ['pdf-protect','pdf-unlock','pdf-permissions','pdf-web-optimize'])known[slug]='已修复：引擎本机资源路径与输出文件名不匹配；失败初始化可重新点击恢复。';
for(const slug of ['pdf-inspect','pdf-bookmarks'])known[slug]='已修复：原打包引擎结构查询失败；独立解析页数、附件、书签和跳转页。';
for(const slug of ['ocr','pdf-ocr','pdf-to-word','handwriting-ocr'])known[slug]='本轮前段修复共享 OCR 本站资源、错误返回、超时与恢复；付费完整流程未实付。';
const alias={'no enlargement stretch':'resize-image','PNG to JPG':'png-to-jpg','PDF merge':'merge-pdf','image to PDF':'image-to-pdf','integer base conversion':'number-base-converter','CSV converts':'csv-json','URL parser':'url-parser','JWT decoder':'jwt-decoder','batch images':'batch-image','private text notes':'burn-after-read','mobile-compatible subtitle preview':'subtitle-translate'};
const rows=inventory.rows.map(tool=>{
 const escaped=tool.slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),mention=new RegExp('(^|[^a-z0-9-])'+escaped+'([^a-z0-9-]|$)','i');
 const verified=entries.filter(entry=>mention.test(entry.title)||new RegExp("['\"`]"+escaped+"['\"`]").test(entry.body)||new RegExp('/tools/'+escaped+'[?\'"`]').test(entry.body)||Object.entries(alias).some(([phrase,slug])=>slug===tool.slug&&entry.title.startsWith(phrase)));
 const operations=[...new Set(verified.map(row=>row.file+' ['+row.project+'] '+row.title))];
 const scope=['document-translate','subtitle-translate'].includes(tool.slug)?'文件处理已实测，翻译服务隔离':tool.slug==='url-to-video'?'网页与交接已实测，未实付生成视频':operations.length?'有具体操作/输出证据，不能等同全部功能验收':'仅已有入口检查，尚无本台账认可的操作输出证据';
 return {slug:tool.slug,title:tool.title,kind:tool.kind,scope,checkedOperations:operations.join(' | '),knownIssues:known[tool.slug]||'未据此判定无问题',remaining:'未覆盖的选项、真实文件类别、付费模型交付和微信真机操作不标记为通过'};
});
const directory='_local/handoff/tool-runtime-20261015';fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(directory+'/operation-ledger.json',JSON.stringify({tools:rows.length,withOperationEvidence:rows.filter(r=>r.checkedOperations).length,reports,warning:'A passed case proves its own assertions only. Route checks and source references are not operational acceptance. Provider-isolated output tests do not certify model quality.',rows},null,2));
const keys=Object.keys(rows[0]),quote=value=>'"'+String(value).replaceAll('"','""')+'"';const output='\ufeff'+keys.join(',')+'\n'+rows.map(row=>keys.map(key=>quote(row[key])).join(',')).join('\n');
fs.writeFileSync('docs/operations/tool-operation-ledger-20261015.csv',output);
console.log(JSON.stringify({tools:rows.length,withOperationEvidence:rows.filter(r=>r.checkedOperations).length,ledger:'docs/operations/tool-operation-ledger-20261015.csv'}));
