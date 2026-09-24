"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const C={
 title:c("工具任务与已保存结果","Tool tasks & saved results","ツール作業と保存済み結果","도구 작업 및 저장된 결과","Tâches et résultats enregistrés","Tool-Aufgaben & gespeicherte Ergebnisse","Tareas y resultados guardados","Tarefas e resultados salvos","مهام الأدوات والنتائج المحفوظة"),
 lead:c("已完成的服务器结果可以重新查看；只在浏览器本地生成的文件不会伪装成云端永久保存。","Completed server-side results can be reopened. Files generated only in the browser are never presented as permanently stored in the cloud.","サーバー側で完了した結果は再表示できます。ブラウザ内だけで生成されたファイルをクラウドに永久保存済みとは表示しません。","서버에서 완료된 결과는 다시 볼 수 있습니다. 브라우저 로컬에서만 생성된 파일을 클라우드에 영구 저장된 것처럼 표시하지 않습니다.","Les résultats serveur terminés peuvent être rouverts. Les fichiers générés uniquement dans le navigateur ne sont jamais présentés comme stockés durablement dans le cloud.","Abgeschlossene Server-Ergebnisse können erneut geöffnet werden. Nur lokal erzeugte Dateien werden nicht als dauerhaft in der Cloud gespeichert dargestellt.","Los resultados completados en servidor pueden volver a abrirse. Los archivos generados solo en el navegador no se presentan como almacenados permanentemente en la nube.","Resultados concluídos no servidor podem ser reabertos. Arquivos gerados apenas no navegador não são apresentados como armazenados permanentemente na nuvem.","يمكن إعادة فتح النتائج المكتملة على الخادم. ولا تُعرض الملفات التي أُنشئت محليًا في المتصفح على أنها محفوظة دائمًا في السحابة."),
 loading:c("正在读取任务…","Loading tasks…","タスクを読み込み中…","작업 불러오는 중…","Chargement des tâches…","Aufgaben werden geladen…","Cargando tareas…","Carregando tarefas…","جارٍ تحميل المهام…"),
 empty:c("这笔工具订单还没有任务记录。可以返回订单中心恢复原任务。","This tool order has no job records yet. Return to Orders to resume the original task.","このツール注文にはまだ作業記録がありません。注文ページに戻って元の作業を復元できます。","이 도구 주문에는 아직 작업 기록이 없습니다. 주문 센터로 돌아가 원래 작업을 복구할 수 있습니다.","Cette commande n’a pas encore de tâche. Revenez aux commandes pour reprendre la tâche d’origine.","Für diese Tool-Bestellung gibt es noch keinen Task. Kehren Sie zu den Bestellungen zurück, um ihn fortzusetzen.","Este pedido aún no tiene tareas. Vuelve a Pedidos para reanudar la tarea original.","Este pedido ainda não tem tarefas. Volte aos Pedidos para retomar a tarefa original.","لا توجد سجلات مهام لهذا الطلب بعد. عُد إلى الطلبات لاستئناف المهمة الأصلية."),
 failedLoad:c("暂时无法读取任务记录，请确认已登录后刷新。","Could not load task records. Make sure you are signed in and refresh.","タスク記録を読み込めません。ログインを確認して再読み込みしてください。","작업 기록을 불러올 수 없습니다. 로그인 상태를 확인한 뒤 새로고침하세요.","Impossible de charger les tâches. Vérifiez votre connexion puis actualisez.","Aufgaben konnten nicht geladen werden. Prüfen Sie Ihre Anmeldung und laden Sie neu.","No se pudieron cargar las tareas. Comprueba que has iniciado sesión y actualiza.","Não foi possível carregar as tarefas. Confirme o login e atualize.","تعذر تحميل سجلات المهام. تأكد من تسجيل الدخول ثم حدّث الصفحة."),
 completed:c("已完成","Completed","完了","완료","Terminé","Abgeschlossen","Completado","Concluído","مكتمل"),
 processing:c("处理中","Processing","処理中","처리 중","En traitement","In Verarbeitung","Procesando","Processando","قيد المعالجة"),
 failed:c("失败 · 可恢复","Failed · resumable","失敗 · 復元可能","실패 · 복구 가능","Échec · récupérable","Fehlgeschlagen · fortsetzbar","Fallido · reanudable","Falhou · retomável","فشل · قابل للاستئناف"),
 view:c("查看已保存结果","View saved result","保存済み結果を見る","저장된 결과 보기","Voir le résultat enregistré","Gespeichertes Ergebnis anzeigen","Ver resultado guardado","Ver resultado salvo","عرض النتيجة المحفوظة"),
 hide:c("收起结果","Hide result","結果を閉じる","결과 접기","Masquer le résultat","Ergebnis ausblenden","Ocultar resultado","Ocultar resultado","إخفاء النتيجة"),
 localOnly:c("最终文件只在当时浏览器本地生成，没有上传永久保存。可使用原付款恢复任务重新生成，不会重复收费。","The final file was generated only in the browser and was not uploaded for permanent storage. Resume with the original payment to regenerate it without another charge.","最終ファイルはブラウザ内だけで生成され、永久保存用にはアップロードされていません。元の支払いで復元して再生成できます。","최종 파일은 브라우저에서만 생성되었고 영구 저장되지 않았습니다. 기존 결제로 복구해 다시 생성할 수 있습니다.","Le fichier final a été généré uniquement dans le navigateur et n’a pas été stocké durablement. Reprenez avec le paiement initial pour le régénérer sans nouveau débit.","Die endgültige Datei wurde nur im Browser erzeugt und nicht dauerhaft gespeichert. Mit der ursprünglichen Zahlung können Sie sie ohne erneute Belastung neu erzeugen.","El archivo final se generó solo en el navegador y no se almacenó permanentemente. Reanúdalo con el pago original para regenerarlo sin otro cobro.","O arquivo final foi gerado apenas no navegador e não foi salvo permanentemente. Retome com o pagamento original para regenerá-lo sem nova cobrança.","تم إنشاء الملف النهائي داخل المتصفح فقط ولم يُحفظ دائمًا. استأنف المهمة بالدفعة الأصلية لإعادة إنشائه دون رسوم جديدة."),
 noResult:c("任务已完成，但没有可重新展示的服务器结果。可回订单中心恢复原任务。","The task completed, but there is no reusable server result. Return to Orders to resume the original task.","作業は完了していますが、再表示できるサーバー結果はありません。注文ページから元の作業を復元できます。","작업은 완료되었지만 다시 표시할 서버 결과가 없습니다. 주문 센터에서 원래 작업을 복구할 수 있습니다.","La tâche est terminée mais aucun résultat serveur réutilisable n’est disponible. Revenez aux commandes pour reprendre la tâche.","Die Aufgabe ist abgeschlossen, aber es gibt kein wiederverwendbares Server-Ergebnis. Kehren Sie zu den Bestellungen zurück.","La tarea terminó, pero no hay un resultado de servidor reutilizable. Vuelve a Pedidos para reanudarla.","A tarefa foi concluída, mas não há resultado de servidor reutilizável. Volte aos Pedidos para retomá-la.","اكتملت المهمة، لكن لا توجد نتيجة خادم قابلة لإعادة العرض. عُد إلى الطلبات لاستئناف المهمة."),
 back:c("← 返回我的订单","← Back to Orders","← 注文に戻る","← 주문으로 돌아가기","← Retour aux commandes","← Zurück zu Bestellungen","← Volver a Pedidos","← Voltar aos Pedidos","← العودة إلى الطلبات"),
 download:c("下载","Download","ダウンロード","다운로드","Télécharger","Herunterladen","Descargar","Baixar","تنزيل"),
 copy:c("复制文字","Copy text","テキストをコピー","텍스트 복사","Copier le texte","Text kopieren","Copiar texto","Copiar texto","نسخ النص"),
};
type Job={id:string;tool_id:string;item_key:string;units:number;status:string;updated_at:string};
type ResultState={loading?:boolean;loaded?:boolean;value?:any;error?:string};

