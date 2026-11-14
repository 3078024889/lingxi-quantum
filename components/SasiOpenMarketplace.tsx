"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import JSZip from "jszip";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {sasiSoftwareUiText} from "@/lib/sasi-software/ui-copy";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
import {parseMarketplacePayoutMinorUnits} from "@/lib/sasi-marketplace/fees";
import styles from "./SasiOpenMarketplace.module.css";
type Listing={id:string;seller_id:string;title:string;description:string;category:string;price_cny_minor:number;price_usd_minor:number;status:string;scan_status:string;created_at:string;published_at?:string|null;rejection_reason?:string|null;};
type Seller={user_id:string;display_name:string;status:string;kyc_status:string;payout_provider:string|null};
type Payout={balances:Record<string,{grossMinor:number;platformFeeMinor:number;availableMinor:number}>;payouts:Array<{id:string;currency:string;amount_minor:number;status:string;requested_at:string}>;payoutsOpen:boolean;submissionTargetMinutes:number};
const MARKET_FEATURES=[
 {icon:"◈",zh:"软件授权",en:"Software licensing",zhDesc:"成品与源码 · 权限清晰",enDesc:"Finished software & source · clear rights"},
 {icon:"↗",zh:"自动交付",en:"Automatic delivery",zhDesc:"付款验证后获取",enDesc:"Available after payment verification"},
 {icon:"◇",zh:"安全可靠",en:"Secure & reliable",zhDesc:"私密存储 · 安心下载",enDesc:"Private storage · secure downloads"},
 {icon:"◎",zh:"全球可用",en:"Global availability",zhDesc:"多语言 · 多地区",enDesc:"Multiple languages · regions"},
 {icon:"⌘",zh:"开发者支持",en:"Developer support",zhDesc:"发布 · 审核 · 结算",enDesc:"Publishing · review · settlement"}
] as const;
const CATEGORIES=[["mt5-ea","MT5 EA","MT5 EA"],["mt5-indicator","MT5 指标","MT5 indicator"],["automation","自动化软件","Automation software"],["desktop-app","桌面程序","Desktop application"],["developer-tool","开发工具","Developer tools"],["software","其他软件","Other software"]] as const;
const STATUS_LABELS:Record<string,readonly [string,string]>={draft:["草稿","Draft"],submitted:["审核中","In review"],published:["已发布","Published"],rejected:["需修改","Changes required"],archived:["已下架","Unlisted"]};
const SCAN_LABELS:Record<string,readonly [string,string]>={unscanned:["等待安全检查","Security check pending"],clean:["安全检查通过","Security checked"],infected:["文件存在风险","File risk detected"],scan_failed:["安全检查未通过","Security check failed"]};
function translatedStatus(lang:string,key:string,scan=false){const pair=(scan?SCAN_LABELS:STATUS_LABELS)[key];return pair?sasiSoftwareUiText(lang,pair[0],pair[1]):"—"}
function categoryLabel(lang:string,key:string){const c=CATEGORIES.find(([id])=>id===key);return c?sasiSoftwareUiText(lang,c[1],c[2]):sasiSoftwareUiText(lang,"其他软件","Other software")}
function friendlyError(error:unknown,lang:string){const raw=error instanceof Error?error.message:String(error);return /login|account|VERIFIED_ACCOUNT_REQUIRED|SELLER_NOT_APPROVED|401|403/i.test(raw)?sasiSoftwareUiText(lang,"请先完成登录、邮箱验证或卖家审核。","Please sign in, verify your email and complete seller approval."):sasiSoftwareUiText(lang,"操作暂未完成，请稍后重试或联系平台支持。","The action could not be completed. Please try again or contact support.")}
function format(value:number){return (value/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
export default function SasiOpenMarketplace({view="marketplace"}:{view?:"marketplace"|"seller"}){
 const {lang}=useLingxiLang();const zh=lang==="zh";const sellerOnly=view==="seller";
 const [listings,setListings]=useState<Listing[]>([]);
 const featured=SASI_SOFTWARE_CATALOG[0];
 const [featuredReady,setFeaturedReady]=useState(false);
 const [featuredPayment,setFeaturedPayment]=useState({wechat:false,alipay:false,paypal:false});
 const [featuredPaypalBusy,setFeaturedPaypalBusy]=useState(false);
 const [featuredPaypalError,setFeaturedPaypalError]=useState("");
 const [images,setImages]=useState<Record<string,Array<{id:string;kind:string;url:string}>>>({});
 const [mine,setMine]=useState<Listing[]>([]);
 const [mineCounts,setMineCounts]=useState<{published:number|null;pending:number|null}|null>(null);
 const [mediaCounts,setMediaCounts]=useState<Record<string,{cover:number;detail:number}>>({});
 const [mediaEntries,setMediaEntries]=useState<Record<string,Array<{id:string;kind:string;status:string}>>>({});
 const [seller,setSeller]=useState<Seller|null>(null);
 const [payments,setPayments]=useState<Payout|null>(null);
 const [filter,setFilter]=useState("all"),[search,setSearch]=useState("");
 const [sort,setSort]=useState<"newest"|"price-asc"|"price-desc">("newest");
 const [displayName,setDisplayName]=useState("");
 const [adult,setAdult]=useState(false),[terms,setTerms]=useState(false);
 const [title,setTitle]=useState(""),[description,setDescription]=useState("");
 const [editingId,setEditingId]=useState<string|null>(null);
 const [activeDraftId,setActiveDraftId]=useState<string|null>(null);
 const [uploadedPackages,setUploadedPackages]=useState<Record<string,boolean>>({});
 const [licenseFiles,setLicenseFiles]=useState<Record<string,File>>({});
 const [category,setCategory]=useState("mt5-ea"),[rmb,setRmb]=useState("99.00"),[usd,setUsd]=useState("99.00");
 const [busy,setBusy]=useState(""),[error,setError]=useState(""),[status,setStatus]=useState("");
 const [showStudio,setShowStudio]=useState(sellerOnly);
 const studioMountedRef=useRef(false);
 const [requestedAmount,setRequestedAmount]=useState(""),[requestCurrency,setRequestCurrency]=useState<"CNY"|"USD">("CNY");
 const payoutAttemptRef=useRef<{amountMinor:number;currency:"CNY"|"USD";key:string}|null>(null);
 const refresh=useCallback(async()=>{
  const paths=["/api/sasi/marketplace/listings","/api/sasi/marketplace/listings?mode=mine","/api/sasi/marketplace/seller","/api/sasi/marketplace/payouts"];
  const values=await Promise.all(paths.map(p=>fetch(p,{cache:"no-store"}).then(async r=>r.ok?r.json():null).catch(()=>null)));
  if(Array.isArray(values[0]?.items))setListings(values[0].items);
  if(Array.isArray(values[1]?.items))setMine(values[1].items);
  if(values[1]?.counts&&[values[1].counts.published,values[1].counts.pending].every((value:unknown)=>value===null||Number.isSafeInteger(value)))setMineCounts(values[1].counts);
  else setMineCounts(null);
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
    .then(j=>{if(live){
      setFeaturedReady(j?.products?.[featured.id]?.available===true);
      setFeaturedPayment({wechat:j?.payment?.wechat===true,alipay:j?.payment?.alipay===true,paypal:j?.payment?.paypal===true});
    }})
    .catch(()=>{if(live){setFeaturedReady(false);setFeaturedPayment({wechat:false,alipay:false,paypal:false})}});
  return()=>{live=false};
 },[featured.id]);
 useEffect(()=>{
  if(!studioMountedRef.current){studioMountedRef.current=true;return;}
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
 const visible=useMemo(()=>{
  const query=search.trim().toLowerCase();
  const matched=listings.filter(x=>(filter==="all"||x.category===filter)&&
   (x.title+" "+x.description).toLowerCase().includes(query));
  return matched.sort((a,b)=>{
   if(sort==="price-asc")return a.price_cny_minor-b.price_cny_minor;
   if(sort==="price-desc")return b.price_cny_minor-a.price_cny_minor;
   return Date.parse(b.published_at||b.created_at)-Date.parse(a.published_at||a.created_at);
  });
 },[listings,filter,search,sort]);
 const featuredSide=visible.slice(0,2);
 const remainingVisible=visible.slice(featuredSide.length);
 const featuredFallbacks=featuredSide.length===0?["browse","publish"]:featuredSide.length===1?["publish"]:[];
 const publishedCount=mineCounts?(mineCounts.published??"—"):mine.filter(item=>item.status==="published").length;
 const pendingCount=mineCounts?(mineCounts.pending??"—"):mine.filter(item=>item.status==="submitted").length;
 const activeDraft=mine.find(item=>item.id===activeDraftId&&["draft","rejected"].includes(item.status))??null;
 const resumableDraft=mine.find(item=>["draft","rejected"].includes(item.status))??null;
 const cnyGross=payments?.balances?.CNY?.grossMinor??0;
 const usdGross=payments?.balances?.USD?.grossMinor??0;
 const featuredVisualTitle=(zh?featured.titleZh:featured.titleEn).match(/SI\s*[\d.]+/i)?.[0]??"COPERNICUS SI";
 const post=async(url:string,payload:unknown,method:"POST"|"PATCH"="POST")=>{
  const r=await fetch(url,{method,headers:{"content-type":"application/json"},body:JSON.stringify(payload),credentials:"same-origin"});
  const result=await r.json().catch(()=>null);
  if(!r.ok){const error=Error(typeof result?.error==="string"?result.error:"REQUEST_FAILED_"+r.status) as Error&{status:number};error.status=r.status;throw error;}
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
   const listingId=editingId??activeDraftId;
   const saved=await post("/api/sasi/marketplace/listings",{
    title,description,category,priceCnyMinor:minor(rmb),priceUsdMinor:minor(usd),
    ...(listingId?{listingId}:{})
   },listingId?"PATCH":"POST");
   const savedId=saved?.item?.id??listingId;
   if(savedId)setActiveDraftId(savedId);
   setStatus(sasiSoftwareUiText(lang,"商品草稿已保存，可在下方上传区继续上传软件包和主图。","Draft saved. Continue with the package and cover uploads below."));
   setEditingId(null);await refresh();
  }catch(e){setError(friendlyError(e,lang))}finally{setBusy("")}
 };
 const editDraft=(item:Listing)=>{
  setEditingId(item.id);setActiveDraftId(item.id);setTitle(item.title);setDescription(item.description);setCategory(item.category);
  setRmb((item.price_cny_minor/100).toFixed(2));setUsd((item.price_usd_minor/100).toFixed(2));setShowStudio(true);
  requestAnimationFrame(()=>document.getElementById("listing-editor")?.scrollIntoView({block:"start"}));
 };
 const selectLicenseFile=async(item:Listing,file:File)=>{
  setError("");setStatus("");
  try{
   const extension=file.name.split(".").pop()?.toLowerCase();
   if(!extension||!["pdf","txt","png"].includes(extension)||file.size<1||file.size>20*1024*1024)
    throw Error("LICENSE_PDF_TXT_PNG_MAX_20MB");
   const signature=new Uint8Array(await file.slice(0,8).arrayBuffer());
   if(extension==="pdf"&&new TextDecoder().decode(signature.slice(0,5))!=="%PDF-")
    throw Error("LICENSE_PDF_SIGNATURE_INVALID");
   if(extension==="png"&&![137,80,78,71,13,10,26,10].every((byte,index)=>signature[index]===byte))
    throw Error("LICENSE_PNG_SIGNATURE_INVALID");
   if(extension==="txt"){
    const sample=new Uint8Array(await file.slice(0,4096).arrayBuffer());
    if(sample.includes(0))throw Error("LICENSE_TEXT_FILE_INVALID");
   }
   setLicenseFiles(current=>({...current,[item.id]:file}));
   if(uploadedPackages[item.id]){
    setUploadedPackages(current=>({...current,[item.id]:false}));
    setStatus(sasiSoftwareUiText(lang,"许可文件已更新，请重新选择 ZIP；系统会将许可文件合并后重新上传。","License file updated. Re-select the ZIP so the license can be bundled and uploaded."));
   }else{
    setStatus(sasiSoftwareUiText(lang,"许可文件已选择，上传 ZIP 时会自动合并，并随软件包统一安全检查与交付。","License selected. It will be bundled into the ZIP for the same security review and delivery."));
   }
  }catch(e){setError(friendlyError(e,lang))}
 };
 const upload=async(item:Listing,file:File)=>{
  setBusy("upload-"+item.id);setStatus("");setError("");
  try{
   if(!/\.zip$/i.test(file.name)||file.size<1||file.size>30*1024*1024)
    throw Error("ZIP_REQUIRED_MAX_30MB");
   let packageBlob:Blob=file;
   const licenseFile=licenseFiles[item.id];
   if(licenseFile){
    const archive=await JSZip.loadAsync(file);
    const entries=Object.values(archive.files);
    if(entries.length>1000)throw Error("ZIP_TOO_MANY_ENTRIES");
    const expandedBytes=entries.reduce((total,entry)=>total+Number((entry as unknown as {_data?:{uncompressedSize?:number}})._data?.uncompressedSize??0),0);
    if(expandedBytes>512*1024*1024)throw Error("ZIP_EXPANSION_LIMIT_EXCEEDED");
    const safeName=licenseFile.name.normalize("NFKC").replace(/[^A-Za-z0-9._-]+/g,"_").slice(0,120)||"license";
    archive.file("SASI_LICENSE/"+safeName,licenseFile,{binary:true});
    packageBlob=await archive.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:5}});
    if(packageBlob.size>30*1024*1024)throw Error("ZIP_WITH_LICENSE_MAX_30MB");
   }
   const ticket=await post("/api/sasi/marketplace/upload-ticket",{
    listingId:item.id,extension:"zip",fileSize:packageBlob.size
   });
   const put=await fetch(ticket.uploadUrl,{method:"PUT",headers:{"Content-Type":"application/zip"},body:packageBlob});
   if(!put.ok)throw Error("PRIVATE_R2_UPLOAD_FAILED_"+put.status);
   setUploadedPackages(current=>({...current,[item.id]:true}));
   setStatus(licenseFile?
    sasiSoftwareUiText(lang,"软件包与许可文件已合并上传，将统一进行安全检查。","Package and license uploaded together for unified security review."):
    sasiSoftwareUiText(lang,"软件包已上传。上传1张主图即可提交审核；详情图最多4张，可不上传。","Package uploaded. Add one main image; up to four detail images are optional."));
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
   setActiveDraftId(null);setEditingId(null);await refresh();
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
 const payFeaturedPaypal=async()=>{
  if(!featuredReady||!featuredPayment.paypal||featuredPaypalBusy)return;
  setFeaturedPaypalBusy(true);setFeaturedPaypalError("");
  try{
   const res=await fetch("/api/pay/create",{
    method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",
    body:JSON.stringify({productId:featured.id,returnPath:"/account/software"})
   });
   const data=await res.json().catch(()=>({}));
   if(res.status===401){window.location.assign("/account?next="+encodeURIComponent("/sasi"));return;}
   if(!res.ok||typeof data.url!=="string")throw Error("PAYPAL_SOFTWARE_CHECKOUT_UNAVAILABLE");
   const target=new URL(data.url);
   if(target.protocol!=="https:"||!/(^|\.)paypal\.com$/.test(target.hostname))
    throw Error("INVALID_PAYPAL_REDIRECT");
   window.location.assign(target.href);
  }catch{
   setFeaturedPaypalError(sasiSoftwareUiText(lang,"PayPal 暂时无法创建订单，请稍后重试。","PayPal checkout is temporarily unavailable. Please try again."));
  }finally{setFeaturedPaypalBusy(false);}
 };
 const payout=async()=>{
  setBusy("payout");setError("");setStatus("");
  try{
   const amountMinor=parseMarketplacePayoutMinorUnits(requestedAmount);
   if(amountMinor===null||amountMinor<1)throw Error("INVALID_AMOUNT");
   let attempt=payoutAttemptRef.current;
   if(!attempt||attempt.amountMinor!==amountMinor||attempt.currency!==requestCurrency){
    attempt={amountMinor,currency:requestCurrency,key:crypto.randomUUID()};
    payoutAttemptRef.current=attempt;
   }
   const result=await post("/api/sasi/marketplace/payouts",{amountMinor,currency:requestCurrency,idempotencyKey:attempt.key});
   payoutAttemptRef.current=null;
   setStatus(result.status==="requested"?(sasiSoftwareUiText(lang,"提现申请已提交，平台将核实并向收款机构发起转账；到账以渠道回执为准。","Payout requested. Provider submission and arrival are separately verified.")):sasiSoftwareUiText(lang,"提现申请状态已更新。","Your payout request status has been updated."));
   await refresh();
  }catch(e){
   const statusCode=(e as Error&{status?:number}).status;
   if(statusCode&&[400,401,403,409].includes(statusCode))payoutAttemptRef.current=null;
   setError(friendlyError(e,lang));
  }finally{setBusy("")}
 };
 return <main dir={lang==="ar"?"rtl":"ltr"} className={styles.main}><div className={styles.container + (sellerOnly ? "" : " " + styles.marketplaceContainer)}>
  {!sellerOnly&&<>
  <section className={styles.hero} data-testid="sasi-transparent-hero" data-hero-asset="global-scene-20261114.webp" aria-labelledby="sasi-market-title" aria-label={sasiSoftwareUiText(lang,"灵犀场 SASI 智能软件市场","LINGXIFIELD SASI intelligent software marketplace")}>
    <img src="/images/global-scene-20261114.webp" className={styles.heroArtwork} alt="" width={2172} height={724} loading="eager" fetchPriority="high" decoding="async"/>
    <div className={styles.heroCopy}>
     <p className={styles.heroBrand}>LINGXIFIELD · SASI</p>
     <h1 id="sasi-market-title">{sasiSoftwareUiText(lang,"SASI 智能软件市场","SASI Software Marketplace")}</h1>
     <p>{sasiSoftwareUiText(lang,"成品软件 · MT5 EA 与指标模块 · 安装教程 · 开发者发布 · 源码授权 · 自动交付","Finished software · MT5 EAs & indicators · Installation guides · Developer publishing · Source licenses · Automatic delivery")}</p>
     <div className={styles.heroActions}><a href="#products">{sasiSoftwareUiText(lang,"浏览软件","Browse software")} →</a><Link href="/sasi/seller">＋ {sasiSoftwareUiText(lang,"发布产品","Publish software")}</Link></div>
    </div>
  </section>
  <div className={styles.marketFeatures} aria-label={sasiSoftwareUiText(lang,"软件市场服务能力","Marketplace capabilities")}>
   {MARKET_FEATURES.map(item=><div className={styles.marketFeature} key={item.zh}>
    <span className={styles.marketFeatureIcon} aria-hidden="true">{item.icon}</span>
    <span><strong>{sasiSoftwareUiText(lang,item.zh,item.en)}</strong><small>{sasiSoftwareUiText(lang,item.zhDesc,item.enDesc)}</small></span>
   </div>)}
  </div>
   <section id="featured" className={styles.featured} data-testid="featured-copernicus-source">
   <div className={styles.sectionHeading}><div><h2>{sasiSoftwareUiText(lang,"精选软件","Featured software")}</h2></div>
    <a href="#products" className={styles.featuredBrowse}>{sasiSoftwareUiText(lang,"浏览开发者作品","Browse creator software")}</a></div>
   <div className={styles.featuredShelf}>
   <article className={styles.featuredCard}>
    <div className={styles.featuredVisual} aria-hidden="true"><small>MT5 · SOURCE</small><strong>{featuredVisualTitle}</strong><span>CODE · LICENSE</span></div>
    <div className={styles.featuredDescription}>
     <p className={styles.featuredBadge}>{sasiSoftwareUiText(lang,"仅售源码授权版","Source code license only")}</p>
     <h3>{zh?featured.titleZh:featured.titleEn}</h3>
     <p>{zh?featured.featureZh:featured.featureEn}</p>
     <div className={styles.featuredChips}><span>MT5</span><span>{sasiSoftwareUiText(lang,"源码交付","Source delivery")}</span><span>{sasiSoftwareUiText(lang,"安装与使用教程","Installation and user guide")}</span><span>{sasiSoftwareUiText(lang,"只读观察","Read-only observation")}</span></div>
    </div>
    <div className={styles.featuredPrice}>
     <strong>¥{featured.priceCny.toLocaleString("en-US")}</strong>
     <small>USD {"$"}{featured.priceUsd.toLocaleString("en-US")}</small>
     {featuredReady&&(featuredPayment.wechat||featuredPayment.alipay)&&<Link href={"/checkout?productId="+encodeURIComponent(featured.id)+"&redirect=%2Faccount%2Fsoftware"}
      className={styles.featuredAction}>{sasiSoftwareUiText(lang,"人民币支付 · 微信 / 支付宝","Pay in CNY · WeChat / Alipay")}</Link>}
     {featuredReady&&featuredPayment.paypal&&<button type="button" disabled={featuredPaypalBusy} onClick={()=>void payFeaturedPaypal()}
      className={styles.featuredAction+" "+styles.featuredPaypalAction}>
      {featuredPaypalBusy?sasiSoftwareUiText(lang,"正在连接 PayPal…","Connecting to PayPal…"):sasiSoftwareUiText(lang,"美元支付 · PayPal","Pay in USD · PayPal")}
     </button>}
     {featuredPaypalError&&<small role="alert" className={styles.featuredPaypalError}>{featuredPaypalError}</small>}
     {!featuredReady?
      <span role="status" aria-live="polite" className={styles.featuredUnavailable}>{sasiSoftwareUiText(lang,"商品文件与 SHA256 正在核验，暂不可购买","Product files and SHA-256 are being verified; purchases are disabled.")}</span>:
      !featuredPayment.wechat&&!featuredPayment.alipay&&!featuredPayment.paypal?
      <span className={styles.featuredUnavailable}>{sasiSoftwareUiText(lang,"当前没有可用的支付方式","No payment method is currently available")}</span>:null}
    </div>
   </article>
    {featuredSide.map(item=>{
     const cover=images[item.id]?.find(photo=>photo.kind==="cover")?.url;
     return <article className={styles.featuredMiniCard} key={item.id}>
      <Link href={"/sasi/marketplace/"+item.id} className={styles.featuredMiniVisual}>
       {cover?<img src={cover} alt={item.title} loading="lazy" referrerPolicy="no-referrer"/>:<span>{categoryLabel(lang,item.category)}</span>}
      </Link>
      <div className={styles.featuredMiniInfo}>
       <small className={styles.featuredMiniCategory}>{categoryLabel(lang,item.category)}</small>
       <h3>{item.title}</h3><p>{item.description}</p>
       <div className={styles.featuredMiniPrice}><strong>¥{format(item.price_cny_minor)}</strong><small>USD ${format(item.price_usd_minor)}</small></div>
       <Link className={styles.featuredMiniDetail} href={"/sasi/marketplace/"+item.id}>{sasiSoftwareUiText(lang,"查看详情","View details")} →</Link>
      </div>
     </article>;
    })}
    {featuredFallbacks.map(kind=>kind==="browse"?<Link key={kind} href="#products" className={styles.featuredMiniCta}>
     <span className={styles.featuredMiniCtaIcon}>◈</span><strong>{sasiSoftwareUiText(lang,"浏览全部软件","Browse all software")}</strong><small>{sasiSoftwareUiText(lang,"查看已审核发布的商品与开发者作品。","Explore reviewed software and developer listings.")}</small><b>{sasiSoftwareUiText(lang,"浏览软件","Browse software")} →</b>
    </Link>:<Link key={kind} href="/sasi/seller" className={styles.featuredMiniCta}>
     <span className={styles.featuredMiniCtaIcon}>✧</span><strong>{sasiSoftwareUiText(lang,"开发者发布","Publish as a developer")}</strong><small>{sasiSoftwareUiText(lang,"提交软件资料，审核通过后展示并自动交付。","Submit software for review and verified automatic delivery.")}</small><b>{sasiSoftwareUiText(lang,"进入卖家工作台","Open seller workspace")} →</b>
    </Link>)}
   </div>
  </section>
  <section id="products" className={styles.section}><div className={styles.sectionHeading}><div><h2>{sasiSoftwareUiText(lang,"开发者作品","Software & seller services")}</h2></div>
   <div className={styles.find}>
    <input aria-label={sasiSoftwareUiText(lang,"搜索软件","Search software")} placeholder={sasiSoftwareUiText(lang,"搜索 EA、指标、应用…","Find EAs and software…")} value={search} onChange={e=>setSearch(e.target.value)}/>
    <select data-testid="sasi-sort" className={styles.sortSelect} value={sort} onChange={e=>setSort(e.target.value as "newest"|"price-asc"|"price-desc")} aria-label={sasiSoftwareUiText(lang,"排序方式","Sort listings")}>
     <option value="newest">{sasiSoftwareUiText(lang,"最新上架","Newest")}</option>
     <option value="price-asc">{sasiSoftwareUiText(lang,"人民币价格：从低到高","Price: low to high")}</option>
     <option value="price-desc">{sasiSoftwareUiText(lang,"人民币价格：从高到低","Price: high to low")}</option>
    </select>
   </div></div>
   <div className={styles.filters} aria-label={sasiSoftwareUiText(lang,"软件分类筛选","Software category filters")}>
    <button type="button" aria-pressed={filter==="all"} className={filter==="all"?styles.active:""} onClick={()=>setFilter("all")}>{sasiSoftwareUiText(lang,"全部","All")} <span className={styles.filterCount}>{listings.length}</span></button>
    {CATEGORIES.map(([key])=>{const count=listings.filter(item=>item.category===key).length;return <button type="button" key={key} aria-pressed={filter===key} className={filter===key?styles.active:""} onClick={()=>setFilter(key)}>{categoryLabel(lang,key)} <span className={styles.filterCount}>{count}</span></button>})}
   </div>
   <p className={styles.resultsMeta} aria-live="polite">{sasiSoftwareUiText(lang,`当前显示 ${visible.length} 款已审核软件`,`Showing ${visible.length} reviewed listings`)}</p>
   <div className={styles.products}>{remainingVisible.map((item,i)=><article className={styles.card} key={item.id}>
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
   {remainingVisible.length===0&&visible.length>0&&<div className={styles.empty}>{sasiSoftwareUiText(lang,"精选软件已展示在上方，更多作品将在审核通过后持续出现。","Featured software is shown above. More listings appear as they pass review.")}</div>}
    {visible.length===0&&<div className={styles.empty}>{sasiSoftwareUiText(lang,"已审核的软件将在这里展示；欢迎开发者发布原创作品。","No reviewed and published software matches this search.")}</div>}
  </section>
  <section className={styles.section} aria-label={sasiSoftwareUiText(lang,"软件发布与交付步骤","Software publishing steps")}>
    <div className={styles.sectionHeading}><div><h2>{sasiSoftwareUiText(lang,"卖家发布与自动交付","Publish and deliver")}</h2></div></div>
    <div className={styles.steps}>
       <div><b>01</b><strong>{sasiSoftwareUiText(lang,"填写商品资料","Product details")}</strong><span>{sasiSoftwareUiText(lang,"名称 · 介绍 · 价格","Name, description, price")}</span></div>
       <div><b>02</b><strong>{sasiSoftwareUiText(lang,"上传软件包","Upload software ZIP")}</strong><span>{sasiSoftwareUiText(lang,"成品或源码、说明与授权","Software or source, documentation and license")}</span></div>
       <div><b>03</b><strong>{sasiSoftwareUiText(lang,"审核发布","Review and publish")}</strong><span>{sasiSoftwareUiText(lang,"安全审核后公开展示","Listed after security review")}</span></div>
       <div><b>04</b><strong>{sasiSoftwareUiText(lang,"自动交付","Automatic delivery")}</strong><span>{sasiSoftwareUiText(lang,"付款验证后限时获取","Download after verified payment")}</span></div>
       <button type="button" className={styles.launchStudio} onClick={()=>setShowStudio(v=>!v)} aria-expanded={showStudio} aria-controls="sasi-seller-studio">{showStudio?(sasiSoftwareUiText(lang,"收起工作台","Close workspace")):(sasiSoftwareUiText(lang,"立即发布软件","Publish software"))}</button>
     </div>
   </section>
   
</>}
{sellerOnly&&<>
 <section className={styles.sellerHero} data-testid="seller-workspace-hero">
  <div className={styles.sellerHeroCopy}>
   <small className={styles.sellerHeroEyebrow}>SASI · SELLER WORKSPACE</small>
   <h1>{sasiSoftwareUiText(lang,"卖家工作台","Seller workspace")}</h1>
   <p>{sasiSoftwareUiText(lang,"在 SASI 发布软件，触达全球用户，管理商品审核、自动交付与安全结算。","Publish software on SASI, reach global users and manage review, verified delivery and settlement.")}</p>
   <Link href="/sasi" className={styles.sellerBack}>{sasiSoftwareUiText(lang,"返回软件市场","Back to software market")} ↗</Link>
  </div>
  <div className={styles.sellerHeroArt} aria-hidden="true">
   <img className={styles.sellerHeroArtwork} data-testid="seller-hero-artwork"
    src="/images/sasi/sasi-market-hero-lingxifield.png" alt="" loading="eager" decoding="async"/>
  </div>
 </section>
 <div className={styles.metrics} aria-label={sasiSoftwareUiText(lang,"卖家经营数据","Seller activity")} data-testid="seller-metrics">
  <div data-metric="published"><span className={styles.metricIcon} aria-hidden="true">▱</span><div className={styles.metricCopy}><span>{sasiSoftwareUiText(lang,"已发布软件","Published software")}</span><strong>{publishedCount}</strong><small>{sasiSoftwareUiText(lang,"当前公开展示","Currently listed")}</small></div></div>
  <div data-metric="pending"><span className={styles.metricIcon} aria-hidden="true">⌛</span><div className={styles.metricCopy}><span>{sasiSoftwareUiText(lang,"待审核","Pending review")}</span><strong>{pendingCount}</strong><small>{sasiSoftwareUiText(lang,"等待平台审核","Awaiting review")}</small></div></div>
  <div data-metric="sales"><span className={styles.metricIcon} aria-hidden="true">¥</span><div className={styles.metricCopy}><span>{sasiSoftwareUiText(lang,"总销售额","Gross sales")}</span><strong>{payments?"¥"+format(cnyGross):"—"}</strong><small>{payments?"USD $ "+format(usdGross):sasiSoftwareUiText(lang,"等待真实结算数据","Waiting for verified settlement data")}</small></div></div>
  <div data-metric="delivery"><span className={styles.metricIcon} aria-hidden="true">↗</span><div className={styles.metricCopy}><span>{sasiSoftwareUiText(lang,"自动交付成功率","Automatic delivery success")}</span><strong>—</strong><small>{sasiSoftwareUiText(lang,"等待真实订单统计，不展示估算值","Shown after verified order data is available")}</small></div></div>
 </div>
</>}
{showStudio&&<section id="sasi-seller-studio" className={styles.section + (sellerOnly ? " " + styles.sellerWorkspaceSection : "")} data-testid="seller-workspace-section">{!sellerOnly&&<div className={styles.sectionHeading}><div><h2>{sasiSoftwareUiText(lang,"卖家工作台","Seller workspace")}</h2></div><Link href="/account/software">{sasiSoftwareUiText(lang,"已购买的软件","Purchased software")} ↗</Link></div>}
   <div className={styles.sellerWorkspaceGrid} data-testid="seller-workspace-grid">
    <aside className={styles.sellerJoinColumn}>
    <div className={styles.formCard}><h3>{seller?(sasiSoftwareUiText(lang,"卖家资料","Seller profile")):(sasiSoftwareUiText(lang,"零费用申请入驻","Apply to sell for free"))}</h3>
    {!seller&&<div className={styles.sellerJoinArt} aria-hidden="true">
     <img className={styles.sellerJoinArtwork} data-testid="seller-join-artwork"
      src="/images/global-scene-20261114.webp" alt="" loading="lazy" decoding="async"/>
    </div>}
    {seller?<div className={styles.profile}><strong>{seller.display_name}</strong><p>{sasiSoftwareUiText(lang,"审核状态","Review status")}: {translatedStatus(lang,seller.status)}</p><p>{sasiSoftwareUiText(lang,"身份核验","Identity verification")}: {seller.kyc_status==="verified"?(sasiSoftwareUiText(lang,"已完成","Verified")):(sasiSoftwareUiText(lang,"待完成","Pending"))}</p><p>{sasiSoftwareUiText(lang,"完成身份和收款方式审核后才能提现。","Identity and payout verification are required before cash-out.")}</p></div>:<>
     <label>{sasiSoftwareUiText(lang,"展示名称","Display name")}<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} placeholder={sasiSoftwareUiText(lang,"软件开发者 / 工作室","Developer / studio")}/></label>
     <label className={styles.check}><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/>{sasiSoftwareUiText(lang,"确认已满 18 周岁","I am at least 18 years old")}</label>
     <label className={styles.check}><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/>{sasiSoftwareUiText(lang,"同意 SASI 卖家协议与结算规则","I accept the SASI seller and settlement terms")}</label>
     {terms&&<p className="mt-2 text-sm leading-relaxed text-[var(--lx-muted)]">{sasiSoftwareUiText(lang,"仅在实际交易完成后，卖家获得商品净销售金额的 85%，平台收取 15% 服务费。具体结算与退货规则以卖家协议为准。","After a completed eligible sale, the seller receives 85% and the platform charges a 15% service fee. Settlement and refund rules follow the seller agreement.")}</p>}
     <button disabled={busy!==""||!adult||!terms||displayName.trim().length<2} onClick={()=>void apply()}>{busy==="seller"?"…":sasiSoftwareUiText(lang,"申请成为卖家","Apply as seller")}</button>
     <p>{sasiSoftwareUiText(lang,"须先登录且验证邮箱，平台不收取保证金。","Sign-in and verified email are required. No seller deposit.")} <Link href="/account?mode=signin">{sasiSoftwareUiText(lang,"账户登录","Sign in")} ↗</Link></p>
    </>}</div>
     <div className={styles.sellerBenefits}>
      <div><span>✓</span><strong>{sasiSoftwareUiText(lang,"平台审核","Platform review")}</strong><small>{sasiSoftwareUiText(lang,"资料清晰可核验","Clear, reviewable listings")}</small></div>
      <div><span>↗</span><strong>{sasiSoftwareUiText(lang,"自动交付","Automatic delivery")}</strong><small>{sasiSoftwareUiText(lang,"付款验证后发放","Released after payment verification")}</small></div>
      <div><span>¥</span><strong>{sasiSoftwareUiText(lang,"收益结算","Payout settlement")}</strong><small>{sasiSoftwareUiText(lang,"多币种账户支持","Multi-currency account")}</small></div>
     </div>
    </aside>
    <div className={styles.sellerMainColumn}>
    <div id="listing-editor" className={styles.formCard}><div className={styles.sellerFormHeading}><h3>{editingId?sasiSoftwareUiText(lang,"修改商品资料","Edit listing"):sasiSoftwareUiText(lang,"发布新软件","Create a software listing")}</h3>{resumableDraft&&<button type="button" className={styles.resumeDraftButton} disabled={busy!==""} onClick={()=>editDraft(resumableDraft)}><span aria-hidden="true">↶</span>{sasiSoftwareUiText(lang,"从草稿继续","Continue draft")}</button>}</div>
      <div className={styles.identityFields}><label>{sasiSoftwareUiText(lang,"软件名称","Product name")}<input value={title} maxLength={120} onChange={e=>setTitle(e.target.value)} placeholder={sasiSoftwareUiText(lang,"软件名称、版本、授权类型","Software name, version, license")}/></label>
      <label>{sasiSoftwareUiText(lang,"分类","Category")}<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(([id])=><option key={id} value={id}>{categoryLabel(lang,id)}</option>)}</select></label></div>
      <label>{sasiSoftwareUiText(lang,"完整软件介绍（最多5,000字）","Full software description (up to 5,000 characters)")}<textarea rows={5} value={description} maxLength={5000} onChange={e=>setDescription(e.target.value)} placeholder={sasiSoftwareUiText(lang,"介绍核心功能、适用场景、MT5版本与账户模式（对冲/净额）、适用品种和周期、安装要求、依赖项、版本更新及授权范围。支持换行分段，详情页可完整展开。","Explain features, use cases, MT5 build and account mode (hedging/netting), supported symbols and timeframes, installation, dependencies, updates and license scope.")}/><span className={styles.descriptionCount} aria-live="polite">{description.length.toLocaleString("en-US")} / 5,000</span></label>
      <div className={styles.priceFields}><label>{sasiSoftwareUiText(lang,"人民币标价","CNY price")}<input type="number" min="1" max="10000000" step="0.01" value={rmb} onChange={e=>setRmb(e.target.value)}/></label>
      <label>{sasiSoftwareUiText(lang,"美元标价","USD price")}<input type="number" min="1" max="10000000" step="0.01" value={usd} onChange={e=>setUsd(e.target.value)}/></label></div>
      <div className={styles.uploadGrid} data-testid="seller-upload-grid" aria-label={sasiSoftwareUiText(lang,"软件文件上传","Software file uploads")}>
       <label data-testid="seller-upload-tile" className={`${styles.uploadTile} ${activeDraft?"":styles.uploadTileDisabled}`}>
        <span className={styles.uploadTileIcon} aria-hidden="true">⇧</span>
        <strong>{sasiSoftwareUiText(lang,"软件 ZIP / 源码包","Software ZIP / source package")}</strong>
        <small>{sasiSoftwareUiText(lang,"仅支持 ZIP，最大 30MB","ZIP only · up to 30MB")}</small>
        <em>{activeDraft?translatedStatus(lang,activeDraft.scan_status,true):sasiSoftwareUiText(lang,"保存草稿后上传","Save a draft to upload")}</em>
        <input type="file" accept=".zip,application/zip" disabled={!activeDraft||busy!==""} onChange={e=>{const file=e.target.files?.[0];if(file&&activeDraft)void upload(activeDraft,file)}}/>
       </label>
       <label data-testid="seller-upload-tile" className={`${styles.uploadTile} ${activeDraft?"":styles.uploadTileDisabled}`}>
        <span className={styles.uploadTileIcon} aria-hidden="true">▧</span>
        <strong>{sasiSoftwareUiText(lang,"封面图片","Cover image")}</strong>
        <small>{sasiSoftwareUiText(lang,"PNG / JPG / WebP，最大 1MB","PNG / JPG / WebP · up to 1MB")}</small>
        <em>{activeDraft?sasiSoftwareUiText(lang,`已上传 ${mediaCounts[activeDraft.id]?.cover??0} / 1 张`,`${mediaCounts[activeDraft.id]?.cover??0} / 1 uploaded`):sasiSoftwareUiText(lang,"保存草稿后上传","Save a draft to upload")}</em>
        <input type="file" accept="image/png,image/jpeg,image/webp" disabled={!activeDraft||busy!==""||(mediaCounts[activeDraft?.id??""]?.cover??0)>=1} onChange={e=>{const file=e.target.files?.[0];if(file&&activeDraft)void uploadImage(activeDraft,file,"cover")}}/>
       </label>
       <label data-testid="seller-upload-tile" className={`${styles.uploadTile} ${activeDraft?"":styles.uploadTileDisabled}`}>
        <span className={styles.uploadTileIcon} aria-hidden="true">▤</span>
        <strong>{sasiSoftwareUiText(lang,"授权或许可文件","License document")}</strong>
        <small>{licenseFiles[activeDraft?.id??""]?.name??sasiSoftwareUiText(lang,"PDF / TXT / PNG，最大 20MB","PDF / TXT / PNG · up to 20MB")}</small>
        <em>{licenseFiles[activeDraft?.id??""]?sasiSoftwareUiText(lang,"已选择，上传 ZIP 时自动合并","Selected · bundled into ZIP on upload"):sasiSoftwareUiText(lang,"单独选择，随软件包统一审核与交付","Select separately · reviewed and delivered with the package")}</em>
        <input data-testid="seller-license-file-input" type="file" accept=".pdf,.txt,.png,application/pdf,text/plain,image/png" disabled={!activeDraft||busy!==""} onChange={e=>{const file=e.target.files?.[0];if(file&&activeDraft)void selectLicenseFile(activeDraft,file)}}/>
       </label>
      </div>
      {activeDraft&&<label className={styles.detailUploadRow}>
       <span><strong>{sasiSoftwareUiText(lang,"详情图（可选，最多4张）","Detail images (optional, up to 4)")}</strong><small>{sasiSoftwareUiText(lang,"用于商品详情页的补充展示","Optional images for the product detail page")}</small></span>
       <em>{sasiSoftwareUiText(lang,`已上传 ${mediaCounts[activeDraft.id]?.detail??0} / 4 张`,`${mediaCounts[activeDraft.id]?.detail??0} / 4 uploaded`)}</em>
       <input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy!==""||(mediaCounts[activeDraft.id]?.detail??0)>=4} onChange={e=>{const files=Array.from(e.target.files??[]).slice(0,4-(mediaCounts[activeDraft.id]?.detail??0));void(async()=>{for(const file of files)await uploadImage(activeDraft,file,"detail")})()}}/>
      </label>}
      {activeDraft&&<div className={styles.activeDraftActions}>
       <span>{sasiSoftwareUiText(lang,"当前草稿","Active draft")}：{activeDraft.title}</span>
       <button type="button" disabled={busy!==""||(mediaCounts[activeDraft.id]?.cover??0)!==1||!uploadedPackages[activeDraft.id]} onClick={()=>void submitReview(activeDraft)} className={styles.launchStudio}>{busy==="submit-"+activeDraft.id?"…":sasiSoftwareUiText(lang,"提交商品审核","Submit for review")}</button>
       <button type="button" disabled={busy!==""} onClick={()=>{setActiveDraftId(null);setEditingId(null);setTitle("");setDescription("");}}>{sasiSoftwareUiText(lang,"新建商品","New listing")}</button>
      </div>}
      <button disabled={busy!==""||seller?.status!=="approved"} onClick={()=>void makeDraft()}>{busy==="draft"?"…":(editingId||activeDraftId)?sasiSoftwareUiText(lang,"保存修改","Save changes"):sasiSoftwareUiText(lang,"保存商品草稿","Save product draft")}</button>
      {editingId&&<button type="button" disabled={busy!==""} onClick={()=>{setEditingId(null);setActiveDraftId(null);setTitle("");setDescription("");}}>{sasiSoftwareUiText(lang,"取消修改","Cancel editing")}</button>}
      <p>{sasiSoftwareUiText(lang,"软件 ZIP 最大30MB；许可文件可单独选择，系统会合并进 ZIP 后统一安全检查与交付。主图1张，详情图最多4张。","ZIP packages are limited to 30MB. Select a PDF, TXT or PNG license file separately; it is bundled into the ZIP for unified security review and delivery. One cover image and up to four optional detail images are supported.")}</p>
    </div>

   {mine.length>0&&<div className={styles.drafts}><h3>{sasiSoftwareUiText(lang,"我的软件草稿与审核进度","My submissions")}</h3>{mine.map(item=><div className={styles.draft} key={item.id}><div><strong>{item.title}</strong><small>{translatedStatus(lang,item.status)} · {translatedStatus(lang,item.scan_status,true)}</small></div>
    {item.status==="rejected"&&item.rejection_reason&&<p role="status">{item.rejection_reason}</p>}
    {["draft","rejected"].includes(item.status)&&<button type="button" disabled={busy!==""} onClick={()=>editDraft(item)}>{sasiSoftwareUiText(lang,"继续编辑与上传","Continue editing and upload")}</button>}
    {item.status==="draft"&&<button type="button" disabled={busy!==""||mediaCounts[item.id]?.cover!==1||!uploadedPackages[item.id]} onClick={()=>void submitReview(item)}>{busy==="submit-"+item.id?"…":sasiSoftwareUiText(lang,"提交商品审核","Submit for review")}</button>}
    {item.status==="published"&&<button onClick={()=>void share(item)}>{sasiSoftwareUiText(lang,"分享商品","Share")}</button>}
   </div>)}</div>}
   {error&&<p className={styles.error} role="alert">{error}</p>}{status&&<p className={styles.success} role="status">{status}</p>}
    </div>
    <aside className={styles.sellerGuideColumn}>
     <article className={styles.sellerGuideCard}>
      <h3><span className={styles.sellerGuideMark}>01</span>{sasiSoftwareUiText(lang,"发布流程","Publishing steps")}</h3>
      <ol className={styles.sellerGuideSteps}>
       <li><b>1</b><span><strong>{sasiSoftwareUiText(lang,"入驻","Apply")}</strong><small>{sasiSoftwareUiText(lang,"申请成为卖家","Become a seller")}</small></span></li>
       <li><b>2</b><span><strong>{sasiSoftwareUiText(lang,"上传","Upload")}</strong><small>{sasiSoftwareUiText(lang,"填写资料并上传 ZIP","Add details and ZIP")}</small></span></li>
       <li><b>3</b><span><strong>{sasiSoftwareUiText(lang,"审核","Review")}</strong><small>{sasiSoftwareUiText(lang,"安全检查与平台审核","Security and platform review")}</small></span></li>
       <li><b>4</b><span><strong>{sasiSoftwareUiText(lang,"自动交付","Delivery")}</strong><small>{sasiSoftwareUiText(lang,"付款核验后自动发放","Released after payment verification")}</small></span></li>
      </ol>
     </article>
     <article className={styles.sellerGuideCard}><h3><span className={styles.sellerGuideMark}>¥</span>{sasiSoftwareUiText(lang,"结算说明","Settlement")}</h3><p>{sasiSoftwareUiText(lang,"销售收入按实际成交、退款及卖家协议计算。结算与提现状态可在账户中查看。","Sales are calculated from completed orders, refunds and the seller agreement. View settlement and payout status in the account.")}</p></article>
     <article className={styles.sellerGuideCard}><h3><span className={styles.sellerGuideMark}>✓</span>{sasiSoftwareUiText(lang,"安全校验","Security checks")}</h3><p>{sasiSoftwareUiText(lang,"软件包进入私密存储，提交后进行安全检查与管理员审核；未通过的文件不会公开交付。","Packages use private storage and undergo security scanning and administrator review. Rejected files are not made available for delivery.")}</p></article>
     <article className={styles.sellerGuideCard}><h3><span className={styles.sellerGuideMark}>▤</span>{sasiSoftwareUiText(lang,"授权范围","License scope")}</h3><p>{sasiSoftwareUiText(lang,"请写清成品或源码、适用平台与账户模式、设备数量、授权期限、更新政策与商用范围。授权或许可文件可放入 ZIP 软件包。","Specify finished software or source, device limits, license duration and commercial scope. Include license documents in the ZIP package.")}</p></article>
    </aside>
   </div>
  </section>}
  {showStudio&&seller&&<section className={styles.section}><div className={styles.sectionHeading}><div><h2>{sasiSoftwareUiText(lang,"销售收入与提现","Seller earnings & payouts")}</h2></div></div>
   <div className={styles.earnings}><div><span>{sasiSoftwareUiText(lang,"人民币可提现","CNY available")}</span><strong>¥{format(payments?.balances?.CNY?.availableMinor??0)}</strong></div>
   <div><span>{sasiSoftwareUiText(lang,"美元可提现","USD available")}</span><strong>${format(payments?.balances?.USD?.availableMinor??0)}</strong></div></div>
   <div className={styles.payoutForm}><select value={requestCurrency} onChange={e=>setRequestCurrency(e.target.value as "CNY"|"USD")}><option value="CNY">CNY</option><option value="USD">USD</option></select>
    <input type="number" min="0.01" step="0.01" placeholder={sasiSoftwareUiText(lang,"提现金额","Withdrawal amount")} value={requestedAmount} onChange={e=>setRequestedAmount(e.target.value)}/>
    <button disabled={busy!==""||!payments?.payoutsOpen||!seller||seller.kyc_status!=="verified"} onClick={()=>void payout()}>{sasiSoftwareUiText(lang,"申请提现","Request payout")}</button></div>
   <p className={styles.note}>{payments?.payoutsOpen?(sasiSoftwareUiText(lang,"平台将在受理后核对付款状态并提交支付机构；不代表已到账。","Payout requests are checked and submitted to the provider; submission does not confirm arrival.")):(sasiSoftwareUiText(lang,"自动转账渠道正在接入和验收，暂不开放提现申请。","Automated provider payouts are in integration testing and are not open."))}</p>
  </section>}
 </div></main>
}
