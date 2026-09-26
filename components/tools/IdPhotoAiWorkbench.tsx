"use client";
import NextImage from "next/image";
import {useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {downloadUrl} from "@/lib/tools/shared/download";

type Result={name:string;url:string};
type Failure={name:string;reason:string};
type C={white:string;blue:string;red:string;gray:string;busy:string;price:string;warning:string;download:string;error:string;partial:string;result:string};
const D:Record<LingxiLang,C>={
 zh:{white:"白底",blue:"蓝底",red:"红底",gray:"灰底",busy:"正在生成…",price:"查看本次证件照价格",warning:"AI 生成不等于官方证件照合规认证。提交护照、签证、考试报名等前，请核对尺寸、头部比例与主管机构要求。",download:"下载",error:"证件照生成没有完成",partial:"部分图片处理失败，已保留成功结果",result:"生成结果"},
 en:{white:"White",blue:"Light blue",red:"Red",gray:"Light gray",busy:"Generating…",price:"See this ID-photo price",warning:"AI generation is not an official compliance certification. Check size, head ratio and authority requirements before passport, visa or exam submission.",download:"Download",error:"ID-photo generation did not finish",partial:"Some images failed. Successful results were kept.",result:"Result"},
 ja:{white:"白",blue:"青",red:"赤",gray:"薄いグレー",busy:"生成中…",price:"今回の証明写真料金を見る",warning:"AI 生成は公的な証明写真適合認証ではありません。提出前にサイズ、頭部比率、主管機関の規定を確認してください。",download:"ダウンロード",error:"証明写真を生成できませんでした",partial:"一部の画像に失敗しました。成功した結果は保持されています。",result:"生成結果"},
 ko:{white:"흰색",blue:"연한 파랑",red:"빨강",gray:"연한 회색",busy:"생성 중…",price:"이번 증명사진 가격 보기",warning:"AI 생성은 공식 규격 인증이 아닙니다. 여권, 비자, 시험 제출 전 크기·얼굴 비율·기관 규정을 확인하세요.",download:"다운로드",error:"증명사진 생성을 완료하지 못했습니다",partial:"일부 이미지가 실패했습니다. 성공 결과는 유지했습니다.",result:"결과"},
 fr:{white:"Blanc",blue:"Bleu clair",red:"Rouge",gray:"Gris clair",busy:"Génération…",price:"Voir le prix",warning:"Une image générée par IA ne constitue pas une certification officielle. Vérifiez format, proportion de tête et règles de l’organisme avant toute soumission.",download:"Télécharger",error:"La génération n’a pas abouti",partial:"Certaines images ont échoué. Les résultats réussis sont conservés.",result:"Résultat"},
 de:{white:"Weiß",blue:"Hellblau",red:"Rot",gray:"Hellgrau",busy:"Erstellung…",price:"Preis anzeigen",warning:"KI-Erstellung ist keine offizielle Konformitätsbestätigung. Vor Pass-, Visum- oder Prüfungsanträgen Maße, Kopfanteil und Behördenregeln prüfen.",download:"Herunterladen",error:"Passfoto-Erstellung fehlgeschlagen",partial:"Einige Bilder sind fehlgeschlagen. Erfolgreiche Ergebnisse bleiben erhalten.",result:"Ergebnis"},
 es:{white:"Blanco",blue:"Azul claro",red:"Rojo",gray:"Gris claro",busy:"Generando…",price:"Ver precio",warning:"La generación por IA no equivale a certificación oficial. Verifica tamaño, proporción de cabeza y requisitos de la autoridad antes de enviar.",download:"Descargar",error:"No se pudo completar la generación",partial:"Algunas imágenes fallaron. Se conservaron los resultados correctos.",result:"Resultado"},
 pt:{white:"Branco",blue:"Azul claro",red:"Vermelho",gray:"Cinza claro",busy:"Gerando…",price:"Ver preço",warning:"A geração por IA não equivale a certificação oficial. Verifique tamanho, proporção da cabeça e requisitos do órgão antes de enviar.",download:"Baixar",error:"Não foi possível concluir a geração",partial:"Algumas imagens falharam. Os resultados concluídos foram preservados.",result:"Resultado"},
 ar:{white:"أبيض",blue:"أزرق فاتح",red:"أحمر",gray:"رمادي فاتح",busy:"جارٍ الإنشاء…",price:"عرض السعر",warning:"الإنشاء بالذكاء الاصطناعي ليس اعتمادًا رسميًا. تحقق من المقاس ونسبة الرأس ومتطلبات الجهة قبل تقديم الصورة.",download:"تنزيل",error:"تعذر إكمال إنشاء صورة الهوية",partial:"فشلت بعض الصور وتم الاحتفاظ بالنتائج الناجحة.",result:"النتيجة"}
};
export default function IdPhotoAiWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[bg,setBg]=useState("white"),[busy,setBusy]=useState(false),[results,setResults]=useState<Result[]>([]),[failures,setFailures]=useState<Failure[]>([]),[error,setError]=useState("");
 async function run(q:string){
  setBusy(true);setError("");setResults([]);setFailures([]);
  const out:Result[]=[],bad:Failure[]=[];
  try{
   for(let i=0;i<files.length;i++){
    const f=files[i];
    try{
     const fd=new FormData();fd.set("file",f);fd.set("quote_id",q);fd.set("item_key",`id-photo-${i}`);fd.set("background",bg);
     const r=await fetch("/api/ai/id-photo",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
     if(!r.ok)throw new Error(d.error||"ID_PHOTO_FAILED");
     const url=d.b64?`data:image/png;base64,${d.b64}`:typeof d.url==="string"?d.url:"";
     if(!url)throw new Error("EMPTY_RESULT");
     out.push({name:f.name,url});
    }catch(e){bad.push({name:f.name,reason:e instanceof Error?e.message:String(e)})}
   }
   setResults(out);setFailures(bad);
   if(bad.length)setError(out.length?c.partial:c.error);
  }finally{setBusy(false)}
 }
 const options=[["white",c.white],["light blue",c.blue],["red",c.red],["light gray",c.gray]];
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple maxFiles={20} maxSizeMB={12} files={files} onChange={f=>{setFiles(f);setResults([]);setFailures([]);setError("")}} disabled={busy} kind="image"/>
  <div className="flex flex-wrap gap-2">{options.map(([v,n])=><button key={v} onClick={()=>setBg(v)} className={`rounded-full px-4 py-2 text-sm ${bg===v?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)] text-[var(--lx-ink)]"}`}>{n}</button>)}</div>
  {busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{c.busy}</button>:files.length?<PaidActionButton toolId="id-photo-ai" quantity={files.length} metadata={{images:files.length}} onPaid={run} label={c.price}/>:null}
  <div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">{c.warning}</div>
  {results.length>0&&<div className="grid gap-4 sm:grid-cols-2">{results.map(r=><div key={r.name} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3"><NextImage src={r.url} alt={c.result} className="w-full rounded-xl" width={1200} height={1600} unoptimized/><button type="button" onClick={()=>void downloadUrl(r.url,`lingxifield-id-${r.name.replace(/\.[^.]+$/,".png")}`)} className="mt-3 inline-flex rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">{c.download}</button></div>)}</div>}
  {failures.length>0&&<div className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-3 text-xs text-[var(--lx-danger)]">{failures.map(x=><div key={x.name}>{x.name} · {x.reason}</div>)}</div>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
