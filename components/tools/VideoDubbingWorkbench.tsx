"use client";
import {useEffect,useRef,useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import FileDropzone from "@/components/tools/FileDropzone";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";

const LANGS=[["en","English"],["zh","中文"],["ja","日本語"],["ko","한국어"],["es","Español"],["pt","Português"],["fr","Français"],["de","Deutsch"],["it","Italiano"],["id","Bahasa Indonesia"],["vi","Tiếng Việt"],["th","ไทย"],["hi","हिन्दी"],["ar","العربية"]];
type C={url:string;probe:string;probing:string;urlLead:string;duration:string;minutes:string;target:string;working:string;price:string;billing:string;status:string;open:string;topup:string;topupRun:string;service:string;probeFail:string;https:string;pollFail:string};
const D:Record<LingxiLang,C>={
 zh:{url:"或粘贴可直接读取的视频 / 音频直链",probe:"检测时长",probing:"检测中…",urlLead:"如果网页链接无法直接读取，请上传文件。不会接入来源不明的“万能下载”接口。",duration:"检测时长",minutes:"本次计费分钟",target:"翻译成",working:"正在创建项目…",price:"查看本次价格",billing:"按源媒体时长和目标语言计费。确认价格并付款后开始处理。",status:"当前状态",open:"打开生成结果",topup:"实际时长比预估更长，需要补足差额",topupRun:"补差价并继续",service:"视频配音服务暂不可用，请稍后再试。",probeFail:"无法读取媒体时长，请改为上传文件。",https:"链接必须使用 HTTPS。",pollFail:"暂时无法读取处理进度，系统会继续尝试。"},
 en:{url:"Or paste a directly readable video/audio URL",probe:"Check duration",probing:"Checking…",urlLead:"If a webpage URL cannot be read directly, upload the file instead. Unknown “universal downloader” services are not used.",duration:"Detected duration",minutes:"Billable minutes",target:"Translate to",working:"Creating project…",price:"See this price",billing:"Billing is based on source-media duration and target language. Processing starts after price confirmation and payment.",status:"Status",open:"Open generated result",topup:"Actual duration is longer than estimated and needs an additional payment",topupRun:"Pay difference and continue",service:"Video dubbing is temporarily unavailable. Please try again later.",probeFail:"Could not read media duration. Upload the file instead.",https:"The URL must use HTTPS.",pollFail:"Could not read progress right now. The system will keep trying."},
 ja:{url:"直接読み取れる動画 / 音声 URL を貼り付け",probe:"長さを確認",probing:"確認中…",urlLead:"ウェブページ URL を直接読めない場合はファイルをアップロードしてください。不明な万能ダウンロードサービスは使いません。",duration:"検出時間",minutes:"課金分数",target:"翻訳先",working:"プロジェクト作成中…",price:"今回の料金を見る",billing:"元メディアの長さと対象言語で課金します。料金確認と支払い後に処理を開始します。",status:"現在の状態",open:"生成結果を開く",topup:"実際の長さが予測より長いため差額が必要です",topupRun:"差額を支払って続行",service:"動画吹替サービスは一時的に利用できません。",probeFail:"メディアの長さを読み取れません。ファイルをアップロードしてください。",https:"URL は HTTPS である必要があります。",pollFail:"進行状況を取得できません。システムは再試行します。"},
 ko:{url:"직접 읽을 수 있는 영상 / 오디오 URL 붙여넣기",probe:"길이 확인",probing:"확인 중…",urlLead:"웹페이지 URL을 직접 읽을 수 없으면 파일을 업로드하세요. 출처 불명의 범용 다운로드 서비스는 사용하지 않습니다.",duration:"감지 길이",minutes:"과금 분",target:"번역 언어",working:"프로젝트 생성 중…",price:"이번 가격 보기",billing:"원본 미디어 길이와 대상 언어 기준으로 과금합니다. 가격 확인과 결제 후 처리합니다.",status:"현재 상태",open:"생성 결과 열기",topup:"실제 길이가 예상보다 길어 추가 결제가 필요합니다",topupRun:"차액 결제 후 계속",service:"영상 더빙 서비스를 잠시 사용할 수 없습니다.",probeFail:"미디어 길이를 읽을 수 없습니다. 파일을 업로드하세요.",https:"URL은 HTTPS여야 합니다.",pollFail:"현재 진행 상태를 읽을 수 없습니다. 계속 다시 시도합니다."},
 fr:{url:"Ou collez une URL vidéo/audio directement lisible",probe:"Vérifier la durée",probing:"Vérification…",urlLead:"Si l’URL d’une page n’est pas lisible directement, importez le fichier. Aucun service de téléchargement universel non fiable n’est utilisé.",duration:"Durée détectée",minutes:"Minutes facturées",target:"Traduire vers",working:"Création du projet…",price:"Voir le prix",billing:"La facturation dépend de la durée source et de la langue cible. Le traitement commence après confirmation et paiement.",status:"État",open:"Ouvrir le résultat",topup:"La durée réelle est plus longue que prévu et nécessite un complément",topupRun:"Payer le complément",service:"Le doublage vidéo est temporairement indisponible.",probeFail:"Impossible de lire la durée. Importez le fichier.",https:"L’URL doit utiliser HTTPS.",pollFail:"Impossible de lire la progression pour le moment. Le système réessaiera."},
 de:{url:"Oder direkt lesbare Video-/Audio-URL einfügen",probe:"Dauer prüfen",probing:"Prüfung…",urlLead:"Wenn eine Webseiten-URL nicht direkt lesbar ist, Datei hochladen. Unbekannte Universal-Downloader werden nicht verwendet.",duration:"Erkannte Dauer",minutes:"Abrechenbare Minuten",target:"Übersetzen nach",working:"Projekt wird erstellt…",price:"Preis anzeigen",billing:"Abrechnung nach Quelldauer und Zielsprache. Verarbeitung startet nach Preisbestätigung und Zahlung.",status:"Status",open:"Ergebnis öffnen",topup:"Die tatsächliche Dauer ist länger als geschätzt; ein Aufpreis ist nötig",topupRun:"Differenz zahlen und fortfahren",service:"Video-Synchronisation ist vorübergehend nicht verfügbar.",probeFail:"Mediendauer konnte nicht gelesen werden. Datei hochladen.",https:"Die URL muss HTTPS verwenden.",pollFail:"Fortschritt kann gerade nicht gelesen werden. Das System versucht es weiter."},
 es:{url:"O pega una URL de vídeo/audio directamente legible",probe:"Comprobar duración",probing:"Comprobando…",urlLead:"Si una página no se puede leer directamente, sube el archivo. No se usan descargadores universales de origen desconocido.",duration:"Duración detectada",minutes:"Minutos facturables",target:"Traducir a",working:"Creando proyecto…",price:"Ver precio",billing:"Se cobra según la duración del medio y el idioma de destino. El proceso comienza tras confirmar y pagar.",status:"Estado",open:"Abrir resultado",topup:"La duración real es mayor de la estimada y requiere un complemento",topupRun:"Pagar diferencia y continuar",service:"El doblaje de vídeo no está disponible temporalmente.",probeFail:"No se pudo leer la duración. Sube el archivo.",https:"La URL debe usar HTTPS.",pollFail:"No se puede leer el progreso ahora. El sistema seguirá intentando."},
 pt:{url:"Ou cole uma URL de vídeo/áudio diretamente legível",probe:"Verificar duração",probing:"Verificando…",urlLead:"Se uma página não puder ser lida diretamente, envie o arquivo. Não usamos serviços universais de download desconhecidos.",duration:"Duração detectada",minutes:"Minutos cobrados",target:"Traduzir para",working:"Criando projeto…",price:"Ver preço",billing:"A cobrança usa a duração da mídia e o idioma alvo. O processamento começa após confirmação e pagamento.",status:"Status",open:"Abrir resultado",topup:"A duração real é maior que a estimada e exige complemento",topupRun:"Pagar diferença e continuar",service:"A dublagem de vídeo está temporariamente indisponível.",probeFail:"Não foi possível ler a duração. Envie o arquivo.",https:"A URL deve usar HTTPS.",pollFail:"Não foi possível ler o progresso agora. O sistema continuará tentando."},
 ar:{url:"أو الصق رابط فيديو / صوت يمكن قراءته مباشرة",probe:"فحص المدة",probing:"جارٍ الفحص…",urlLead:"إذا تعذر قراءة رابط صفحة مباشرة فارفع الملف. لا نستخدم خدمات تنزيل شاملة مجهولة المصدر.",duration:"المدة المكتشفة",minutes:"الدقائق المحسوبة",target:"الترجمة إلى",working:"جارٍ إنشاء المشروع…",price:"عرض السعر",billing:"تُحسب التكلفة حسب مدة الوسائط واللغة المستهدفة. تبدأ المعالجة بعد تأكيد السعر والدفع.",status:"الحالة",open:"فتح النتيجة",topup:"المدة الفعلية أطول من التقدير وتحتاج إلى دفع فرق",topupRun:"دفع الفرق والمتابعة",service:"خدمة دبلجة الفيديو غير متاحة مؤقتًا.",probeFail:"تعذر قراءة مدة الوسائط. ارفع الملف بدلًا من ذلك.",https:"يجب أن يستخدم الرابط HTTPS.",pollFail:"تعذر قراءة التقدم الآن. سيواصل النظام المحاولة."}
};

function probeMedia(src:string,msg:string,timeoutMs=15000){
 return new Promise<number>((resolve,reject)=>{
  const el=document.createElement("video"),cleanup=()=>{clearTimeout(timer);el.removeAttribute("src");el.load()},timer=setTimeout(()=>{cleanup();reject(new Error(msg))},timeoutMs);
  el.preload="metadata";el.onloadedmetadata=()=>{const d=el.duration;cleanup();Number.isFinite(d)&&d>0?resolve(d):reject(new Error(msg))};el.onerror=()=>{cleanup();reject(new Error(msg))};el.src=src;
 });
}
export default function VideoDubbingWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[url,setUrl]=useState(""),[target,setTarget]=useState("en"),[duration,setDuration]=useState(0),[probeBusy,setProbeBusy]=useState(false),[busy,setBusy]=useState(false),[quoteId,setQuoteId]=useState(""),[projectId,setProjectId]=useState(""),[languageId,setLanguageId]=useState(""),[status,setStatus]=useState(""),[output,setOutput]=useState(""),[error,setError]=useState(""),[topupRequired,setTopupRequired]=useState(0),[topupQuoteId,setTopupQuoteId]=useState(""),[pollError,setPollError]=useState("");
 const obj=useRef(""),topupTimer=useRef<ReturnType<typeof setInterval>|null>(null),file=files[0]||null;
 const minutes=duration>0?Math.max(1,Math.ceil(duration/60)):0;
 async function setAndProbeFiles(next:File[]){
  if(obj.current){URL.revokeObjectURL(obj.current);obj.current=""}
  setFiles(next);setUrl("");setDuration(0);setProjectId("");setOutput("");setError("");setPollError("");
  if(!next[0])return;obj.current=URL.createObjectURL(next[0]);
  try{setDuration(await probeMedia(obj.current,c.probeFail))}catch(e){setError(e instanceof Error?e.message:String(e))}
 }
 useEffect(()=>()=>{if(obj.current)URL.revokeObjectURL(obj.current);if(topupTimer.current)clearInterval(topupTimer.current)},[]);
 async function probeUrl(){
  if(!url.trim())return;setProbeBusy(true);setError("");setDuration(0);
  try{const u=new URL(url.trim());if(u.protocol!=="https:")throw new Error(c.https);setDuration(await probeMedia(u.toString(),c.probeFail))}
  catch(e){setError(e instanceof Error?e.message:String(e))}finally{setProbeBusy(false)}
 }
 async function start(paidQuoteId:string){
  if((!file&&!url.trim())||!minutes)return;setBusy(true);setError("");setPollError("");setOutput("");setStatus(c.working);setQuoteId(paidQuoteId);
  try{
   const form=new FormData();form.set("target_language",target);form.set("quote_id",paidQuoteId);form.set("item_key","dub-0");form.set("paid_minutes",String(minutes));
   if(file)form.set("file",file,file.name);else form.set("source_url",url.trim());
   const res=await fetch("/api/ai/dub/create",{method:"POST",body:form});const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.error==="ELEVENLABS_NOT_CONFIGURED"?c.service:(data.detail||data.error||"CREATE_FAILED"));
   if(!data.project_id)throw new Error("EMPTY_PROJECT_ID");
   setProjectId(data.project_id);setLanguageId(data.language_id||"");setStatus(data.status||"queued");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStatus("")}finally{setBusy(false)}
 }
 useEffect(()=>{
  if(!projectId||!quoteId||output)return;
  let failures=0;
  const timer=setInterval(async()=>{
   try{
    const endpoint=languageId?`/api/ai/dub/language-status?project_id=${encodeURIComponent(projectId)}&language_id=${encodeURIComponent(languageId)}&quote_id=${encodeURIComponent(quoteId)}`:`/api/ai/dub/status?project_id=${encodeURIComponent(projectId)}&quote_id=${encodeURIComponent(quoteId)}`;
    const r=await fetch(endpoint,{cache:"no-store"}),d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||"STATUS_FAILED");
    failures=0;setPollError("");setStatus(d.status||"");
    if(languageId){
     const candidate=d.outputs?.video||d.outputs?.dubbed_video||d.outputs?.lossless_audio||Object.values(d.outputs||{})[0];
     if(typeof candidate==="string"&&candidate){setOutput(candidate);clearInterval(timer)}
    }else{
     if(d.language_id)setLanguageId(d.language_id);
     if(d.error==="TOPUP_REQUIRED"){setTopupRequired(Number(d.required_minutes)||0);setError(`${c.topup} · ${Number(d.required_minutes)||0} ${c.minutes}`)}else setTopupRequired(0);
    }
   }catch{failures++;if(failures>=2)setPollError(c.pollFail)}
  },5000);
  return()=>clearInterval(timer);
 },[projectId,languageId,quoteId,output,c.pollFail,c.topup,c.minutes]);
 async function topup(){
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/quote/topup",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({parentQuoteId:quoteId,requiredQuantity:topupRequired})}),d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error||"TOPUP_QUOTE_FAILED");
   if(d.alreadyEnough){setTopupRequired(0);return}
   if(!d.id)throw new Error("EMPTY_TOPUP_QUOTE");
   setTopupQuoteId(d.id);const w=window.open(`/tools/pay?quoteId=${encodeURIComponent(d.id)}`,"lingxi_tool_topup","width=720,height=820");if(!w)location.href=`/tools/pay?quoteId=${encodeURIComponent(d.id)}`;
   if(topupTimer.current)clearInterval(topupTimer.current);
   topupTimer.current=setInterval(async()=>{try{const s=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(d.id)}`,{cache:"no-store"});if(!s.ok)return;const j=await s.json();if(j.paid){if(topupTimer.current)clearInterval(topupTimer.current);topupTimer.current=null;setTopupRequired(0);setError("")}}catch{}},2200);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 return <div className="space-y-5">
  <FileDropzone accept="video/*,audio/*" files={files} onChange={setAndProbeFiles} disabled={busy} kind="media" maxSizeMB={500}/>
  <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4"><label className="text-sm font-medium text-[var(--lx-ink)]">{c.url}</label><input value={url} disabled={busy} onChange={e=>{setUrl(e.target.value);setFiles([]);setDuration(0)}} placeholder="https://...mp4" className="mt-2 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-2.5 text-[var(--lx-ink)] outline-none"/><button onClick={probeUrl} disabled={!url.trim()||probeBusy} className="mt-3 rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm text-[var(--lx-ink)]">{probeBusy?c.probing:c.probe}</button><p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{c.urlLead}</p></div>
  {duration>0&&<div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm text-[var(--lx-muted)]">{c.duration}: {Math.floor(duration/60)}m {Math.round(duration%60)}s · <b className="text-[var(--lx-ink)]">{c.minutes}: {minutes}</b></div>}
  <label className="text-sm text-[var(--lx-muted)]">{c.target}<select value={target} onChange={e=>setTarget(e.target.value)} disabled={busy} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]">{LANGS.map(([v,n])=><option value={v} key={v}>{n}</option>)}</select></label>
  {busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{c.working}</button>:minutes>0?<PaidActionButton toolId="video-dubbing" quantity={minutes} metadata={{detectedDurationSeconds:Math.round(duration),targetLanguage:target}} onPaid={start} label={c.price}/>:null}
  <div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">{c.billing}</div>
  {status&&<div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-muted)]">{c.status}: <strong className="text-[var(--lx-ink)]">{status}</strong></div>}
  {pollError&&<p className="text-sm text-[var(--lx-danger)]">{pollError}</p>}
  {output&&<a href={output} target="_blank" rel="noreferrer" className="inline-flex rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{c.open}</a>}
  {topupRequired>0&&quoteId&&<div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4"><div className="text-sm font-medium text-[var(--lx-ink)]">{c.topup} · {topupRequired} {c.minutes}</div><button onClick={topup} disabled={busy} className="mt-3 rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">{c.topupRun}</button>{topupQuoteId&&<div className="mt-2 text-xs text-[var(--lx-faint)]">{topupQuoteId}</div>}</div>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
