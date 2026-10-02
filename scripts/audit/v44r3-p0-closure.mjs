import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {searchToolItems,isLikelyToolQuery} from '../../lib/tools/search-intents-v44r2.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>{if(!v)throw new Error(m)};
const hub=read('components/tools/ToolsHubV11.tsx');
must(hub.includes('const list = useMemo<ToolItem[]>(() => searchToolItems('),'V44R3_TOOL_LIST_NOT_TYPESAFE');
must(hub.includes('V44R2_MULTILINGUAL_INTENT_SEARCH'),'V44R3_SEARCH_MARKER_MISSING');
must(hub.includes('searchToolItems'),'V44R3_SEARCH_ENGINE_NOT_CONNECTED');

const forbidden=['图片已采用紧凑横向浏览','视觉说明改为紧凑横向展示','9 张视觉图已压缩为轻量 WebP','Nine lightweight visuals in a compact horizontal strip','9 个真实使用场景','9 个场景放在页面上方','一排浏览','横向展示'];
for(const p of ['app/tools/temp-mail/page.tsx','app/tools/burn-after-read/page.tsx','components/tools/FoodCaloriePage.tsx']){
 const s=read(p); for(const x of forbidden) must(!s.includes(x),`V44R3_FRONTEND_ENGINEERING_COPY:${p}:${x}`);
}
const promo=read('components/tools/ToolPromoStrip.tsx');
must(!promo.includes('{images.length} / {images.length}'),'V44R3_FAKE_PROMO_PROGRESS_REMAINS');
const home=read('components/HomeProblemHub.tsx');
must(home.includes('isLikelyToolQuery'),'V44R3_HOME_INTENT_ROUTER_MISSING');
must(home.includes('/tools?q='),'V44R3_HOME_QUERY_PROPAGATION_MISSING');

let total=0;
for(let i=1;i<=9;i++){
 const p=`public/images/tool-stories/food-calorie/food-calorie-${String(i).padStart(2,'0')}.webp`;
 must(fs.existsSync(p),`V44R3_FOOD_VISUAL_MISSING:${p}`);
 const size=fs.statSync(p).size; total+=size;
 must(size<100*1024,`V44R3_FOOD_VISUAL_TOO_LARGE:${p}:${size}`);
 const meta=await sharp(p).metadata();
 must(meta.width===480&&meta.height===480,`V44R3_FOOD_VISUAL_DIMENSIONS:${p}:${meta.width}x${meta.height}`);
 must(meta.format==='webp',`V44R3_FOOD_VISUAL_FORMAT:${p}:${meta.format}`);
 await sharp(p).raw().toBuffer();
}
must(total<900*1024,`V44R3_FOOD_VISUAL_TOTAL_TOO_LARGE:${total}`);

const fixtures=[
 ['我要压缩PDF','/tools/pdf-compress'],['I need to compress a PDF','/tools/pdf-compress'],['PDFを圧縮したい','/tools/pdf-compress'],
 ['PDF 압축하고 싶어요','/tools/pdf-compress'],['je veux compresser un PDF','/tools/pdf-compress'],['ich möchte PDF komprimieren','/tools/pdf-compress'],
 ['quiero comprimir un PDF','/tools/pdf-compress'],['quero compactar PDF','/tools/pdf-compress'],['أريد ضغط PDF','/tools/pdf-compress'],
 ['把图片里的文字提出来','/tools/ocr'],['remove watermark from video','/tools/video-watermark-remover'],['correo temporal','/tools/temp-mail'],['سعرات الطعام','/tools/food-calorie']
];
const items=[...new Set(fixtures.map(x=>x[1]))].map(href=>({href,titleZh:'',titleEn:'',descZh:'',descEn:''}));
for(const [query,expected] of fixtures){
 const list=searchToolItems(items,query,'all',()=> 'file',()=> '');
 must(list[0]?.href===expected,`V44R3_SEARCH_FIXTURE:${query}:${list[0]?.href||'NONE'}!=${expected}`);
 must(isLikelyToolQuery(query),`V44R3_HOME_TOOL_DETECTION:${query}`);
}

const statusText=execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'});
const changed=statusText.split(/\r?\n/)
 .filter(line=>line.length>=3)
 .map(line=>line.slice(3).trim())
 .map(p=>p.includes(' -> ')?p.split(' -> ').pop():p)
 .filter(Boolean)
 .filter(p=>!p.startsWith('.lingxifield-backups/'))
 .filter(p=>p!=='imports/tongshi-pipeline/manifests/hourly-tick.log');
const allow=new Set([
 'app/tools/burn-after-read/page.tsx','app/tools/temp-mail/page.tsx','components/HomeProblemHub.tsx',
 'components/tools/FoodCaloriePage.tsx','components/tools/ToolPromoStrip.tsx','components/tools/ToolsHubV11.tsx',
 'lib/tools/search-intents-v44r2.mjs','scripts/audit/v44r2-p0-closure.mjs','tests/final-closure/search-intent-v44r2.spec.ts',
 'scripts/audit/v44r3-p0-closure.mjs'
]);
for(const p of changed)must(allow.has(p),`V44R3_UNEXPECTED_FILE_CHANGED:${p}`);
console.log(`V44R3_SEARCH_FIXTURES=${fixtures.length}`);
console.log(`V44R3_FOOD_VISUAL_TOTAL_BYTES=${total}`);
console.log('V44R3_TYPESCRIPT_SEARCH_LIST=PASS');
console.log('V44R3_FRONTEND_COPY_CLEAN=PASS');
console.log('V44R3_MULTILINGUAL_SEARCH_INTENT=PASS');
console.log('V44R3_HOME_QUERY_PROPAGATION=PASS');
console.log('V44R3_PROMO_FALSE_PROGRESS_REMOVED=PASS');
console.log('V44R3_FOOD_VISUAL_REAL_DECODE=PASS');
console.log('V44R3_PROTECTED_CHANGE_ALLOWLIST=PASS');
console.log('LINGXIFIELD_V44R3_P0_CLOSURE=PASS');
