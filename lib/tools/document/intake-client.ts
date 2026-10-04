import type{LingxiLang}from"@/lib/lingxi-i18n";

export const DOCUMENT_INPUT_ACCEPT=[
 "application/pdf",".pdf",
 ".doc",".docx",".docm",".dot",".dotm",".dotx",".odt",".fodt",".ott",".rtf",".txt",
 ".xls",".xlsx",".xlsm",".xlt",".xltx",".ods",".csv",".tsv",
 ".ppt",".pptx",".pptm",".pot",".potx",".odp"
].join(",");

const OFFICE_EXT=new Set(["doc","docx","docm","dot","dotm","dotx","odt","fodt","ott","rtf","txt","xls","xlsx","xlsm","xlt","xltx","ods","csv","tsv","ppt","pptx","pptm","pot","potx","odp"]);
function extOf(name:string){return(name.split(".").pop()||"").toLowerCase()}
export function isDocumentInputFile(file:File){const e=extOf(file.name);return e==="pdf"||file.type==="application/pdf"||OFFICE_EXT.has(e)}
export function isOfficeDocument(file:File){return OFFICE_EXT.has(extOf(file.name))}

type Ticket={mode:"direct"|"same-origin";version?:"v1";url?:string;exp?:number;nonce?:string;token?:string;maxBytes:number};
async function ticketFor(file:File):Promise<Ticket>{
 const r=await fetch("/api/tools/document/ticket",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:file.name,size:file.size,type:file.type||"application/octet-stream"}),cache:"no-store"});
 if(!r.ok)throw new Error(r.status===413?"DOCUMENT_SIZE_UNSUPPORTED":r.status===415?"DOCUMENT_TYPE_UNSUPPORTED":"DOCUMENT_CONVERSION_UNAVAILABLE");
 return await r.json() as Ticket;
}
async function viaDirectGateway(file:File,t:Ticket){
 if(t.version!=="v1"||!t.url||!t.exp||!t.nonce||!t.token)throw new Error("DOCUMENT_CONVERSION_UNAVAILABLE");
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90_000);
 try{
  const r=await fetch(t.url,{
   method:"POST",credentials:"omit",referrerPolicy:"no-referrer",signal:controller.signal,
   headers:{
    "content-type":file.type||"application/octet-stream",
    "x-lingxifield-ticket-version":"v1",
    "x-lingxifield-filename":encodeURIComponent(file.name),
    "x-lingxifield-size":String(file.size),
    "x-lingxifield-exp":String(t.exp),
    "x-lingxifield-nonce":t.nonce,
    "x-lingxifield-token":t.token
   },
   body:file
  });
  if(!r.ok)throw new Error(r.status===413?"DOCUMENT_SIZE_UNSUPPORTED":r.status===415?"DOCUMENT_TYPE_UNSUPPORTED":r.status===408||r.status===504?"DOCUMENT_CONVERSION_TIMEOUT":"DOCUMENT_CONVERSION_FAILED");
  return await r.blob();
 }finally{clearTimeout(timer)}
}
async function viaSameOrigin(file:File){
 const fd=new FormData();fd.set("file",file,file.name);
 const r=await fetch("/api/tools/document/normalize",{method:"POST",body:fd});
 if(!r.ok){
  let code="DOCUMENT_CONVERSION_FAILED";
  try{code=String((await r.json())?.error||code)}catch{}
  throw new Error(code);
 }
 return await r.blob();
}
export async function normalizeDocumentFile(file:File){
 if(!isOfficeDocument(file))return file;
 const ticket=await ticketFor(file);
 if(file.size>ticket.maxBytes)throw new Error("DOCUMENT_DIRECT_GATEWAY_REQUIRED");
 const blob=ticket.mode==="direct"?await viaDirectGateway(file,ticket):await viaSameOrigin(file);
 const head=new Uint8Array(await blob.slice(0,5).arrayBuffer());
 if(head.length<5||head[0]!==0x25||head[1]!==0x50||head[2]!==0x44||head[3]!==0x46||head[4]!==0x2d)throw new Error("DOCUMENT_CONVERSION_INVALID");
 const base=file.name.replace(/\.[^.]+$/,"")||"document";
 return new File([blob],`${base}.pdf`,{type:"application/pdf",lastModified:Date.now()});
}
export async function normalizeDocumentFiles(files:File[]){
 const out:File[]=[];for(const file of files)out.push(await normalizeDocumentFile(file));return out;
}

