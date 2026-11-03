"use client";
import {useRef,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import FileDropzone from "@/components/tools/FileDropzone";
import OptionalAIImageAnalysis from "@/components/tools/OptionalAIImageAnalysis";
import OptionalAIVoiceAnalysis from "@/components/tools/OptionalAIVoiceAnalysis";
import OptionalAIVideoFrameAnalysis from "@/components/tools/OptionalAIVideoFrameAnalysis";
import C2paProvenanceCheck from "@/components/tools/C2paProvenanceCheck";
const TEXT:Record<string,Record<LingxiLang,string>>={"image":{"zh":"AI 图片检测","en":"AI Image Analysis","ja":"AI画像検出","ko":"AI 이미지 검사","fr":"Détection d’images IA","de":"KI-Bilderkennung","es":"Detección de imágenes IA","pt":"Detecção de imagens IA","ar":"فحص صور الذكاء الاصطناعي"},"media":{"zh":"AI 视频与音频检测","en":"AI Video & Audio Analysis","ja":"AI動画・音声検出","ko":"AI 영상·음성 검사","fr":"Détection vidéo et audio IA","de":"KI-Video- und Audioerkennung","es":"Detección de vídeo y audio IA","pt":"Detecção de vídeo e áudio IA","ar":"فحص فيديو وصوت الذكاء الاصطناعي"},"intro":{"zh":"上传图片、视频或录音，查看来源信息与内容特征。结果清楚呈现，帮助你进一步核对。","en":"Upload an image, video or recording to review its origin details and content indicators. Results help you investigate, not certify authenticity.","ja":"ファイルを選択して形式と検査結果を確認。","ko":"파일을 선택해 형식과 검사 결과를 확인하세요.","fr":"Choisissez un fichier pour voir son format et son résultat.","de":"Datei auswählen und Format sowie Ergebnis anzeigen.","es":"Elige un archivo para ver su formato y resultado.","pt":"Escolha um arquivo para ver o formato e o resultado.","ar":"اختر ملفًا لعرض تنسيقه ونتيجة فحصه."},"select":{"zh":"选择文件（最多20个）","en":"Choose files (max 20)","ja":"ファイル選択（最大20件）","ko":"파일 선택 (최대 20개)","fr":"Choisir des fichiers (20 max.)","de":"Dateien auswählen (max. 20)","es":"Elegir archivos (máx. 20)","pt":"Selecionar arquivos (até 20)","ar":"اختر ملفات (حتى 20)"},"run":{"zh":"开始检查","en":"Start checking","ja":"検査を開始","ko":"검사 시작","fr":"Lancer la détection","de":"Prüfung starten","es":"Iniciar detección","pt":"Iniciar detecção","ar":"ابدأ الفحص"},"busy":{"zh":"正在检测…","en":"Checking…","ja":"検査中…","ko":"검사 중…","fr":"Vérification…","de":"Prüfung läuft…","es":"Comprobando…","pt":"Verificando…","ar":"جارٍ الفحص…"},"privacy":{"zh":"文件只在当前设备处理。","en":"Files stay on this device.","ja":"ファイルはこの端末内で処理されます。","ko":"파일은 현재 기기에서만 처리됩니다.","fr":"Les fichiers restent sur votre appareil.","de":"Dateien bleiben auf diesem Gerät.","es":"Los archivos permanecen en tu dispositivo.","pt":"Os arquivos permanecem neste dispositivo.","ar":"تبقى الملفات على جهازك."},"format":{"zh":"文件格式","en":"Detected format","ja":"判別形式","ko":"감지된 형식","fr":"Format détecté","de":"Erkanntes Format","es":"Formato detectado","pt":"Formato detectado","ar":"التنسيق المكتشف"},"size":{"zh":"大小","en":"Size","ja":"サイズ","ko":"크기","fr":"Taille","de":"Größe","es":"Tamaño","pt":"Tamanho","ar":"الحجم"},"unknown":{"zh":"未知格式","en":"Unknown format","ja":"不明な形式","ko":"알 수 없는 형식","fr":"Format inconnu","de":"Unbekanntes Format","es":"Formato desconocido","pt":"Formato desconhecido","ar":"تنسيق غير معروف"},"uncertain":{"zh":"暂时无法识别这种格式。","en":"This file format could not be identified.","ja":"このファイル形式は判別できません。","ko":"이 파일 형식을 식별할 수 없습니다.","fr":"Impossible d’identifier ce format.","de":"Dieses Dateiformat konnte nicht erkannt werden.","es":"No se pudo identificar este formato.","pt":"Não foi possível identificar este formato.","ar":"تعذر تحديد نوع الملف."},"notice":{"zh":"文件已读取。下方分别展示来源签名与内容特征，两项结果可相互参考，但不能互相替代。","en":"File ready. Review origin signatures and content indicators separately; neither result replaces the other.","ja":"形式の確認が完了しました。","ko":"형식 확인이 완료되었습니다.","fr":"Format identifié.","de":"Formatprüfung abgeschlossen.","es":"Formato identificado.","pt":"Formato identificado.","ar":"اكتمل فحص التنسيق."},"verdict":{"zh":"内容特征分析（仅供参考）","en":"Content indicators (for reference)","ja":"AI生成：判定できません","ko":"AI 생성 여부: 확인할 수 없음","fr":"Création par IA : indéterminée","de":"KI-Erzeugung: nicht feststellbar","es":"Generado por IA: no determinado","pt":"Gerado por IA: não determinado","ar":"إنشاء بالذكاء الاصطناعي: غير محدد"},"signature":{"zh":"查看来源信息","en":"View source information","ja":"出所情報を見る","ko":"출처 정보 보기","fr":"Voir les informations d’origine","de":"Herkunftsinformationen anzeigen","es":"Ver información de origen","pt":"Ver informações de origem","ar":"عرض معلومات المصدر"},"official":{"zh":"查询文件来源 ↗","en":"Check file provenance ↗","ja":"ファイルの出所を確認 ↗","ko":"파일 출처 확인 ↗","fr":"Vérifier la provenance ↗","de":"Dateiherkunft prüfen ↗","es":"Consultar origen del archivo ↗","pt":"Consultar origem do arquivo ↗","ar":"التحقق من مصدر الملف ↗"},"empty":{"zh":"是空文件","en":"is empty","ja":"は空です","ko":"파일이 비었습니다","fr":"est vide","de":"ist leer","es":"está vacío","pt":"está vazio","ar":"فارغ"},"large":{"zh":"超过250MB","en":"exceeds 250MB","ja":"は250MB超です","ko":"250MB를 초과합니다","fr":"dépasse 250 Mo","de":"überschreitet 250 MB","es":"supera 250 MB","pt":"excede 250 MB","ar":"يتجاوز 250 ميغابايت"},"error":{"zh":"文件读取失败","en":"Could not read file","ja":"ファイルを読み取れません","ko":"파일을 읽을 수 없습니다","fr":"Lecture impossible","de":"Datei nicht lesbar","es":"No se pudo leer el archivo","pt":"Não foi possível ler o arquivo","ar":"تعذرت قراءة الملف"}};
function isAudioSelected(file:File){const n=file.name.toLowerCase();return file.type.startsWith("audio/")||[".wav",".mp3",".ogg",".m4a",".flac"].some(ext=>n.endsWith(ext));}
function isVideoSelected(file:File){const n=file.name.toLowerCase();return file.type.startsWith("video/")||[".mp4",".mov",".webm",".mkv"].some(ext=>n.endsWith(ext));}
type Mode="image"|"media";
type Result={name:string;bytes:number;format:string;file:File};
const label=(key:string,lang:LingxiLang)=>TEXT[key]?.[lang]||TEXT[key]?.zh||key;
function four(b:Uint8Array,i:number){return String.fromCharCode(...b.slice(i,i+4))}
async function check(file:File):Promise<Result>{
  const b=new Uint8Array(await file.slice(0,48).arrayBuffer());
  let format="unknown";
  if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)format="JPEG";
  else if(b.length>=8&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10)format="PNG";
  else if((four(b,0)==="GIF8")&&(b[4]===55||b[4]===57)&&b[5]===97)format="GIF";
  else if(four(b,0)==="RIFF"&&four(b,8)==="WEBP")format="WebP";
  else if(four(b,0)==="RIFF"&&four(b,8)==="WAVE")format="WAV";
  else if(four(b,0)==="OggS")format="Ogg";
  else if(four(b,0)==="ID3"||(b.length>=2&&b[0]===255&&(b[1]&224)===224))format="Possible MP3";
  else if(four(b,4)==="ftyp"){const brand=four(b,8);format=["heic","heix","mif1","avif","avis"].includes(brand)?"HEIF/AVIF":brand==="qt  "?"MOV":"ISO MP4/M4A media container";}
  else if(b.length>=4&&b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163)format="Matroska/WebM";
  return {name:file.name,bytes:file.size,format,file};
}
const INTRO_BY_MODE:Record<"image"|"media",Record<LingxiLang,string>>={
  "image": {
    "zh": "仅分析图片：先核验 C2PA 来源签名，再可选运行本机 AI 图片特征检测。模型分数不是图片真伪的证明。",
    "en": "Image only: check C2PA provenance first, then optionally run an on-device AI-image indicator test. Scores are not proof of authenticity.",
    "ja": "画像のみ対象。C2PAの出所を確認し、任意で端末内AI画像分析を実行します。スコアは真正性の証明ではありません。",
    "ko": "이미지만 검사합니다. C2PA 출처를 확인한 뒤 선택적으로 기기 내 AI 특징 분석을 실행합니다. 점수는 진위 증명이 아닙니다.",
    "fr": "Images uniquement : vérifiez C2PA, puis les indicateurs IA locaux si nécessaire. Les scores ne prouvent pas l’authenticité.",
    "de": "Nur Bilder: C2PA-Herkunft prüfen und optional KI-Merkmale lokal analysieren. Scores beweisen keine Echtheit.",
    "es": "Solo imágenes: verifica C2PA y, si quieres, indicadores IA locales. Los resultados no prueban autenticidad.",
    "pt": "Apenas imagens: verifique C2PA e, se desejar, indicadores de IA locais. Os resultados não comprovam autenticidade.",
    "ar": "للصور فقط: تحقق من مصدر C2PA، ثم حلل مؤشرات الذكاء الاصطناعي اختياريًا على الجهاز. النتائج لا تثبت الأصالة."
  },
  "media": {
    "zh": "检查视频或音频的 C2PA 来源签名。视频只抽取 3 帧，音频只分析开头最多 12 秒的人声；不能据此断定整段媒体的真伪。",
    "en": "Check C2PA provenance for video or audio. Optional analysis samples only 3 video frames or up to 12 seconds of speech; it cannot certify an entire recording.",
    "ja": "動画・音声のC2PA出所を確認します。任意分析は動画3フレームまたは冒頭最大12秒の音声のみで、全体の真偽は判定できません。",
    "ko": "영상·오디오의 C2PA 출처를 확인합니다. 선택 분석은 영상 3프레임 또는 음성 첫 12초만 검사하며 전체 진위를 보장하지 않습니다.",
    "fr": "Vérifiez C2PA pour vidéo ou audio. L’analyse optionnelle porte sur 3 images ou 12 secondes de voix au maximum ; elle ne certifie pas tout le média.",
    "de": "C2PA-Herkunft von Video/Audio prüfen. Optional werden nur 3 Bilder oder bis zu 12 Sekunden Sprache analysiert; nicht die gesamte Aufnahme.",
    "es": "Comprueba C2PA en vídeo/audio. El análisis opcional examina 3 fotogramas o hasta 12 segundos de voz; no certifica toda la grabación.",
    "pt": "Verifique C2PA em vídeo/áudio. A análise opcional examina 3 quadros ou até 12 segundos de fala; não certifica a gravação inteira.",
    "ar": "تحقق من مصدر C2PA للفيديو أو الصوت. يحلل الفحص الاختياري 3 إطارات أو أول 12 ثانية من الكلام فقط، ولا يثبت أصالة الملف بالكامل."
  }
};
export default function MediaOriginStarter({mode}:{mode:Mode}){
  const {lang}=useLingxiLang();const t=(key:string)=>label(key,lang);
  const [files,setFiles]=useState<File[]>([]);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const runTicket=useRef(0);
  const [error,setError]=useState("");
  const accept=mode==="image"?"image/*,.jpg,.jpeg,.png,.webp,.heic,.avif":"video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.ogg,.m4a";
  async function run(){
    const ticket=++runTicket.current;
    const selectedFiles=[...files];
    setBusy(true);setError("");setResults([]);
    try{
      const next:Result[]=[];
      for(const f of selectedFiles){
        if(ticket!==runTicket.current)return;
        if(!f.size)throw Error(f.name+" "+t("empty"));
        if(f.size>250*1024*1024)throw Error(f.name+" "+t("large"));
        next.push(await check(f));
      }
      if(ticket===runTicket.current)setResults(next);
    }catch(e){
      if(ticket===runTicket.current)setError(e instanceof Error?e.message:t("error"));
    }finally{
      if(ticket===runTicket.current)setBusy(false);
    }
  }
  return <main className="mx-auto max-w-3xl space-y-6 px-5 py-12" dir={lang==="ar"?"rtl":undefined}>
    <h1 className="text-3xl font-semibold">{t(mode==="image"?"image":"media")}</h1>
    <p>{INTRO_BY_MODE[mode][lang]}</p>
    <section className="space-y-4 rounded-2xl border p-5">
      <h2 className="text-lg font-semibold">{t("select")}</h2>
      <FileDropzone files={files} onChange={next=>{runTicket.current++;setFiles(next);setResults([]);setError("");setBusy(false)}} multiple append maxFiles={20} maxSizeMB={250} accept={accept} kind={mode==="image"?"image":"media"}/>
      <button type="button" className="rounded-lg border px-5 py-2 disabled:opacity-50" disabled={busy||!files.length} onClick={()=>void run()}>{t(busy?"busy":"run")}</button>
      <p className="text-sm opacity-75">{t("privacy")}</p>
      {error&&<p role="alert">{error}</p>}
      {results.length>0&&<ul className="space-y-3">{results.map((r,i)=><li className="rounded-lg border p-4" key={i}>
        <p className="break-all font-semibold">{r.name}</p>
        <p>{t("format")}: {r.format==="unknown"?t("unknown"):r.format}</p>
        <p>{t("size")}: {(r.bytes/1048576).toFixed(2)} MB</p>
        <p>{t(r.format==="unknown"?"uncertain":"notice")}</p>
        <C2paProvenanceCheck file={r.file} lang={lang}/>
        <p className="font-medium">{t("verdict")}</p>
        {mode==="image"&&<OptionalAIImageAnalysis key={r.file.name+":"+r.file.size+":"+r.file.lastModified} file={r.file} lang={lang}/> }
        {mode==="media"&&isAudioSelected(r.file)&&<OptionalAIVoiceAnalysis key={"voice:"+r.file.name+r.file.lastModified} file={r.file} lang={lang}/>}
        {mode==="media"&&isVideoSelected(r.file)&&<OptionalAIVideoFrameAnalysis key={"frames:"+r.file.name+r.file.lastModified} file={r.file} lang={lang}/> }
      </li>)}</ul>}
    </section>

  </main>
}