function safeName(s:string){return s.replace(/[^\w.-]+/g,"-").slice(0,80)||"result"}
function downloadBlob(name:string,body:BlobPart,type:string){
  const blob=new Blob([body],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function imageHref(r:any){
  if(r&&typeof r.b64==="string"&&r.b64.length>20)return `data:image/png;base64,${r.b64}`;
  if(r&&typeof r.url==="string"&&(/^(https:\/\/|data:image\/)/i.test(r.url)))return r.url;
  return "";
}
function textValue(r:any){return r&&typeof r.text==="string"?r.text:r&&typeof r.raw==="string"?r.raw:""}

export default function ToolJobResultsClient({quoteId}:{quoteId:string}){
  const {lang}=useLingxiLang(),t=(x:Copy)=>x[lang]||x.en;
  const [jobs,setJobs]=useState<Job[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(false);
  const [results,setResults]=useState<Record<string,ResultState>>({});
  const valid=useMemo(()=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId),[quoteId]);

  useEffect(()=>{
    let alive=true;
    if(!valid){setLoading(false);setLoadError(true);return}
    void fetch(`/api/tools/jobs?quoteId=${encodeURIComponent(quoteId)}`,{cache:"no-store"})
      .then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"LOAD_FAILED");return d})
      .then(d=>{if(alive)setJobs(d.jobs||[])})
      .catch(()=>{if(alive)setLoadError(true)})
      .finally(()=>{if(alive)setLoading(false)});
    return()=>{alive=false};
  },[quoteId,valid]);

  async function toggle(job:Job){
    if(results[job.id]?.loaded){setResults(v=>({...v,[job.id]:{}}));return}
    setResults(v=>({...v,[job.id]:{loading:true}}));
    try{
      const r=await fetch(`/api/tools/jobs/result?quoteId=${encodeURIComponent(quoteId)}&jobId=${encodeURIComponent(job.id)}`,{cache:"no-store"});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"RESULT_FAILED");
      setResults(v=>({...v,[job.id]:{loaded:true,value:d.result??null}}));
    }catch(e){setResults(v=>({...v,[job.id]:{loaded:true,error:e instanceof Error?e.message:"RESULT_FAILED"}}))}
  }

  function render(job:Job,s:ResultState){
    if(s.loading)return <p className="mt-3 text-xs text-[var(--lx-muted)]">{t(C.loading)}</p>;
    if(!s.loaded)return null;
    if(s.error)return <p className="mt-3 text-xs text-rose-600">{s.error}</p>;
    const r=s.value;
    if(!r)return <p className="mt-3 text-xs leading-6 text-[var(--lx-muted)]">{t(C.noResult)}</p>;
    if(r.localProcessing===true&&!r.b64&&!r.url&&!r.text&&!r.raw)return <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">{t(C.localOnly)}</p>;
    const img=imageHref(r),txt=textValue(r);
    if(img)return <div className="mt-4"><img src={img} alt="" className="max-h-[520px] max-w-full rounded-xl border border-[var(--lx-line)] object-contain"/><a href={img} download={`lingxifield-${safeName(job.tool_id)}-${safeName(job.item_key)}.png`} className="mt-3 inline-flex rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.download)}</a></div>;
    if(txt)return <div className="mt-4"><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-xs leading-6">{txt}</pre><div className="mt-3 flex gap-2"><button onClick={()=>navigator.clipboard?.writeText(txt)} className="rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.copy)}</button><button onClick={()=>downloadBlob(`lingxifield-${safeName(job.tool_id)}-${safeName(job.item_key)}.txt`,txt,"text/plain;charset=utf-8")} className="rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.download)}</button></div></div>;
    const pretty=JSON.stringify(r,null,2);
    return <div className="mt-4"><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-xs leading-6">{pretty}</pre><button onClick={()=>downloadBlob(`lingxifield-${safeName(job.tool_id)}-${safeName(job.item_key)}.json`,pretty,"application/json;charset=utf-8")} className="mt-3 rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.download)}</button></div>;
  }

  return <section>
    <Link href="/account/orders" className="text-xs text-[var(--lx-muted)] hover:text-[var(--lx-ink)]">{t(C.back)}</Link>
    <h1 className="mt-4 font-display text-3xl font-light text-[var(--lx-ink)]">{t(C.title)}</h1>
    <p className="mt-2 mb-7 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">{t(C.lead)}</p>
    {loading&&<p className="lx11-legacy-panel p-6 text-sm text-[var(--lx-muted)]">{t(C.loading)}</p>}
    {!loading&&loadError&&<p className="lx11-legacy-panel p-6 text-sm text-rose-600">{t(C.failedLoad)}</p>}
    {!loading&&!loadError&&jobs.length===0&&<p className="lx11-legacy-panel p-6 text-sm text-[var(--lx-muted)]">{t(C.empty)}</p>}
    <div className="space-y-3">{jobs.map(job=>{
      const sc=job.status==="completed"?C.completed:job.status==="processing"?C.processing:C.failed,s=results[job.id]||{};
      return <article key={job.id} className="lx11-legacy-panel p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-[var(--lx-ink)]">{job.tool_id}</p><p className="mt-1 text-xs text-[var(--lx-muted)]">{job.item_key} · {job.units} unit(s)</p><p className="mt-1 text-[11px] text-[var(--lx-faint)]">{new Date(job.updated_at).toLocaleString()}</p></div><span className="rounded-full border border-[var(--lx-line)] px-3 py-1 text-[11px] text-[var(--lx-muted)]">{t(sc)}</span></div>{job.status==="completed"&&<button type="button" onClick={()=>void toggle(job)} className="mt-4 rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs text-[var(--lx-ink)]">{s.loaded?t(C.hide):t(C.view)}</button>}{job.status==="failed"&&<p className="mt-3 text-xs leading-6 text-[var(--lx-muted)]">{t(C.noResult)}</p>}{render(job,s)}</article>;
    })}</div>
  </section>;
}
