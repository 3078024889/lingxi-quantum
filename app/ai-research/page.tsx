import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import LxText from "@/components/LxText";

export const metadata:Metadata={
  title:"灵犀场科研 SASI｜让研究从可追溯证据出发",
  description:"把论文、笔记与研究资料放进同一个工作区，基于命中的原文证据提问、比较与继续推理。",
  alternates:{canonical:"/ai-research"}
};

export default function Page(){
  return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
    <p className="lx10-kicker"><LxText zh="科研 SASI" en="Research SASI" ja="研究 SASI" ko="연구 SASI" fr="SASI Recherche" de="Forschungs-SASI" es="SASI Investigación" pt="SASI Pesquisa" ar="SASI للبحث"/></p>
    <h1 className="lx10-title"><LxText zh="让下一步研究，从可追溯的证据出发。" en="Let the next research step begin with traceable evidence." ja="次の研究を、追跡可能な証拠から始める。" ko="다음 연구 단계를 추적 가능한 근거에서 시작하세요." fr="Faites partir la prochaine étape de recherche de preuves traçables." de="Beginnen Sie den nächsten Forschungsschritt mit nachvollziehbaren Belegen." es="Haz que el siguiente paso de investigación parta de evidencia rastreable." pt="Faça o próximo passo da pesquisa partir de evidências rastreáveis." ar="ابدأ الخطوة البحثية التالية من أدلة قابلة للتتبع."/></h1>
    <p className="lx10-lead"><LxText zh="把论文、研究笔记和原始资料放在同一处。先在本地命中证据，再把相关片段交给 AI，而不是把整份资料无差别发送。" en="Keep papers, notes and primary sources together. Relevant evidence is matched locally before selected snippets are sent to AI." ja="論文、研究ノート、一次資料を一か所にまとめ、まずローカルで証拠を見つけ、関連断片だけをAIへ送ります。" ko="논문, 연구 노트, 원자료를 한곳에 모으고 로컬에서 근거를 찾은 뒤 관련 조각만 AI로 보냅니다." fr="Réunissez articles, notes et sources primaires ; les preuves sont d’abord retrouvées localement avant l’envoi des seuls extraits pertinents à l’IA." de="Bündeln Sie Papers, Notizen und Primärquellen; passende Belege werden lokal gefunden, bevor nur relevante Auszüge an die KI gehen." es="Reúne artículos, notas y fuentes primarias; la evidencia se localiza primero de forma local y solo se envían fragmentos relevantes a la IA." pt="Reúna artigos, notas e fontes primárias; a evidência é localizada primeiro no navegador e só trechos relevantes seguem para a IA." ar="اجمع الأبحاث والملاحظات والمصادر الأولية؛ تُطابق الأدلة محليًا أولًا ثم تُرسل المقاطع ذات الصلة فقط إلى الذكاء الاصطناعي."/></p>
    <KnowledgeWorkspace mode="research"/>
  </div></main><Footer/></>;
}