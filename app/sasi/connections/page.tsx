import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import SasiConnectionsClient from "@/components/SasiConnectionsClient";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"连接你的 AI 能力｜灵犀场 SASI",
  description:"把你已经在使用的模型服务接入灵犀场，让 SASI 在需要时调用它们完成创作、研究与处理任务。",
  alternates:{canonical:"/sasi/connections"},
};

export default async function Page(){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  return <><Nav/><main className="lx11-page">
    <div className="lx11-wrap py-14">
      <section className="mb-8 max-w-3xl">
        <div className="lx-page-title-line"><LingxiMiniIcon name="connections" size="title"/><p className="text-sm text-[var(--lx-faint)]"><LxText zh="SASI · 你的 AI 能力" en="SASI · Your AI capabilities" ja="SASI · あなたの AI 能力" ko="SASI · 나의 AI 기능" fr="SASI · Vos capacités IA" de="SASI · Ihre KI-Fähigkeiten" es="SASI · Tus capacidades de IA" pt="SASI · Suas capacidades de IA" ar="SASI · قدراتك في الذكاء الاصطناعي"/></p></div>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]"><LxText zh="把你已经拥有的 AI，接进同一个创作入口。" en="Bring the AI services you already use into one creative entry point." ja="すでに使っている AI サービスを、ひとつの制作入口へ。" ko="이미 사용 중인 AI 서비스를 하나의 창작 입구로 연결하세요." fr="Rassemblez les services IA que vous utilisez déjà dans un seul point de création." de="Verbinden Sie Ihre bestehenden KI-Dienste mit einem gemeinsamen Erstellungseinstieg." es="Conecta los servicios de IA que ya usas en un único punto de creación." pt="Conecte os serviços de IA que já usa em um único ponto de criação." ar="اجمع خدمات الذكاء الاصطناعي التي تستخدمها بالفعل في مدخل إنشاء واحد."/></h1>
        <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><LxText zh="连接后，短剧、研究和资料处理可以继续使用你自己的模型服务，不必在多个平台之间重复切换。" en="Once connected, drama, research and document work can continue with your own model services without repeatedly switching platforms." ja="接続後は、短編ドラマ、研究、資料処理で自分のモデルサービスをそのまま使え、複数のプラットフォームを行き来する手間を減らせます。" ko="연결 후 숏드라마, 연구, 자료 처리에서 자신의 모델 서비스를 계속 사용하며 여러 플랫폼을 오갈 필요를 줄일 수 있습니다." fr="Une fois connectés, vos dramas, recherches et traitements de documents peuvent continuer avec vos propres services de modèles, sans changer sans cesse de plateforme." de="Nach der Verbindung können Drama-, Forschungs- und Dokumentaufgaben Ihre eigenen Modelldienste nutzen, ohne ständig zwischen Plattformen zu wechseln." es="Después de conectar, tus dramas, investigaciones y trabajos con documentos pueden seguir usando tus propios modelos sin cambiar continuamente de plataforma." pt="Depois de conectar, dramas, pesquisas e trabalhos com documentos podem continuar usando seus próprios modelos sem alternar entre plataformas." ar="بعد الربط، يمكن لمهام الدراما والبحث ومعالجة المستندات الاستمرار باستخدام خدمات النماذج الخاصة بك دون التنقل المتكرر بين المنصات."/></p>
      </section>
      <SasiConnectionsClient accountEmail={user?.email??null}/>
    </div>
  </main><Footer/></>;
}
