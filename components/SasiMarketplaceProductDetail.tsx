"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import styles from "./SasiMarketplaceProductDetail.module.css";
type Product={id:string;name:string;nameEn:string;priceRmb:number;priceUsd:number;note:string;noteEn:string;};
type Photo={id:string;kind:string;url:string};
const EXCERPT_LIMIT=320;
export default function SasiMarketplaceProductDetail(){
 const params=useParams(),id=typeof params?.id==="string"?params.id:"";
 const {lang}=useLingxiLang(),zh=lang==="zh";
 const {currency}=usePreferredCurrency();
 const [product,setProduct]=useState<Product|null>(null),[ready,setReady]=useState(false),[loading,setLoading]=useState(true);
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [descriptionOpen,setDescriptionOpen]=useState(false);
 const [payBusy,setPayBusy]=useState(false),[payError,setPayError]=useState(""),[shared,setShared]=useState(false);
 useEffect(()=>{
  if(!id){setLoading(false);return}
  const controller=new AbortController();setLoading(true);setProduct(null);setReady(false);setPhotos([]);setDescriptionOpen(false);
  fetch("/api/sasi/marketplace/product?id="+encodeURIComponent("sasi-market:"+id)+"&currency="+currency,
   {cache:"no-store",signal:controller.signal})
   .then(r=>r.ok?r.json():null)
   .then(data=>{if(controller.signal.aborted)return;setProduct(data?.product||null);setReady(data?.available===true)})
   .catch(()=>{})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[id,currency]);
 useEffect(()=>{
  if(!id||!product)return;
  const controller=new AbortController();
  fetch("/api/sasi/marketplace/images?listingId="+encodeURIComponent(id),
   {cache:"no-store",signal:controller.signal})
   .then(r=>r.ok?r.json():null)
   .then(data=>{if(!controller.signal.aborted)setPhotos(Array.isArray(data?.items?.[id])?data.items[id]:[])})
   .catch(()=>{});
  return()=>controller.abort();
 },[id,product]);
 const cover=photos.find(p=>p.kind==="cover")||null;
 const details=photos.filter(p=>p.kind==="detail").slice(0,4);
 const fullDescription=(zh?product?.note:product?.noteEn||product?.note)||"";
 const hasMore=fullDescription.length>EXCERPT_LIMIT||details.length>0;
 const excerpt=fullDescription.length>EXCERPT_LIMIT?fullDescription.slice(0,EXCERPT_LIMIT).trimEnd()+"…":fullDescription;
 const payPaypal=async()=>{
  if(!product||!ready||payBusy)return;
  setPayBusy(true);setPayError("");
  try{
   const res=await fetch("/api/pay/create",{
    method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",
    body:JSON.stringify({productId:product.id,returnPath:"/account/software"})
   });
   const data=await res.json().catch(()=>({}));
   if(res.status===401){window.location.assign("/account?next="+encodeURIComponent(window.location.pathname));return}
   if(!res.ok||typeof data.url!=="string")throw Error("MARKET_PAYPAL_UNAVAILABLE");
   const target=new URL(data.url);
   if(target.protocol!=="https:"||!/(^|\.)paypal\.com$/.test(target.hostname))
    throw Error("INVALID_PAYPAL_REDIRECT");
   window.location.assign(target.href);
  }catch{setPayError(zh?"当前无法连接 PayPal，请稍后再试。":"PayPal is currently unavailable.");setPayBusy(false)}
 };
 const share=async()=>{
  try{
   if(typeof navigator.share==="function")await navigator.share({title:product?.name||"SASI",url:window.location.href});
   else{await navigator.clipboard.writeText(window.location.href);setShared(true)}
  }catch{}
 };
 return <main className={styles.root}><div className={styles.container}>
  <Link className={styles.back} href="/sasi">{zh?"← 返回 SASI 智能软件":"← Back to SASI Intelligent Software"}</Link>
  {loading?<p role="status" className={styles.empty}>{zh?"正在加载软件详情…":"Loading software details…"}</p>:!product?
   <h1 className={styles.empty}>{zh?"软件尚未公开或正在审核":"This software is not published yet"}</h1>:
   <>
    <div className={styles.intro}>
     <section className={styles.gallery} aria-label={zh?"软件主图":"Software main image"}>
      <div className={styles.mainImage}>
       {cover?<img src={cover.url} alt={product.name} loading="eager" referrerPolicy="no-referrer"/>:
        <div className={styles.fallback}><strong>SASI</strong><small>INTELLIGENT SOFTWARE</small></div>}
      </div>
      <p className={styles.galleryCount}>{zh?"每件软件展示1张主图；详情图可选":"One main image per listing; detail images are optional"}</p>
     </section>
     <section className={styles.purchase}>
      <small>SASI / VERIFIED SOFTWARE</small>
      <h1>{product.name}</h1>
      <p className={styles.headline}>{excerpt.slice(0,145)}</p>
      <div className={styles.prices}>
       <strong>{currency==="USD"?"$":"¥"}{(currency==="USD"?product.priceUsd:product.priceRmb).toLocaleString()}</strong>
       <span>{currency==="USD"?"¥"+product.priceRmb.toLocaleString():"USD $"+product.priceUsd.toLocaleString()}</span>
      </div>
      {ready?(currency==="USD"?
       <button type="button" onClick={()=>void payPaypal()} disabled={payBusy} className={styles.buy}>
        {payBusy?(zh?"正在连接…":"Connecting…"):(zh?"PayPal 安全支付":"Pay securely with PayPal")}
       </button>:
       <Link className={styles.buy} href={"/checkout?productId="+encodeURIComponent(product.id)+"&redirect=%2Faccount%2Fsoftware"}>
        {zh?"购买并安全交付":"Buy and receive securely"}
       </Link>):
       <p className={styles.disabled}>{zh?"支付渠道尚未完成商户验证，暂未开放购买。":"Checkout opens after merchant verification."}</p>}
      {payError&&<p role="alert" className={styles.error}>{payError}</p>}
      <button type="button" onClick={()=>void share()} className={styles.share}>{shared?(zh?"链接已复制":"Link copied"):(zh?"分享此软件":"Share software")} ↗</button>
      <div className={styles.deliveryInfo}><h3>{zh?"授权与交付":"Licensing and delivery"}</h3>
       <ul>
        <li>{zh?"仅展示已通过审核的软件":"Only reviewed and published software is listed"}</li>
        <li>{zh?"真实付款验证后，按订单授权下载":"Downloads require confirmed payment and purchase authorization"}</li>
        <li>{zh?"软件更新与售后以商品说明及订单条款为准":"Updates and support follow the listing and order terms"}</li>
       </ul>
      </div>
     </section>
    </div>
    <section className={styles.details} aria-labelledby="sasi-product-full-details">
     <h2 id="sasi-product-full-details">{zh?"软件详情":"Software details"}</h2>
     <div className={styles.description}><p>{descriptionOpen?fullDescription:excerpt}</p></div>
     {descriptionOpen&&details.length>0&&<div className={styles.detailGrid} aria-label={zh?"详情图片":"Detail images"}>
       {details.map((photo,index)=><div key={photo.id} className={styles.detailImage}>
        <img src={photo.url} alt={zh?"软件详情图 "+(index+1):"Software detail "+(index+1)} loading="lazy" referrerPolicy="no-referrer"/>
       </div>)}
      </div>}
     {hasMore&&<button type="button" className={styles.expand} aria-expanded={descriptionOpen}
      aria-controls="sasi-product-expanded" onClick={()=>setDescriptionOpen(v=>!v)}>
       {descriptionOpen?(zh?"收起详情":"Show less"):(zh?"展开更多 · 查看完整图文":"Show more · Full description and images")}
      </button>}
     <div id="sasi-product-expanded" hidden={!descriptionOpen} className={styles.expandState} aria-hidden="true"/>
    </section>
   </>}
 </div></main>;
}
