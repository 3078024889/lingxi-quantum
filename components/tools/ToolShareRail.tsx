"use client";
import{useEffect,useMemo,useState,useRef}from"react";
import{usePathname}from"next/navigation";
import {deliveryText} from "@/lib/tools/commerce/delivery-copy";
import{privateSearchPath}from"@/lib/seo/indexing";
import{useLingxiLang}from"@/lib/lingxi-i18n";

const COPY:any={
 zh:{open:"分享这个工具",title:"把好用的工具递给需要的人",lead:"复制链接、扫码打开，或直接从手机分享。对方打开就是这个工具。",native:"分享",copy:"复制链接",copied:"链接已复制",qr:"扫码打开",close:"关闭"},
 en:{open:"Share this tool",title:"Pass a useful tool to someone who needs it",lead:"Copy the link, scan the QR code, or use your device share menu. The link opens this tool directly.",native:"Share",copy:"Copy link",copied:"Link copied",qr:"Scan to open",close:"Close"},
 ja:{open:"このツールを共有",title:"役立つツールを必要な人へ",lead:"リンクをコピー、QRコードをスキャン、または端末から共有できます。",native:"共有",copy:"リンクをコピー",copied:"コピーしました",qr:"QRで開く",close:"閉じる"},
 ko:{open:"이 도구 공유",title:"필요한 사람에게 유용한 도구를 공유하세요",lead:"링크 복사, QR 스캔 또는 기기 공유 메뉴를 사용할 수 있습니다.",native:"공유",copy:"링크 복사",copied:"복사됨",qr:"QR로 열기",close:"닫기"},
 fr:{open:"Partager cet outil",title:"Partagez cet outil utile",lead:"Copiez le lien, scannez le QR code ou utilisez le partage de votre appareil.",native:"Partager",copy:"Copier le lien",copied:"Lien copié",qr:"Scanner pour ouvrir",close:"Fermer"},
 de:{open:"Tool teilen",title:"Dieses hilfreiche Tool weitergeben",lead:"Link kopieren, QR-Code scannen oder direkt über das Gerät teilen.",native:"Teilen",copy:"Link kopieren",copied:"Link kopiert",qr:"Zum Öffnen scannen",close:"Schließen"},
 es:{open:"Compartir herramienta",title:"Comparte una herramienta útil",lead:"Copia el enlace, escanea el QR o comparte desde tu dispositivo.",native:"Compartir",copy:"Copiar enlace",copied:"Enlace copiado",qr:"Escanear para abrir",close:"Cerrar"},
 pt:{open:"Compartilhar ferramenta",title:"Compartilhe uma ferramenta útil",lead:"Copie o link, escaneie o QR ou compartilhe pelo dispositivo.",native:"Compartilhar",copy:"Copiar link",copied:"Link copiado",qr:"Escanear para abrir",close:"Fechar"},
 ar:{open:"مشاركة الأداة",title:"شارك أداة مفيدة مع من يحتاجها",lead:"انسخ الرابط أو امسح رمز QR أو شارك مباشرة من جهازك.",native:"مشاركة",copy:"نسخ الرابط",copied:"تم نسخ الرابط",qr:"امسح للفتح",close:"إغلاق"}
};
export default function ToolShareRail(){
 const pathname=usePathname();const{lang}=useLingxiLang();const c=COPY[lang]||COPY.en;
 const[open,setOpen]=useState(false),[url,setUrl]=useState(""),[qr,setQr]=useState(""),[copied,setCopied]=useState(false),[error,setError]=useState("");
 const dialog=useRef<HTMLDialogElement>(null);
 const eligible=useMemo(()=>{const publicPath=pathname.replace(/^\/(?:zh|en|ja|ko|fr|de|es|pt|ar)(?=\/|$)/,"")||"/";return publicPath.startsWith("/tools/")&&!privateSearchPath(publicPath)},[pathname]);
 useEffect(()=>{setOpen(false)},[pathname]);
 useEffect(()=>{setCopied(false);setError("");setUrl(location.origin+pathname+'?lang='+lang)},[pathname,lang]);
 useEffect(()=>{if(!open)return;let active=true;setQr("");void import('qrcode').then(m=>m.default.toDataURL(url,{width:320,margin:1,errorCorrectionLevel:"M"})).then(v=>{if(active)setQr(v)}).catch(()=>{});return()=>{active=false}},[open,url]);
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close()},[open]);
 async function copy(){try{await navigator.clipboard.writeText(url);setCopied(true);setError("")}catch{setError(deliveryText(lang,'manualCopy'))}}
 async function share(){const title=document.querySelector('h1')?.textContent?.trim()||'LINGXIFIELD';if(navigator.share){try{await navigator.share({title,url});return}catch(e){if(e instanceof Error&&e.name==='AbortError')return}}await copy()}
 if(!eligible)return null;
 return <>
 <button type="button" data-testid="tool-share-open" aria-haspopup="dialog" aria-expanded={open} disabled={!url} onClick={()=>setOpen(true)} className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[70] rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-3 text-sm font-medium shadow-lg backdrop-blur md:bottom-5">↗ {c.open}</button>
 <dialog ref={dialog} onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} aria-labelledby="tool-share-title" className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] overflow-y-auto rounded-[28px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-0 text-[var(--lx-ink)] shadow-2xl backdrop:bg-black/40">
 <section dir={lang==='ar'?'rtl':'ltr'} className="p-5 sm:p-7">
 <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold tracking-[.16em] text-[var(--lx-muted)]">LINGXIFIELD</p><h2 id="tool-share-title" className="mt-2 text-xl font-semibold">{c.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{c.lead}</p></div><button aria-label={c.close} onClick={()=>setOpen(false)} className="min-h-11 min-w-11 rounded-full border">×</button></div>
 <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]"><div className="min-w-0 space-y-3"><input aria-label={c.copy} readOnly value={url} onFocus={e=>e.target.select()} className="w-full rounded-xl border bg-[var(--lx-soft)] p-3 text-xs"/><button onClick={share} className="w-full rounded-xl bg-[var(--lx-ink)] px-4 py-3 text-sm text-[var(--lx-bg)]">{c.native}</button><button onClick={copy} className="w-full rounded-xl border px-4 py-3 text-sm">{copied?c.copied:c.copy}</button><p role="status" className="text-xs">{error||(copied?c.copied:'')}</p></div><div className="mx-auto w-40 rounded-2xl border bg-white p-3 text-center">{qr?<img src={qr} alt={c.qr} width={160} height={160}/>:<div className="aspect-square"/>}<p className="mt-2 text-xs text-slate-600">{c.qr}</p></div></div>
 <p className="mt-4 text-xs leading-5 text-[var(--lx-muted)]">{deliveryText(lang,'privateShare')}</p>
 </section></dialog></>;
}
