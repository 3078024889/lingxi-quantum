import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const ROOT = path.resolve(WORK, "../../..");
const STATEMENT_MAX = 900;
const OVERLAP = 120;

function sha256(s){ return crypto.createHash("sha256").update(s,"utf8").digest("hex"); }
function stripPriority(raw){
  const m=raw.match(/^TITLE:[\s\S]*?\n---\n\n([\s\S]*)$/);
  if (m) return m[1];
  const m2=raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
  if (m2) return m2[1];
  // some priority files have TITLE/SOURCE/HTML_STRIPPED headers without ---
  const m3=raw.match(/^TITLE:[\s\S]*?\n\n([\s\S]*)$/);
  return m3?m3[1]:raw;
}
function stripSite(raw){
  const m=raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
  return m?m[1]:raw;
}
function chunkBody(text, max=STATEMENT_MAX, overlap=OVERLAP){
  const t=text.replace(/\r\n/g,"\n").trim();
  if (!t) return [];
  if (t.length<=max) return [t];
  const chunks=[]; let i=0;
  while (i<t.length){
    let end=Math.min(t.length, i+max);
    if (end<t.length){
      const window=t.slice(i,end);
      let br=window.lastIndexOf("\n\n");
      if (br<max*0.4) br=window.lastIndexOf("\n");
      if (br<max*0.4) br=Math.max(window.lastIndexOf("。"), window.lastIndexOf("！"), window.lastIndexOf("？"), window.lastIndexOf("."));
      if (br>=max*0.4) end=i+br+1;
    }
    const piece=t.slice(i,end).trim();
    if (piece) chunks.push(piece);
    if (end>=t.length) break;
    i=Math.max(i+1, end-overlap);
  }
  return chunks;
}

const priGaps = [
  {file:'lyricus_4.txt', title:'理瑞克斯会话4'},
  {file:'lyricus_5.txt', title:'理瑞克斯会话5'},
  {file:'lyricus_6.txt', title:'理瑞克斯会话6'},
  {file:'lyricus_intro.txt', title:'阈限宇宙起源论'},
  {file:'philosophy_blueprint.txt', title:'勘探的蓝图'},
  {file:'philosophy_modes.txt', title:'转变中的存在模式'},
  {file:'mahu_interview_index.txt', title:'玛呼访谈索引'},
];

const siteNew = [
  {file:'wm_cn_belief_energy.txt', title:'信念及其能量系统', url:'https://www.wingmakers.com.cn/works.html?id=54'},
  {file:'moci_show_3.txt', title:'联合创始人/创始的洞见', url:'https://www.mocilife.cn/index.php?c=category&id=3'},
  {file:'wm_cn_download.txt', title:'下载页', url:'https://www.wingmakers.com.cn/download.html'},
  {file:'wm_cn_lyricus_index.txt', title:'理瑞克斯', url:'https://www.wingmakers.com.cn/works.html?id=3'},
  {file:'wm_cn_practitioner.txt', title:'实践者', url:'https://www.wingmakers.com.cn/works.html?id=45'},
  {file:'wm_cn_wm_tools.txt', title:'造翼者工具', url:'https://www.wingmakers.com.cn/works.html?id=47'},
  {file:'wm_cn_diagram.txt', title:'图解', url:'https://www.wingmakers.com.cn/about.html?id=14'},
  {file:'wmc_diagram.txt', title:'图表', url:'https://www.wingmakerschina.com/2017/12/08/diagram/'},
  {file:'wmc_dohrman.txt', title:'神谕石', url:'https://www.wingmakerschina.com/2017/12/09/dohrman/'},
  {file:'wmc_lyricus.txt', title:'理律克斯专栏', url:'https://www.wingmakerschina.com/2022/07/13/lyricus/'},
  {file:'wmc_practitioner.txt', title:'实践者', url:'https://www.wingmakerschina.com/2020/07/29/practitioner/'},
  {file:'jm_cat_4.txt', title:'文章_詹姆斯玛呼中文站', url:'https://www.jamesmahu.com.cn/index.php?c=category&id=4'},
];

const priInc=[];
for (const rec of priGaps){
  const fp=path.join(WORK,'extracts','priority',rec.file);
  const body=stripPriority(fs.readFileSync(fp,'utf8')).trim();
  if (body.length<2000 && rec.file!=='mahu_interview_index.txt') { console.log('skip pri short', rec.file, body.length); continue; }
  if (body.length<2000) { console.log('skip pri still short', rec.file, body.length); continue; }
  const parts=chunkBody(body);
  parts.forEach((statement, idx)=>{
    priInc.push({
      category:'SCRIPT',
      title:`${rec.title} ·全文${idx+1}`.slice(0,200),
      statement,
      evidence:`fulltext fragment extracts/priority/${rec.file} body_chars=${body.length} part=${idx+1}/${parts.length}`.slice(0,2000),
      tier:'gold', trainability:'trainable', review_status:'approved',
      content_hash: sha256(`SCRIPT:${statement}`),
      domain:'field-source-priority-fulltext',
      sourceFile: rec.file,
      bucket:'priority',
      rightsScope:'licensed_open',
      ingestMode:'fulltext_chunk_1k',
    });
  });
  console.log('pri', rec.file, 'body', body.length, 'chunks', parts.length);
}

