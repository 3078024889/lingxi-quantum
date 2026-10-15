"use client";

import {useMemo,useState} from "react";
import {getQpdfRuntime} from '@/lib/tools/shared/qpdf-runtime';
import {readPdfStructure} from '@/lib/tools/shared/pdf-structure';
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

export type PdfStructureInfoMode="inspect"|"attachments"|"bookmarks";
type RunnerResult={ok:boolean;outputs:Record<string,Uint8Array>;stdout:string[];stderr:string[];warnings:string[];exitCode:number|null;durationMs:number};
type Runner={run:(o:{inputs:Record<string,Uint8Array|ArrayBuffer>;args:string[];outputs?:string[]})=>Promise<RunnerResult>;destroy:()=>Promise<void>|void};
async function getRunner(){return getQpdfRuntime()}
const asBytes=async(f:File)=>new Uint8Array(await f.arrayBuffer());
const asOwnedArrayBuffer=(bytes:Uint8Array):ArrayBuffer=>{
 const buffer=new ArrayBuffer(bytes.byteLength);
 new Uint8Array(buffer).set(bytes);
 return buffer;
};
const download=(name:string,bytes:Uint8Array):ToolResultFile=>({name,size:bytes.byteLength,mime:"application/pdf",blob:new Blob([asOwnedArrayBuffer(bytes)],{type:"application/pdf"})});

