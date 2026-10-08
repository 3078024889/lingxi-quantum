"use client";
import {useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import FileDropzone from "@/components/tools/FileDropzone";
const TEXT:Record<string,Record<LingxiLang,string>>={"image":{"zh":"AI 图片检测","en":"AI Image Detection","ja":"AI画像検出","ko":"AI 이미지 검사","fr":"Détection d’images IA","de":"KI-Bilderkennung","es":"Detección de imágenes IA","pt":"Detecção de imagens IA","ar":"فحص صور الذكاء الاصطناعي"},"media":{"zh":"AI 视频音频检测","en":"AI Video & Audio Detection","ja":"AI動画・音声検出","ko":"AI 영상·음성 검사","fr":"Détection vidéo et audio IA","de":"KI-Video- und Audioerkennung","es":"Detección de vídeo y audio IA","pt":"Detecção de vídeo e áudio IA","ar":"فحص فيديو وصوت الذكاء الاصطناعي"},"intro":{"zh":"免费检测文件格式并了解来源凭证。文件头无法证明是否由 AI 生成。","en":"Free format check and provenance guidance. File headers cannot prove AI generation.","ja":"ファイル形式と来歴情報を無料で確認。ヘッダーだけではAI生成と判断できません。","ko":"파일 형식과 출처 정보를 무료로 확인하세요. 파일 헤더만으로 AI 생성 여부를 판단할 수 없습니다.","fr":"Vérifiez gratuitement le format et la provenance. L’en-tête ne prouve pas la génération par IA.","de":"Dateiformat und Herkunft kostenlos prüfen. Dateiheader belegen keine KI-Erzeugung.","es":"Comprueba gratis el formato y la procedencia. La cabecera no demuestra generación por IA.","pt":"Verifique gratuitamente formato e origem. O cabeçalho não comprova geração por IA.","ar":"افحص التنسيق والمصدر مجانًا. لا تثبت ترويسة الملف أنه مولّد بالذكاء الاصطناعي."},"select":{"zh":"选择文件（最多20个）","en":"Choose files (max 20)","ja":"ファイル選択（最大20件）","ko":"파일 선택 (최대 20개)","fr":"Choisir des fichiers (20 max.)","de":"Dateien auswählen (max. 20)","es":"Elegir archivos (máx. 20)","pt":"Selecionar arquivos (até 20)","ar":"اختر ملفات (حتى 20)"},"run":{"zh":"开始免费检测","en":"Start free detection","ja":"無料検査を開始","ko":"무료 검사 시작","fr":"Lancer la détection gratuite","de":"Kostenlose Prüfung starten","es":"Iniciar detección gratuita","pt":"Iniciar detecção gratuita","ar":"ابدأ الفحص المجاني"},"busy":{"zh":"正在检测…","en":"Checking…","ja":"検査中…","ko":"검사 중…","fr":"Vérification…","de":"Prüfung läuft…","es":"Comprobando…","pt":"Verificando…","ar":"جارٍ الفحص…"},"privacy":{"zh":"仅在浏览器读取文件头；不上传原文件、不扣额度、不收费。","en":"Only file headers are read locally. No original upload, quota use or charges.","ja":"ヘッダーのみブラウザーで読み取り。原本の送信・枠消費・料金はありません。","ko":"브라우저에서 헤더만 읽습니다. 원본 업로드, 한도 차감, 비용이 없습니다.","fr":"Seul l’en-tête est lu dans le navigateur, sans envoi ni frais.","de":"Nur Header im Browser; kein Upload, Kontingentverbrauch oder Kosten.","es":"Solo se lee la cabecera en el navegador; sin subida ni cargos.","pt":"Apenas o cabeçalho é lido no navegador; sem envio ou cobrança.","ar":"تُقرأ ترويسة الملف في المتصفح فقط دون رفع الأصل أو رسوم."},"format":{"zh":"识别格式","en":"Detected format","ja":"判別形式","ko":"감지된 형식","fr":"Format détecté","de":"Erkanntes Format","es":"Formato detectado","pt":"Formato detectado","ar":"التنسيق المكتشف"},"size":{"zh":"大小","en":"Size","ja":"サイズ","ko":"크기","fr":"Taille","de":"Größe","es":"Tamaño","pt":"Tamanho","ar":"الحجم"},"unknown":{"zh":"未知格式","en":"Unknown format","ja":"不明な形式","ko":"알 수 없는 형식","fr":"Format inconnu","de":"Unbekanntes Format","es":"Formato desconocido","pt":"Formato desconhecido","ar":"تنسيق غير معروف"},"uncertain":{"zh":"文件头不足以判断具体格式。","en":"Header bytes cannot identify the exact format.","ja":"ヘッダーから形式を特定できません。","ko":"헤더만으로 정확한 형식을 알 수 없습니다.","fr":"L’en-tête ne suffit pas à identifier le format.","de":"Header reicht zur Bestimmung nicht aus.","es":"La cabecera no permite identificar el formato.","pt":"O cabeçalho não permite identificar o formato.","ar":"الترويسة غير كافية لتحديد التنسيق."},"notice":{"zh":"文件格式只是线索，无法证实 AI 生成、篡改或真实来源。","en":"Format alone cannot prove AI origin, tampering or authenticity.","ja":"形式だけでAI生成・改変・真正性は証明できません。","ko":"형식만으로 AI 생성, 변조, 진위를 입증할 수 없습니다.","fr":"Le format ne prouve ni origine IA, ni altération, ni authenticité.","de":"Das Format belegt weder KI-Ursprung noch Manipulation oder Echtheit.","es":"El formato no demuestra origen IA, alteración ni autenticidad.","pt":"O formato não comprova origem IA, adulteração ou autenticidade.","ar":"التنسيق وحده لا يثبت المصدر أو التلاعب أو الأصالة."},"verdict":{"zh":"AI 来源：仅凭格式无法判定","en":"AI origin: cannot be determined from format alone","ja":"AI生成：形式だけでは判定不可","ko":"AI 생성 여부: 형식만으로 판단 불가","fr":"Origine IA : indéterminable par le format","de":"KI-Ursprung: nicht aus dem Format bestimmbar","es":"Origen IA: indeterminable por el formato","pt":"Origem IA: não determinada pelo formato","ar":"مصدر الذكاء الاصطناعي: غير قابل للتحديد من التنسيق"},"signature":{"zh":"来源签名检测","en":"Provenance signature verification","ja":"来歴署名の検証","ko":"출처 서명 검증","fr":"Vérification de signature d’origine","de":"Herkunftssignatur prüfen","es":"Verificación de firma de origen","pt":"Verificação de assinatura de origem","ar":"التحقق من توقيع المصدر"},"explain":{"zh":"C2PA 可包含签名与编辑记录。没有凭证不等于造假；签名有效也不代表内容事实真实。","en":"C2PA can contain signatures and edit history. No credential does not prove fakery; a valid signature does not establish factual truth.","ja":"C2PAには署名や編集履歴が含まれます。証明情報の欠如は偽造を意味せず、署名も事実の真実性を保証しません。","ko":"C2PA에는 서명과 편집 기록이 포함될 수 있습니다. 자격 증명 부재는 위조의 증거가 아니며 서명이 사실을 보장하지 않습니다.","fr":"C2PA peut contenir des signatures et l’historique. Leur absence ne prouve pas la fraude ; une signature ne garantit pas les faits.","de":"C2PA kann Signaturen und Verlauf enthalten. Fehlende Nachweise belegen keine Fälschung; eine Signatur garantiert keine Tatsachen.","es":"C2PA puede incluir firma e historial. Sin credenciales no significa falsedad y una firma no garantiza hechos.","pt":"C2PA pode conter assinaturas e histórico. A ausência não prova falsificação; a assinatura não garante fatos.","ar":"قد يتضمن C2PA توقيعًا وسجل تعديلات. غيابه لا يثبت التزوير وصحته لا تثبت صحة الوقائع."},"official":{"zh":"打开 Content Credentials 官方检测 ↗","en":"Open official Content Credentials verification ↗","ja":"Content Credentials公式検証を開く ↗","ko":"Content Credentials 공식 검증 열기 ↗","fr":"Ouvrir la vérification officielle Content Credentials ↗","de":"Offizielle Content-Credentials-Prüfung öffnen ↗","es":"Abrir verificación oficial Content Credentials ↗","pt":"Abrir verificação oficial Content Credentials ↗","ar":"افتح خدمة Content Credentials الرسمية ↗"},"disabled":{"zh":"本站高级签名检测尚未开放，当前检测免费。","en":"Advanced on-site signature checks are not available yet. This check is free.","ja":"高度なサイト内署名検証は未公開です。現在の検査は無料です。","ko":"사이트 내 고급 서명 검증은 준비 중입니다. 현재 검사는 무료입니다.","fr":"La vérification avancée n’est pas encore disponible. Ce contrôle est gratuit.","de":"Erweiterte Signaturprüfung ist noch nicht verfügbar. Diese Prüfung ist kostenlos.","es":"La verificación avanzada aún no está disponible. Esta comprobación es gratis.","pt":"A verificação avançada ainda não está disponível. Esta análise é gratuita.","ar":"فحص التوقيع المتقدم غير متاح بعد. الفحص الحالي مجاني."},"empty":{"zh":"是空文件","en":"is empty","ja":"は空です","ko":"파일이 비었습니다","fr":"est vide","de":"ist leer","es":"está vacío","pt":"está vazio","ar":"فارغ"},"large":{"zh":"超过250MB","en":"exceeds 250MB","ja":"は250MB超です","ko":"250MB를 초과합니다","fr":"dépasse 250 Mo","de":"überschreitet 250 MB","es":"supera 250 MB","pt":"excede 250 MB","ar":"يتجاوز 250 ميغابايت"},"error":{"zh":"文件读取失败","en":"Could not read file","ja":"ファイルを読み取れません","ko":"파일을 읽을 수 없습니다","fr":"Lecture impossible","de":"Datei nicht lesbar","es":"No se pudo leer el archivo","pt":"Não foi possível ler o arquivo","ar":"تعذرت قراءة الملف"}};
type Mode="image"|"media";
type Result={name:string;bytes:number;format:string};
const label=(key:string,lang:LingxiLang)=>TEXT[key]?.[lang]||TEXT[key]?.zh||key;
function four(b:Uint8Array,i:number){return String.fromCharCode(...b.slice(i,i+4))}
async function check(file:File):Promise<Result>{
  const b=new Uint8Array(await file.slice(0,48).arrayBuffer());
  let format="unknown";
  if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)format="JPEG";
  else if(b.length>=8&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10)format="PNG";
  else if(four(b,0)==="GIF8")format="GIF";
  else if(four(b,0)==="RIFF"&&four(b,8)==="WEBP")format="WebP";
  else if(four(b,0)==="RIFF"&&four(b,8)==="WAVE")format="WAV";
  else if(four(b,0)==="OggS")format="Ogg";
  else if(four(b,0)==="ID3"||(b.length>=2&&b[0]===255&&(b[1]&224)===224))format="Possible MP3";
  else if(four(b,4)==="ftyp"){const brand=four(b,8);format=["heic","heix","mif1","avif","avis"].includes(brand)?"HEIF/AVIF":brand==="qt  "?"MOV":"ISO MP4/M4A media container";}
  else if(b.length>=4&&b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163)format="Matroska/WebM";
  return {name:file.name,bytes:file.size,format};
}
export default function MediaOriginStarter({mode}:{mode:Mode}){
  const {lang}=useLingxiLang();const t=(key:string)=>label(key,lang);
  const [files,setFiles]=useState<File[]>([]);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const accept=mode==="image"?"image/*,.jpg,.jpeg,.png,.webp,.heic,.avif":"video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.ogg,.m4a";
  async function run(){
    setBusy(true);setError("");setResults([]);
    try{const next:Result[]=[];for(const f of files){if(!f.size)throw Error(f.name+" "+t("empty"));if(f.size>250*1024*1024)throw Error(f.name+" "+t("large"));next.push(await check(f))}setResults(next)}
    catch(e){setError(e instanceof Error?e.message:t("error"))}finally{setBusy(false)}
  }
  return <main className="mx-auto max-w-3xl space-y-6 px-5 py-12" dir={lang==="ar"?"rtl":undefined}>
    <h1 className="text-3xl font-semibold">{t(mode==="image"?"image":"media")}</h1>
    <p>{t("intro")}</p>
    <section className="space-y-4 rounded-2xl border p-5">
      <h2 className="text-lg font-semibold">{t("select")}</h2>
      <FileDropzone files={files} onChange={next=>{setFiles(next);setResults([])}} multiple append maxFiles={20} maxSizeMB={250} accept={accept} kind={mode==="image"?"image":"media"}/>
      <button type="button" className="rounded-lg border px-5 py-2 disabled:opacity-50" disabled={busy||!files.length} onClick={()=>void run()}>{t(busy?"busy":"run")}</button>
      <p className="text-sm opacity-75">{t("privacy")}</p>
      {error&&<p role="alert">{error}</p>}
      {results.length>0&&<ul className="space-y-3">{results.map((r,i)=><li className="rounded-lg border p-4" key={i}>
        <p className="break-all font-semibold">{r.name}</p>
        <p>{t("format")}: {r.format==="unknown"?t("unknown"):r.format}</p>
        <p>{t("size")}: {(r.bytes/1048576).toFixed(2)} MB</p>
        <p>{t(r.format==="unknown"?"uncertain":"notice")}</p>
        <p className="font-medium">{t("verdict")}</p>
      </li>)}</ul>}
    </section>
    <section className="space-y-2 rounded-2xl border p-5">
      <h2 className="text-lg font-semibold">{t("signature")}</h2>
      <p>{t("explain")}</p>
      <a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer" className="underline">{t("official")}</a>
      <p className="text-sm opacity-75">{t("disabled")}</p>
    </section>
  </main>
}