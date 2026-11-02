"use client";

import {useEffect,useRef,useState,type FormEvent} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {openPdf} from "@/lib/tools/pdf-render-client";

type SearchHit={page:number;preview:string};
type Labels={title:string;placeholder:string;search:string;searching:string;none:string;scanned:string;matches:string;page:string;limit:string;error:string;hint:string};
const LABELS:Record<LingxiLang,Labels>={
 zh:{title:"查找 PDF 内文字",placeholder:"输入合同金额、姓名或关键词",search:"查找",searching:"正在搜索当前 PDF…",none:"未找到匹配的文字。",scanned:"此 PDF 可能是扫描件，页面文字无法直接提取。可先使用 PDF OCR。",matches:"个匹配页面",page:"第 {page} 页",limit:"为保护浏览器性能，本次仅搜索前 {pages} 页。",error:"无法读取此 PDF 的文字。",hint:"在本机搜索，不上传文件。点击结果即可跳转页面。"},
 en:{title:"Find text in PDF",placeholder:"Search names, clauses or amounts",search:"Find",searching:"Searching this PDF…",none:"No matching text found.",scanned:"This may be a scanned PDF without extractable text. Try PDF OCR first.",matches:"matching pages",page:"Page {page}",limit:"To keep the browser responsive, this search covers the first {pages} pages.",error:"Could not read text from this PDF.",hint:"Search stays on your device. Select a result to jump to its page."},
 ja:{title:"PDF内の文字を検索",placeholder:"キーワードを入力",search:"検索",searching:"PDFを検索中…",none:"一致する文字がありません。",scanned:"スキャンPDFの可能性があります。先にOCRを試してください。",matches:"一致するページ",page:"{page}ページ",limit:"先頭{pages}ページのみを検索しました。",error:"PDFの文字を読み取れません。",hint:"端末内で検索。結果を選ぶとページへ移動します。"},
 ko:{title:"PDF 텍스트 검색",placeholder:"검색어 입력",search:"검색",searching:"검색 중…",none:"일치하는 텍스트가 없습니다.",scanned:"스캔된 PDF일 수 있습니다. OCR을 사용해 보세요.",matches:"일치 페이지",page:"{page}페이지",limit:"처음 {pages}페이지만 검색했습니다.",error:"PDF 텍스트를 읽을 수 없습니다.",hint:"기기 내에서만 검색합니다. 결과를 선택해 이동하세요."},
 fr:{title:"Rechercher dans le PDF",placeholder:"Saisissez un mot-clé",search:"Rechercher",searching:"Recherche en cours…",none:"Aucun texte correspondant.",scanned:"Ce PDF est peut-être scanné. Essayez d'abord l'OCR.",matches:"pages correspondantes",page:"Page {page}",limit:"Recherche limitée aux {pages} premières pages.",error:"Impossible de lire le texte PDF.",hint:"Recherche locale. Cliquez sur un résultat pour ouvrir sa page."},
 de:{title:"Text im PDF suchen",placeholder:"Suchbegriff eingeben",search:"Suchen",searching:"PDF wird durchsucht…",none:"Kein Treffer gefunden.",scanned:"Möglicherweise ein gescanntes PDF. Zuerst OCR verwenden.",matches:"Seiten mit Treffern",page:"Seite {page}",limit:"Nur die ersten {pages} Seiten durchsucht.",error:"PDF-Text konnte nicht gelesen werden.",hint:"Suche bleibt lokal. Treffer anklicken, um zur Seite zu springen."},
 es:{title:"Buscar texto en PDF",placeholder:"Escribe un término",search:"Buscar",searching:"Buscando en el PDF…",none:"No se encontraron coincidencias.",scanned:"Puede ser un PDF escaneado. Prueba primero OCR.",matches:"páginas coincidentes",page:"Página {page}",limit:"Se buscaron las primeras {pages} páginas.",error:"No se pudo leer el texto del PDF.",hint:"Búsqueda local. Pulsa un resultado para ir a su página."},
 pt:{title:"Buscar texto no PDF",placeholder:"Digite uma palavra-chave",search:"Buscar",searching:"Pesquisando PDF…",none:"Nenhum texto correspondente.",scanned:"Este PDF pode ser digitalizado. Use OCR primeiro.",matches:"páginas encontradas",page:"Página {page}",limit:"Pesquisa limitada às primeiras {pages} páginas.",error:"Não foi possível ler o texto.",hint:"Pesquisa local. Selecione um resultado para ir à página."},
 ar:{title:"البحث في نص PDF",placeholder:"أدخل كلمة البحث",search:"بحث",searching:"جارٍ البحث…",none:"لا توجد نتائج مطابقة.",scanned:"قد يكون الملف ممسوحًا ضوئيًا. جرب OCR أولاً.",matches:"صفحات مطابقة",page:"الصفحة {page}",limit:"تم البحث في أول {pages} صفحة فقط.",error:"تعذّرت قراءة نص PDF.",hint:"يتم البحث على جهازك. اختر النتيجة للانتقال إلى صفحتها."}
};
const MAX_SEARCH_PAGES=300;
const MAX_HITS=100;
function label(template:string,value:number){return template.replace(/\{(?:pages|page)\}/g,String(value))}
function normalized(s:string){return s.normalize("NFKC").toLocaleLowerCase()}
export default function PdfTextFind({file,onNavigate}:{file:File;onNavigate:(page:number)=>void}){
 const {lang}=useLingxiLang(),t=LABELS[lang]||LABELS.en;
 const[query,setQuery]=useState("");
 const[searched,setSearched]=useState(false),[loading,setLoading]=useState(false),[foundText,setFoundText]=useState(false),[truncated,setTruncated]=useState(false),[hasError,setHasError]=useState(false);
 const[hits,setHits]=useState<SearchHit[]>([]);
 const ticket=useRef(0);
 useEffect(()=>{ticket.current++;setQuery("");setHits([]);setSearched(false);setLoading(false);setTruncated(false);setFoundText(false);setHasError(false);return()=>{ticket.current++}},[file]);
 async function search(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const term=normalized(query.trim());
  const myTicket=++ticket.current;
  setSearched(false);setHits([]);setFoundText(false);setHasError(false);setTruncated(false);
  if(!term){setLoading(false);return;}
  setLoading(true);
  let pdf:Awaited<ReturnType<typeof openPdf>>|null=null;
  try{
   pdf=await openPdf(file);
   const count=Math.min(pdf.numPages,MAX_SEARCH_PAGES);
   const matches:SearchHit[]=[];
   let characters=0;
   for(let pageNumber=1;pageNumber<=count;pageNumber++){
    if(ticket.current!==myTicket)return;
    const page=await pdf.getPage(pageNumber);
    const content=await page.getTextContent();
    const all=content.items.map(item=>("str" in item?item.str:"")).join(" ").replace(/\s+/g," ").trim();
    characters+=all.length;
    const pos=normalized(all).indexOf(term);
    if(pos!==-1&&matches.length<MAX_HITS){
      const from=Math.max(0,pos-55),to=Math.min(all.length,pos+term.length+80);
      matches.push({page:pageNumber,preview:(from?"…":"")+all.slice(from,to)+(to<all.length?"…":"")});
    }
    page.cleanup();
   }
   if(ticket.current!==myTicket)return;
   setHits(matches);setFoundText(characters>0);setTruncated(pdf.numPages>MAX_SEARCH_PAGES||matches.length>=MAX_HITS);setSearched(true);
  }catch{if(ticket.current===myTicket){setHasError(true);setSearched(true)}}
  finally{try{await pdf?.destroy()}catch{}if(ticket.current===myTicket)setLoading(false)}
 }
 return <details data-testid="pdf-text-find" className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 sm:p-4">
  <summary className="cursor-pointer text-sm font-semibold">{t.title}</summary>
  <p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{t.hint}</p>
  <form onSubmit={e=>void search(e)} className="mt-3 flex flex-wrap gap-2">
   <input data-testid="pdf-search-query" aria-label={t.title} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.placeholder} className="min-w-0 flex-1 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2.5 text-sm" maxLength={180}/>
   <button data-testid="pdf-search-submit" type="submit" disabled={loading||!query.trim()} className="rounded-lg bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)] disabled:opacity-40">{loading?t.searching:t.search}</button>
  </form>
  {loading&&<p role="status" className="mt-2 text-sm">{t.searching}</p>}
  {hasError&&<p role="alert" className="mt-2 text-sm">{t.error}</p>}
  {searched&&!hasError&&<>
   <p data-testid="pdf-search-count" role="status" className="mt-2 text-sm">{hits.length} {t.matches}</p>
   {!hits.length&&<p className="mt-1 text-sm text-[var(--lx-muted)]">{foundText?t.none:t.scanned}</p>}
   {truncated&&<p className="mt-1 text-xs text-[var(--lx-muted)]">{label(t.limit,MAX_SEARCH_PAGES)}</p>}
   {!!hits.length&&<ul className="mt-2 max-h-56 space-y-2 overflow-auto">
    {hits.map(hit=><li key={hit.page}><button data-testid="pdf-search-result" type="button" onClick={()=>onNavigate(hit.page)} className="w-full rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3 text-start text-sm hover:underline"><strong>{label(t.page,hit.page)}</strong><span className="mt-1 block break-words text-xs text-[var(--lx-muted)]">{hit.preview}</span></button></li>)}
   </ul>}
  </>}
 </details>;
}