type Copy={local:string;run:string;working:string;invalid:string;inspectHint:string;attachHint:string;bookHint:string;pages:string;attachments:string;bookmarks:string;warnings:string;none:string;addFile:string;add:string;removeKey:string;remove:string;refresh:string;ready:string;};
const C:Record<LingxiLang,Copy>={
zh:{local:"免费 · 文件只在浏览器里处理，不上传。",run:"开始检查",working:"正在处理…",invalid:"这个 PDF 暂时无法处理，请换一个文件再试。",inspectHint:"查看页数、附件、书签和 PDF 检查信息，不修改文件。",attachHint:"查看 PDF 里的附件，也可以添加或移除附件。",bookHint:"查看 PDF 的书签层级和跳转页。",pages:"页数",attachments:"附件",bookmarks:"书签",warnings:"发现的信息",none:"没有",addFile:"选择要加入 PDF 的附件",add:"加入附件",removeKey:"要移除的附件键名",remove:"移除附件",refresh:"重新读取",ready:"完成。"},
en:{local:"Free · Files stay in your browser and are not uploaded.",run:"Inspect PDF",working:"Working…",invalid:"This PDF could not be processed. Try another file.",inspectHint:"Check page count, attachments, bookmarks and PDF inspection details without changing the PDF.",attachHint:"View embedded attachments, add a file, or remove an attachment.",bookHint:"View the PDF bookmark tree and destination pages.",pages:"Pages",attachments:"Attachments",bookmarks:"Bookmarks",warnings:"Details",none:"None",addFile:"Choose a file to attach",add:"Add attachment",removeKey:"Attachment key to remove",remove:"Remove attachment",refresh:"Refresh",ready:"Done."},
ja:{local:"無料 · ファイルはブラウザ内だけで処理され、アップロードされません。",run:"PDFを確認",working:"処理中…",invalid:"このPDFは処理できませんでした。",inspectHint:"ページ数、添付ファイル、しおり、qpdfの確認情報を表示します。",attachHint:"PDF内の添付ファイルを確認し、追加または削除できます。",bookHint:"PDFのしおり階層と移動先ページを確認します。",pages:"ページ数",attachments:"添付",bookmarks:"しおり",warnings:"情報",none:"なし",addFile:"添付するファイルを選択",add:"添付を追加",removeKey:"削除する添付キー",remove:"添付を削除",refresh:"再読み込み",ready:"完了。"},
ko:{local:"무료 · 파일은 브라우저 안에서만 처리되며 업로드되지 않습니다.",run:"PDF 확인",working:"처리 중…",invalid:"이 PDF를 처리할 수 없습니다.",inspectHint:"페이지 수, 첨부 파일, 북마크와 qpdf 검사 정보를 확인합니다.",attachHint:"PDF 첨부 파일을 확인하고 추가하거나 제거합니다.",bookHint:"PDF 북마크 구조와 이동 페이지를 확인합니다.",pages:"페이지",attachments:"첨부 파일",bookmarks:"북마크",warnings:"정보",none:"없음",addFile:"첨부할 파일 선택",add:"첨부 추가",removeKey:"삭제할 첨부 키",remove:"첨부 삭제",refresh:"새로 읽기",ready:"완료."},
fr:{local:"Gratuit · Les fichiers restent dans votre navigateur.",run:"Inspecter le PDF",working:"Traitement…",invalid:"Ce PDF n’a pas pu être traité.",inspectHint:"Vérifie le nombre de pages, les pièces jointes, les signets et les informations qpdf.",attachHint:"Affichez, ajoutez ou supprimez les pièces jointes intégrées.",bookHint:"Affichez l’arborescence des signets et leurs pages de destination.",pages:"Pages",attachments:"Pièces jointes",bookmarks:"Signets",warnings:"Informations",none:"Aucun",addFile:"Choisir un fichier à joindre",add:"Ajouter",removeKey:"Clé de la pièce jointe",remove:"Supprimer",refresh:"Actualiser",ready:"Terminé."},
de:{local:"Kostenlos · Dateien bleiben im Browser.",run:"PDF prüfen",working:"Wird verarbeitet…",invalid:"Dieses PDF konnte nicht verarbeitet werden.",inspectHint:"Zeigt Seitenzahl, Anhänge, Lesezeichen und qpdf-Prüfinformationen.",attachHint:"PDF-Anhänge anzeigen, hinzufügen oder entfernen.",bookHint:"Lesezeichenstruktur und Zielseiten anzeigen.",pages:"Seiten",attachments:"Anhänge",bookmarks:"Lesezeichen",warnings:"Informationen",none:"Keine",addFile:"Datei zum Anhängen wählen",add:"Anhang hinzufügen",removeKey:"Anhangsschlüssel",remove:"Anhang entfernen",refresh:"Neu laden",ready:"Fertig."},
es:{local:"Gratis · Los archivos permanecen en tu navegador.",run:"Revisar PDF",working:"Procesando…",invalid:"No se pudo procesar este PDF.",inspectHint:"Consulta páginas, adjuntos, marcadores e información de inspección de qpdf.",attachHint:"Consulta, añade o elimina archivos adjuntos del PDF.",bookHint:"Consulta el árbol de marcadores y sus páginas de destino.",pages:"Páginas",attachments:"Adjuntos",bookmarks:"Marcadores",warnings:"Información",none:"Ninguno",addFile:"Elegir archivo para adjuntar",add:"Añadir adjunto",removeKey:"Clave del adjunto",remove:"Eliminar adjunto",refresh:"Actualizar",ready:"Listo."},
pt:{local:"Grátis · Os ficheiros ficam no navegador.",run:"Verificar PDF",working:"A processar…",invalid:"Não foi possível processar este PDF.",inspectHint:"Veja páginas, anexos, marcadores e informações de inspeção do qpdf.",attachHint:"Veja, adicione ou remova anexos incorporados no PDF.",bookHint:"Veja a árvore de marcadores e as páginas de destino.",pages:"Páginas",attachments:"Anexos",bookmarks:"Marcadores",warnings:"Informações",none:"Nenhum",addFile:"Escolher ficheiro para anexar",add:"Adicionar anexo",removeKey:"Chave do anexo",remove:"Remover anexo",refresh:"Atualizar",ready:"Concluído."},
ar:{local:"مجاني · تبقى الملفات داخل المتصفح ولا يتم رفعها.",run:"فحص PDF",working:"جارٍ العمل…",invalid:"تعذر معالجة ملف PDF هذا.",inspectHint:"اعرض عدد الصفحات والمرفقات والإشارات المرجعية ومعلومات فحص qpdf.",attachHint:"اعرض المرفقات داخل PDF وأضف ملفات أو احذفها.",bookHint:"اعرض شجرة الإشارات المرجعية وصفحات الوجهة.",pages:"الصفحات",attachments:"المرفقات",bookmarks:"الإشارات المرجعية",warnings:"المعلومات",none:"لا يوجد",addFile:"اختر ملفًا لإرفاقه",add:"إضافة مرفق",removeKey:"مفتاح المرفق المراد حذفه",remove:"حذف المرفق",refresh:"تحديث",ready:"تم."}
};
function countOutlines(x:any):number{if(!Array.isArray(x))return 0;return x.reduce((n,v)=>n+1+countOutlines(v?.kids),0)}
function flattenOutlines(x:any[],depth=0,out:{title:string;page:string;depth:number}[]=[]){for(const v of x||[]){out.push({title:String(v?.title||"—"),page:String(v?.destpageposfrom1??v?.page??"—"),depth});if(Array.isArray(v?.kids))flattenOutlines(v.kids,depth+1,out)}return out}
function jsonFrom(lines:string[]){const s=lines.join("\n").trim();return s?JSON.parse(s):{}}
export default function PdfStructureInfoWorkbench({mode}:{mode:PdfStructureInfoMode}){
 const {lang}=useLingxiLang(),t=C[lang];const[files,setFiles]=useState<File[]>([]);const[file]=files;const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[summary,setSummary]=useState<any>(null);const[result,setResult]=useState<ToolResultFile[]>([]);const[extra,setExtra]=useState<File|null>(null);const[removeKey,setRemoveKey]=useState("");
 const ready=!!file&&!busy;
 async function readSummary(input:File){const data=await readPdfStructure(await asBytes(input));return {...data,outlineRows:flattenOutlines(data.outlines)}}
 async function inspect(){if(!file)return;setBusy(true);setError("");setResult([]);try{setSummary(await readSummary(file))}catch(e){console.error(e);setError(t.invalid)}finally{setBusy(false)}}
 async function updateAttachment(remove:boolean){
  if(!file||(remove?!removeKey.trim():!extra))return;setBusy(true);setError("");setResult([]);
  try{
   const q=await getRunner(),pdf=await asBytes(file);
   const inputs:Record<string,Uint8Array>={"input.pdf":pdf};
   const args=remove?["input.pdf",`--remove-attachment=${removeKey.trim()}`,"output.pdf"]:["input.pdf","--add-attachment","attachment.bin","--filename="+extra!.name,"--key="+extra!.name,"--","output.pdf"];
   if(!remove)inputs['attachment.bin']=await asBytes(extra!);
   const r=await q.run({inputs,args,outputs:["output.pdf"]}),bytes=r.outputs["output.pdf"];
   if(!r.ok||!bytes?.length)throw Error('PDF_ATTACHMENT_UPDATE_FAILED');
   const updated=new File([asOwnedArrayBuffer(bytes)],file.name,{type:'application/pdf'});
   const summary=await readSummary(updated);
   setFiles([updated]);setSummary(summary);setResult([download(file.name.replace(/\.pdf$/i,"")+(remove?"-attachments-updated.pdf":"-with-attachment.pdf"),bytes)]);
   if(remove)setRemoveKey("");else setExtra(null);
  }catch(e){console.error(e);setError(t.invalid)}finally{setBusy(false)}
 }
 async function addAttachment(){await updateAttachment(false)}
 async function removeAttachment(){await updateAttachment(true)}
 const hint=mode==="inspect"?t.inspectHint:mode==="attachments"?t.attachHint:t.bookHint;
 return <div className="space-y-4"><p className="text-sm text-[var(--lx-muted)]">{t.local}</p><FileDropzone accept="application/pdf,.pdf" maxFiles={1} maxSizeMB={100} files={files} onChange={n=>{setFiles(n.slice(0,1));setSummary(null);setResult([]);setError("")}} disabled={busy} kind="pdf"/><p className="rounded-xl border border-[var(--lx-line)] p-4 text-sm text-[var(--lx-muted)]">{hint}</p>{ready&&<button type="button" onClick={inspect} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)]">{busy?t.working:(summary?t.refresh:t.run)}</button>}{busy&&<p className="text-sm text-[var(--lx-muted)]">{t.working}</p>}{error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 {summary&&mode==="inspect"&&<div className="grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-[var(--lx-line)] p-4"><b>{t.pages}</b><div className="mt-2 text-2xl">{summary.pages}</div></div><div className="rounded-xl border border-[var(--lx-line)] p-4"><b>{t.attachments}</b><div className="mt-2 text-2xl">{summary.attachments.length}</div></div><div className="rounded-xl border border-[var(--lx-line)] p-4"><b>{t.bookmarks}</b><div className="mt-2 text-2xl">{countOutlines(summary.outlines)}</div></div><div className="md:col-span-3 rounded-xl border border-[var(--lx-line)] p-4"><b>{t.warnings}</b><pre className="mt-2 whitespace-pre-wrap text-xs text-[var(--lx-muted)]">{summary.warnings.length?summary.warnings.join("\n"):t.none}</pre></div></div>}
 {mode==="attachments"&&<div className="space-y-3"><div className="rounded-xl border border-[var(--lx-line)] p-4"><b>{t.attachments}</b><div className="mt-2 text-sm text-[var(--lx-muted)]">{summary?.attachments?.length?summary.attachments.join("\n"):t.none}</div></div><label className="block text-sm">{t.addFile}<input type="file" onChange={e=>setExtra(e.target.files?.[0]||null)} className="mt-2 block w-full"/></label><button type="button" disabled={!file||!extra||busy} onClick={addAttachment} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm disabled:opacity-50">{t.add}</button><label className="block text-sm">{t.removeKey}<input value={removeKey} onChange={e=>setRemoveKey(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3"/></label><button type="button" disabled={!file||!removeKey.trim()||busy} onClick={removeAttachment} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm disabled:opacity-50">{t.remove}</button></div>}
 {mode==="bookmarks"&&summary&&<div className="rounded-xl border border-[var(--lx-line)] p-4"><b>{t.bookmarks}</b><div className="mt-3 space-y-1 text-sm">{summary.outlineRows.length?summary.outlineRows.map((r:any,i:number)=><div key={i} style={{paddingInlineStart:`${r.depth*16}px`}}>{r.title} <span className="text-[var(--lx-muted)]">· {r.page}</span></div>):<span className="text-[var(--lx-muted)]">{t.none}</span>}</div></div>}
 {result.length>0&&<ResultPanel sourceSlug={`pdf-${mode}`} files={result} messageZh="处理完成，可直接下载。" messageEn="Done. Your PDF is ready to download."/>}</div>
}
