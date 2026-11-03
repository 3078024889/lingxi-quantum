/** Static, offline editorial UI; no server route and no public candidate indexing. */
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=(x,n=110)=>{const s=String(x||'—');return s.length>n?s.slice(0,n-1)+'…':s};
const FACT_LABEL={price:'真实价格 / 套餐',free:'免费额度',models:'代表模型',regions:'国家与地区',commercial:'商用授权',payment:'付款方式',company:'公司法人资料'};
const REGION_EVIDENCE_LABEL={
 missing:'未找到官方可用地区资料',
 restrictions_only:'仅明确限制地区，不能推断其他国家均可用',
 provider_specific_restrictions:'模型供应商限制不同，不是统一可用地区清单',
 broad_market_statement:'官方公布广泛市场范围，尚非逐国注册/付款实测',
 other_observation_not_country_proof:'已记录地区说明，仍缺逐国实测',
 country_by_country_verified:'逐国验证通过'
};
function sourceLink(f){
 return f.source?'<a href="'+esc(f.source)+'" target="_blank" rel="nofollow noopener noreferrer">官方证据 ↗</a>':'';
}
function factDisplay(f,key,preview=false){
 if(f.status==='missing')return '<span class="missing">尚无官方证据</span>';
 const body=preview?short(f.text,key==='price'?130:100):f.text;
 return '<span>'+esc(body)+'</span>'+(preview?'':sourceLink(f));
}
function completeEvidence(product){
 return '<div class="factgrid">'+Object.entries(product.facts).map(([key,f])=>
  '<div class="fact"><strong>'+esc(FACT_LABEL[key]||key)+'</strong><p>'+factDisplay(f,key)+'</p>'+
  (f.checkedAt?'<small>官方记录日期：'+esc(f.checkedAt)+'</small>':'')+
  (f.extra||[]).map(x=>'<p><span>'+esc(x.text)+'</span> <a href="'+esc(x.source)+
   '" target="_blank" rel="nofollow noopener noreferrer">补充证据 ↗</a></p>').join('')+
  '</div>').join('')+'</div>';
}
function rows(p,i){
 const f=p.facts;
 const values=[p.name,p.company,p.parentGroup,p.legalEntity||'',p.category,...p.tasks,
  ...p.keywords,...Object.values(f).map(x=>x.text||'')].join(' ').normalize('NFKC').toLowerCase();
 const search=esc(values.slice(0,2200));
 const overview='<strong>'+esc(p.name)+'</strong><dl class="publisher">'+
  '<div><dt>公司名称</dt><dd>'+esc(p.company)+'</dd></div>'+
  '<div><dt>法人主体</dt><dd>'+esc(p.legalEntity||'未核实')+'</dd></div>'+
  '<div><dt>所属集团</dt><dd>'+esc(p.parentGroup)+'</dd></div>'+
  '<div><dt>是否上市</dt><dd>未核实上市状态</dd></div>'+
  '<div><dt>成立时间</dt><dd>未核实</dd></div></dl>';
 const missing=p.missingCount>0?'<span class="note">'+p.missingCount+' 项资料待补</span>':
  '<span class="note">7 项来源已记录，待独立审核</span>';
 return '<tr class="product" data-category="'+esc(p.category)+'" data-search="'+search+
  '" data-missing="'+p.missingCount+'" data-id="'+esc(p.id)+'">'+
  '<td class="num">'+(i+1)+'</td><td class="identity">'+overview+'</td>'+
  '<td>'+esc(p.tasks.join(' · '))+'</td>'+
  '<td>'+factDisplay(f.price,'price',true)+'</td>'+
  '<td>'+factDisplay(f.free,'free',true)+'</td>'+
  '<td>'+factDisplay(f.regions,'regions',true)+'<small class="region-proof">'+esc(REGION_EVIDENCE_LABEL[p.regionEvidenceQuality])+'</small></td>'+
  '<td>'+factDisplay(f.payment,'payment',true)+'</td>'+
  '<td>'+factDisplay(f.models,'models',true)+'</td>'+
  '<td>'+factDisplay(f.commercial,'commercial',true)+'</td>'+
  '<td><a class="official" target="_blank" rel="noopener noreferrer" href="'+esc(p.website)+
  '">打开官网 ↗</a></td></tr>'+
  '<tr class="detail" data-owner="'+esc(p.id)+'"><td colspan="10"><details><summary>'+
  '展开 '+esc(p.name)+' 官方依据 · '+p.recordedCount+'/7 项来源　'+missing+'</summary>'+
  '<p class="scope">这是开发分支内部审核材料：官方网页记录 ≠ 独立验证成功 ≠ 厂商认证 ≠ 允许上线。'+
  '逐国注册与付款未经实际账户验证，限制条款不能当成支持国家列表。</p>'+
  completeEvidence(p)+'</details></td></tr>';
}
export function renderCandidateReviewHtml(review){
 if(review.candidateProducts!==30||review.publisherGroups!==28||review.public!==false||
  review.products.some(p=>p.publishApproved||p.visibleToPublic||p.seoIndex))
  throw Error('PUBLIC_CANDIDATE_PREVIEW_FORBIDDEN');
 const categories=[...new Set(review.products.map(p=>p.category))].sort();
 const style=`
 :root{font-family:system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;color:#183a65;background:#f7faff}
 *{box-sizing:border-box}body{margin:0;padding:22px}h1{font-size:26px;margin:0 0 6px}
 .lead{font-size:14px;line-height:1.7;color:#526d8b;margin:0 0 15px}
 .summary{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:15px}.summary>div{border:1px solid #d8e5f4;border-radius:10px;padding:12px 18px;background:#fff;min-width:145px}
 .summary strong{display:block;font-size:23px;color:#185aa7}.summary span{font-size:13px;color:#55708e}
 .filters{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;align-items:center}
 input,select{min-height:38px;min-width:165px;border:1px solid #c8dced;border-radius:7px;background:white;color:#173c67;padding:7px;font-size:14px}
 input{min-width:min(390px,100%);flex:1}.count{font-size:13px;font-weight:700}
 .scroll{overflow:auto;background:#fff;border:1px solid #d7e3f2;border-radius:11px}
 table{min-width:1920px;width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px;line-height:1.55}
 th{background:#e9f2fe;color:#174473;text-align:start;padding:11px 9px;border-bottom:1px solid #d9e5f3}
 td{vertical-align:top;padding:12px 9px;border-bottom:1px solid #e4edf6;overflow-wrap:anywhere}
 tr.product:nth-of-type(4n+3){background:#f8fbff}.num{width:48px}.identity{width:260px}
 .identity>strong{font-size:16px;display:block;margin-bottom:7px}.publisher{display:grid;gap:3px;margin:0}
 .publisher>div{display:grid;grid-template-columns:74px minmax(0,1fr);gap:5px}
 .publisher dt{color:#69819a;font-size:13px}.publisher dd{margin:0;font-weight:600}
 td:not(.identity) span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;line-clamp:4;overflow:hidden}
 .missing{font-size:13px;color:#885229}.region-proof{display:block;margin-top:7px;font-size:12px;color:#765b33;line-height:1.5}.official{display:inline-block;background:#1964c2;color:#fff;padding:7px 9px;border-radius:7px;text-decoration:none}
 .detail td{padding:0 9px 12px!important}.detail details{border:0;background:#f1f6fe;border-radius:8px;padding:7px 12px}
 .detail summary{cursor:pointer;font-weight:700;padding:5px;font-size:14px}.note{font-size:12px;color:#b15b18}
 .scope{font-size:13px;color:#536e8c}.factgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}
 .fact{background:transparent;padding:7px;border-top:1px solid #cbdfef}.fact p{margin:7px 0;white-space:pre-wrap}
 .fact a{color:#185bb1;font-weight:600}.fact small{display:block;color:#66809b;margin-top:5px}
 .empty{padding:18px;text-align:center}
 @media(max-width:760px){body{padding:12px}h1{font-size:22px}.summary>div{min-width:95px;padding:8px}.filters{align-items:stretch}}
 `;
 const script=`
 (()=>{'use strict';
 const search=document.querySelector('#search'),category=document.querySelector('#category');
 const status=document.querySelector('#status'),count=document.querySelector('#visible');
 const rows=[...document.querySelectorAll('tr.product')],details=[...document.querySelectorAll('tr.detail')];
 const byId=new Map(details.map(x=>[x.getAttribute('data-owner'),x]));
 const update=()=>{
  const q=(search.value||'').normalize('NFKC').trim().toLowerCase();
  let found=0;
  for(const row of rows){
   const ok=(!q||row.dataset.search.includes(q))&&(!category.value||category.value===row.dataset.category)&&
    (status.value!=='missing'||Number(row.dataset.missing)>0)&&
    (status.value!=='complete'||Number(row.dataset.missing)===0);
   row.hidden=!ok;const detail=byId.get(row.dataset.id);if(detail)detail.hidden=!ok;
   if(ok)found++;
  }
  count.textContent=String(found);
 };
 [search,category,status].forEach(el=>el.addEventListener(el===search?'input':'change',update));
 update();
 })();
 `;
 const options=categories.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
 return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'+
  '<meta name="robots" content="noindex,nofollow,noarchive">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; img-src \'none\'; connect-src \'none\'; form-action \'none\'; base-uri \'none\'">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>全球 SIAI 30 个候选产品｜内部审核</title><style>'+style+'</style></head><body>'+
  '<h1>全球 SIAI｜30 款候选产品内部审核</h1>'+
  '<p class="lead">实际源数据构建 · 30 款产品 / 28 个集团 · 公司名称、法人、是否上市、成立时间直接在厂商列内竖排展示；没有独立悬浮白框。'+
  '本页仅作为 CI 审核附件，不是用户可见网站、不代表独立测评通过，不允许向搜索引擎提交。</p>'+
  '<p class="lead">国家地区证据分类：'+review.geography.missing+' 款尚无地区资料、'+review.geography.restrictions_only+
  ' 款只有限制条款、'+review.geography.provider_specific_restrictions+' 款受模型供应商限制、'+
  review.geography.broad_market_statement+' 款有官方市场范围声明；逐国账号与支付验证通过：'+
  review.geography.country_by_country_verified+' 款。限制地区名单不能推断其他地区全都支持。</p>'+ 
  '<div class="summary"><div><strong>30</strong><span>产品候选</span></div>'+
  '<div><strong>28</strong><span>去重厂商集团</span></div>'+
  '<div><strong>'+review.totals.observed+'</strong><span>记录官方资料</span></div>'+
  '<div><strong>'+review.totals.missing+'</strong><span>待补资料</span></div>'+
  '<div><strong>0</strong><span>公开上线</span></div></div>'+
  '<div class="filters"><input id="search" aria-label="按产品名称、厂商、功能与官方资料搜索" placeholder="搜索 AI 工具 / 厂商 / 功能 / 条款">'+
  '<select id="category" aria-label="领域"><option value="">全部领域</option>'+options+'</select>'+
  '<select id="status" aria-label="资料完整度"><option value="all">全部候选</option><option value="missing">有缺口</option>'+
  '<option value="complete">7项官网记录（仍待审核）</option></select><span class="count">显示 <b id="visible">30</b> / 30</span></div>'+
  '<div class="scroll" tabindex="0" aria-label="30个候选产品行情表"><table><thead><tr>'+
  ['#','厂商与法人','能做什么','价格','免费额度','地区','付款方式','模型','商用授权','官网'].map(x=>'<th scope="col">'+x+'</th>').join('')+
  '</tr></thead><tbody>'+review.products.map(rows).join('')+'</tbody></table></div>'+
  '<p class="lead">确认全部资料并完成单独审批后，方可进入正式产品目录。这里所有事实都附有厂商原始网页链接。</p>'+
  '<script>'+script+'</script></body></html>';
}
