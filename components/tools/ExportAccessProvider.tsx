"use client";
import {useEffect,useRef,useState} from 'react';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import PaidExportButton from './PaidExportButton';
import {installExportGate,ensureToolExportAccess,restoreExportAccess,type ExportAccessRequest} from '@/lib/tools/commerce/export-access-client';
import {METERED_EXPORT_TOOL_ID} from '@/lib/tools/commerce/metered-catalog';
import {savePaidTaskDraft,loadPaidTaskDraft,deletePaidTaskDraft} from '@/lib/tools/workspace/paid-task-draft';
import {downloadBlob} from '@/lib/tools/shared/download';
const TEXT={
 zh:['保存或发送结果','确认费用后导出','继续','取消','暂时无法确认导出权限，请重试。','重试','已用完免费额度，请确认价格后继续。','登录后继续','文件已准备好，请继续保存或发送。'],
 en:['Save or send your result','Confirm export price','Continue','Cancel','Export access could not be checked. Please retry.','Retry','The free allowance is used. Confirm the price to continue.','Sign in to continue','Your file is ready. Continue to save or send it.'],
 ja:['結果を保存・送信','料金を確認して書き出す','続ける','キャンセル','書き出しを確認できません。再試行してください。','再試行','無料枠を使い切りました。料金を確認してください。','ログインして続ける','ファイルの準備ができました。保存・送信を続けてください。'],
 ko:['결과 저장 또는 보내기','요금 확인 후 내보내기','계속','취소','내보내기를 확인할 수 없습니다. 다시 시도하세요.','재시도','무료 한도를 사용했습니다. 요금을 확인하세요.','로그인 후 계속','파일이 준비되었습니다. 저장하거나 보내세요.'],
 fr:['Enregistrer ou envoyer','Confirmer le prix','Continuer','Annuler','Impossible de vérifier l’accès. Réessayez.','Réessayer','Le quota gratuit est épuisé. Confirmez le prix.','Se connecter','Le fichier est prêt. Continuez pour l’enregistrer ou l’envoyer.'],
 de:['Ergebnis speichern oder senden','Exportpreis bestätigen','Weiter','Abbrechen','Export konnte nicht geprüft werden. Erneut versuchen.','Erneut versuchen','Das kostenlose Kontingent ist aufgebraucht. Preis bestätigen.','Anmelden und fortfahren','Die Datei ist bereit. Zum Speichern oder Senden fortfahren.'],
 es:['Guardar o enviar el resultado','Confirmar precio','Continuar','Cancelar','No se pudo verificar el acceso. Reintenta.','Reintentar','Se agotó el cupo gratuito. Confirma el precio.','Iniciar sesión','El archivo está listo. Continúa para guardarlo o enviarlo.'],
 pt:['Salvar ou enviar resultado','Confirmar preço','Continuar','Cancelar','Não foi possível verificar o acesso. Tente novamente.','Tentar novamente','A cota gratuita acabou. Confirme o preço.','Entrar para continuar','O arquivo está pronto. Continue para salvar ou enviar.'],
 ar:['حفظ النتيجة أو إرسالها','تأكيد السعر','متابعة','إلغاء','تعذر التحقق من التصدير. أعد المحاولة.','إعادة المحاولة','انتهى الحد المجاني. أكد السعر للمتابعة.','تسجيل الدخول','الملف جاهز. تابع للحفظ أو الإرسال.'],
} as const;
type Pending={request:ExportAccessRequest;paidUnits:number;loginRequired:boolean;phase:'payment'|'ready'|'error';resolve:(ok:boolean)=>void};
export default function ExportAccessProvider(){
 const {lang}=useLingxiLang(),c=TEXT[lang]||TEXT.en;
 const [pending,setPending]=useState<Pending|null>(null),pendingRef=useRef<Pending|null>(null),working=useRef(false),dialog=useRef<HTMLDialogElement>(null);
 function update(value:Pending|null){pendingRef.current=value;setPending(value)}
 async function check(request:ExportAccessRequest){
  const r=await fetch('/api/tools/free-export',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:request.id,toolId:request.toolId,units:request.units})});
  const data=await r.json().catch(()=>({}));
  if((r.status!==402&&!r.ok)||data.id!==request.id||typeof data.allowed!=='boolean')throw Error('EXPORT_CHECK_FAILED');
  if(!data.allowed&&(!Number.isSafeInteger(data.paidUnits)||data.paidUnits<1||data.paidUnits>request.units))throw Error('EXPORT_CHECK_FAILED');
  return data as {allowed:boolean;paidUnits:number;loginRequired:boolean};
 }
 useEffect(()=>{
  const uninstall=installExportGate(async request=>{
   if(working.current||pendingRef.current)return false;
   working.current=true;
   let data:Awaited<ReturnType<typeof check>>|null=null;try{data=await check(request)}catch{}finally{working.current=false}
   if(data?.allowed&&(request.intent!=='share'||navigator.userActivation?.isActive))return true;
   return new Promise<boolean>(resolve=>update({request,resolve,paidUnits:data?.paidUnits||0,loginRequired:data?.loginRequired||false,phase:data?(data.allowed?'ready':'payment'):'error'}));
  });
  const id=new URLSearchParams(location.search).get('resumeDraft');
  if(id)void loadPaidTaskDraft<{toolId:string;units:number}>(id).then(row=>{
   if(!row||row.toolId!==METERED_EXPORT_TOOL_ID||!row.file||row.state.toolId!==location.pathname.match(/\/tools\/([^/?#]+)/)?.[1])return;
   const blob=row.file,name=row.fileName||'result';restoreExportAccess(blob,id,row.state.units);
   void ensureToolExportAccess(blob,name).then(()=>downloadBlob(blob,name)).catch(()=>{});
  }).catch(()=>{});
  return()=>{uninstall();pendingRef.current?.resolve(false)};
 },[]);
 useEffect(()=>{if(pending&&!dialog.current?.open)dialog.current?.showModal()},[pending]);
 function cancel(){pendingRef.current?.resolve(false);update(null)}
 async function retry(){const current=pendingRef.current;if(!current)return;try{const data=await check(current.request);update({...current,paidUnits:data.paidUnits,loginRequired:data.loginRequired,phase:data.allowed?'ready':'payment'})}catch{update({...current,phase:'error'})}}
 async function persist(){const current=pendingRef.current;if(!current)throw Error('NO_EXPORT');const r=current.request;await savePaidTaskDraft({id:r.id,toolId:METERED_EXPORT_TOOL_ID,file:r.blob,fileName:r.name,fileType:r.blob.type,state:{toolId:r.toolId,units:r.units}})}
 async function paid(){const current=pendingRef.current;if(!current)return;const data=await check(current.request);if(!data.allowed)throw Error('EXPORT_NOT_UNLOCKED');update({...current,phase:'ready'})}
 function continueNow(){const current=pendingRef.current;if(!current)return;current.resolve(true);update(null);void deletePaidTaskDraft(current.request.id)}
 if(!pending)return null;
 return <dialog ref={dialog} onCancel={e=>{e.preventDefault();cancel()}} aria-labelledby="export-access-title" className="w-[calc(100%-2rem)] max-w-lg rounded-2xl border bg-[var(--lx-panel)] p-5 text-[var(--lx-ink)] backdrop:bg-black/40">
  <h2 id="export-access-title" className="text-lg font-semibold">{c[0]}</h2><p className="my-3 break-all text-sm">{pending.request.name}</p>
  {pending.phase==='ready'?<><p>{c[8]}</p><button type="button" onClick={continueNow} className="my-3 rounded-xl border px-4 py-3">{c[2]}</button></>:pending.phase==='error'?<><p role="alert">{c[4]}</p><button type="button" onClick={retry} className="my-3 rounded-xl border px-4 py-3">{c[5]}</button></>:<><p className="mb-3">{c[6]}</p><PaidExportButton toolId={METERED_EXPORT_TOOL_ID} quantity={pending.paidUnits} draftId={pending.request.id} metadata={{exportRequestId:pending.request.id}} beforePayment={persist} onUnlocked={()=>Boolean(pendingRef.current?.request.blob)} onCompleted={paid} label={c[1]}/>{pending.loginRequired&&<a className="mt-3 block underline" target="_blank" rel="noopener noreferrer" href={`/account?next=${encodeURIComponent(location.pathname)}`}>{c[7]}</a>}</>}
  <button type="button" onClick={cancel} className="mt-3 rounded-xl border px-4 py-2">{c[3]}</button>
 </dialog>;
}
