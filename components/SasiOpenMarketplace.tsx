"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import styles from "./SasiOpenMarketplace.module.css";
type Listing={id:string;seller_id:string;title:string;description:string;category:string;price_cny_minor:number;price_usd_minor:number;status:string;scan_status:string;created_at:string;};
type Seller={user_id:string;display_name:string;status:string;kyc_status:string;payout_provider:string|null};
type Payout={balances:Record<string,{grossMinor:number;platformFeeMinor:number;availableMinor:number}>;payouts:Array<{id:string;currency:string;amount_minor:number;status:string;requested_at:string}>;payoutsOpen:boolean;submissionTargetMinutes:number};
const CATEGORIES=[["mt5-ea","MT5 EA"],["mt5-indicator","MT5 指标"],["automation","自动化软件"],["desktop-app","桌面程序"],["developer-tool","开发工具"],["software","其他软件"]] as const;
function format(value:number){return (value/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
export default function SasiOpenMarketplace(){
 const {lang}=useLingxiLang();const zh=lang==="zh";
 const [listings,setListings]=useState<Listing[]>([]);
 const [mine,setMine]=useState<Listing[]>([]);
 const [seller,setSeller]=useState<Seller|null>(null);
 const [payments,setPayments]=useState<Payout|null>(null);
 const [filter,setFilter]=useState("all"),[search,setSearch]=useState("");
 const [displayName,setDisplayName]=useState("");
 const [adult,setAdult]=useState(false),[terms,setTerms]=useState(false);
 const [title,setTitle]=useState(""),[description,setDescription]=useState("");
 const [category,setCategory]=useState("mt5-ea"),[rmb,setRmb]=useState("99.00"),[usd,setUsd]=useState("99.00");
 const [busy,setBusy]=useState(""),[error,setError]=useState(""),[status,setStatus]=useState("");
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
   setStatus(zh?"卖家申请已保存，审核通过后可上传软件。":"Seller application saved. Uploads open after approval.");
   await refresh();
  }catch(e){setError(String(e instanceof Error?e.message:e))}finally{setBusy("")}
 };
 const makeDraft=async()=>{
  setBusy("draft");setError("");setStatus("");
  try{
   const minor=(n:string)=>Math.round(Number(n)*100);
   await post("/api/sasi/marketplace/listings",{
    title,description,category,priceCnyMinor:minor(rmb),priceUsdMinor:minor(usd)
   });
   setStatus(zh?"商品草稿已保存，可继续上传安装包。":"Draft saved. You can now upload its package.");
   setTitle("");setDescription("");await refresh();
  }catch(e){setError(String(e instanceof Error?e.message:e))}finally{setBusy("")}
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
   await post("/api/sasi/marketplace/submit",{listingId:item.id});
   setStatus(zh?"文件已进入隔离扫描和人工审核队列，不会直接公开下载。":"Package submitted for quarantine scanning and review. It is not publicly downloadable.");
   await refresh();
  }catch(e){setError(String(e instanceof Error?e.message:e))}finally{setBusy("")}
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
   setStatus(zh?"商品图片已上传并等待审核，最多支持五张。":"Image uploaded, awaiting review. Up to five images per listing.");
   await refresh();
  }catch(e){setError(String(e instanceof Error?e.message:e))}finally{setBusy("")}
 };
 const share=async(item:Listing)=>{
  const url=window.location.origin+"/sasi/marketplace/"+item.id;
  try{
   if(typeof navigator.share==="function")await navigator.share({title:item.title,url});
   else {await navigator.clipboard.writeText(url);setStatus(zh?"商品分享链接已复制。":"Product link copied.");}
  }catch{}
 };
 const payout=async()=>{
  setBusy("payout");setError("");setStatus("");
  try{
   const amountMinor=Math.round(Number(requestedAmount)*100);
   if(!Number.isSafeInteger(amountMinor)||amountMinor<1)throw Error("INVALID_AMOUNT");
   const key=crypto.randomUUID();
   const result=await post("/api/sasi/marketplace/payouts",{amountMinor,currency:requestCurrency,idempotencyKey:key});
   setStatus(result.status==="requested"?(zh?"提现申请已提交，平台将核实并向收款机构发起转账；到账以渠道回执为准。":"Payout requested. Provider submission and arrival are separately verified."):"PAYOUT_STATUS_"+result.status);
   await refresh();
  }catch(e){setError(String(e instanceof Error?e.message:e))}finally{setBusy("")}
 };
 return <main className={styles.main}><div className={styles.container}>
  <div className={styles.hero}><div><span className={styles.eyebrow}>SASI / OPEN SOFTWARE MARKETPLACE</span>
   <h1>{zh?"分享创造力，让软件被世界看见":"Share your software with the world"}</h1>
   <p>{zh?"开发者可以发布 EA、指标、自动化脚本和成品软件。零保证金、零上架费，只有成交后平台收取 15% 服务费。":"Publish EAs, indicators, scripts and software. No deposit or listing fee. SASI earns 15% only from completed sales."}</p>
   <div className={styles.heroLinks}><a href="#products">{zh?"探索软件":"Explore software"}</a><a href="#sell">{zh?"成为卖家":"Become a seller"}</a><Link href="/sasi">SASI SOFTWARE ↗</Link></div>
  </div><div className={styles.heroRate}><small>SELLER REVENUE</small><strong>85<span>%</span></strong><div>{zh?"卖家收入占比":"Seller's share"}</div><p>15% SASI SERVICE FEE</p></div></div>
  <div className={styles.metrics}>
   <div><span>{zh?"入驻保证金":"Seller deposit"}</span><strong>¥0</strong></div>
   <div><span>{zh?"上架费用":"Listing fee"}</span><strong>¥0</strong></div>
   <div><span>{zh?"成交佣金":"Sale fee"}</span><strong>15%</strong></div>
   <div><span>{zh?"提现处理目标":"Payout handling target"}</span><strong>15 <small>min</small></strong></div>
  </div>
  <p className={styles.note}>{zh?"提现目标为可提现资金申请后的平台审核及向支付机构提交时间，不承诺银行或微信、支付宝的最终到账时间。销售款设有七天风险结算期。":"The 15-minute target covers eligible payout review and provider submission, not guaranteed recipient arrival. Seller revenue has a seven-day risk hold."}</p>
  <section id="products" className={styles.section}><div className={styles.sectionHeading}><div><small>01 / COMMUNITY</small><h2>{zh?"创作者软件市场":"Community software market"}</h2></div>
   <div className={styles.find}><input aria-label={zh?"搜索软件":"Search software"} placeholder={zh?"搜索 EA、指标、应用…":"Find EAs and software…"} value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
   <div className={styles.filters}><button className={filter==="all"?styles.active:""} onClick={()=>setFilter("all")}>{zh?"全部":"All"}</button>{CATEGORIES.map(([key,label])=><button key={key} className={filter===key?styles.active:""} onClick={()=>setFilter(key)}>{label}</button>)}</div>
   <div className={styles.products}>{visible.map((item,i)=><article className={styles.card} key={item.id}>
    <div className={styles.tile} data-tone={i%3}><span>{item.category==="mt5-ea"?"EA":item.category==="mt5-indicator"?"SI":"SASI"}</span></div>
    <div className={styles.cardContent}><div className={styles.category}>{CATEGORIES.find(([x])=>x===item.category)?.[1]||"Software"}</div>
    <h3>{item.title}</h3><p>{item.description}</p><div className={styles.cardBottom}><strong>¥{format(item.price_cny_minor)}</strong><span>USD ${format(item.price_usd_minor)}</span></div>
    <div className={styles.cardActions}><Link href={"/sasi/marketplace/"+item.id}>{zh?"查看详情":"Details"} ↗</Link><button onClick={()=>void share(item)}>{zh?"分享":"Share"} ↗</button></div>
    </div></article>)}</div>
   {visible.length===0&&<div className={styles.empty}>{zh?"开放市场正在准备首批经过安全审核的软件作品。":"The first security-reviewed community listings are being prepared."}</div>}
  </section>
  <section id="sell" className={styles.section}><div className={styles.sectionHeading}><div><small>02 / SELLER STUDIO</small><h2>{zh?"卖家工作台":"Seller workspace"}</h2></div><Link href="/account/software">{zh?"已购买的软件":"Purchased software"} ↗</Link></div>
   <div className={styles.workspace}>
    <div className={styles.formCard}><h3>{seller?(zh?"卖家资料":"Seller profile"):(zh?"零费用申请入驻":"Apply to sell for free")}</h3>
    {seller?<div className={styles.profile}><strong>{seller.display_name}</strong><p>{zh?"审核状态":"Review status"}: {seller.status}</p><p>KYC: {seller.kyc_status}</p><p>{zh?"完成身份和收款方式审核后才能提现。":"Identity and payout verification are required before cash-out."}</p></div>:<>
     <label>{zh?"展示名称":"Display name"}<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} placeholder={zh?"软件开发者 / 工作室":"Developer / studio"}/></label>
     <label className={styles.check}><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/>{zh?"确认已满 18 周岁":"I am at least 18 years old"}</label>
     <label className={styles.check}><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/>{zh?"同意软件版权、安全审核、15% 服务费及结算规则":"I agree to the IP, security, 15% fee and settlement terms"}</label>
     <button disabled={busy!==""||!adult||!terms||displayName.trim().length<2} onClick={()=>void apply()}>{busy==="seller"?"…":zh?"申请成为卖家":"Apply as seller"}</button>
     <p>{zh?"须先登录且验证邮箱，平台不收取保证金。":"Sign-in and verified email are required. No seller deposit."} <Link href="/account?mode=signin">{zh?"账户登录":"Sign in"} ↗</Link></p>
    </>}</div>
    <div className={styles.formCard}><h3>{zh?"发布新软件":"Create a software listing"}</h3>
      <label>{zh?"软件名称":"Product name"}<input value={title} maxLength={120} onChange={e=>setTitle(e.target.value)} placeholder="Copernicus / MT5 Expert Advisor"/></label>
      <label>{zh?"分类":"Category"}<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <label>{zh?"软件介绍":"Description"}<textarea rows={3} value={description} maxLength={5000} onChange={e=>setDescription(e.target.value)} placeholder={zh?"功能、适用平台、系统要求、版本与许可说明":"Features, requirements, version and licensing"}/></label>
      <div className={styles.priceFields}><label>{zh?"人民币标价":"CNY price"}<input type="number" min="1" max="10000000" step="0.01" value={rmb} onChange={e=>setRmb(e.target.value)}/></label>
      <label>{zh?"美元标价":"USD price"}<input type="number" min="1" max="10000000" step="0.01" value={usd} onChange={e=>setUsd(e.target.value)}/></label></div>
      <button disabled={busy!==""||!seller} onClick={()=>void makeDraft()}>{busy==="draft"?"…":zh?"保存商品草稿":"Save product draft"}</button>
      <p>{zh?"软件包 ZIP 限 30 MB；支持最多五张 PNG/JPG/WebP 图片，每张限 1 MB。软件和图片均须审核。":"ZIP software up to 30 MB and five PNG/JPG/WebP photos up to 1 MB each. Security review is mandatory."}</p>
    </div>
   </div>
   {mine.length>0&&<div className={styles.drafts}><h3>{zh?"我的软件草稿与审核进度":"My submissions"}</h3>{mine.map(item=><div className={styles.draft} key={item.id}><div><strong>{item.title}</strong><small>{item.status} · {item.scan_status}</small></div>
    {item.status==="draft"&&<>
     <label className={styles.upload}>{busy==="image-"+item.id?"上传图片中…":zh?"上传封面 / 详情图":"Add product image"}
       <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy!==""} onChange={e=>{const f=e.target.files?.[0];if(f)void uploadImage(item,f,"detail")}}/>
     </label>
     <label className={styles.upload}>{busy==="upload-"+item.id?"处理中…":zh?"上传 ZIP 并提交审核":"Upload ZIP"}
       <input type="file" accept=".zip,application/zip" disabled={busy!==""} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(item,f)}}/>
     </label>
   </>}
    {item.status==="published"&&<button onClick={()=>void share(item)}>{zh?"分享商品":"Share"}</button>}
   </div>)}</div>}
   {error&&<p className={styles.error} role="alert">{error}</p>}{status&&<p className={styles.success} role="status">{status}</p>}
  </section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><small>03 / SELLER EARNINGS</small><h2>{zh?"销售收入与提现":"Seller earnings & payouts"}</h2></div></div>
   <div className={styles.earnings}><div><span>{zh?"人民币可提现":"CNY available"}</span><strong>¥{format(payments?.balances?.CNY?.availableMinor??0)}</strong></div>
   <div><span>{zh?"美元可提现":"USD available"}</span><strong>${format(payments?.balances?.USD?.availableMinor??0)}</strong></div></div>
   <div className={styles.payoutForm}><select value={requestCurrency} onChange={e=>setRequestCurrency(e.target.value as "CNY"|"USD")}><option value="CNY">CNY</option><option value="USD">USD</option></select>
    <input type="number" min="0.01" step="0.01" placeholder={zh?"提现金额":"Withdrawal amount"} value={requestedAmount} onChange={e=>setRequestedAmount(e.target.value)}/>
    <button disabled={busy!==""||!payments?.payoutsOpen||!seller||seller.kyc_status!=="verified"} onClick={()=>void payout()}>{zh?"申请提现":"Request payout"}</button></div>
   <p className={styles.note}>{payments?.payoutsOpen?(zh?"平台将在受理后核对付款状态并提交支付机构；不代表已到账。":"Payout requests are checked and submitted to the provider; submission does not confirm arrival."):(zh?"自动转账渠道正在接入和验收，暂不开放提现申请。":"Automated provider payouts are in integration testing and are not open.")}</p>
  </section>
 </div></main>
}
