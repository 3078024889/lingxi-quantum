"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LxText from "@/components/LxText";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";

type Readiness = {
  capabilitySupplyReady?: boolean;
  productionAccountReady?: boolean;
  executionReady?: boolean;
  refundFlowTested?: boolean;
  usageSettlementTested?: boolean;
  contentLabelingReady?: boolean;
  productionReady?: boolean;
  paymentChannels?: {
    alipay?: boolean;
    wechat?: boolean;
    paypal?: boolean;
  };
  videoRoutes?: {
    seedance?: boolean;
    xai?: boolean;
    openai?: boolean;
    wan?: boolean;
  };
};

function ReadyLine({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
          ok
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {ok ? "✓" : "·"}
      </span>
      <span className={ok ? "text-slate-700" : "text-slate-500"}>{children}</span>
    </div>
  );
}

export default function SasiDramaLaunch({
  accountEmail,
}: {
  accountEmail: string | null;
}) {
  const [readiness, setReadiness] = useState<Readiness | null>(null);

  useEffect(() => {
    fetch("/api/sasi/status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setReadiness(data))
      .catch(() => setReadiness(null));
  }, []);

  const productionReady = readiness?.productionReady === true;

  return (
    <main className="min-h-screen bg-[#fafaff] pt-16 lg:ml-[260px] lg:pt-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section
          className={`rounded-3xl border p-6 sm:p-8 ${
            productionReady
              ? "border-emerald-200 bg-emerald-50/70"
              : "border-amber-200 bg-amber-50/70"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p
                className={`text-xs font-semibold uppercase tracking-[.18em] ${
                  productionReady ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                <LxText
                  zh={productionReady ? "AI短剧制作 · 可执行" : "AI短剧制作 · 工作台已就绪，生产执行待核验"}
                  en={productionReady ? "AI Drama · Production ready" : "AI Drama · Workspace ready, production pending verification"}
                  ja={productionReady ? "AIドラマ · 制作可能" : "AIドラマ · ワークスペース準備済み、制作実行は検証待ち"}
                  ko={productionReady ? "AI 드라마 · 제작 가능" : "AI 드라마 · 작업공간 준비 완료, 제작 실행 검증 대기"}
                  fr={productionReady ? "Drama IA · Production prête" : "Drama IA · Espace prêt, exécution en attente de vérification"}
                  de={productionReady ? "KI-Drama · Produktion bereit" : "KI-Drama · Arbeitsbereich bereit, Ausführung wartet auf Prüfung"}
                  es={productionReady ? "Drama IA · Producción lista" : "Drama IA · Espacio listo, ejecución pendiente de verificación"}
                  pt={productionReady ? "Drama IA · Produção pronta" : "Drama IA · Espaço pronto, execução aguardando verificação"}
                  ar={productionReady ? "الدراما بالذكاء الاصطناعي · الإنتاج جاهز" : "الدراما بالذكاء الاصطناعي · مساحة العمل جاهزة والتنفيذ بانتظار التحقق"}
                />
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                <LxText
                  zh="从剧本到成片，把短剧制作拆成一条真实工作流。"
                  en="Turn a script into a finished short drama through one real production workflow."
                  ja="脚本から完成映像まで、短編ドラマ制作を一つの実制作フローにまとめます。"
                  ko="대본부터 완성 영상까지, 숏드라마 제작을 하나의 실제 제작 흐름으로 연결합니다."
                  fr="Du scénario au film final, réunissez toute la production d’un drama court dans un seul flux réel."
                  de="Vom Skript bis zum fertigen Film: ein durchgängiger realer Produktionsablauf für Kurzdramen."
                  es="Del guion al vídeo final: una sola cadena de producción real para dramas cortos."
                  pt="Do roteiro ao vídeo final: um único fluxo real de produção para dramas curtos."
                  ar="من النص إلى الفيديو النهائي: مسار إنتاج حقيقي واحد للدراما القصيرة."
                />
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                <LxText
                  zh="项目理解 → 剧本结构 → 人物设定 → 身份板 → 场景身份板 → 故事板 → 精分镜与配音 → 视频镜头 → Timeline → 字幕与成片。上传剧本、图片、音频、视频都支持直接拖入。"
                  en="Project intake → story structure → characters → identity boards → scene bible → storyboard → shots & voice → video clips → timeline → subtitles & master. Scripts, images, audio and video can all be dragged in directly."
                  ja="プロジェクト理解 → 構成 → キャラクター → アイデンティティボード → シーン設定 → ストーリーボード → 詳細ショットと音声 → 映像クリップ → Timeline → 字幕と完成版。脚本・画像・音声・動画はドラッグで追加できます。"
                  ko="프로젝트 이해 → 스토리 구조 → 캐릭터 → 아이덴티티 보드 → 장면 설정 → 스토리보드 → 상세 숏·보이스 → 영상 클립 → Timeline → 자막·완성본. 대본, 이미지, 오디오, 비디오를 바로 드래그해 넣을 수 있습니다."
                  fr="Cadrage du projet → structure → personnages → planches d’identité → scènes → storyboard → plans détaillés et voix → clips → timeline → sous-titres et master. Scripts, images, audio et vidéo peuvent être déposés directement."
                  de="Projektaufnahme → Storystruktur → Figuren → Identity Boards → Szenenbibel → Storyboard → Detailshots & Stimme → Videoclips → Timeline → Untertitel & Master. Skripte, Bilder, Audio und Video lassen sich direkt hineinziehen."
                  es="Definición del proyecto → estructura → personajes → paneles de identidad → escenas → storyboard → planos y voz → clips → timeline → subtítulos y máster. Puedes arrastrar directamente guiones, imágenes, audio y vídeo."
                  pt="Definição do projeto → estrutura → personagens → painéis de identidade → cenas → storyboard → planos e voz → clipes → timeline → legendas e master. É possível arrastar diretamente roteiros, imagens, áudio e vídeo."
                  ar="فهم المشروع → بنية القصة → الشخصيات → لوحات الهوية → هوية المشاهد → القصة المصورة → اللقطات الدقيقة والصوت → مقاطع الفيديو → الخط الزمني → الترجمة والنسخة النهائية. يمكن سحب النصوص والصور والصوت والفيديو مباشرة."
                />
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/sasi/pricing"
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700"
              >
                <LxText
                  zh="余额与价格"
                  en="Balance & pricing"
                  ja="残高と料金"
                  ko="잔액 및 가격"
                  fr="Solde et tarifs"
                  de="Guthaben & Preise"
                  es="Saldo y precios"
                  pt="Saldo e preços"
                  ar="الرصيد والأسعار"
                />
              </Link>
              <Link
                href="/sasi/connections"
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700"
              >
                <LxText
                  zh="模型 / API 连接"
                  en="Model / API connections"
                  ja="モデル / API 接続"
                  ko="모델 / API 연결"
                  fr="Connexions modèle / API"
                  de="Modell-/API-Verbindungen"
                  es="Conexiones modelo / API"
                  pt="Conexões de modelo / API"
                  ar="اتصالات النموذج / API"
                />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <ReadyLine ok={readiness?.capabilitySupplyReady === true}>
              <LxText
                zh="视频模型供应已验证"
                en="Video provider verified"
                ja="動画プロバイダー検証済み"
                ko="비디오 공급자 검증 완료"
                fr="Fournisseur vidéo vérifié"
                de="Videoanbieter verifiziert"
                es="Proveedor de vídeo verificado"
                pt="Provedor de vídeo verificado"
                ar="تم التحقق من مزود الفيديو"
              />
            </ReadyLine>
            <ReadyLine ok={readiness?.productionAccountReady === true}>
              <LxText
                zh="制作余额与支付已就绪"
                en="Production balance & payment ready"
                ja="制作残高と決済が準備済み"
                ko="제작 잔액 및 결제 준비 완료"
                fr="Solde de production et paiement prêts"
                de="Produktionsguthaben & Zahlung bereit"
                es="Saldo de producción y pago listos"
                pt="Saldo de produção e pagamento prontos"
                ar="رصيد الإنتاج والدفع جاهزان"
              />
            </ReadyLine>
            <ReadyLine ok={readiness?.executionReady === true}>
              <LxText
                zh="任务执行与用量结算已就绪"
                en="Task execution & usage settlement ready"
                ja="タスク実行と利用量精算が準備済み"
                ko="작업 실행 및 사용량 정산 준비 완료"
                fr="Exécution et règlement d’usage prêts"
                de="Ausführung & Nutzungsabrechnung bereit"
                es="Ejecución y liquidación de uso listas"
                pt="Execução e liquidação de uso prontas"
                ar="تنفيذ المهام وتسوية الاستخدام جاهزان"
              />
            </ReadyLine>
            <ReadyLine ok={readiness?.refundFlowTested === true}>
              <LxText
                zh="退还流程已验收"
                en="Refund flow tested"
                ja="返金フロー検証済み"
                ko="환불 흐름 검증 완료"
                fr="Flux de remboursement testé"
                de="Erstattungsablauf getestet"
                es="Flujo de reembolso probado"
                pt="Fluxo de reembolso testado"
                ar="تم اختبار مسار الاسترداد"
              />
            </ReadyLine>
            <ReadyLine ok={readiness?.contentLabelingReady === true}>
              <LxText
                zh="AI生成内容标识已就绪"
                en="AI content labeling ready"
                ja="AI生成コンテンツ表示が準備済み"
                ko="AI 생성 콘텐츠 표시 준비 완료"
                fr="Marquage du contenu IA prêt"
                de="KI-Inhaltskennzeichnung bereit"
                es="Etiquetado de contenido IA listo"
                pt="Rotulagem de conteúdo de IA pronta"
                ar="وسم محتوى الذكاء الاصطناعي جاهز"
              />
            </ReadyLine>
            <ReadyLine ok={productionReady}>
              <LxText
                zh={productionReady ? "生产执行总开关已开放" : "生产执行总开关尚未全部通过"}
                en={productionReady ? "Production execution is enabled" : "Production execution is not fully enabled yet"}
                ja={productionReady ? "制作実行が有効です" : "制作実行はまだ完全には有効ではありません"}
                ko={productionReady ? "제작 실행이 활성화되었습니다" : "제작 실행이 아직 완전히 활성화되지 않았습니다"}
                fr={productionReady ? "L’exécution de production est activée" : "L’exécution de production n’est pas encore entièrement activée"}
                de={productionReady ? "Produktionsausführung ist aktiviert" : "Produktionsausführung ist noch nicht vollständig aktiviert"}
                es={productionReady ? "La ejecución de producción está activada" : "La ejecución de producción aún no está totalmente activada"}
                pt={productionReady ? "A execução de produção está ativada" : "A execução de produção ainda não está totalmente ativada"}
                ar={productionReady ? "تم تفعيل تنفيذ الإنتاج" : "لم يتم تفعيل تنفيذ الإنتاج بالكامل بعد"}
              />
            </ReadyLine>
          </div>

          {!accountEmail && (
            <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-600">
              <LxText
                zh="登录后才能创建项目、查看余额并提交真实制作任务。"
                en="Sign in to create projects, view balance and submit real production jobs."
                ja="プロジェクト作成、残高確認、実制作タスク送信にはログインが必要です。"
                ko="프로젝트 생성, 잔액 확인, 실제 제작 작업 제출에는 로그인이 필요합니다."
                fr="Connectez-vous pour créer des projets, voir le solde et soumettre de vraies tâches de production."
                de="Melden Sie sich an, um Projekte zu erstellen, Guthaben zu sehen und echte Produktionsaufträge zu senden."
                es="Inicia sesión para crear proyectos, ver el saldo y enviar tareas reales de producción."
                pt="Entre para criar projetos, ver o saldo e enviar tarefas reais de produção."
                ar="سجّل الدخول لإنشاء المشاريع وعرض الرصيد وإرسال مهام إنتاج حقيقية."
              />
            </p>
          )}
        </section>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <SasiWorkspace accountEmail={accountEmail} />
        </div>
      </div>
    </main>
  );
}
