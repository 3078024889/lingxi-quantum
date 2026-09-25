"use client";
import {useMemo,useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

async function cleanOne(file:File){
 if(file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf")){
  const d=await PDFDocument.load(await file.arrayBuffer());
  d.setTitle("");d.setAuthor("");d.setSubject("");d.setKeywords([]);d.setProducer("Lingxifield");d.setCreator("Lingxifield");
  const bytes=await d.save(),copy=new Uint8Array(bytes.length);copy.set(bytes);return new Blob([copy.buffer],{type:"application/pdf"});
 }
 if(file.type.startsWith("image/")){
  const bmp=await createImageBitmap(file),c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;const x=c.getContext("2d")!;x.drawImage(bmp,0,0);bmp.close?.();
  return await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("EXPORT_FAILED")),file.type==="image/png"?"image/png":"image/jpeg",.95));
 }
 throw new Error("UNSUPPORTED_FILE");
}
type C={lead:string;run:string;batch:string;busy:string;ready:string;error:string;unsupported:string};
const D:Record<LingxiLang,C>={
 zh:{lead:"图片会重新编码以去除常见 EXIF / GPS；PDF 会清除标题、作者、主题、关键词等文档属性。处理在浏览器本地完成。",run:"清除隐私信息",batch:"批量清理",busy:"正在清理…",ready:"隐私信息清理完成，可以先核对结果再下载。",error:"清理没有完成",unsupported:"当前支持图片与 PDF。"},
 en:{lead:"Images are re-encoded to remove common EXIF/GPS data. PDFs have title, author, subject and keyword metadata cleared. Processing stays in your browser.",run:"Remove private metadata",batch:"Clean batch",busy:"Cleaning…",ready:"Privacy cleanup finished. Review the results before downloading.",error:"Cleanup did not finish",unsupported:"Images and PDFs are supported."},
 ja:{lead:"画像は再エンコードして一般的な EXIF / GPS を除去し、PDF はタイトル・作者・件名・キーワード等を消去します。処理はブラウザ内で行われます。",run:"プライバシー情報を削除",batch:"一括クリーニング",busy:"クリーニング中…",ready:"クリーニングが完了しました。確認してからダウンロードできます。",error:"クリーニングを完了できませんでした",unsupported:"画像と PDF に対応しています。"},
 ko:{lead:"이미지는 다시 인코딩해 일반적인 EXIF/GPS를 제거하고 PDF는 제목, 작성자, 주제, 키워드 등의 속성을 지웁니다. 처리는 브라우저 안에서 진행됩니다.",run:"개인정보 제거",batch:"일괄 정리",busy:"정리 중…",ready:"개인정보 정리가 완료되었습니다. 확인 후 다운로드하세요.",error:"정리를 완료하지 못했습니다",unsupported:"이미지와 PDF를 지원합니다."},
 fr:{lead:"Les images sont réencodées pour supprimer les données EXIF/GPS courantes. Les PDF sont nettoyés de leurs métadonnées titre, auteur, sujet et mots-clés. Le traitement reste dans votre navigateur.",run:"Supprimer les métadonnées privées",batch:"Nettoyer le lot",busy:"Nettoyage…",ready:"Nettoyage terminé. Vérifiez les résultats avant de télécharger.",error:"Le nettoyage n’a pas abouti",unsupported:"Images et PDF sont pris en charge."},
 de:{lead:"Bilder werden neu codiert, um gängige EXIF/GPS-Daten zu entfernen. Bei PDFs werden Titel, Autor, Betreff und Stichwörter gelöscht. Die Verarbeitung bleibt im Browser.",run:"Private Metadaten entfernen",batch:"Stapel bereinigen",busy:"Bereinigung…",ready:"Bereinigung abgeschlossen. Ergebnisse vor dem Download prüfen.",error:"Bereinigung konnte nicht abgeschlossen werden",unsupported:"Bilder und PDFs werden unterstützt."},
 es:{lead:"Las imágenes se vuelven a codificar para eliminar EXIF/GPS habituales. En PDF se limpian título, autor, asunto y palabras clave. El proceso permanece en tu navegador.",run:"Eliminar metadatos privados",batch:"Limpiar lote",busy:"Limpiando…",ready:"Limpieza terminada. Revisa los resultados antes de descargar.",error:"No se pudo completar la limpieza",unsupported:"Se admiten imágenes y PDF."},
 pt:{lead:"As imagens são recodificadas para remover EXIF/GPS comuns. PDFs têm título, autor, assunto e palavras-chave removidos. O processamento fica no navegador.",run:"Remover metadados privados",batch:"Limpar lote",busy:"Limpando…",ready:"Limpeza concluída. Revise os resultados antes de baixar.",error:"Não foi possível concluir a limpeza",unsupported:"Imagens e PDFs são suportados."},
 ar:{lead:"تُعاد ترميز الصور لإزالة بيانات EXIF/GPS الشائعة، وتُمسح من ملفات PDF بيانات العنوان والمؤلف والموضوع والكلمات المفتاحية. تتم المعالجة داخل المتصفح.",run:"إزالة البيانات الخاصة",batch:"تنظيف دفعة",busy:"جارٍ التنظيف…",ready:"اكتمل التنظيف. راجع النتائج قبل التنزيل.",error:"تعذر إكمال التنظيف",unsupported:"يتم دعم الصور وملفات PDF."}
};

export default function PrivacyCleanerWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 async function run(){
  setBusy(true);setError("");setResults([]);
  try{
   const out:ToolResultFile[]=[];
   for(const f of files){
    const blob=await cleanOne(f).catch(e=>{if(e instanceof Error&&e.message==="UNSUPPORTED_FILE")throw new Error(c.unsupported);throw e});
    out.push({name:"clean-"+f.name,blob,mime:blob.type||"application/octet-stream",size:blob.size});
   }
   setResults(out);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 const total=useMemo(()=>results.reduce((n,x)=>n+x.size,0),[results]);
 return <div className="space-y-4">
  <FileDropzone accept="image/*,application/pdf,.pdf" multiple maxFiles={50} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy}/>
  <p className="text-sm leading-6 text-[var(--lx-muted)]">{c.lead}</p>
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:files.length>1?`${c.batch} · ${files.length}`:c.run}</button>
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready} details={{files:results.length,resultKB:Number((total/1024).toFixed(1))}}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
