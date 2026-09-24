"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const C={
 title:c("工具任务与已保存结果","Tool tasks & saved results","ツール作業と保存済み結果","도구 작업 및 저장된 결과","Tâches et résultats enregistrés","Tool-Aufgaben & gespeicherte Ergebnisse","Tareas y resultados guardados","Tarefas e resultados salvos","مهام الأدوات والنتائج المحفوظة"),
 lead:c("这里只读取你自己的付费工具任务。已完成的服务器结果可以重新查看；本地浏览器生成的文件不会伪装成已永久保存。","Only your own paid-tool jobs are read here. Completed server-side results can be reopened; files generated only in your browser are never presented as permanently stored.","ここでは自分の有料ツール作業だけを読み込みます。サーバー側で完了した結果は再表示できますが、ブラウザ内だけで生成されたファイルを永久保存済みとは表示しません。","여기서는 본인의 유료 도구 작업만 읽습니다. 서버에서 완료된 결과는 다시 볼 수 있지만 브라우저 로컬에서만 생성된 파일을 영구 저장된 것처럼 표시하지 않습니다.","Seules vos tâches payantes sont lues ici. Les résultats serveur terminés peuvent être rouverts ; les fichiers générés uniquement dans le navigateur ne sont jamais présentés comme durablement enregistrés.","Hier werden nur Ihre eigenen bezahlten Tool-Aufgaben gelesen. Abgeschlossene Server-Ergebnisse können erneut geöffnet werden; nur lokal im Browser erzeugte Dateien werden nicht als dauerhaft gespeichert dargestellt.","Aquí solo se leen tus propias tareas de pago. Los resultados completados en servidor pueden volver a abrirse; los archivos generados solo en el navegador no se presentan como guardados permanentemente.","Aqui são lidas apenas as suas tarefas pagas. Resultados concluídos no servidor podem ser reabertos; arquivos gerados apenas no navegador não são apresentados como salvos permanentemente.","تُقرأ هنا مهام الأدوات المدفوعة الخاصة بك فقط. يمكن إعادة فتح النتائج المكتملة على الخادم، ولا تُعرض الملفات التي أُنشئت محليًا في المتصفح على أنها محفوظة دائمًا."),
 loading:c("正在读取任务…","Loading tasks…","タスクを読み込み中…","작업 불러오는 중…","Chargement des tâches…","Aufgaben werden geladen…","Cargando tareas…","Carregando tarefas…","جارٍ تحميل المهام…"),
 empty:c("这笔工具订单还没有任务记录。可以返回订单中心恢复原任务。","This tool order has no job records yet. Return to Orders to resume the original task.","このツール注文にはまだ作業記録がありません。注文ページに戻って元の作業を復元できます。","이 도구 주문에는 아직 작업 기록이 없습니다. 주문 센터로 돌아가 원래 작업을 복구할 수 있습니다.","Cette commande n’a pas encore de tâche. Revenez aux commandes pour reprendre la tâche d’origine.","Für diese Tool-Bestellung gibt es noch keinen Task. Kehren Sie zu den Bestellungen zurück, um ihn fortzusetzen.","Este pedido aún no tiene tareas. Vuelve a Pedidos para reanudar la tarea original.","Este pedido ainda não tem tarefas. Volte aos Pedidos para retomar a tarefa original.","لا توجد سجلات مهام لهذا الطلب بعد. عُد إلى الطلبات لاستئناف المهمة الأصلية."),
 failedLoad:c("暂时无法读取任务记录。请确认已登录后刷新。","Could not load task records. Make sure you are signed in and refresh.","タスク記録を読み込めません。ログインを確認して再読み込みしてください。","작업 기록을 불러올 수 없습니다. 로그인 상태를 확인한 뒤 새로고침하세요.","Impossible de charger les tâches. Vérifiez votre connexion puis actualisez.","Aufgaben konnten nicht geladen werden. Prüfen Sie Ihre Anmeldung und laden Sie neu.","No se pudieron cargar las tareas. Comprueba que has iniciado sesión y actualiza.","Não foi possível carregar as tarefas. Confirme o login e atualize.","تعذر تحميل سجلات المهام. تأكد من تسجيل الدخول ثم حدّث الصفحة."),
 completed:c("已完成","Completed","完了","완료","Terminé","Abgeschlossen","Completado","Concluído","مكتمل"),
 processing:c("处理中","Processing","処理中","처리 중","En traitement","In Verarbeitung","Procesando","Processando","قيد المعالجة"),
 failed:c("失败 · 可恢复","Failed · resumable","失敗 · 復元可能","실패 · 복구 가능","Échec · récupérable","Fehlgeschlagen · fortsetzbar","Fallido · reanudable","Falhou · retomável","فشل · قابل للاستئناف"),
 view:c("查看已保存结果","View saved result","保存済み結果を見る","저장된 결과 보기","Voir le résultat enregistré","Gespeichertes Ergebnis anzeigen","Ver resultado guardado","Ver resultado salvo","عرض النتيجة المحفوظة"),
 hide:c("收起结果","Hide result","結果を閉じる","결과 접기","Masquer le résultat","Ergebnis ausblenden","Ocultar resultado","Ocultar resultado","إخفاء النتيجة"),
 resultMissing:c("任务已完成，但没有可重新展示的服务器结果。可回到订单中心使用原付款恢复处理。","The task completed, but no reusable server result is stored. Return to Orders to resume processing with the original payment.","作業は完了していますが、再表示できるサーバー結果は保存されていません。注文ページから元の支払いで処理を再開できます。","작업은 완료되었지만 다시 표시할 서버 결과가 저장되어 있지 않습니다. 주문 센터에서 기존 결제로 처리를 복구할 수 있습니다.","La tâche est terminée mais aucun résultat serveur réutilisable n’est stocké. Revenez aux commandes pour reprendre avec le paiement initial.","Die Aufgabe ist abgeschlossen, aber es ist kein wiederverwendbares Server-Ergebnis gespeichert. Kehren Sie zu den Bestellungen zurück, um mit der ursprünglichen Zahlung fortzufahren.","La tarea terminó, pero no hay un resultado reutilizable guardado en servidor. Vuelve a Pedidos para continuar con el pago original.","A tarefa foi concluída, mas não há resultado reutilizável salvo no servidor. Volte aos Pedidos para retomar com o pagamento original.","اكتملت المهمة، لكن لا توجد نتيجة خادم قابلة لإعادة العرض. عُد إلى الطلبات لاستئناف المعالجة باستخدام الدفعة الأصلية."),
 localOnly:c("这项任务的最终文件只在当时的浏览器本地生成，没有上传永久保存。你仍可用原付款恢复任务并重新生成，不会重复收费。","The final file for this task was generated only in the browser and was not uploaded for permanent storage. You can resume with the original payment and regenerate it without another charge.","この作業の最終ファイルは当時のブラウザ内だけで生成され、永久保存のためにはアップロードされていません。元の支払いで作業を復元し、再生成できます。","이 작업의 최종 파일은 당시 브라우저에서만 생성되었고 영구 저장을 위해 업로드되지 않았습니다. 기존 결제로 작업을 복구해 다시 생성할 수 있습니다.","Le fichier final a été généré uniquement dans le navigateur et n’a pas été téléversé pour stockage permanent. Vous pouvez reprendre avec le paiement initial et le régénérer sans nouveau débit.","Die endgültige Datei wurde nur im Browser erzeugt und nicht dauerhaft hochgeladen. Sie können sie mit der ursprünglichen Zahlung ohne erneute Belastung neu erzeugen.","El archivo final se generó solo en el navegador y no se subió para almacenamiento permanente. Puedes reanudar con el pago original y regenerarlo sin otro cobro.","O arquivo final foi gerado apenas no navegador e não foi enviado para armazenamento permanente. Você pode retomar com o pagamento original e regenerá-lo sem nova cobrança.","تم إنشاء الملف النهائي داخل المتصفح فقط ولم يُرفع للتخزين الدائم. يمكنك استئناف المهمة بالدفعة الأصلية وإعادة إنشائه دون رسوم جديدة."),
 download:c("下载","Download","ダウンロード","다운로드","Télécharger","Herunterladen","Descargar","Baixar","تنزيل"),
 copy:c("复制文字","Copy text","テキストをコピー","텍스트 복사","Copier le texte","Text kopieren","Copiar texto","Copiar texto","نسخ النص"),
 back:c("← 返回我的订单","← Back to Orders","← 注文に戻る","← 주문으로 돌아가기","← Retour aux commandes","← Zurück zu Bestellungen","← Volver a Pedidos","← Voltar aos Pedidos","← العودة إلى الطلبات"),
};

