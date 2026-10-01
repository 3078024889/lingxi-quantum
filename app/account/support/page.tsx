"use client";
import Image from"next/image";
import{useCallback,useEffect,useState}from"react";
import Nav from"@/components/Nav";
import Footer from"@/components/Footer";
import{createClient}from"@/lib/supabase/client";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";

const COPY:Record<LingxiLang,any>={
 zh:{k:"LINGXIFIELD CARE",title:"我的问题",lead:"查看你提交的问题、截图和处理进度。邮件往返也会同步到这里。",tell:"告诉我们",loading:"正在读取…",empty:"目前没有问题记录。",steps:["已收到","已查看","处理中","已完成"],issue:"使用问题",email:"联系邮箱",reply:"最近回复",agent:"灵犀场回复",customer:"你的回复",done:"这个问题已经完成处理。如仍有问题，可以继续回复原邮件，或再次告诉我们。"},
 en:{k:"LINGXIFIELD CARE",title:"My issues",lead:"See your submitted issues, screenshots and progress. Email replies are synced here too.",tell:"Tell us",loading:"Loading…",empty:"No issues yet.",steps:["Received","Viewed","In progress","Completed"],issue:"Usage issue",email:"Contact email",reply:"Latest reply",agent:"LINGXIFIELD reply",customer:"Your reply",done:"This issue has been completed. If anything remains, reply to the same email thread or tell us again."},
 ja:{k:"LINGXIFIELD CARE",title:"お問い合わせ",lead:"送信した問題、スクリーンショット、対応状況を確認できます。メール返信もここに同期されます。",tell:"知らせる",loading:"読み込み中…",empty:"問題記録はありません。",steps:["受信","確認済み","対応中","完了"],issue:"利用上の問題",email:"連絡先メール",reply:"最新の返信",agent:"LINGXIFIELD からの返信",customer:"あなたの返信",done:"この問題の対応は完了しました。必要なら同じメールに返信できます。"},
 ko:{k:"LINGXIFIELD CARE",title:"내 문의",lead:"제출한 문제, 스크린샷, 처리 진행 상황을 확인하세요. 이메일 답장도 여기에 동기화됩니다.",tell:"알려주기",loading:"불러오는 중…",empty:"문의 기록이 없습니다.",steps:["접수","확인","처리 중","완료"],issue:"사용 문제",email:"연락 이메일",reply:"최근 답변",agent:"LINGXIFIELD 답변",customer:"내 답변",done:"이 문제의 처리가 완료되었습니다. 필요한 경우 같은 이메일에 계속 답장할 수 있습니다."},
 fr:{k:"LINGXIFIELD CARE",title:"Mes demandes",lead:"Consultez vos demandes, captures et leur progression. Les réponses par e-mail sont aussi synchronisées ici.",tell:"Nous écrire",loading:"Chargement…",empty:"Aucune demande.",steps:["Reçu","Vu","En cours","Terminé"],issue:"Problème d’utilisation",email:"E-mail",reply:"Dernière réponse",agent:"Réponse LINGXIFIELD",customer:"Votre réponse",done:"Cette demande est terminée. Vous pouvez répondre au même e-mail si nécessaire."},
 de:{k:"LINGXIFIELD CARE",title:"Meine Anliegen",lead:"Hier sehen Sie Ihre Anliegen, Screenshots und den Bearbeitungsstand. E-Mail-Antworten werden ebenfalls synchronisiert.",tell:"Mitteilung senden",loading:"Wird geladen…",empty:"Noch keine Anliegen.",steps:["Eingegangen","Gesehen","In Bearbeitung","Erledigt"],issue:"Nutzungsproblem",email:"Kontakt-E-Mail",reply:"Letzte Antwort",agent:"LINGXIFIELD-Antwort",customer:"Ihre Antwort",done:"Dieses Anliegen ist abgeschlossen. Bei Bedarf können Sie im selben E-Mail-Verlauf antworten."},
 es:{k:"LINGXIFIELD CARE",title:"Mis consultas",lead:"Consulta tus problemas, capturas y progreso. Las respuestas por correo también se sincronizan aquí.",tell:"Cuéntanos",loading:"Cargando…",empty:"Aún no hay consultas.",steps:["Recibido","Visto","En proceso","Completado"],issue:"Problema de uso",email:"Correo de contacto",reply:"Última respuesta",agent:"Respuesta de LINGXIFIELD",customer:"Tu respuesta",done:"Este problema se ha completado. Si hace falta, responde al mismo correo."},
 pt:{k:"LINGXIFIELD CARE",title:"Meus chamados",lead:"Veja seus problemas, capturas e andamento. As respostas por e-mail também aparecem aqui.",tell:"Fale conosco",loading:"Carregando…",empty:"Ainda não há chamados.",steps:["Recebido","Visto","Em andamento","Concluído"],issue:"Problema de uso",email:"E-mail de contato",reply:"Resposta mais recente",agent:"Resposta da LINGXIFIELD",customer:"Sua resposta",done:"Este chamado foi concluído. Se necessário, responda ao mesmo e-mail."},
 ar:{k:"LINGXIFIELD CARE",title:"طلباتي",lead:"اعرض المشكلات التي أرسلتها ولقطات الشاشة وتقدم المعالجة. تتم مزامنة الردود عبر البريد هنا أيضًا.",tell:"أخبرنا",loading:"جارٍ التحميل…",empty:"لا توجد طلبات حتى الآن.",steps:["تم الاستلام","تمت المشاهدة","قيد المعالجة","مكتمل"],issue:"مشكلة استخدام",email:"بريد التواصل",reply:"أحدث رد",agent:"رد LINGXIFIELD",customer:"ردك",done:"اكتملت معالجة هذه المشكلة. يمكنك الرد على نفس رسالة البريد عند الحاجة."}
};

