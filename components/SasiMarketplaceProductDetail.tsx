"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
type Product={id:string;name:string;nameEn:string;priceRmb:number;priceUsd:number;note:string;noteEn:string;};
export default function SasiMarketplaceProductDetail(){
 const p=useParams(),id=typeof p?.id==="string"?p.id:"";
 const {lang}=useLingxiLang(),zh=lang==="zh";
 const {currency}=usePreferredCurrency();
 const [payBusy,setPayBusy]=useState(false),[payError,setPayError]=useState("");
 const [product,setProduct]=useState<Product|null>(null),[ready,setReady]=useState(false),[loading,setLoading]=useState(true);
 const [shared,setShared]=useState(false);
 const [photos,setPhotos]=useState<Array<{id:string;kind:string;url:string}>>([]);
 useEffect(()=>{
  if(!id){setLoading(false);return;}
  fetch("/api/sasi/marketplace/product?id="+encodeURIComponent("sasi-market:"+id)+"&currency="+currency,{cache:"no-store"})
  .then(r=>r.ok?r.json():null).then(x=>{setProduct(x?.product||null);setReady(x?.available===true)}).catch(()=>{})
  .finally(()=>setLoading(false));
 },[id,currency]);
 useEffect(()=>{
  if(!id||!product)return;
  let current=true;
  fetch("/api/sasi/marketplace/images?listingId="+encodeURIComponent(id),{cache:"no-store"})
   .then(r=>r.ok?r.json():null)
   .then(x=>{if(current)setPhotos(x?.items?.[id]||[])})
   .catch(()=>{});
  return()=>{current=false};
 },[id,product]);
 const payPaypal=async()=>{
  if(!product||!ready||payBusy)return;
  setPayBusy(true);setPayError("");
  try{
   const response=await fetch("/api/pay/create",{
    method:"POST",headers:{"Content-Type":"application/json"},
    credentials:"same-origin",
    body:JSON.stringify({productId:product.id,returnPath:"/account/software"})
   });
   const result=await response.json().catch(()=>({}));
   if(response.status===401){
    window.location.assign("/account?next="+encodeURIComponent(window.location.pathname));
    return;
   }
   if(!response.ok||typeof result.url!=="string")throw Error("MARKET_PAYPAL_UNAVAILABLE");
   const target=new URL(result.url);
   if(target.protocol!=="https:"||!/(^|\.)paypal\.com$/.test(target.hostname))
    throw Error("INVALID_PAYPAL_REDIRECT");
   window.location.assign(target.href);
  }catch{
   setPayError(zh?"当前暂无法连接 PayPal，请稍后再试。":"Unable to connect to PayPal right now.");
   setPayBusy(false);
  }
 };
 const share=async()=>{const link=window.location.href;
  try{if(navigator.share)await navigator.share({title:product?.name||"SASI Software",url:link});
   else{await navigator.clipboard.writeText(link);setShared(true)}}catch{}
 };
 return <main className="lx11-page" style={{minHeight:"75vh"}}><div style={{maxWidth:1000,margin:"0 auto",padding:"35px 14px 70px"}}>
 <Link href="/sasi/marketplace" style={{color:"#2b66a0",fontSize:13}}>← {zh?"返回软件作品":"Back to software"}</Link>
 {loading?<p style={{marginTop:45}}>{zh?"加载商品中…":"Loading..."}</p>:!product?<h1 style={{fontSize:25,marginTop:38}}>{zh?"商品尚未公开或正在审核":"Listing is not public yet"}</h1>:
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:22,marginTop:30}}>
 <div style={{minHeight:270,background:"linear-gradient(135deg,#eaf7ff,#a8d6f6)",borderRadius:23,padding:30,display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",color:"#1b5b8e"}}>
 {photos.length>0?
   <img src={photos[0].url} alt={product.name} referrerPolicy="no-referrer" style={{width:"100%",maxHeight:300,objectFit:"contain",borderRadius:14}}/>
   :<><span style={{fontWeight:850,fontSize:70,letterSpacing:".2em"}}>SASI</span>
     <span style={{fontSize:12,letterSpacing:".2em"}}>SOFTWARE</span></>}
  </div>
 <section style={{background:"var(--lx-panel)",border:"1px solid var(--lx-line)",borderRadius:20,padding:28}}>
 <small style={{color:"#396d98",fontWeight:700,letterSpacing:".14em"}}>SASI / VERIFIED SOFTWARE</small>
 <h1 style={{fontSize:28,margin:"16px 0"}}>{product.name}</h1>
 <p style={{fontSize:13,color:"var(--lx-muted)",lineHeight:1.9,minHeight:65}}>{product.note}</p>
 <div style={{display:"flex",alignItems:"baseline",gap:20,flexWrap:"wrap",margin:"24px 0"}}>
  <strong style={{fontSize:31}}>{currency==="USD"?"$":"¥"}{(currency==="USD"?product.priceUsd:product.priceRmb).toLocaleString()}</strong>
  <span style={{color:"var(--lx-muted)",fontSize:13}}>{currency==="USD"?"¥"+product.priceRmb.toLocaleString():"USD $"+product.priceUsd.toLocaleString()}</span>
 </div>
 {ready?(currency==="USD"?
 <button type="button" onClick={()=>void payPaypal()} disabled={payBusy}
  style={{display:"inline-flex",padding:"12px 23px",background:"#225c90",color:"#fff",borderRadius:10,fontSize:13,opacity:payBusy?.65:1}}>
  {payBusy?(zh?"正在连接…":"Connecting…"):(zh?"PayPal 安全支付":"Pay securely with PayPal")}
 </button>:
 <Link href={"/checkout?productId="+encodeURIComponent(product.id)+"&redirect=%2Faccount%2Fsoftware"}
  style={{display:"inline-flex",padding:"12px 23px",background:"#225c90",color:"#fff",borderRadius:10,fontSize:13}}>
  {zh?"购买并安全交付":"Buy & download"}</Link>):
 <span style={{display:"inline-flex",padding:"12px 16px",background:"#eff5fb",borderRadius:10,color:"#3f6887",fontSize:12}}>
  {zh?"当前支付方式暂未开放":"This payment method is not yet available"}</span>}
 {payError&&<p role="alert" style={{marginTop:10,color:"#b45309",fontSize:13}}>{payError}</p>}
 <button type="button" onClick={()=>void share()} style={{display:"block",marginTop:19,fontSize:13,textDecoration:"underline",color:"#286fa4"}}>{shared?(zh?"链接已复制":"Link copied"):(zh?"分享此商品":"Share this product")} ↗</button>
 </section>
 </div>}
 </div></main>;
}