const copy:Record<LingxiLang,{hint:string;busy:string;unavailable:string;unsupported:string;size:string}>={
 zh:{hint:"支持 PDF、Word、PPT、Excel 等文档；非 PDF 会先转换后继续处理。",busy:"正在准备文档…",unavailable:"文档转换暂时不可用，请稍后重试或先上传 PDF。",unsupported:"暂不支持这个文档格式。",size:"文件过大，请选择较小文件，或减少文档中的图片。"},
 en:{hint:"PDF, Word, PowerPoint and Excel are supported. Non-PDF files are converted before processing.",busy:"Preparing document…",unavailable:"Document conversion is temporarily unavailable. Try again later or upload a PDF.",unsupported:"This document format is not supported.",size:"The file is too large. Choose a smaller file or reduce images in the document."},
 ja:{hint:"PDF、Word、PowerPoint、Excel に対応。PDF 以外は変換してから処理します。",busy:"文書を準備中…",unavailable:"文書変換は一時的に利用できません。後でもう一度試すか、PDF をアップロードしてください。",unsupported:"この文書形式には対応していません。",size:"ファイルが大きすぎます。小さいファイルを選ぶか、文書内の画像を減らしてください。"},
 ko:{hint:"PDF, Word, PowerPoint, Excel을 지원합니다. PDF가 아닌 파일은 변환 후 처리합니다.",busy:"문서를 준비하는 중…",unavailable:"문서 변환을 일시적으로 사용할 수 없습니다. 나중에 다시 시도하거나 PDF를 업로드하세요.",unsupported:"지원하지 않는 문서 형식입니다.",size:"파일이 너무 큽니다. 더 작은 파일을 선택하거나 문서의 이미지를 줄이세요."},
 fr:{hint:"PDF, Word, PowerPoint et Excel sont pris en charge. Les autres documents sont convertis en PDF avant traitement.",busy:"Préparation du document…",unavailable:"La conversion de document est temporairement indisponible. Réessayez plus tard ou importez un PDF.",unsupported:"Ce format de document n’est pas pris en charge.",size:"Le fichier est trop volumineux. Choisissez un fichier plus petit ou réduisez les images du document."},
 de:{hint:"PDF, Word, PowerPoint und Excel werden unterstützt. Andere Dokumente werden vor der Verarbeitung in PDF umgewandelt.",busy:"Dokument wird vorbereitet…",unavailable:"Die Dokumentkonvertierung ist vorübergehend nicht verfügbar. Versuche es später erneut oder lade eine PDF hoch.",unsupported:"Dieses Dokumentformat wird nicht unterstützt.",size:"Die Datei ist zu groß. Wähle eine kleinere Datei oder reduziere die Bilder im Dokument."},
 es:{hint:"Se admiten PDF, Word, PowerPoint y Excel. Los archivos que no sean PDF se convierten antes de procesarse.",busy:"Preparando documento…",unavailable:"La conversión de documentos no está disponible temporalmente. Inténtalo más tarde o sube un PDF.",unsupported:"Este formato de documento no es compatible.",size:"El archivo es demasiado grande. Elige uno más pequeño o reduce las imágenes del documento."},
 pt:{hint:"PDF, Word, PowerPoint e Excel são compatíveis. Arquivos que não sejam PDF são convertidos antes do processamento.",busy:"Preparando documento…",unavailable:"A conversão de documentos está temporariamente indisponível. Tente novamente mais tarde ou envie um PDF.",unsupported:"Este formato de documento não é compatível.",size:"O arquivo é muito grande. Escolha um menor ou reduza as imagens do documento."},
 ar:{hint:"يدعم PDF وWord وPowerPoint وExcel. يتم تحويل الملفات غير PDF قبل المعالجة.",busy:"جارٍ تجهيز المستند…",unavailable:"تحويل المستندات غير متاح مؤقتًا. حاول لاحقًا أو ارفع ملف PDF.",unsupported:"تنسيق المستند هذا غير مدعوم.",size:"الملف كبير جداً. اختر ملفاً أصغر أو قلّل الصور في المستند."}
};
export function documentIntakeText(lang:LingxiLang,key:keyof(typeof copy.zh)){return(copy[lang]||copy.en)[key]}
export function documentIntakeError(lang:LingxiLang,error:unknown){
 const code=error instanceof Error?error.message:String(error);
 if(code.includes("SIZE_UNSUPPORTED"))return documentIntakeText(lang,"size");
 if(code.includes("UNSUPPORTED"))return documentIntakeText(lang,"unsupported");
 return documentIntakeText(lang,"unavailable");
}
