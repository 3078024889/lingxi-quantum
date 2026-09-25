import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import LxText from "@/components/LxText";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

export const metadata:Metadata={
  title:"灵犀场学习 SASI｜把教材与笔记变成可追问的学习库",
  description:"上传教材、笔记与资料，保留原文证据，在同一个学习工作区继续提问、复习与核对。",
  alternates:{canonical:"/ai-learning"}
};

export default function Page(){
  return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
    <div className="lx-page-title-line"><LingxiMiniIcon name="learning" size="title" className="lx-page-title-icon"/><p className="lx10-kicker"><LxText zh="学习 SASI" en="Learning SASI" ja="学習 SASI" ko="학습 SASI" fr="SASI Études" de="Lern-SASI" es="SASI Aprendizaje" pt="SASI Aprendizagem" ar="SASI للتعلّم"/></p></div>
    <h1 className="lx10-title"><LxText zh="把一次读懂，变成下一次还能找到、还能追问。" en="Turn understanding into something you can find and question again." ja="一度の理解を、あとで探し直し、問い直せる知識へ。" ko="한 번의 이해를 나중에 다시 찾고 질문할 수 있는 지식으로 바꾸세요." fr="Transformez une compréhension en savoir que vous pourrez retrouver et interroger." de="Machen Sie Verständnis zu Wissen, das Sie wiederfinden und weiter befragen können." es="Convierte lo entendido en conocimiento que puedas volver a encontrar y preguntar." pt="Transforme o que entendeu em conhecimento que você possa reencontrar e questionar." ar="حوّل الفهم إلى معرفة يمكنك العثور عليها وسؤالها من جديد."/></h1>
    <p className="lx10-lead"><LxText zh="教材、课堂笔记、复习材料可以放进同一个资料库。粘贴正文后无需先保存，也可以直接基于当前内容提问。" en="Keep textbooks, notes and revision material together. Pasted text can be queried immediately, even before saving." ja="教材・ノート・復習資料を一つにまとめ、貼り付けた本文は保存前でもすぐ質問できます。" ko="교재, 수업 노트, 복습 자료를 한곳에 모으고 붙여넣은 본문은 저장 전에도 바로 질문할 수 있습니다." fr="Réunissez manuels, notes et révisions ; le texte collé peut être interrogé avant même d’être enregistré." de="Bündeln Sie Lehrbücher, Notizen und Lernmaterial; eingefügter Text kann schon vor dem Speichern befragt werden." es="Reúne libros, notas y material de repaso; el texto pegado puede consultarse antes de guardarlo." pt="Reúna livros, notas e material de revisão; o texto colado pode ser consultado antes de ser salvo." ar="اجمع الكتب والملاحظات ومواد المراجعة؛ ويمكن سؤال النص الملصق مباشرة قبل حفظه."/></p>
    <KnowledgeWorkspace mode="learning"/>
  </div></main><Footer/></>;
}