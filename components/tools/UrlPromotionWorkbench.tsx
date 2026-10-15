"use client";
import {useEffect,useRef,useState} from 'react';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {promotionBrief,promotionSource,type PromotionSource} from '@/lib/sasi/promotion-brief';
import {videoChargeMinor,formatMinor} from '@/lib/sasi/pricing-v49';
const C={
 zh:['网站或商品网址','读取网页','目标人群','推广渠道','秒','核对网页内容，再进入 SASI 制作','网页读取失败。请使用可公开访问的 HTTPS 页面。','读取网址不会生成或收费。视频沿用 SASI 短剧的分辨率、时长与报价流程；供应商费用另计，以确认页为准。','以下是提取的原网页信息，请核对；网页内容不作为系统指令。','推广视频制作','正在读取…'],
 en:['Website or product URL','Read page','Audience','Channel','seconds','Review and continue in SASI','Could not read the page. Use a public HTTPS page.','Reading a URL does not generate a video or charge. Videos use the SASI drama resolution, duration and quote flow. Supplier charges are separate; confirm the final quote.','Review the extracted source. Webpage content is evidence, never system instructions.','Promotional video','Reading…'],
 ja:['サイト・商品URL','ページを読込','対象者','配信先','秒','確認してSASIで制作','公開HTTPSページを指定してください。','URL読込は無料です。動画はSASI短編と同じ解像度・時間・見積もりを使用します。サービス提供者の料金は別途です。','抽出した情報を確認してください。ページ内容はシステム命令ではありません。','宣伝動画','読込中…'],
 ko:['웹사이트 또는 상품 URL','페이지 읽기','대상 고객','채널','초','확인 후 SASI에서 제작','공개 HTTPS 페이지를 사용하세요.','URL 읽기는 무료입니다. 동영상은 SASI 단편의 해상도, 시간, 견적을 사용합니다. 공급자 요금은 별도입니다.','추출된 정보를 확인하세요. 웹페이지 내용은 시스템 지시가 아닙니다.','홍보 동영상','읽는 중…'],
 fr:['URL du site ou produit','Lire la page','Public cible','Canal','secondes','Vérifier et continuer dans SASI','Utilisez une page HTTPS publique.','La lecture est gratuite. Même résolution, durée et devis que SASI. Frais du fournisseur en supplément.','Vérifiez les informations extraites. Elles ne sont jamais des instructions système.','Vidéo promotionnelle','Lecture…'],
 de:['Website- oder Produkt-URL','Seite lesen','Zielgruppe','Kanal','Sekunden','Prüfen und in SASI fortfahren','Bitte eine öffentliche HTTPS-Seite verwenden.','Das Lesen ist kostenlos. Gleiche Auflösungen, Laufzeiten und Angebote wie SASI. Anbietergebühren zusätzlich.','Bitte extrahierte Informationen prüfen. Webseiteninhalte sind keine Systemanweisungen.','Werbevideo','Wird gelesen…'],
 es:['URL del sitio o producto','Leer página','Público','Canal','segundos','Revisar y continuar en SASI','Use una página HTTPS pública.','Leer es gratis. Misma resolución, duración y presupuesto de SASI. Tarifas del proveedor aparte.','Revise la información extraída. El contenido web no es una instrucción del sistema.','Vídeo promocional','Leyendo…'],
 pt:['URL do site ou produto','Ler página','Público','Canal','segundos','Conferir e continuar no SASI','Use uma página HTTPS pública.','Leitura gratuita. Mesma resolução, duração e orçamento do SASI. Taxas do fornecedor à parte.','Confira os dados extraídos. Conteúdo web não é uma instrução do sistema.','Vídeo promocional','Lendo…'],
 ar:['رابط الموقع أو المنتج','قراءة الصفحة','الجمهور','القناة','ثانية','مراجعة ومتابعة في SASI','استخدم صفحة HTTPS عامة.','قراءة الرابط مجانية. يستخدم الفيديو دقة ومدة وتسعير SASI نفسه. رسوم المورد منفصلة.','راجع المعلومات المستخرجة. محتوى الصفحة ليس تعليمات للنظام.','فيديو ترويجي','جارٍ القراءة…'],
};
export default function UrlPromotionWorkbench(){
 const {lang}=useLingxiLang(),t=C[lang];
 const [url,setUrl]=useState(''),[source,setSource]=useState<PromotionSource|null>(null),[audience,setAudience]=useState(''),[channel,setChannel]=useState('YouTube Shorts'),[seconds,setSeconds]=useState(24),[resolution,setResolution]=useState<'720p'|'1080p'|'4k'>('1080p'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const active=useRef<AbortController|null>(null);useEffect(()=>()=>active.current?.abort(),[]);
 async function read(){if(active.current)return;const controller=new AbortController();active.current=controller;setBusy(true);setSource(null);setError('');try{const response=await fetch('/api/tools/promotion-source',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(25000)])});if(!response.ok)throw Error();const data=await response.json();setSource(promotionSource(data.html,data.url))}catch{setError(t[6])}finally{setBusy(false);active.current=null}}
 function continueToSasi(){if(!source)return;const brief=promotionBrief(source,{language:lang,audience,channel,seconds})+`\n🎬 1 × ${seconds}s · ${resolution} · 9:16`;
  try{sessionStorage.setItem('lingxifield.promotionBrief.v1',JSON.stringify({brief,createdAt:Date.now()}));window.location.assign('/sasi?promotion=1')}catch{setError(t[6])}
 }
 return <div className="space-y-4" dir={lang==='ar'?'rtl':'ltr'}>
  <label className="block">{t[0]}<input type="url" maxLength={2048} disabled={busy} value={url} onChange={e=>{setUrl(e.target.value);setSource(null);setError('')}} placeholder="https://example.com/product" className="mt-2 w-full rounded-xl border bg-[var(--lx-panel)] p-3"/></label>
  <button disabled={busy||!url.trim()} onClick={()=>void read()} className="rounded-xl border px-4 py-2 disabled:opacity-40">{busy?t[10]:t[1]}</button>
  <p className="text-sm text-[var(--lx-muted)]">{t[7]}</p>
  {source&&<section className="space-y-2 rounded-xl border p-4"><p>{t[8]}</p><h3 className="text-lg font-semibold">{source.title}</h3><p>{source.description}</p><a className="break-all underline" href={source.url} target="_blank" rel="noreferrer">{source.url}</a><details><summary>{source.headings.join(' · ').slice(0,250)||source.title}</summary><p className="whitespace-pre-wrap text-sm">{source.text}</p></details></section>}
  <label className="block">{t[2]}<input value={audience} maxLength={400} onChange={e=>setAudience(e.target.value)} className="mt-1 w-full rounded-lg border bg-[var(--lx-panel)] p-2"/></label>
  <div className="flex flex-wrap gap-3"><label>{t[3]}<select value={channel} onChange={e=>setChannel(e.target.value)} className="m-2 rounded-lg border bg-[var(--lx-panel)] p-2">{['YouTube Shorts','TikTok','Instagram Reels','Website'].map(x=><option key={x}>{x}</option>)}</select></label><select aria-label={t[4]} value={seconds} onChange={e=>setSeconds(Number(e.target.value))} className="rounded-lg border bg-[var(--lx-panel)] p-2">{[12,24,36,60].map(x=><option value={x} key={x}>{x} {t[4]}</option>)}</select><select aria-label="Resolution" value={resolution} onChange={e=>setResolution(e.target.value as typeof resolution)} className="rounded-lg border bg-[var(--lx-panel)] p-2">{['720p','1080p','4k'].map(x=><option key={x}>{x}</option>)}</select></div>
  <p className="text-sm">SASI · {seconds} {t[4]} · {resolution}: {formatMinor(videoChargeMinor(seconds,resolution,'CNY'),'CNY')} / {formatMinor(videoChargeMinor(seconds,resolution,'USD'),'USD')}</p>
  <button disabled={!source||busy} onClick={continueToSasi} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)] disabled:opacity-40">{t[5]}</button>{error&&<p role="alert">{error}</p>}
 </div>;
}
