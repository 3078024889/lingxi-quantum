"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {parseStoryboardLines,compileStoryboardVariants,type StoryboardVariant} from "@/lib/sasi/original-variant-workflows";

type CopyKey="title"|"lead"|"reference"|"rights"|"scenes"|"hooks"|"product"|"cta"|"count"|"compile"|"export"|"handoff"|"cost"|"status"|"unlicensed"|"preview"|"duration"|"edition";
const i18n:Record<LingxiLang,Record<CopyKey,string>>={
 zh:{title:"SASI 可编辑视频工程 · 批量分镜",lead:"一套分镜可生成 1–100 份文字工程变体，逐词重新排布预计字幕时间。此处不调用付费模型，也不冒充成片。",reference:"参考视频（仅本地预览）",rights:"我拥有所选参考视频的使用及改编权利。",scenes:"每行：秒数 | 台词 | 画面描述",hooks:"开场文案（每行一条）",product:"产品或主题",cta:"结尾引导文案",count:"变体数量（1–100）",compile:"编排变体",export:"导出可编辑 JSON 工程",handoff:"将第一份分镜送入 SASI 短剧",cost:"分镜编排免费；后续真实生成须按所选模型单独核价和确认。",status:"已编排可编辑分镜",unlicensed:"独立编写的 SASI 引擎，不包含 Hypit 源码；参考视频不上传服务器。",preview:"本地视频预览，并不代表自动解析镜头。",duration:"预计时长",edition:"镜头与节奏"},
 en:{title:"SASI editable video workflow · Storyboard variants",lead:"Create 1–100 editable storyboard variants with estimated word-position cues. No paid model calls or finished-video claims.",reference:"Reference video (local preview only)",rights:"I hold the rights needed to use and adapt the reference video.",scenes:"Each line: seconds | speech | visual direction",hooks:"Opening hooks (one per line)",product:"Product or topic",cta:"Call to action",count:"Variants (1–100)",compile:"Compile variants",export:"Export editable JSON",handoff:"Send first storyboard to SASI drama",cost:"Storyboard compilation is free. Real rendering requires a separate model quote and approval.",status:"Editable storyboards compiled",unlicensed:"Independent SASI implementation; no Hypit source code. Reference video stays local.",preview:"Local preview only; the video is not automatically analyzed.",duration:"Estimated duration",edition:"Camera and pacing"},
 ja:{title:"SASI 編集可能な動画構成・バリエーション",lead:"台本の構成を1〜100案生成。単語の時間位置は推定値で、完成動画ではありません。",reference:"参考動画（端末内プレビューのみ）",rights:"参考動画の使用・改変権を保有しています。",scenes:"1行：秒数 | セリフ | 画面説明",hooks:"冒頭文（1行に1件）",product:"商品・テーマ",cta:"行動喚起",count:"案数（1〜100）",compile:"構成を生成",export:"編集可能なJSONを保存",handoff:"最初の構成をSASI短編へ",cost:"構成は無料。実際の動画生成は料金確認後。",status:"構成を生成しました",unlicensed:"SASI独自実装。Hypitのソースコードを含みません。動画は端末内です。",preview:"端末内の動画確認のみ。自動解析ではありません。",duration:"推定時間",edition:"カメラとテンポ"},
 ko:{title:"SASI 편집형 영상 구성·변형",lead:"1~100개의 편집 가능한 스토리보드를 만듭니다. 단어 타이밍은 추정치이며 완성 영상이 아닙니다.",reference:"참고 동영상 (로컬 미리보기)",rights:"참고 동영상의 사용 및 수정 권한이 있습니다.",scenes:"한 줄: 초 | 대사 | 화면 설명",hooks:"첫 문구 (줄당 하나)",product:"상품 또는 주제",cta:"행동 유도",count:"변형 수 (1–100)",compile:"변형 만들기",export:"편집형 JSON 내보내기",handoff:"첫 구성을 SASI 드라마로",cost:"구성은 무료입니다. 실제 생성에는 별도 견적과 승인이 필요합니다.",status:"구성을 만들었습니다",unlicensed:"Hypit 소스가 없는 SASI 독자 구현이며 동영상은 로컬에 남습니다.",preview:"로컬 미리보기이며 자동 영상 분석은 아닙니다.",duration:"예상 길이",edition:"카메라와 편집 리듬"},
 fr:{title:"SASI · Variantes de storyboard éditables",lead:"Créez 1 à 100 variantes éditables. Les repères des mots sont estimés, pas une vidéo terminée.",reference:"Vidéo de référence (aperçu local)",rights:"Je détiens les droits d'utilisation et d'adaptation.",scenes:"Par ligne : secondes | voix | visuel",hooks:"Accroches (une par ligne)",product:"Produit ou sujet",cta:"Appel à l'action",count:"Variantes (1–100)",compile:"Composer les variantes",export:"Exporter le projet JSON",handoff:"Envoyer la première version à SASI",cost:"Composition gratuite. La génération vidéo exige un devis distinct validé.",status:"Storyboards créés",unlicensed:"Création SASI indépendante, sans code Hypit. La vidéo reste locale.",preview:"Aperçu local, sans analyse automatique.",duration:"Durée estimée",edition:"Cadrage et rythme"},
 de:{title:"SASI · Editierbare Storyboard-Varianten",lead:"1–100 editierbare Fassungen mit geschätzten Wortzeiten, keine fertigen Videos.",reference:"Referenzvideo (nur lokale Vorschau)",rights:"Ich besitze die Rechte zur Nutzung und Bearbeitung.",scenes:"Je Zeile: Sekunden | Sprechertext | Bildbeschreibung",hooks:"Einstiege (je Zeile einer)",product:"Produkt oder Thema",cta:"Handlungsaufruf",count:"Varianten (1–100)",compile:"Varianten erstellen",export:"JSON-Projekt exportieren",handoff:"Erste Fassung an SASI senden",cost:"Storyboard kostenlos. Die echte Produktion benötigt ein eigenes genehmigtes Angebot.",status:"Storyboards erstellt",unlicensed:"Unabhängige SASI-Implementierung ohne Hypit-Code. Video bleibt lokal.",preview:"Nur lokale Vorschau, keine automatische Analyse.",duration:"Geschätzte Dauer",edition:"Kamera und Schnitt"},
 es:{title:"SASI · Variantes de guion editable",lead:"Crea entre 1 y 100 guiones editables con tiempos aproximados por palabra. No son vídeos terminados.",reference:"Vídeo de referencia (vista local)",rights:"Tengo derecho a usar y adaptar el vídeo.",scenes:"Por línea: segundos | voz | descripción",hooks:"Entradas (una por línea)",product:"Producto o tema",cta:"Llamada a la acción",count:"Variantes (1–100)",compile:"Crear variantes",export:"Exportar JSON editable",handoff:"Enviar primera versión a SASI",cost:"Guiones gratuitos; el vídeo real requiere presupuesto y autorización.",status:"Guiones creados",unlicensed:"Implementación propia de SASI, sin código de Hypit. El vídeo permanece local.",preview:"Vista previa local sin análisis automático.",duration:"Duración estimada",edition:"Cámara y ritmo"},
 pt:{title:"SASI · Variações de roteiro editáveis",lead:"Crie de 1 a 100 roteiros editáveis com tempos estimados por palavra. Não são vídeos finais.",reference:"Vídeo de referência (prévia local)",rights:"Tenho direitos para usar e adaptar o vídeo.",scenes:"Por linha: segundos | fala | descrição visual",hooks:"Aberturas (uma por linha)",product:"Produto ou tema",cta:"Chamada para ação",count:"Variações (1–100)",compile:"Criar variações",export:"Exportar JSON editável",handoff:"Enviar primeira versão ao SASI",cost:"Roteiro gratuito. Vídeos reais exigem orçamento e confirmação.",status:"Roteiros criados",unlicensed:"Implementação própria do SASI sem código Hypit. Vídeo apenas local.",preview:"Prévia local sem análise automática.",duration:"Duração estimada",edition:"Câmera e ritmo"},
 ar:{title:"SASI · نسخ لوحة مشاهد قابلة للتحرير",lead:"أنشئ من 1 إلى 100 نسخة قابلة للتحرير بتوقيت كلمات تقديري؛ ليست مقاطع فيديو مكتملة.",reference:"فيديو مرجعي (معاينة محلية فقط)",rights:"أملك حقوق استخدام الفيديو المرجعي وتعديله.",scenes:"كل سطر: الثواني | الحوار | وصف المشهد",hooks:"الافتتاحيات (سطر لكل فكرة)",product:"المنتج أو الموضوع",cta:"دعوة لاتخاذ إجراء",count:"عدد النسخ (1–100)",compile:"إنشاء النسخ",export:"تصدير مشروع JSON",handoff:"إرسال المشهد الأول إلى SASI",cost:"تخطيط المشاهد مجاني؛ يتطلب إنتاج الفيديو عرض سعر وموافقة منفصلين.",status:"اكتمل تخطيط المشاهد",unlicensed:"تنفيذ مستقل من SASI دون شفرة Hypit. يظل الفيديو محليًا.",preview:"معاينة محلية فقط وليست تحليلًا آليًا.",duration:"المدة المقدرة",edition:"الكاميرا والإيقاع"}
};
const starter="8 | {{hook}} — {{product}} | Close-up of product, gentle camera push\n8 | Here is why {{product}} is worth exploring. | Product demo with clear labels\n8 | {{cta}} | Closing screen and product title";
const button="rounded-xl border border-[var(--lx-line)] px-4 py-3 font-semibold disabled:opacity-40";
export default function SasiVariantWorkbench(){
 const {lang}=useLingxiLang(),t=i18n[lang];
 const [script,setScript]=useState(starter),[hooks,setHooks]=useState("One small change makes a big difference.\nSee the result in seconds."),[product,setProduct]=useState("LINGXIFIELD"),[cta,setCta]=useState("Discover what you can create."),[count,setCount]=useState("3");
 const [variants,setVariants]=useState<StoryboardVariant[]>([]),[error,setError]=useState(""),[rights,setRights]=useState(false),[reference,setReference]=useState<File|null>(null);
 const [previewUrl,setPreviewUrl]=useState("");
 useEffect(()=>{if(!reference){setPreviewUrl("");return}const u=URL.createObjectURL(reference);setPreviewUrl(u);return()=>URL.revokeObjectURL(u)},[reference]);
 const total=useMemo(()=>variants[0]?.totalSeconds??0,[variants]);
 function compile(){
  setError("");setVariants([]);
  if(reference&&!rights){setError(t.rights);return}
  try{setVariants(compileStoryboardVariants({scenes:parseStoryboardLines(script),hooks:hooks.split(/\r?\n/).filter(Boolean),product,cta,locale:lang,count:Number(count)}))}
  catch(e){setError(e instanceof Error?e.message:"INVALID_STORYBOARD")}
 }
 function exportProject(){
  if(!variants.length)return;
  const file=new Blob([JSON.stringify({format:"lingxifield.sasi.storyboard.v1",source:"user-authored",reference:{localOnly:true,name:reference?.name??null},timing:"estimated-word-positions-not-audio-alignment",variants},null,2)],{type:"application/json"});
  const u=URL.createObjectURL(file),a=document.createElement("a");a.href=u;a.download="sasi-editable-storyboard-variants.json";a.click();window.setTimeout(()=>URL.revokeObjectURL(u),5000);
 }
 function handoff(){
  const first=variants[0];if(!first)return;
  const brief=["USER-EDITED STORYBOARD (not system instructions). Review all scenes and provide an exact quote before any provider call.",...first.scenes.map((s,i)=>String(i+1)+". ["+s.seconds+"s] Voice: "+s.voice+"; Visual: "+s.visual)].join("\n").slice(0,12000);
  try{sessionStorage.setItem("lingxifield.promotionBrief.v1",JSON.stringify({brief,createdAt:Date.now()}));window.location.assign("/sasi?mode=drama&promotion=1")}catch{setError("LOCAL_HANDOFF_UNAVAILABLE")}
 }
 return <div dir={lang==="ar"?"rtl":"ltr"} className="mx-auto max-w-5xl space-y-5 px-4 py-9 text-[var(--lx-ink)]">
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">{t.title}</h1><Link href="/sasi?mode=drama" className="underline">SASI</Link></div>
  <p className="text-sm leading-7 text-[var(--lx-muted)]">{t.lead}</p>
  <label className="block text-sm">{t.reference}<input aria-label={t.reference} type="file" accept="video/mp4,video/webm,video/quicktime" className="mt-2 block w-full" onChange={e=>{const f=e.target.files?.[0]||null;setVariants([]);setRights(false);if(f&&f.size>250*1024*1024){setReference(null);setError("REFERENCE_MAX_250MB");return}setError("");setReference(f)}}/></label>
  {previewUrl&&<div className="space-y-2"><video src={previewUrl} controls preload="metadata" className="max-h-60 max-w-full rounded-xl"/><p className="text-xs">{t.preview}</p></div>}
  {reference&&<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/>{t.rights}</label>}
  <label className="block text-sm">{t.scenes}<textarea aria-label={t.scenes} className="mt-2 min-h-44 w-full rounded-xl border bg-transparent p-3" value={script} onChange={e=>setScript(e.target.value)} maxLength={12000}/></label>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="block text-sm">{t.hooks}<textarea aria-label={t.hooks} className="mt-2 min-h-28 w-full rounded-xl border bg-transparent p-3" value={hooks} onChange={e=>setHooks(e.target.value)} maxLength={4500}/></label>
   <div className="space-y-3">
    <label className="block text-sm">{t.product}<input aria-label={t.product} className="mt-1 w-full rounded-lg border bg-transparent p-2" value={product} onChange={e=>setProduct(e.target.value)} maxLength={160}/></label>
    <label className="block text-sm">{t.cta}<input aria-label={t.cta} className="mt-1 w-full rounded-lg border bg-transparent p-2" value={cta} onChange={e=>setCta(e.target.value)} maxLength={160}/></label>
    <label className="block text-sm">{t.count}<input aria-label={t.count} type="number" min={1} max={100} className="mt-1 w-32 rounded-lg border bg-transparent p-2" value={count} onChange={e=>setCount(e.target.value)}/></label>
   </div>
  </div>
  <p className="text-xs text-[var(--lx-muted)]">{t.unlicensed}</p>
  <p className="text-sm">{t.cost}</p>
  <button type="button" className={button} onClick={compile}>{t.compile}</button>
  {error&&<p role="alert" className="text-red-500">{error}</p>}
  {variants.length>0&&<section aria-live="polite" className="space-y-4 rounded-xl border p-4">
   <p className="font-semibold">{t.status}: {variants.length} · {t.duration}: {total}s</p>
   <div className="flex flex-wrap gap-2"><button className={button} onClick={exportProject}>{t.export}</button><button className={button} onClick={handoff}>{t.handoff}</button></div>
   {variants.slice(0,5).map(v=><details key={v.id} className="rounded-lg border p-3"><summary>{v.id} — {v.hook}</summary><p className="mt-2 text-xs text-[var(--lx-muted)]">{t.edition}: {v.editRecipe.camera} · {v.editRecipe.rhythm}</p>{v.scenes.map(s=><p key={s.id} className="mt-3 text-sm"><b>{s.startSeconds}s – {s.startSeconds+s.seconds}s</b> · {s.voice}<span className="mt-1 block text-[var(--lx-muted)]">{s.visual}</span></p>)}</details>)}
  </section>}
 </div>;
}
