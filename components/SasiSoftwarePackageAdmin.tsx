"use client";
import {useCallback,useEffect,useState} from "react";
type ProductStatus={productId:string;title:string;priceCny:number;priceUsd:number;exists:boolean;saleReady:boolean;verifiedAt:string|null;sha256Prefix:string|null;priceMatches:boolean;privateBucket:boolean;packageVerified:boolean;integrityOk:boolean;sizeBytes:number|null};
export default function SasiSoftwarePackageAdmin(){
 const [products,setProducts]=useState<ProductStatus[]>([]);
 const [files,setFiles]=useState<Record<string,File|null>>({});
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState("");
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const reload=useCallback(async()=>{
  setLoading(true);
  try{
   const response=await fetch("/api/sasi/software/admin/package",{cache:"no-store",credentials:"same-origin"});
   const body=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(body.error||"源码包状态暂不可用");
   setProducts(body.products||[]);
   setError("");
  }catch(e){setError(e instanceof Error?e.message:"源码包状态暂不可用")}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void reload()},[reload]);
 async function upload(product:ProductStatus){
  const file=files[product.productId];
  if(!file||busy)return;
  if(!window.confirm("确认上传哥白尼 SI 9.5 源码 ZIP？系统将检查 MQ5、同名 EX5、PDF 白皮书、安装编译/F7/授权说明和只读观察账号资料，并在私有存储回读 SHA256 一致后标记为已核验、待人工发布。这一步不会自动开放销售。"))return;
  setBusy(product.productId);setError("");setSuccess("");
  try{
   const form=new FormData();
   form.set("action","upload");
   form.set("productId",product.productId);
   form.set("package",file);
   const response=await fetch("/api/sasi/software/admin/package",{method:"POST",credentials:"same-origin",body:form});
   const body=await response.json().catch(()=>({}));
   if(!response.ok||!body.ok)throw Error(body.error||"源码包核验未完成");
   setSuccess("源码包已完成内容检查、私有存储回读与 SHA256 核验，等待人工审核发布。SHA256："+body.sha256);
   setFiles(current=>({...current,[product.productId]:null}));
   await reload();
  }catch(e){setError(e instanceof Error?e.message:"源码包上传未完成")}
  finally{setBusy("")}
 }

 async function activate(product:ProductStatus){
  if(busy||!product.packageVerified||product.saleReady)return;
  if(!window.confirm("确认已人工检查商品内容、源码授权范围、白皮书、F7 教程、只读观察账号和 ¥6,900 / USD 6,900 售价，并立即开放该源码商品销售？"))return;
  setBusy(product.productId);setError("");setSuccess("");
  try{
   const form=new FormData();
   form.set("action","activate");
   form.set("productId",product.productId);
   const response=await fetch("/api/sasi/software/admin/package",{method:"POST",credentials:"same-origin",body:form});
   const body=await response.json().catch(()=>({}));
   if(!response.ok||!body.ok)throw Error(body.error||"商品发布核验未完成");
   setSuccess("哥白尼 SI 9.5 源码授权商品已通过二次私有文件校验并开放销售。SHA256："+body.sha256);
   await reload();
  }catch(e){setError(e instanceof Error?e.message:"商品发布未完成")}
  finally{setBusy("")}
 }

 return <section className="mx-auto mb-8 max-w-6xl px-4 md:px-8" data-testid="sasi-first-party-package-admin">
  <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 md:p-7">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div><p className="text-xs font-bold tracking-[.18em] text-violet-600">FIRST-PARTY SOURCE DELIVERY</p>
     <h2 className="mt-2 text-xl font-bold text-[var(--lx-ink)]">自营源码商品交付核验</h2>
     <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--lx-muted)]">仅销售源码授权版。系统检查 9.5 MQ5、同名 EX5、白皮书、安装编译/F7/授权说明及只读观察资料；核验后须经管理员二次确认才开放销售。不会修改历史订单。</p>
    </div>
    <button type="button" onClick={()=>void reload()} disabled={loading||Boolean(busy)} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm text-[var(--lx-ink)] disabled:opacity-50">刷新状态</button>
   </div>
   {error&&<p role="alert" className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
   {success&&<p role="status" className="mt-4 break-all rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
   {loading?<p className="mt-5 text-sm text-[var(--lx-muted)]">正在读取源码包状态…</p>:
    <div className="mt-5 grid gap-4 md:grid-cols-2">{products.map(product=><article key={product.productId} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-bg)] p-4">
     <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-[var(--lx-ink)]">{product.title}</h3>
      <p className="mt-1 text-xs text-[var(--lx-muted)]">¥{product.priceCny.toLocaleString("zh-CN")} · USD ${product.priceUsd.toLocaleString("en-US")}</p></div>
      <span className={product.saleReady&&product.integrityOk?"rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-800":product.packageVerified?"rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-800":"rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800"}>{product.saleReady?(product.integrityOk?"已开放销售":"销售文件完整性异常"):product.packageVerified?"已核验 · 待人工发布":"待上传与核验"}</span>
     </div>
     {product.verifiedAt&&<p className="mt-2 text-xs text-[var(--lx-muted)]">核验时间：{new Date(product.verifiedAt).toLocaleString()}</p>}
     {product.sha256Prefix&&<p className="mt-1 text-xs text-[var(--lx-muted)]">SHA256：{product.sha256Prefix}…</p>}
     {product.sizeBytes&&<p className="mt-1 text-xs text-[var(--lx-muted)]">私有包大小：{(product.sizeBytes/1024/1024).toFixed(2)} MB</p>}
     {!product.exists||!product.priceMatches||!product.privateBucket?
      <p className="mt-3 text-sm text-rose-700">商品数据库记录、价格或私有存储配置不匹配，禁止上传。</p>:
      product.saleReady?
      <p className="mt-3 text-sm text-[var(--lx-muted)]">{product.integrityOk?"商品已启用。为保护已售订单对应的交付文件，本入口不提供覆盖操作。":"存储对象未通过完整性复核，需检查存储记录。此界面不会擅自改动历史订单。"}</p>:
      product.packageVerified?
      <div className="mt-4 space-y-3">
       <p className="text-sm leading-6 text-[var(--lx-muted)]">文件已完成私有回读、SHA256 与源码包结构复核。人工确认商品内容和授权说明后，才会开放销售。</p>
       <button type="button" disabled={Boolean(busy)} onClick={()=>void activate(product)} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy===product.productId?"正在二次核验并发布…":"确认审核并开放销售"}</button>
      </div>:
      <div className="mt-4 space-y-3">
       <input type="file" accept=".zip,application/zip" disabled={Boolean(busy)} onChange={e=>setFiles(current=>({...current,[product.productId]:e.target.files?.[0]||null}))}
        className="block w-full text-sm text-[var(--lx-ink)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--lx-soft)] file:px-3 file:py-2"/>
       <p className="text-xs leading-5 text-[var(--lx-muted)]">ZIP 最大 30MB；必须包含一个 9.5 MQ5、同名 EX5、PDF 白皮书、含安装/编译/F7/授权范围的 README，以及 DEMO_ACCESS.txt（服务器、账号、投资者只读密码）。该文件保存在私有交付包内，不进入公开页面。禁止通用脚本、安装程序、DLL及路径穿越。</p>
       <button type="button" disabled={!files[product.productId]||Boolean(busy)} onClick={()=>void upload(product)}
        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy===product.productId?"正在上传与核验…":"上传并核验源码包"}</button>
      </div>}
    </article>)}</div>}
  </div>
 </section>;
}
