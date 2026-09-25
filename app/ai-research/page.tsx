import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import LxText from "@/components/LxText";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

export const metadata:Metadata={
  title:"灵犀场科研 SASI｜让研究从可追溯证据出发",
  description:"把论文、笔记与研究资料放进同一个工作区，基于命中的原文证据提问、比较与继续推理。",
  alternates:{canonical:"/ai-research"}
};

export default function Page(){
  return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
    <div className="lx-page-title-line"><LingxiMiniIcon name="research" size="title" className="lx-page-title-icon"/><p className="lx10-kicker"><LxText zh="科研 SASI" en="Research SASI" ja="研究 SASI" ko="연구 SASI" fr="SASI Recherche" de="Forschungs-SASI" es="SASI Investigación" pt="SASI Pesquisa" ar="SASI للبحث"/></p></div>
    <h1 className="lx10-title"><LxText zh="让下一步研究，从可追溯的证据出发。" en="Let the next research step begin with traceable evidence." ja="次の研究を、追跡可能な証拠から始める。" ko="다음 연구 단계를 추적 가능한 근거에서 시작하세요." fr="Faites partir la prochaine étape de recherche de preuves traçables." de="Beginnen Sie den nächsten Forschungsschritt mit nachvollziehbaren Belegen." es="Haz que el siguiente paso de investigación parta de evidencia rastreable." pt="Faça o próximo passo da pesquisa partir de evidências rastreáveis." ar="ابدأ الخطوة البحثية التالية من أدلة قابلة للتتبع."/></h1>
    <p className="lx10-lead"><LxText zh="把论文、研究笔记和原始资料放在同一处。提问时围绕相关原文证据展开，比较观点、追溯出处并继续研究。" en="Keep papers, notes and primary sources together. Questions stay anchored to relevant source evidence for comparison, traceability and continued research." ja="論文、研究ノート、一次資料を一か所にまとめ、原文の証拠に沿って問い、比較し、出典をたどりながら研究を続けられます。" ko="논문, 연구 노트, 원자료를 한곳에 모으고 원문 근거를 중심으로 질문·비교·출처 확인을 이어가세요." fr="Réunissez articles, notes et sources primaires, puis comparez les idées, retrouvez les références et poursuivez la recherche à partir des preuves originales." de="Bündeln Sie Papers, Notizen und Primärquellen und arbeiten Sie mit nachvollziehbaren Belegen weiter: vergleichen, Quellen prüfen und Forschung fortsetzen." es="Reúne artículos, notas y fuentes primarias y continúa investigando a partir de evidencia original, comparando ideas y rastreando sus fuentes." pt="Reúna artigos, notas e fontes primárias e continue a pesquisa a partir das evidências originais, comparando ideias e rastreando as fontes." ar="اجمع الأبحاث والملاحظات والمصادر الأولية في مكان واحد، ثم قارن الآراء وتتبع المراجع وواصل البحث انطلاقًا من الأدلة الأصلية."/></p>
    <KnowledgeWorkspace mode="research"/>
  </div></main><Footer/></>;
}