const siteInc=[];
for (const rec of siteNew){
  const fp=path.join(WORK,'extracts','site-rest',rec.file);
  const body=stripSite(fs.readFileSync(fp,'utf8')).trim();
  if (body.length<2000) { console.log('skip site short', rec.file, body.length); continue; }
  const parts=chunkBody(body);
  parts.forEach((statement, idx)=>{
    siteInc.push({
      category:'SCRIPT',
      title:`${rec.title} ·全文${idx+1}`.slice(0,200),
      statement,
      evidence:`fulltext fragment extracts/site-rest/${rec.file} body_chars=${body.length} part=${idx+1}/${parts.length}`.slice(0,2000),
      tier:'gold', trainability:'trainable', review_status:'approved',
      content_hash: sha256(`SCRIPT:${statement}`),
      domain:'field-source-site-rest-fulltext',
      sourceFile: rec.file,
      bucket:'site-rest',
      rightsScope:'licensed_open',
      ingestMode:'fulltext_chunk_1k',
      sourceUrl: rec.url||'',
    });
  });
  console.log('site', rec.file, 'body', body.length, 'chunks', parts.length);
}

const priPath=path.join(WORK,'foundry-ingest','04-seed-knowledge-incremental-priority-gapfill.json');
const sitePath=path.join(WORK,'foundry-ingest','04-seed-knowledge-incremental-site-rest-gapfill.json');
fs.writeFileSync(priPath, JSON.stringify(priInc,null,2),'utf8');
fs.writeFileSync(sitePath, JSON.stringify(siteInc,null,2),'utf8');
console.log('wrote', priPath, priInc.length);
console.log('wrote', sitePath, siteInc.length);

function loadEnvLocal(){
  const p=path.join(ROOT,'.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p,'utf8').split(/\r?\n/)){
    const m=line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v=m[2].trim();
    if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    process.env[m[1]]=v;
  }
}
loadEnvLocal();
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId=process.env.CANGXUAN_SEED_USER_ID;
if (!url||!key||!userId){ console.error('missing env', {url:!!url,key:!!key,userId:!!userId}); process.exit(1); }

let createClient;
try { ({createClient}=require(path.join(ROOT,'node_modules/@supabase/supabase-js'))); }
catch { ({createClient}=await import('@supabase/supabase-js')); }
const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const sourceId='b8a7852d-dd26-4594-9746-fda7dd49846c';
const {data:src,error:se}=await admin.from('cangxuan_sources').select('id,title,extracted_count').eq('id',sourceId).eq('user_id',userId).maybeSingle();
if (se){ console.error(se.message); process.exit(1); }
if (!src){ console.error('source not found'); process.exit(1); }
console.log('[source]', src.id, src.title, 'extracted', src.extracted_count);

async function ingest(items, label){
  let ok=0, skipped=0, errors=0;
  for (const item of items){
    const content_hash=item.content_hash||sha256(`${item.category}:${item.statement}`);
    const {data:existing}=await admin.from('cangxuan_knowledge_items').select('id').eq('user_id',userId).eq('content_hash',content_hash).maybeSingle();
    if (existing){ skipped++; continue; }
    const {error}=await admin.from('cangxuan_knowledge_items').insert({
      user_id:userId, source_id:sourceId,
      category:item.category||'SCRIPT',
      title:String(item.title||'').slice(0,200),
      statement:String(item.statement||'').slice(0,9000),
      evidence:String(item.evidence||'').slice(0,2000),
      tier:item.tier||'gold', trainability:'trainable', quality_score:0.95, review_status:'approved', content_hash,
    });
    if (error){ errors++; if (errors<=5) console.error('ERR', item.title, error.message); continue; }
    ok++;
    if (ok%25===0) console.log(label,'inserted',ok);
  }
  return {ok,skipped,errors};
}

const all=[...priInc, ...siteInc];
const r=await ingest(all, 'gapfill');
await admin.from('cangxuan_sources').update({extracted_count:(src.extracted_count||0)+r.ok}).eq('id',sourceId);
const result={inserted:r.ok, skippedExisting:r.skipped, errors:r.errors, incrementalFile:all.length, priorityChunks:priInc.length, siteRestChunks:siteInc.length, sourceId, mode:'thin_and_priority_gapfill', at:new Date().toISOString()};
fs.writeFileSync(path.join(WORK,'foundry-ingest','05-incremental-gapfill-ingest.json'), JSON.stringify(result,null,2),'utf8');
console.log(JSON.stringify(result,null,2));
