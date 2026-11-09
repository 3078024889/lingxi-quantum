"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {sasiSoftwareUiText} from "@/lib/sasi-software/ui-copy";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
import styles from "./SasiOpenMarketplace.module.css";
type Listing={id:string;seller_id:string;title:string;description:string;category:string;price_cny_minor:number;price_usd_minor:number;status:string;scan_status:string;created_at:string;};
type Seller={user_id:string;display_name:string;status:string;kyc_status:string;payout_provider:string|null};
type Payout={balances:Record<string,{grossMinor:number;platformFeeMinor:number;availableMinor:number}>;payouts:Array<{id:string;currency:string;amount_minor:number;status:string;requested_at:string}>;payoutsOpen:boolean;submissionTargetMinutes:number};
const CATEGORIES=[["mt5-ea","MT5 EA","MT5 EA"],["mt5-indicator","MT5 指标","MT5 indicator"],["automation","自动化软件","Automation software"],["desktop-app","桌面程序","Desktop application"],["developer-tool","开发工具","Developer tools"],["software","其他软件","Other software"]] as const;
const STATUS_LABELS:Record<string,readonly [string,string]>={draft:["草稿","Draft"],submitted:["审核中","In review"],published:["已发布","Published"],rejected:["需修改","Changes required"],archived:["已下架","Unlisted"]};
const SCAN_LABELS:Record<string,readonly [string,string]>={unscanned:["等待安全检查","Security check pending"],clean:["安全检查通过","Security checked"],infected:["文件存在风险","File risk detected"],scan_failed:["安全检查未通过","Security check failed"]};
function translatedStatus(lang:string,key:string,scan=false){const pair=(scan?SCAN_LABELS:STATUS_LABELS)[key];return pair?sasiSoftwareUiText(lang,pair[0],pair[1]):"—"}
function categoryLabel(lang:string,key:string){const c=CATEGORIES.find(([id])=>id===key);return c?sasiSoftwareUiText(lang,c[1],c[2]):sasiSoftwareUiText(lang,"其他软件","Other software")}
function friendlyError(error:unknown,lang:string){const raw=error instanceof Error?error.message:String(error);return /login|account|VERIFIED_ACCOUNT_REQUIRED|SELLER_NOT_APPROVED|401|403/i.test(raw)?sasiSoftwareUiText(lang,"请先完成登录、邮箱验证或卖家审核。","Please sign in, verify your email and complete seller approval."):sasiSoftwareUiText(lang,"操作暂未完成，请稍后重试或联系平台支持。","The action could not be completed. Please try again or contact support.")}
function format(value:number){return (value/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
export default function SasiOpenMarketplace(){
 const {lang}=useLingxiLang();const zh=lang==="zh";
 const [listings,setListings]=useState<Listing[]>([]);
 const featured=SASI_SOFTWARE_CATALOG[0];
 const [featuredReady,setFeaturedReady]=useState(false);
 const [images,setImages]=useState<Record<string,Array<{id:string;kind:string;url:string}>>>({});
 const [mine,setMine]=useState<Listing[]>([]);
 const [mediaCounts,setMediaCounts]=useState<Record<string,{cover:number;detail:number}>>({});
 const [mediaEntries,setMediaEntries]=useState<Record<string,Array<{id:string;kind:string;status:string}>>>({});
 const [seller,setSeller]=useState<Seller|null>(null);
 const [payments,setPayments]=useState<Payout|null>(null);
 const [filter,setFilter]=useState("all"),[search,setSearch]=useState("");
 const [displayName,setDisplayName]=useState("");
 const [adult,setAdult]=useState(false),[terms,setTerms]=useState(false);
 const [title,setTitle]=useState(""),[description,setDescription]=useState("");
 const [category,setCategory]=useState("mt5-ea"),[rmb,setRmb]=useState("99.00"),[usd,setUsd]=useState("99.00");
 const [busy,setBusy]=useState(""),[error,setError]=useState(""),[status,setStatus]=useState("");
 const [showStudio,setShowStudio]=useState(false);
 const [requestedAmount,setRequestedAmount]=useState(""),[requestCurrency,setRequestCurrency]=useState<"CNY"|"USD">("CNY");
 const refresh=useCallback(async()=>{
  const paths=["/api/sasi/marketplace/listings","/api/sasi/marketplace/listings?mode=mine","/api/sasi/marketplace/seller","/api/sasi/marketplace/payouts"];
  const values=await Promise.all(paths.map(p=>fetch(p,{cache:"no-store"}).then(async r=>r.ok?r.json():null).catch(()=>null)));
  if(Array.isArray(values[0]?.items))setListings(values[0].items);
  if(Array.isArray(values[1]?.items))setMine(values[1].items);
  if(values[2]?.profile)setSeller(values[2].profile);
  if(values[3]?.balances)setPayments(values[3]);
 },[]);
 useEffect(()=>{void refresh()},[refresh]);
 useEffect(()=>{
  const ids=mine.map(item=>item.id).filter(Boolean);
  if(!ids.length){setMediaCounts({});setMediaEntries({});return;}
  let live=true;
  fetch("/api/sasi/marketplace/my-media?listingIds="+ids.join(","),{cache:"no-store",credentials:"same-origin"})
   .then(r=>r.ok?r.json():null).then(v=>{if(live&&v?.counts){setMediaCounts(v.counts);setMediaEntries(v.items||{})}})
   .catch(()=>{});
  return()=>{live=false};
 },[mine]);
 useEffect(()=>{
  let live=true;
  fetch("/api/sasi/software/catalog",{cache:"no-store"})
    .then(r=>r.ok?r.json():null)
    .then(j=>{if(live)setFeaturedReady(j?.products?.[featured.id]?.available===true)})
    .catch(()=>{if(live)setFeaturedReady(false)});
  return()=>{live=false};
 },[featured.id]);
 useEffect(()=>{
  if(!showStudio)return;
  const frame=requestAnimationFrame(()=>document.getElementById("sasi-seller-studio")?.scrollIntoView({block:"start",behavior:"smooth"}));
  return()=>cancelAnimationFrame(frame);
 },[showStudio]);
 useEffect(()=>{
  if(!listings.length){setImages({});return;}
  let current=true;
  fetch("/api/sasi/marketplace/images?listingIds="+listings.map(x=>x.id).join(","),{cache:"no-store"})
   .then(r=>r.ok?r.json():null).then(v=>{if(current&&v?.items)setImages(v.items)})
   .catch(()=>{});
  return()=>{current=false};
 },[listings]);
 const visible=useMemo(()=>listings.filter(x=>(filter==="all"||x.category===filter)&&
 (x.title+" "+x.description).toLowerCase().includes(search.trim().toLowerCase())),[listings,filter,search]);
 const post=async(url:string,payload:unknown)=>{
  const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),credentials:"same-origin"});
  const result=await r.json().catch(()=>null);
  if(!r.ok)throw Error(typeof result?.error==="string"?result.error:"REQUEST_FAILED_"+r.status);
  return result;
 };
 const apply=async()=>{
  setBusy("seller");setError("");setStatus("");
  try{
   await post("/api/sasi/marketplace/seller",{displayName,adultConfirmed:adult,termsAccepted:terms});
   setStatus(sasiSoftwareUiText(lang,"卖家申请已保存，审核通过后可上传软件。","Seller application saved. Uploads open after approval."));
   await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const makeDraft=async()=>{
  setBusy("draft");setError("");setStatus("");
  try{
   const minor=(n:string)=>Math.round(Number(n)*100);
   await post("/api/sasi/marketplace/listings",{
    title,description,category,priceCnyMinor:minor(rmb),priceUsdMinor:minor(usd)
   });
   setStatus(sasiSoftwareUiText(lang,"商品草稿已保存，可继续上传安装包。","Draft saved. You can now upload its package."));
   setTitle("");setDescription("");await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const upload=async(item:Listing,file:File)=>{
  setBusy("upload-"+item.id);setStatus("");setError("");
  try{
   if(!/\.zip$/i.test(file.name)||file.size<1||file.size>30*1024*1024)
    throw Error("ZIP_REQUIRED_MAX_30MB");
   const ticket=await post("/api/sasi/marketplace/upload-ticket",{
    listingId:item.id,extension:"zip",fileSize:file.size
   });
   const put=await fetch(ticket.uploadUrl,{method:"PUT",headers:{"Content-Type":"application/zip"},body:file});
   if(!put.ok)throw Error("PRIVATE_R2_UPLOAD_FAILED_"+put.status);
   setStatus(sasiSoftwareUiText(lang,"软件包已上传。上传1张主图即可提交审核；详情图最多4张，可不上传。","Package uploaded. Add one main image; up to four detail images are optional."));
   await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const submitReview=async(item:Listing)=>{
  setBusy("submit-"+item.id);setError("");setStatus("");
  try{
   const result=await post("/api/sasi/marketplace/submit",{listingId:item.id});
   setStatus(result?.scanDispatched?
    (sasiSoftwareUiText(lang,"已提交审核，软件包正在安全检查。","Submitted for review; security scanning is in progress.")):
    (sasiSoftwareUiText(lang,"已提交审核，等待平台启动安全检查。","Submitted for review; security scanning is pending.")));
   await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const uploadImage=async(item:Listing,file:File,kind:"cover"|"detail")=>{
  setBusy("image-"+item.id);setError("");setStatus("");
  try{
   const ext=file.name.split(".").pop()?.toLowerCase();
   const extension=ext==="jpeg"?"jpg":ext;
   const allowed:{[k:string]:string}={png:"image/png",jpg:"image/jpeg",webp:"image/webp"};
   if(!extension||!allowed[extension]||file.size<1||file.size>1024*1024)
    throw Error("PNG_JPG_WEBP_MAX_1MB");
   const ticket=await post("/api/sasi/marketplace/image-ticket",{
     listingId:item.id,kind,extension,fileSize:file.size
   });
   const put=await fetch(ticket.uploadUrl,{method:"PUT",
     headers:{"Content-Type":ticket.contentType},body:file});
   if(!put.ok)throw Error("PRIVATE_IMAGE_UPLOAD_FAILED_"+put.status);
   await post("/api/sasi/marketplace/image-confirm",{imageId:ticket.imageId});
   setStatus(sasiSoftwareUiText(lang,"图片已上传并等待审核。每款软件1张主图，最多4张可选详情图。","Image awaiting review. One main image; up to four optional detail images."));
   await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const removeMedia=async(item:Listing,imageId:string)=>{
  setBusy("remove-"+item.id);setError("");setStatus("");
  try{
   await post("/api/sasi/marketplace/my-media",{action:"withdraw",imageId});
   setStatus(sasiSoftwareUiText(lang,"图片已移除，现可重新上传。","Image removed. You may now upload another."));
   await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const share=async(item:Listing)=>{
  const url=window.location.origin+"/sasi/marketplace/"+item.id;
  try{
   if(typeof navigator.share==="function")await navigator.share({title:item.title,url});
   else {await navigator.clipboard.writeText(url);setStatus(sasiSoftwareUiText(lang,"商品分享链接已复制。","Product link copied."));}
  }catch{}
 };
 const payout=async()=>{
  setBusy("payout");setError("");setStatus("");
  try{
   const amountMinor=Math.round(Number(requestedAmount)*100);
   if(!Number.isSafeInteger(amountMinor)||amountMinor<1)throw Error("INVALID_AMOUNT");
   const key=crypto.randomUUID();
   const result=await post("/api/sasi/marketplace/payouts",{amountMinor,currency:requestCurrency,idempotencyKey:key});
   setStatus(result.status==="requested"?(sasiSoftwareUiText(lang,"提现申请已提交，平台将核实并向收款机构发起转账；到账以渠道回执为准。","Payout requested. Provider submission and arrival are separately verified.")):sasiSoftwareUiText(lang,"提现申请状态已更新。","Your payout request status has been updated."));
   await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 return <main dir={lang==="ar"?"rtl":"ltr"} className={styles.main}><div className={styles.container}>
  <div className={styles.hero}>
    <div className={styles.heroCopy}>
      <span className={styles.eyebrow}>LINGXIFIELD · SASI</span>
       <h1><em>SASI</em> {sasiSoftwareUiText(lang,"智能软件市场","Software Market")}</h1>
       <p>{sasiSoftwareUiText(lang,"源码授权 · 开发者发布 · 自动交付 · 安全可靠","Source licenses · Developer publishing · Verified digital delivery")}</p>
       <div className={styles.heroLinks}><a href="#products">◇ {sasiSoftwareUiText(lang,"浏览软件","Explore software")}</a><button type="button" onClick={()=>setShowStudio(v=>!v)} aria-expanded={showStudio}>＋ {sasiSoftwareUiText(lang,"发布产品","Publish software")}</button></div>
     </div>
     <div className={styles.laptopScene} aria-hidden="true">
      <img src="/images/sasi/hero-original.webp" className={styles.originalArtwork} alt="" loading="eager" decoding="async" draggable={false}/>
     </div>
  </div>
    <div className={styles.benefits}>
     <div><span>⬡</span><div><strong>{sasiSoftwareUiText(lang,"源码授权","Source licensing")}</strong><small>{sasiSoftwareUiText(lang,"仅售源码 · 权属清晰","Clear license and ownership")}</small></div></div>
     <div><span>ϟ</span><div><strong>{sasiSoftwareUiText(lang,"自动交付","Digital delivery")}</strong><small>{sasiSoftwareUiText(lang,"付款验证后获取","After verified payment")}</small></div></div>
     <div><span>◇</span><div><strong>{sasiSoftwareUiText(lang,"安全可靠","Secure by design")}</strong><small>{sasiSoftwareUiText(lang,"私有 R2 存储","Private R2 storage")}</small></div></div>
     <div><span>◎</span><div><strong>{sasiSoftwareUiText(lang,"全球可用","Global access")}</strong><small>{sasiSoftwareUiText(lang,"多语言 · 多地区","Multilingual access")}</small></div></div>
     <div><span>♧</span><div><strong>{sasiSoftwareUiText(lang,"开发者支持","Creator support")}</strong><small>{sasiSoftwareUiText(lang,"发布 · 审核 · 结算","Publish, review and settle")}</small></div></div>
   </div>
   <section id="featured" className={styles.featured}>
   <div className={styles.sectionHeading}><div><small>SASI / FEATURED</small><h2>{sasiSoftwareUiText(lang,"精选软件","Featured software")}</h2></div>
    <a href="#products" className={styles.featuredBrowse}>{sasiSoftwareUiText(lang,"浏览开发者作品","Browse creator software")}</a></div>
   <article className={styles.featuredCard}>
    <div className={styles.featuredVisual} aria-hidden="true"><small>MT5 · SOURCE</small><strong>SI 9.5</strong><span>CODE · LICENSE</span></div>
    <div className={styles.featuredDescription}>
     <p className={styles.featuredBadge}>{sasiSoftwareUiText(lang,"仅售源码授权版","Source code license only")}</p>
     <h3>{zh?featured.titleZh:featured.titleEn}</h3>
     <p>{zh?featured.featureZh:featured.featureEn}</p>
     <div className={styles.featuredChips}><span>MT5</span><span>{sasiSoftwareUiText(lang,"源码交付","Source delivery")}</span><span>{sasiSoftwareUiText(lang,"使用说明","Documentation")}</span><span>{sasiSoftwareUiText(lang,"只读观察","Read-only observation")}</span></div>
    </div>
    <div className={styles.featuredPrice}>
     <strong>¥{featured.priceCny.toLocaleString("en-US")}</strong>
     <small>USD {"$"}{featured.priceUsd.toLocaleString("en-US")}</small>
     <Link href={featuredReady?"/checkout?productId="+encodeURIComponent(featured.id)+"&redirect=%2Faccount%2Fsoftware":"/sasi/delivery"}
      className={styles.featuredAction}>{featuredReady?(sasiSoftwareUiText(lang,"查看购买方式","Choose payment")):(sasiSoftwareUiText(lang,"查看软件详情","View details"))}</Link>
    </div>
   </article>
  </section>
  <section id="products" className={styles.section}><div className={styles.sectionHeading}><div><small>01 / SOFTWARE</small><h2>{sasiSoftwareUiText(lang,"开发者作品","Software & seller services")}</h2></div>
   <div className={styles.find}><input aria-label={sasiSoftwareUiText(lang,"搜索软件","Search software")} placeholder={sasiSoftwareUiText(lang,"搜索 EA、指标、应用…","Find EAs and software…")} value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
   <div className={styles.filters}><button className={filter==="all"?styles.active:""} onClick={()=>setFilter("all")}>{sasiSoftwareUiText(lang,"全部","All")}</button>{CATEGORIES.map(([key])=><button key={key} className={filter===key?styles.active:""} onClick={()=>setFilter(key)}>{categoryLabel(lang,key)}</button>)}</div>
   <div className={styles.products}>{visible.map((item,i)=><article className={styles.card} key={item.id}>
    <div className={styles.tile} data-tone={i%3}>{images[item.id]?.find(photo=>photo.kind==="cover")?.url?
    <img src={images[item.id].find(photo=>photo.kind==="cover")!.url} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className={styles.cover}/>
    :<span>{item.category==="mt5-ea"?"EA":item.category==="mt5-indicator"?"SI":"SASI"}</span>}</div>
    <div className={styles.cardContent}><div className={styles.category}>{categoryLabel(lang,item.category)}</div>
    <h3>{item.title}</h3><p>{item.description}</p><div className={styles.cardBottom}><strong>¥{format(item.price_cny_minor)}</strong><span>USD ${format(item.price_usd_minor)}</span></div>
    <div className={styles.cardActions}><Link href={"/sasi/marketplace/"+item.id}>{sasiSoftwareUiText(lang,"查看详情","Details")} ↗</Link><button onClick={()=>void share(item)}>{sasiSoftwareUiText(lang,"分享","Share")} ↗</button></div>
    </div><aside className={styles.quickPreview} aria-label={sasiSoftwareUiText(lang,"软件详情预览","Software quick preview")}>
      <small>{CATEGORIES.find(([x])=>x===item.category)?.[1]||"SASI"}</small>
      <strong>{item.title}</strong>
      <p>{item.description.trim().slice(0,260)}{item.description.length>260?"…":""}</p>
      <Link href={"/sasi/marketplace/"+item.id}>{sasiSoftwareUiText(lang,"查看完整介绍","View full details")} →</Link>
    </aside></article>)}</div>
   {visible.length===0&&<div className={styles.empty}>{sasiSoftwareUiText(lang,"已审核的软件将在这里展示；欢迎开发者发布原创作品。","No reviewed and published software matches this search.")}</div>}
  </section>
  <section className={styles.section} aria-label={sasiSoftwareUiText(lang,"软件发布与交付步骤","Software publishing steps")}>
    <div className={styles.sectionHeading}><div><small>02 / PUBLISH & DELIVERY</small><h2>{sasiSoftwareUiText(lang,"卖家发布与自动交付","Publish and deliver")}</h2></div></div>
    <div className={styles.steps}>
       <div><b>01</b><strong>{sasiSoftwareUiText(lang,"填写商品资料","Product details")}</strong><span>{sasiSoftwareUiText(lang,"名称 · 介绍 · 价格","Name, description, price")}</span></div>
       <div><b>02</b><strong>{sasiSoftwareUiText(lang,"上传源码","Upload source ZIP")}</strong><span>{sasiSoftwareUiText(lang,"私有源码包与文档","Private ZIP and documentation")}</span></div>
       <div><b>03</b><strong>{sasiSoftwareUiText(lang,"审核发布","Review and publish")}</strong><span>{sasiSoftwareUiText(lang,"安全审核后公开展示","Listed after security review")}</span></div>
       <div><b>04</b><strong>{sasiSoftwareUiText(lang,"自动交付","Automatic delivery")}</strong><span>{sasiSoftwareUiText(lang,"付款验证后限时获取","Download after verified payment")}</span></div>
       <button type="button" className={styles.launchStudio} onClick={()=>setShowStudio(v=>!v)} aria-expanded={showStudio} aria-controls="sasi-seller-studio">{showStudio?(sasiSoftwareUiText(lang,"收起工作台","Close workspace")):(sasiSoftwareUiText(lang,"立即发布软件","Publish software"))}</button>
     </div>
   </section>
   {showStudio&&<section id="sasi-seller-studio" className={styles.section}><div className={styles.sectionHeading}><div><small>03 / SELLER STUDIO</small><h2>{sasiSoftwareUiText(lang,"卖家工作台","Seller workspace")}</h2></div><Link href="/account/software">{sasiSoftwareUiText(lang,"已购买的软件","Purchased software")} ↗</Link></div>
   <div className={styles.workspace}>
    <div className={styles.formCard}><h3>{seller?(sasiSoftwareUiText(lang,"卖家资料","Seller profile")):(sasiSoftwareUiText(lang,"零费用申请入驻","Apply to sell for free"))}</h3>
    {seller?<div className={styles.profile}><strong>{seller.display_name}</strong><p>{sasiSoftwareUiText(lang,"审核状态","Review status")}: {translatedStatus(lang,seller.status)}</p><p>{sasiSoftwareUiText(lang,"身份核验","Identity verification")}: {seller.kyc_status==="verified"?(sasiSoftwareUiText(lang,"已完成","Verified")):(sasiSoftwareUiText(lang,"待完成","Pending"))}</p><p>{sasiSoftwareUiText(lang,"完成身份和收款方式审核后才能提现。","Identity and payout verification are required before cash-out.")}</p></div>:<>
     <label>{sasiSoftwareUiText(lang,"展示名称","Display name")}<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} placeholder={sasiSoftwareUiText(lang,"软件开发者 / 工作室","Developer / studio")}/></label>
     <label className={styles.check}><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/>{sasiSoftwareUiText(lang,"确认已满 18 周岁","I am at least 18 years old")}</label>
     <label className={styles.check}><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/>{sasiSoftwareUiText(lang,"同意 SASI 卖家协议与结算规则","I accept the SASI seller and settlement terms")}</label>
     {terms&&<p className="mt-2 text-sm leading-relaxed text-[var(--lx-muted)]">{sasiSoftwareUiText(lang,"仅在实际交易完成后，卖家获得商品净销售金额的 85%，平台收取 15% 服务费。具体结算与退货规则以卖家协议为准。","After a completed eligible sale, the seller receives 85% and the platform charges a 15% service fee. Settlement and refund rules follow the seller agreement.")}</p>}
     <button disabled={busy!==""||!adult||!terms||displayName.trim().length<2} onClick={()=>void apply()}>{busy==="seller"?"…":sasiSoftwareUiText(lang,"申请成为卖家","Apply as seller")}</button>
     <p>{sasiSoftwareUiText(lang,"须先登录且验证邮箱，平台不收取保证金。","Sign-in and verified email are required. No seller deposit.")} <Link href="/account?mode=signin">{sasiSoftwareUiText(lang,"账户登录","Sign in")} ↗</Link></p>
    </>}</div>
    <div className={styles.formCard}><h3>{sasiSoftwareUiText(lang,"发布新软件","Create a software listing")}</h3>
      <label>{sasiSoftwareUiText(lang,"软件名称","Product name")}<input value={title} maxLength={120} onChange={e=>setTitle(e.target.value)} placeholder={sasiSoftwareUiText(lang,"软件名称、版本、授权类型","Software name, version, license")}/></label>
      <label>{sasiSoftwareUiText(lang,"分类","Category")}<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(([id])=><option key={id} value={id}>{categoryLabel(lang,id)}</option>)}</select></label>
      <label>{sasiSoftwareUiText(lang,"完整软件介绍（最多10万字）","Full software description (up to 100,000 characters)")}<textarea rows={7} value={description} maxLength={100000} onChange={e=>setDescription(e.target.value)} placeholder={sasiSoftwareUiText(lang,"介绍核心功能、适用场景、安装要求、版本与授权范围。支持换行分段，详情页可完整展开。","Explain features, uses, requirements, version and licensing. Paragraph breaks are preserved.")}/><span className={styles.descriptionCount} aria-live="polite">{description.length.toLocaleString("en-US")} / 100,000</span></label>
      <div className={styles.priceFields}><label>{sasiSoftwareUiText(lang,"人民币标价","CNY price")}<input type="number" min="1" max="10000000" step="0.01" value={rmb} onChange={e=>setRmb(e.target.value)}/></label>
      <label>{sasiSoftwareUiText(lang,"美元标价","USD price")}<input type="number" min="1" max="10000000" step="0.01" value={usd} onChange={e=>setUsd(e.target.value)}/></label></div>
      <button disabled={busy!==""||!seller} onClick={()=>void makeDraft()}>{busy==="draft"?"…":sasiSoftwareUiText(lang,"保存商品草稿","Save product draft")}</button>
      <p>{sasiSoftwareUiText(lang,"主图仅1张；详情图最多4张，可全部不上传。源码 ZIP 与图片通过审核后展示，私有文件不会公开。","One main image and up to four optional detail images. Source ZIPs remain private and undergo review.")}</p>
    </div>
   </div>
   {mine.length>0&&<div className={styles.drafts}><h3>{sasiSoftwareUiText(lang,"我的软件草稿与审核进度","My submissions")}</h3>{mine.map(item=><div className={styles.draft} key={item.id}><div><strong>{item.title}</strong><small>{translatedStatus(lang,item.status)} · {translatedStatus(lang,item.scan_status,true)}</small></div>
    {item.status==="draft"&&<>
     <label className={styles.upload}>{busy==="image-"+item.id?"上传图片中…":sasiSoftwareUiText(lang,"上传主图（仅1张）","Main image (one only)")}
       <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy!==""||(mediaCounts[item.id]?.cover??0)>=1} onChange={e=>{const f=e.target.files?.[0];if(f)void uploadImage(item,f,"cover")}}/>
     </label>
     <label className={styles.upload}>{busy==="image-"+item.id?"上传图片中…":sasiSoftwareUiText(lang,"上传详情图（可选，最多4张）","Detail image (optional, max 4)")}
       <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy!==""||(mediaCounts[item.id]?.detail??0)>=4} onChange={e=>{const f=e.target.files?.[0];if(f)void uploadImage(item,f,"detail")}}/>
     </label>
     <span className={styles.mediaCounter}>{sasiSoftwareUiText(lang,"图片数量","Images")}：{mediaCounts[item.id]?.cover??0}/1 {sasiSoftwareUiText(lang,"主图","main")} · {mediaCounts[item.id]?.detail??0}/4 {sasiSoftwareUiText(lang,"详情图（可选）","optional details")}</span>
     {(mediaEntries[item.id]||[]).length>0&&<div className={styles.mediaEntries}>
       {(mediaEntries[item.id]||[]).map((photo,index)=><div key={photo.id}>
        <span>{photo.kind==="cover"?(sasiSoftwareUiText(lang,"主图","Main image")):(sasiSoftwareUiText(lang,"详情图","Detail image"))+" "+(index+1)} · {photo.status}</span>
        <button type="button" disabled={busy!==""} onClick={()=>void removeMedia(item,photo.id)}>{sasiSoftwareUiText(lang,"移除并更换","Remove / replace")}</button>
       </div>)}
      </div>}
     <label className={styles.upload}>{busy==="upload-"+item.id?"处理中…":sasiSoftwareUiText(lang,"上传软件 ZIP 包","Upload software ZIP")}
       <input type="file" accept=".zip,application/zip" disabled={busy!==""} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(item,f)}}/>
     </label>
     <button type="button" disabled={busy!==""} onClick={()=>void submitReview(item)} className={styles.launchStudio}>
      {busy==="submit-"+item.id?"…":sasiSoftwareUiText(lang,"提交商品审核","Submit for review")}
     </button>
   </>}
    {item.status==="published"&&<button onClick={()=>void share(item)}>{sasiSoftwareUiText(lang,"分享商品","Share")}</button>}
   </div>)}</div>}
   {error&&<p className={styles.error} role="alert">{error}</p>}{status&&<p className={styles.success} role="status">{status}</p>}
  </section>}
  {showStudio&&seller&&<section className={styles.section}><div className={styles.sectionHeading}><div><small>04 / SELLER EARNINGS</small><h2>{sasiSoftwareUiText(lang,"销售收入与提现","Seller earnings & payouts")}</h2></div></div>
   <div className={styles.earnings}><div><span>{sasiSoftwareUiText(lang,"人民币可提现","CNY available")}</span><strong>¥{format(payments?.balances?.CNY?.availableMinor??0)}</strong></div>
   <div><span>{sasiSoftwareUiText(lang,"美元可提现","USD available")}</span><strong>${format(payments?.balances?.USD?.availableMinor??0)}</strong></div></div>
   <div className={styles.payoutForm}><select value={requestCurrency} onChange={e=>setRequestCurrency(e.target.value as "CNY"|"USD")}><option value="CNY">CNY</option><option value="USD">USD</option></select>
    <input type="number" min="0.01" step="0.01" placeholder={sasiSoftwareUiText(lang,"提现金额","Withdrawal amount")} value={requestedAmount} onChange={e=>setRequestedAmount(e.target.value)}/>
    <button disabled={busy!==""||!payments?.payoutsOpen||!seller||seller.kyc_status!=="verified"} onClick={()=>void payout()}>{sasiSoftwareUiText(lang,"申请提现","Request payout")}</button></div>
   <p className={styles.note}>{payments?.payoutsOpen?(sasiSoftwareUiText(lang,"平台将在受理后核对付款状态并提交支付机构；不代表已到账。","Payout requests are checked and submitted to the provider; submission does not confirm arrival.")):(sasiSoftwareUiText(lang,"自动转账渠道正在接入和验收，暂不开放提现申请。","Automated provider payouts are in integration testing and are not open."))}</p>
  </section>}
 </div></main>
}