function stageOf(x:any){
 const l=x?.context?.support?.lifecycle||{};
 if(l.completedAt||x.status==="fixed"||x.status==="closed")return 3;
 if(l.processingAt||x.status==="reviewing"||x.status==="processing")return 2;
 if(l.viewedAt||x.status==="viewed")return 1;
 return 0;
}
export default function Page(){
 const{lang}=useLingxiLang(),c=COPY[lang]||COPY.en;
 const[items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true);

 const load=useCallback(async()=>{
  const s=createClient(),{data:{session}}=await s.auth.getSession();
  if(!session){location.href="/account?next=/account/support";return}
  const r=await fetch("/api/support/tickets",{headers:{authorization:`Bearer ${session.access_token}`},cache:"no-store"});
  if(r.ok)setItems((await r.json()).items||[]);
  setLoading(false);
 },[]);

 useEffect(()=>{
  load();
  const timer=window.setInterval(()=>{if(document.visibilityState==="visible")load()},15000);
  const focus=()=>load();
  window.addEventListener("focus",focus);
  return()=>{window.clearInterval(timer);window.removeEventListener("focus",focus)}
 },[load]);

 return <><Nav/><main className="lx11-page"><section className="mx-auto max-w-3xl px-6 py-16">
  <p className="text-xs uppercase tracking-[.18em] opacity-45">{c.k}</p>
  <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
   <div><h1 className="text-3xl font-semibold">{c.title}</h1><p className="mt-3 text-sm leading-6 opacity-60">{c.lead}</p></div>
   <button className="rounded-xl border px-4 py-2 text-sm" onClick={()=>window.dispatchEvent(new Event("lingxifield:feedback"))}>{c.tell}</button>
  </div>
  <div className="mt-8 grid gap-4">
   {loading?<div className="rounded-2xl border p-6 text-sm opacity-60">{c.loading}</div>:items.length?items.map(x=>{
    const at=stageOf(x),life=x?.context?.support?.lifecycle||{};
    return <article key={x.id} className="rounded-2xl border border-black/10 p-5">
     <div className="flex flex-wrap justify-between gap-3">
      <div><b className="text-base">{x.title||c.issue}</b><div className="mt-1 text-xs opacity-45">{String(x.id).slice(0,8)} · {new Date(x.created_at).toLocaleString()}</div></div>
      <span className="rounded-full bg-black/5 px-3 py-1 text-xs">{c.steps[at]}</span>
     </div>
     <div className="mt-5 grid grid-cols-4 gap-2">{c.steps.map((n:string,i:number)=><div key={n}><div className={`h-1.5 rounded-full ${i<=at?"bg-black":"bg-black/10"}`}/><div className={`mt-2 text-xs ${i<=at?"opacity-80":"opacity-35"}`}>{n}</div></div>)}</div>
     <p className="mt-5 whitespace-pre-wrap text-sm leading-6 opacity-75">{x.message}</p>
     {x.contact&&<p className="mt-3 text-xs opacity-50">{c.email}：{x.contact}</p>}
     {life.lastReplyPreview&&<div className="mt-4 rounded-xl bg-black/[.035] p-4"><div className="text-xs font-medium opacity-55">{life.lastReplySource==="agent"?c.agent:c.customer} · {c.reply}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 opacity-75">{life.lastReplyPreview}</p></div>}
     {x.attachmentUrls?.length>0&&<div className="mt-4 grid grid-cols-4 gap-2">{x.attachmentUrls.map((url:string,i:number)=><a href={url} target="_blank" rel="noreferrer" key={url} className="relative aspect-square overflow-hidden rounded-xl bg-black/5"><Image src={url} alt={`${c.issue} ${i+1}`} fill unoptimized className="object-cover"/></a>)}</div>}
     {at===3&&<div className="mt-5 rounded-xl bg-black/[.035] p-4 text-sm leading-6">{c.done}</div>}
    </article>
   }):<div className="rounded-2xl border p-8 text-sm opacity-60">{c.empty}</div>}
  </div>
 </section></main><Footer/></>
}