type JobRow={id:string;tool_id:string;item_key:string;units:number;status:string;updated_at:string};
type ResultState={loading?:boolean;loaded?:boolean;value?:any;error?:boolean};

function safeFilename(s:string){return s.replace(/[^\w.-]+/g,"-").slice(0,80)||"result"}
function downloadBlob(name:string,body:BlobPart,type:string){
  const blob=new Blob([body],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function imageHref(result:any){
  if(result&&typeof result.b64==="string"&&result.b64.length>20)return `data:image/png;base64,${result.b64}`;
  if(result&&typeof result.url==="string"&&(/^(https:\/\/|data:image\/)/i.test(result.url)))return result.url;
  return "";
}
function textValue(result:any){
  if(result&&typeof result.text==="string")return result.text;
  if(result&&typeof result.raw==="string")return result.raw;
  return "";
}

export default function ToolJobResultsClient({quoteId}:{quoteId:string}){
  const {lang}=useLingxiLang();
  const t=(x:Copy)=>x[lang]||x.en;
  const [jobs,setJobs]=useState<JobRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState(false);
  const [results,setResults]=useState<Record<string,ResultState>>({});
  const validQuote=useMemo(()=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId),[quoteId]);

  useEffect(()=>{
    let alive=true;
    if(!validQuote){setLoading(false);setLoadError(true);return}
    const supabase=createClient();
    void (async()=>{
      const {data,error}=await supabase.from("tool_paid_jobs")
        .select("id,tool_id,item_key,units,status,updated_at")
        .eq("quote_id",quoteId)
        .order("updated_at",{ascending:false});
      if(!alive)return;
      if(error){setLoadError(true);setJobs([])}
      else setJobs((data??[]) as JobRow[]);
      setLoading(false);
    })();
    return()=>{alive=false};
  },[quoteId,validQuote]);

  async function toggleResult(job:JobRow){
    const current=results[job.id];
    if(current?.loaded){setResults(v=>({...v,[job.id]:{}}));return}
    setResults(v=>({...v,[job.id]:{loading:true}}));
    try{
      const supabase=createClient();
      const {data,error}=await supabase.from("tool_paid_jobs")
        .select("id,result")
        .eq("id",job.id)
        .eq("quote_id",quoteId)
        .eq("status","completed")
        .maybeSingle();
      if(error)throw error;
      setResults(v=>({...v,[job.id]:{loaded:true,value:data?.result??null}}));
    }catch{
      setResults(v=>({...v,[job.id]:{loaded:true,error:true,value:null}}));
    }
  }

  function renderResult(job:JobRow,state:ResultState){
    if(state.loading)return <p className="mt-3 text-xs text-[var(--lx-muted)]">{t(C.loading)}</p>;
    if(!state.loaded)return null;
    if(state.error)return <p className="mt-3 text-xs text-rose-600">{t(C.failedLoad)}</p>;
    const result=state.value;
    if(!result)return <p className="mt-3 text-xs leading-6 text-[var(--lx-muted)]">{t(C.resultMissing)}</p>;
    if(result.localProcessing===true&&!result.b64&&!result.url&&!result.text&&!result.raw){
      return <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">{t(C.localOnly)}</p>;
    }

    const img=imageHref(result);
    const txt=textValue(result);
    if(img){
      return <div className="mt-4">
        <img src={img} alt="" className="max-h-[520px] max-w-full rounded-xl border border-[var(--lx-line)] object-contain"/>
        <a href={img} download={`lingxifield-${safeFilename(job.tool_id)}-${safeFilename(job.item_key)}.png`} className="mt-3 inline-flex rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.download)}</a>
      </div>;
    }
    if(txt){
      return <div className="mt-4">
        <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-xs leading-6">{txt}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={()=>navigator.clipboard?.writeText(txt)} className="rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.copy)}</button>
          <button type="button" onClick={()=>downloadBlob(`lingxifield-${safeFilename(job.tool_id)}-${safeFilename(job.item_key)}.txt`,txt,"text/plain;charset=utf-8")} className="rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.download)}</button>
        </div>
      </div>;
    }

    const pretty=JSON.stringify(result,null,2);
    return <div className="mt-4">
      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-xs leading-6">{pretty}</pre>
      <button type="button" onClick={()=>downloadBlob(`lingxifield-${safeFilename(job.tool_id)}-${safeFilename(job.item_key)}.json`,pretty,"application/json;charset=utf-8")} className="mt-3 rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs">{t(C.download)}</button>
    </div>;
  }

  return <section>
    <div className="mb-7">
      <Link href="/account/orders" className="text-xs text-[var(--lx-muted)] hover:text-[var(--lx-ink)]">{t(C.back)}</Link>
      <h1 className="mt-4 font-display text-3xl font-light text-[var(--lx-ink)]">{t(C.title)}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">{t(C.lead)}</p>
    </div>

    {loading&&<p className="lx11-legacy-panel p-6 text-sm text-[var(--lx-muted)]">{t(C.loading)}</p>}
    {!loading&&loadError&&<p className="lx11-legacy-panel p-6 text-sm text-rose-600">{t(C.failedLoad)}</p>}
    {!loading&&!loadError&&jobs.length===0&&<p className="lx11-legacy-panel p-6 text-sm text-[var(--lx-muted)]">{t(C.empty)}</p>}

    <div className="space-y-3">
      {jobs.map(job=>{
        const statusCopy=job.status==="completed"?C.completed:job.status==="processing"?C.processing:C.failed;
        const state=results[job.id]||{};
        return <article key={job.id} className="lx11-legacy-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--lx-ink)]">{job.tool_id}</p>
              <p className="mt-1 text-xs text-[var(--lx-muted)]">{job.item_key} · {job.units} unit(s)</p>
              <p className="mt-1 text-[11px] text-[var(--lx-faint)]">{new Date(job.updated_at).toLocaleString()}</p>
            </div>
            <span className="rounded-full border border-[var(--lx-line)] px-3 py-1 text-[11px] text-[var(--lx-muted)]">{t(statusCopy)}</span>
          </div>

          {job.status==="completed"&&<button type="button" onClick={()=>void toggleResult(job)} className="mt-4 rounded-lg border border-[var(--lx-line-strong)] px-4 py-2 text-xs text-[var(--lx-ink)]">
            {state.loaded?t(C.hide):t(C.view)}
          </button>}

          {job.status==="failed"&&<p className="mt-3 text-xs leading-6 text-[var(--lx-muted)]">{t(C.resultMissing)}</p>}
          {renderResult(job,state)}
        </article>;
      })}
    </div>
  </section>;
}
