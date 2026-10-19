// Rebuild from the actual browser inventory and operation artifacts on D:.
// Visibility, a click, and a verified result are kept as separate evidence.
const fs=require('fs'),path=require('path');
const root=process.argv[2]||'output/playwright',inventory=JSON.parse(fs.readFileSync(path.join(root,'20261019-live-control-inventory.json'),'utf8'));
const artifacts=[];
for(const directory of ['20261019-expanded-live','20261019-copy-journeys','20261019-live-delivery-retest','20261019-pdf-editor-retest','20261019-local-share-regression','20261019-share-recovery-retest']){
 const base=path.join(root,directory);if(!fs.existsSync(base))continue;
 const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())walk(target);else if(entry.name==='tool-journey.json')artifacts.push({file:target,...JSON.parse(fs.readFileSync(target,'utf8'))})}};walk(base);
}
const rows=inventory.rows.map(row=>{
 const journeys=artifacts.filter(a=>a.events?.some(e=>{try{return new URL(e.url).pathname==='/tools/'+row.slug}catch{return false}}));
 const interactions=journeys.flatMap(j=>j.events.filter(e=>['click','change'].includes(e.kind)&&e.url?.includes('/tools/'+row.slug)).map(e=>({kind:e.kind,tag:e.tag,label:e.label,value:e.value,testId:e.testId,evidence:j.file,runStatus:j.status})));
 return{...row,interactions,acceptance:'Pending individual result checks; interaction evidence alone does not mark controls passed'};
});
const summary={tools:rows.length,initialControls:rows.reduce((n,r)=>n+r.pendingControls.length,0),toolsWithInteractionLogs:rows.filter(r=>r.interactions.length).length,limits:'Initial controls exclude post-output/dialog controls. Those branches must also be exercised and verified. Historical evidence, observed controls and isolated share/payment/provider calls do not certify complete acceptance.',rows};
fs.writeFileSync(path.join(root,'20261019-tool-button-ledger.json'),JSON.stringify(summary,null,2));
const escape=s=>String(s||'').replaceAll('|','\\|').replace(/[\r\n]+/g,' ').slice(0,180);
const lines=['# 全站逐按钮审计台账（持续执行）','',`公开工具 ${summary.tools} 个；真实浏览器初始控件 ${summary.initialControls} 项；${summary.toolsWithInteractionLogs} 个工具已有本轮交互轨迹。`,'','状态保持待逐项核验。控件出现、发生点击、下载产物正确、微信实际收件分别记录；下表不表示全站已通过。输出后按钮、弹窗和选项分支还要按操作轨迹继续补齐。','','已完成专项：复印排版 42 步/12 份 PDF；图片转 PDF 22 步/19 组参数；PDF 经微信附件发送、打开、另存的字节核对；PNG 经网站复制、微信粘贴发送、另存的像素核对。原生系统分享至 Weixin 仍复现失败。','','| 工具 | 初始控件与选项（待核验） | 已记录交互次数 |','| --- | --- | ---: |'];
for(const row of rows){const controls=row.pendingControls.map(c=>escape(`${c.tag}${c.type?'('+c.type+')':''}: ${c.label||'[无可读标签]'}${c.options?' ['+c.options.map(o=>o.value+'='+o.label).join('; ')+']':''}${c.disabled?' [初始禁用]':''}`)).join('<br>');lines.push(`| ${escape(row.title)} (${row.slug}) | ${controls||'[需从实际输入后的界面补齐]'} | ${row.interactions.length} |`)}
lines.push('','原始证据：`output/playwright/20261019-live-control-inventory.json`、`20261019-tool-button-ledger.json` 及各目录的 `tool-journey.json`。详细通过/失败范围见同目录审计报告。');
fs.writeFileSync('docs/operations/tools-button-matrix-20261019.md',lines.join('\n')+'\n');console.log(JSON.stringify({tools:summary.tools,initialControls:summary.initialControls,toolsWithInteractionLogs:summary.toolsWithInteractionLogs}));
