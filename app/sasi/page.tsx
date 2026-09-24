import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import SasiCommandCenter from "@/components/SasiCommandCenter";
import { sasiPublicReadiness } from "@/lib/sasi/readiness";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI｜知识工作与创作生产",
  description:
    "书本、学习与科研 SASI 已可使用；创作生产能力按实时就绪状态开放，支付与执行状态保持一致。",
  alternates: { canonical: "/sasi" },
};

export default function SasiPage() {
  const readiness = sasiPublicReadiness();
  return (
    <>
      <Nav />
      <div className="lx11-page lx11-sasi-page">
        <div className="lx11-sasi-wrap">
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700">
                  <LxText
                    zh="真实可用"
                    en="Available now"
                    ja="利用可能"
                    ko="현재 사용 가능"
                    fr="Disponible"
                    de="Jetzt verfügbar"
                    es="Disponible ahora"
                    pt="Disponível agora"
                    ar="متاح الآن"
                  />
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  <LxText
                    zh="书本 SASI：把书本和资料变成活的智能体"
                    en="Book SASI: turn books and sources into a living knowledge agent"
                    ja="Book SASI：本や資料を対話できる知識エージェントへ"
                    ko="Book SASI: 책과 자료를 대화형 지식 에이전트로"
                    fr="Book SASI : transformez livres et sources en agent de connaissance vivant"
                    de="Book SASI: Bücher und Quellen werden zu einem dialogfähigen Wissensagenten"
                    es="Book SASI: convierte libros y fuentes en un agente de conocimiento activo"
                    pt="Book SASI: transforme livros e fontes em um agente de conhecimento ativo"
                    ar="Book SASI: حوّل الكتب والمصادر إلى وكيل معرفة تفاعلي"
                  />
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  <LxText
                    zh="支持批量上传 PDF、EPUB、DOCX、PPTX、XLSX、CSV、TSV、ODS、RTF、TXT、Markdown、结构化文本与图片；基于原文回答，并使用真实 AI 余额按实际模型用量结算。"
                    en="Batch-upload PDF, EPUB, DOCX, PPTX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown, structured text and images; answers stay grounded in the source text and are billed from your real AI balance by actual model usage."
                    ja="PDF、TXT、Markdown、画像に対応。原文に基づいて回答し、実際のモデル使用量に応じて AI 残高から精算します。"
                    ko="PDF, TXT, Markdown, 이미지를 지원합니다. 원문에 근거해 답변하며 실제 모델 사용량만큼 AI 잔액에서 결제됩니다."
                    fr="PDF, TXT, Markdown et images sont pris en charge. Les réponses s’appuient sur les sources et sont facturées selon l’usage réel du modèle."
                    de="PDF, TXT, Markdown und Bilder werden unterstützt. Antworten basieren auf den Quellen und werden nach tatsächlicher Modellnutzung abgerechnet."
                    es="Admite PDF, TXT, Markdown e imágenes. Las respuestas se basan en las fuentes y se cobran según el uso real del modelo."
                    pt="Compatível com PDF, TXT, Markdown e imagens. As respostas usam as fontes e são cobradas pelo uso real do modelo."
                    ar="يدعم PDF وTXT وMarkdown والصور. تعتمد الإجابات على النص الأصلي وتُحاسب حسب الاستخدام الفعلي للنموذج."
                  />
                </p>
              </div>
              <Link
                href="/ai-knowledge"
                className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
              >
                <LxText
                  zh="打开书本 SASI →"
                  en="Open Book SASI →"
                  ja="Book SASI を開く →"
                  ko="Book SASI 열기 →"
                  fr="Ouvrir Book SASI →"
                  de="Book SASI öffnen →"
                  es="Abrir Book SASI →"
                  pt="Abrir Book SASI →"
                  ar="فتح Book SASI ←"
                />
              </Link>
            </div>
          </section>
          <section className="mt-5 rounded-3xl border border-slate-200 bg-white/70 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
              <LxText zh="SASI 创作生产" en="SASI Creation Production" ja="SASI 制作" ko="SASI 제작" fr="Production SASI" de="SASI-Produktion" es="Producción SASI" pt="Produção SASI" ar="إنتاج SASI"/>
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {readiness.productionReady
                ? <LxText zh="生产与支付链路已就绪" en="Production and payment are ready" ja="制作・決済経路は準備完了" ko="제작·결제 경로 준비 완료" fr="Production et paiement prêts" de="Produktion und Zahlung bereit" es="Producción y pago listos" pt="Produção e pagamento prontos" ar="الإنتاج والدفع جاهزان"/>
                : <LxText zh="按真实就绪状态开放" en="Opens only when the real production path is ready" ja="実際の準備状態に応じて開放" ko="실제 준비 상태에 따라 개방" fr="Ouverture selon l’état réel" de="Freigabe nach tatsächlicher Bereitschaft" es="Apertura según estado real" pt="Abertura conforme prontidão real" ar="يُفتح وفق الجاهزية الفعلية"/>}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {readiness.productionReady
                ? <LxText zh="SASI 创作余额可充值；任务仍需你明确确认，系统才会按报价预留余额并在完成后按实际结果结算。" en="SASI creation balance can be topped up. A task still requires your explicit approval before funds are reserved from the quote and settled after completion." ja="SASI制作残高をチャージできます。タスクは明示的な承認後に見積額を予約し、完了後に実績で精算します。" ko="SASI 제작 잔액 충전이 가능합니다. 작업은 명시적 승인 후 견적 금액을 예약하고 완료 후 실제 결과로 정산합니다." fr="Le solde SASI peut être rechargé ; une tâche exige toujours votre validation avant réservation puis règlement réel." de="SASI-Guthaben kann aufgeladen werden; Reservierung und Abrechnung erfolgen erst nach ausdrücklicher Aufgabenfreigabe." es="El saldo SASI puede recargarse; cada tarea requiere aprobación antes de reservar y liquidar el coste real." pt="O saldo SASI pode ser recarregado; cada tarefa exige aprovação antes da reserva e liquidação real." ar="يمكن شحن رصيد SASI؛ ولا يُحجز المبلغ أو يُسوّى إلا بعد موافقتك الصريحة على المهمة."/>
                : <LxText zh="只要供应、计费、任务执行、退款验证、使用结算或 AIGC 标识中任一关键条件未满足，充值入口就保持关闭，不让用户先付款再等待能力上线。" en="If provider supply, billing, execution, refund validation, usage settlement or AIGC labeling is not ready, top-ups remain closed rather than taking payment first." ja="供給・課金・実行・返金検証・利用精算・AIGC表示のいずれかが未準備なら、先に支払いを受けないようチャージを閉じます。" ko="공급, 과금, 실행, 환불 검증, 사용 정산, AIGC 표시 중 하나라도 준비되지 않으면 선결제를 막기 위해 충전을 닫습니다." fr="Si l’un des maillons critiques n’est pas prêt, les recharges restent fermées au lieu d’encaisser d’abord." de="Fehlt eine kritische Voraussetzung, bleiben Aufladungen geschlossen, statt zuerst Geld anzunehmen." es="Si falta cualquier condición crítica, las recargas permanecen cerradas en vez de cobrar antes." pt="Se faltar qualquer condição crítica, as recargas permanecem fechadas em vez de cobrar antecipadamente." ar="إذا لم يكتمل أي شرط حرج، تبقى عمليات الشحن مغلقة بدل تحصيل الدفع أولًا."/>}
            </p>
          </section>
        </div>
      </div>
      <SasiCommandCenter />
      <Footer />
    </>
  );
}
