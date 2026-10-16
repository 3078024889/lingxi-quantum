"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import ToolUiText from './ToolUiText';
import FileDropzone from './FileDropzone';
import PaidActionButton from './PaidActionButton';
import ResultFileActions from './ResultFileActions';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {plainText} from '@/lib/tools/plain-copy';
import {translateSubtitleLocal} from '@/lib/tools/autonomous/subtitle-local';
import {translateSubtitleOnline} from '@/lib/tools/autonomous/subtitle-online';
import {downloadBlob} from '@/lib/tools/shared/download';
import {draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft} from '@/lib/tools/workspace/paid-task-draft';
const COPY={
 zh:['在线生成翻译预览','在线预览使用账户体验额度，额度不足会停止；仅发送字幕文字。','翻译尚未完成，请检查字幕或稍后重试。','请登录后重试，字幕文件仍保留在本页。','登录账户','使用在线翻译'],
 en:['Create online translation preview','Online previews use your account trial allowance and stop when it is exhausted. Only subtitle text is sent.','Translation is incomplete. Check the subtitles or retry later.','Sign in and retry. Your subtitle file stays on this page.','Sign in','Use online translation'],
 ja:['オンライン翻訳をプレビュー','アカウントの体験枠を利用し、枠がなくなると停止します。字幕の文字だけを送信します。','翻訳が未完了です。字幕を確認するか再試行してください。','ログインして再試行してください。字幕はこのページに保持されます。','ログイン','オンライン翻訳を使う'],
 ko:['온라인 번역 미리 보기','계정 체험 한도를 사용하며 소진되면 중단합니다. 자막 텍스트만 전송됩니다.','번역이 미완료입니다. 자막을 확인하거나 다시 시도하세요.','로그인 후 재시도하세요. 자막 파일은 이 페이지에 유지됩니다.','로그인','온라인 번역 사용'],
 fr:['Créer un aperçu en ligne','L’aperçu utilise votre quota d’essai et s’arrête à son épuisement. Seul le texte des sous-titres est envoyé.','Traduction incomplète. Vérifiez les sous-titres ou réessayez.','Connectez-vous puis réessayez. Le fichier reste sur cette page.','Se connecter','Utiliser la traduction en ligne'],
 de:['Online-Übersetzung ansehen','Die Vorschau nutzt das Testkontingent und stoppt bei dessen Ende. Nur Untertiteltext wird gesendet.','Übersetzung unvollständig. Untertitel prüfen oder erneut versuchen.','Anmelden und erneut versuchen. Die Datei bleibt auf dieser Seite.','Anmelden','Online übersetzen'],
 es:['Crear vista previa en línea','La vista previa usa el cupo de prueba y se detiene al agotarlo. Solo se envía el texto de subtítulos.','Traducción incompleta. Revisa los subtítulos o reintenta.','Inicia sesión y reintenta. El archivo sigue en esta página.','Iniciar sesión','Usar traducción en línea'],
 pt:['Criar prévia online','A prévia usa a cota de teste e para quando ela termina. Apenas o texto das legendas é enviado.','Tradução incompleta. Confira as legendas ou tente novamente.','Entre e tente novamente. O arquivo permanece nesta página.','Entrar','Usar tradução online'],
 ar:['إنشاء معاينة ترجمة عبر الإنترنت','تستخدم المعاينة حصة التجربة وتتوقف عند نفادها. يُرسل نص الترجمة فقط.','الترجمة غير مكتملة. تحقق من الملف أو حاول مجددًا.','سجّل الدخول وأعد المحاولة. يبقى الملف في هذه الصفحة.','تسجيل الدخول','استخدام الترجمة عبر الإنترنت'],
};
const LANGS={zh:'中文',en:'English',ja:'日本語',ko:'한국어',fr:'Français',de:'Deutsch',es:'Español',pt:'Português',ar:'العربية'};
export default function SubtitleTranslateWorkbench(){
 const {lang}=useLingxiLang(),c=COPY[lang];
 const [files,setFiles]=useState<File[]>([]),[target,setTarget]=useState('en'),[source,setSource]=useState('zh'),[busy,setBusy]=useState(false),[out,setOut]=useState(''),[name,setName]=useState('translated.srt'),[charCount,setCharCount]=useState(0),[error,setError]=useState(''),[draftId,setDraftId]=useState(''),[draftReady,setDraftReady]=useState(false),[restored,setRestored]=useState(false),[online,setOnline]=useState(true),[native,setNative]=useState(false),[needsLogin,setNeedsLogin]=useState(false),[delivered,setDelivered]=useState<{blob:Blob;name:string}|null>(null);
 const active=useRef<AbortController|null>(null);
 useEffect(()=>{const supported=Boolean((globalThis as any).Translator?.create);setNative(supported);setOnline(!supported);const id=new URLSearchParams(location.search).get('resumeDraft');if(!id){setRestored(true);return}void loadPaidTaskDraft<any>(id).then(d=>{if(d?.toolId==='subtitle-translate'){setFiles(draftFiles(d).slice(0,1));setDraftId(id);setSource(d.state?.source||'zh');setTarget(d.state?.target||'en');setOut(d.state?.out||'');setName(d.state?.name||'translated.srt');setCharCount(Number(d.state?.charCount||0));setOnline(d.state?.online??!supported)}setRestored(true)}).catch(()=>{setRestored(true);setError(c[2])});return()=>active.current?.abort()},[]);
 async function persist(){if(!files[0]||!draftId)throw Error('NO_SUBTITLE_DRAFT');await savePaidTaskDraft({id:draftId,toolId:'subtitle-translate',files:files.slice(0,1),state:{source,target,out,name,charCount,online}})}
 useEffect(()=>{setDraftReady(false);if(!restored||!files[0]||!draftId)return;let live=true;const timer=setTimeout(()=>{void persist().then(()=>{if(live)setDraftReady(true)}).catch(()=>{if(live)setError(c[2])})},120);return()=>{live=false;clearTimeout(timer)}},[files,source,target,out,name,charCount,draftId,restored,online]);
 async function run(){if(!files[0]||busy)return;const controller=new AbortController();active.current=controller;setBusy(true);setError('');setOut('');setNeedsLogin(false);try{const text=await files[0].text();setCharCount(text.length);const translated=online?await translateSubtitleOnline(text,target,source,controller.signal):await translateSubtitleLocal(text,target,source,controller.signal);controller.signal.throwIfAborted();setOut(translated);setName('translated-'+files[0].name)}catch(e){if(!controller.signal.aborted){const auth=e instanceof Error&&e.message==='AUTH_REQUIRED';setNeedsLogin(auth);setError(auth?c[3]:c[2])}}finally{active.current=null;setBusy(false)}}
 async function exportPaid(){if(!out)throw Error('SUBTITLE_RESULT_MISSING');const blob=new Blob([out],{type:name.toLowerCase().endsWith('.vtt')?'text/vtt':'application/x-subrip'});await downloadBlob(blob,name);setDelivered({blob,name})}
 return <div className="space-y-4">
  {delivered&&<ResultFileActions blob={delivered.blob} name={delivered.name}/>}
  <FileDropzone accept=".srt,.vtt,text/plain" files={files} normalizeDocuments={false} maxSizeMB={1} onChange={n=>{setFiles(n.slice(0,1));setOut('');setCharCount(0);setError('');setDraftId(n[0]?newPaidTaskDraftId():'')}} disabled={busy||!restored} kind="subtitle"/>
  <div className="grid gap-3 sm:grid-cols-2">{([['原语言',source,(v:string)=>{setSource(v);setOut('')}],['目标语言',target,(v:string)=>{setTarget(v);setOut('')}]] as const).map(([label,value,change])=><label className="text-sm" key={label}><ToolUiText text={label}/><select disabled={busy} value={value} onChange={e=>change(e.target.value)} className="ml-2 rounded-xl border px-3 py-2">{Object.entries(LANGS).map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>)}</div>
  {native&&<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={online} disabled={busy} onChange={e=>{setOnline(e.target.checked);setOut('')}}/>{c[5]}</label>}
  {online&&<p className="text-sm text-[var(--lx-muted)]">{c[1]}</p>}
  {files.length>0&&<button disabled={busy} onClick={()=>void run()} className="rounded-xl border px-4 py-2">{busy?plainText(lang,'working'):online?c[0]:<ToolUiText text="先免费生成翻译预览"/>}</button>}
  {busy&&<button onClick={()=>active.current?.abort()} className="ml-2 rounded-xl border px-4 py-2"><ToolUiText text="取消"/></button>}
  {out&&<><textarea aria-label="Translated subtitles" value={out} readOnly rows={12} className="w-full rounded-2xl border bg-[var(--lx-soft)] p-4 text-sm"/><p className="text-xs text-[var(--lx-muted)]"><ToolUiText text="源字幕约"/> {charCount.toLocaleString()} <ToolUiText text="字符；每 5,000 字符 ¥1 / $1。"/></p><PaidActionButton toolId="subtitle-translate" quantity={Math.max(1,charCount)} draftId={draftId} draftReady={draftReady} beforePayment={persist} metadata={{source,target,characters:charCount}} onPaid={exportPaid} label="查看字幕导出价格"/></>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}{needsLogin&&<Link target="_blank" rel="noreferrer" href="/account" className="underline">{c[4]} ↗</Link>}
 </div>;
}
