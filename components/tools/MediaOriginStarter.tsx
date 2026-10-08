"use client";
import {useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import FileDropzone from "@/components/tools/FileDropzone";
import OptionalAIImageAnalysis from "@/components/tools/OptionalAIImageAnalysis";
const TEXT:Record<string,Record<LingxiLang,string>>={"image":{"zh":"AI 图片来源检查（基础版）","en":"AI Image Provenance Check (Basic)","ja":"AI画像検出","ko":"AI 이미지 검사","fr":"Détection d’images IA","de":"KI-Bilderkennung","es":"Detección de imágenes IA","pt":"Detecção de imagens IA","ar":"فحص صور الذكاء الاصطناعي"},"media":{"zh":"AI 视频音频来源检查（基础版）","en":"AI Video & Audio Provenance Check (Basic)","ja":"AI動画・音声検出","ko":"AI 영상·음성 검사","fr":"Détection vidéo et audio IA","de":"KI-Video- und Audioerkennung","es":"Detección de vídeo y audio IA","pt":"Detecção de vídeo e áudio IA","ar":"فحص فيديو وصوت الذكاء الاصطناعي"},"intro":{"zh":"当前免费检查文件格式，不提供 AI 真伪结论。可信来源凭证验证尚未开放。","en":"Checks file format only. AI authenticity and provenance verification are not available yet.","ja":"ファイルを選択して形式と検査結果を確認。","ko":"파일을 선택해 형식과 검사 결과를 확인하세요.","fr":"Choisissez un fichier pour voir son format et son résultat.","de":"Datei auswählen und Format sowie Ergebnis anzeigen.","es":"Elige un archivo para ver su formato y resultado.","pt":"Escolha um arquivo para ver o formato e o resultado.","ar":"اختر ملفًا لعرض تنسيقه ونتيجة فحصه."},"select":{"zh":"选择文件（最多20个）","en":"Choose files (max 20)","ja":"ファイル選択（最大20件）","ko":"파일 선택 (최대 20개)","fr":"Choisir des fichiers (20 max.)","de":"Dateien auswählen (max. 20)","es":"Elegir archivos (máx. 20)","pt":"Selecionar arquivos (até 20)","ar":"اختر ملفات (حتى 20)"},"run":{"zh":"检查文件格式","en":"Check file format","ja":"検査を開始","ko":"검사 시작","fr":"Lancer la détection","de":"Prüfung starten","es":"Iniciar detección","pt":"Iniciar detecção","ar":"ابدأ الفحص"},"busy":{"zh":"正在检测…","en":"Checking…","ja":"検査中…","ko":"검사 중…","fr":"Vérification…","de":"Prüfung läuft…","es":"Comprobando…","pt":"Verificando…","ar":"جارٍ الفحص…"},"privacy":{"zh":"文件只在当前设备处理。","en":"Files stay on this device.","ja":"ファイルはこの端末内で処理されます。","ko":"파일은 현재 기기에서만 처리됩니다.","fr":"Les fichiers restent sur votre appareil.","de":"Dateien bleiben auf diesem Gerät.","es":"Los archivos permanecen en tu dispositivo.","pt":"Os arquivos permanecem neste dispositivo.","ar":"تبقى الملفات على جهازك."},"format":{"zh":"识别格式","en":"Detected format","ja":"判別形式","ko":"감지된 형식","fr":"Format détecté","de":"Erkanntes Format","es":"Formato detectado","pt":"Formato detectado","ar":"التنسيق المكتشف"},"size":{"zh":"大小","en":"Size","ja":"サイズ","ko":"크기","fr":"Taille","de":"Größe","es":"Tamaño","pt":"Tamanho","ar":"الحجم"},"unknown":{"zh":"未知格式","en":"Unknown format","ja":"不明な形式","ko":"알 수 없는 형식","fr":"Format inconnu","de":"Unbekanntes Format","es":"Formato desconocido","pt":"Formato desconhecido","ar":"تنسيق غير معروف"},"uncertain":{"zh":"暂时无法识别这种格式。","en":"This file format could not be identified.","ja":"このファイル形式は判別できません。","ko":"이 파일 형식을 식별할 수 없습니다.","fr":"Impossible d’identifier ce format.","de":"Dieses Dateiformat konnte nicht erkannt werden.","es":"No se pudo identificar este formato.","pt":"Não foi possível identificar este formato.","ar":"تعذر تحديد نوع الملف."},"notice":{"zh":"文件格式检测完成；尚未进行 AI 来源或真伪检测。","en":"File format checked; AI authenticity has not been tested.","ja":"形式の確認が完了しました。","ko":"형식 확인이 완료되었습니다.","fr":"Format identifié.","de":"Formatprüfung abgeschlossen.","es":"Formato identificado.","pt":"Formato identificado.","ar":"اكتمل فحص التنسيق."},"verdict":{"zh":"AI 生成情况：尚未检测（当前仅检查文件格式）","en":"AI generation not tested (file format only)","ja":"AI生成：判定できません","ko":"AI 생성 여부: 확인할 수 없음","fr":"Création par IA : indéterminée","de":"KI-Erzeugung: nicht feststellbar","es":"Generado por IA: no determinado","pt":"Gerado por IA: não determinado","ar":"إنشاء بالذكاء الاصطناعي: غير محدد"},"signature":{"zh":"查看来源信息","en":"View source information","ja":"出所情報を見る","ko":"출처 정보 보기","fr":"Voir les informations d’origine","de":"Herkunftsinformationen anzeigen","es":"Ver información de origen","pt":"Ver informações de origem","ar":"عرض معلومات المصدر"},"official":{"zh":"查询文件来源 ↗","en":"Check file provenance ↗","ja":"ファイルの出所を確認 ↗","ko":"파일 출처 확인 ↗","fr":"Vérifier la provenance ↗","de":"Dateiherkunft prüfen ↗","es":"Consultar origen del archivo ↗","pt":"Consultar origem do arquivo ↗","ar":"التحقق من مصدر الملف ↗"},"empty":{"zh":"是空文件","en":"is empty","ja":"は空です","ko":"파일이 비었습니다","fr":"est vide","de":"ist leer","es":"está vacío","pt":"está vazio","ar":"فارغ"},"large":{"zh":"超过250MB","en":"exceeds 250MB","ja":"は250MB超です","ko":"250MB를 초과합니다","fr":"dépasse 250 Mo","de":"überschreitet 250 MB","es":"supera 250 MB","pt":"excede 250 MB","ar":"يتجاوز 250 ميغابايت"},"error":{"zh":"文件读取失败","en":"Could not read file","ja":"ファイルを読み取れません","ko":"파일을 읽을 수 없습니다","fr":"Lecture impossible","de":"Datei nicht lesbar","es":"No se pudo leer el archivo","pt":"Não foi possível ler o arquivo","ar":"تعذرت قراءة الملف"}};
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
        {mode==="image"&&files[i]&&<OptionalAIImageAnalysis key={files[i].name+":"+files[i].size+":"+files[i].lastModified} file={files[i]} lang={lang}/> }
      </li>)}</ul>}
    </section>

  </main>
}