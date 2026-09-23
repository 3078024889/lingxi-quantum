"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import { EXPLORE_GROUPS } from "@/lib/brand-system-i18n";

type Copy = Record<LingxiLang, string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const C = {
  kicker:c("灵犀场 · 探索","LINGXIFIELD · Explore","LINGXIFIELD · 探索","LINGXIFIELD · 탐색","LINGXIFIELD · Explorer","LINGXIFIELD · Entdecken","LINGXIFIELD · Explorar","LINGXIFIELD · Explorar","LINGXIFIELD · استكشاف"),
  title:c("从你现在想完成的事开始。","Start with what you want to accomplish now.","今、実現したいことから始める。","지금 이루고 싶은 일에서 시작하세요.","Commencez par ce que vous voulez accomplir maintenant.","Beginnen Sie mit dem, was Sie jetzt erreichen möchten.","Empieza por lo que quieres lograr ahora.","Comece pelo que você quer realizar agora.","ابدأ بما تريد إنجازه الآن."),
  lead:c("先选一个方向，再进入对应工具、SASI、研究、书本或场域体验。","Choose a direction, then enter the right tools, SASI, research, books or field experience.","方向を一つ選び、適切なツール、SASI、研究、書籍、フィールド体験へ。","하나의 방향을 고른 뒤 도구, SASI, 연구, 책 또는 필드 경험으로 이동하세요.","Choisissez une direction, puis accédez aux outils, à SASI, à la recherche, aux livres ou aux expériences de terrain adaptés.","Wählen Sie eine Richtung und gehen Sie dann zu passenden Tools, SASI, Forschung, Büchern oder Felderfahrungen.","Elige una dirección y entra en las herramientas, SASI, investigación, libros o experiencias de campo adecuadas.","Escolha uma direção e siga para as ferramentas, SASI, pesquisa, livros ou experiências de campo adequadas.","اختر اتجاهًا ثم انتقل إلى الأدوات أو SASI أو البحث أو الكتب أو تجارب المجال المناسبة."),
  start:c("从目标开始","Start by goal","目的から始める","목표로 시작","Commencer par l’objectif","Nach Ziel starten","Empezar por objetivo","Começar pelo objetivo","ابدأ بالهدف"),
  deeper:c("继续深入","Go deeper","さらに深く","더 깊이 보기","Aller plus loin","Weiter vertiefen","Profundizar","Aprofundar","تعمّق أكثر"),
  open:c("进入","Open","開く","열기","Ouvrir","Öffnen","Abrir","Abrir","فتح"),
};

const intents=[
  {href:"/tools",code:"TL",title:c("解决一个具体问题","Solve a concrete task","具体的な問題を解決","구체적인 문제 해결","Résoudre une tâche concrète","Eine konkrete Aufgabe lösen","Resolver una tarea concreta","Resolver uma tarefa concreta","حل مهمة محددة"),desc:c("图片、PDF、视频、字幕、OCR、隐私处理与日常文件。","Images, PDFs, video, subtitles, OCR, privacy and everyday files.","画像、PDF、動画、字幕、OCR、プライバシー処理。","이미지, PDF, 영상, 자막, OCR, 개인정보 처리.","Images, PDF, vidéo, sous-titres, OCR et confidentialité.","Bilder, PDFs, Video, Untertitel, OCR und Datenschutz.","Imágenes, PDF, vídeo, subtítulos, OCR y privacidad.","Imagens, PDF, vídeo, legendas, OCR e privacidade.","الصور وPDF والفيديو والترجمة وOCR والخصوصية.")},
  {href:"/sasi",code:"SA",title:c("把想法变成作品","Turn an idea into a work","アイデアを作品へ","아이디어를 작품으로","Transformer une idée en œuvre","Eine Idee in ein Werk verwandeln","Convertir una idea en obra","Transformar uma ideia em obra","حوّل الفكرة إلى عمل"),desc:c("短剧、影像、网站、应用与复杂任务，从 SASI 进入。","Short drama, visuals, websites, apps and complex tasks through SASI.","短編ドラマ、映像、Web、アプリ、複雑なタスク。","숏드라마, 영상, 웹사이트, 앱, 복합 작업.","Mini-séries, visuels, sites, apps et tâches complexes.","Kurzdrama, Visuals, Websites, Apps und komplexe Aufgaben.","Cortos, visuales, webs, apps y tareas complejas.","Curtas, visuais, sites, apps e tarefas complexas.","دراما قصيرة ومرئيات ومواقع وتطبيقات ومهام معقدة.")},
  {href:"/ai-knowledge",code:"BK",title:c("把资料变成可追问的智能体","Turn sources into askable intelligence","資料を質問できる知能へ","자료를 질문 가능한 지능으로","Transformer vos sources en intelligence interrogeable","Quellen in befragbare Intelligenz verwandeln","Convertir fuentes en inteligencia consultable","Transformar fontes em inteligência consultável","حوّل المصادر إلى ذكاء يمكن سؤاله"),desc:c("上传书本、论文与资料，保留原文证据，继续追问。","Upload books, papers and sources, preserve evidence and keep asking.","書籍や論文を追加し、原文根拠を保って質問。","책과 논문을 올리고 원문 근거로 계속 질문하세요.","Ajoutez livres et documents, gardez les preuves et poursuivez les questions.","Bücher und Quellen hochladen, Belege behalten und weiterfragen.","Sube libros y fuentes, conserva evidencias y sigue preguntando.","Envie livros e fontes, preserve evidências e continue perguntando.","ارفع الكتب والمصادر واحتفظ بالأدلة وواصل السؤال.")},
  {href:"/ai-research",code:"RS",title:c("围绕资料做研究","Research around your sources","資料を中心に研究","자료 중심 연구","Rechercher à partir de vos sources","Mit Ihren Quellen forschen","Investigar a partir de tus fuentes","Pesquisar a partir das suas fontes","ابحث انطلاقًا من مصادرك"),desc:c("让问题、证据与推理留在同一个工作区。","Keep questions, evidence and reasoning in one workspace.","質問・証拠・推論を一つのワークスペースに。","질문·근거·추론을 하나의 작업 공간에.","Questions, preuves et raisonnement dans un même espace.","Fragen, Belege und Schlussfolgerungen in einem Arbeitsbereich.","Preguntas, evidencias y razonamiento en un solo espacio.","Perguntas, evidências e raciocínio em um só espaço.","الأسئلة والأدلة والاستدلال في مساحة عمل واحدة.")},
  {href:"/field-tests",code:"FT",title:c("看见自己的结构与状态","See your structure and state","自分の構造と状態を見る","나의 구조와 상태 보기","Voir votre structure et votre état","Eigene Struktur und Zustand sehen","Ver tu estructura y estado","Ver sua estrutura e estado","رؤية بنيتك وحالتك"),desc:c("生命图谱、关系、韧性、财富、潮汐与生命原型。","Life map, relationships, resilience, wealth, tide and archetype.","生命図、関係、レジリエンス、富、潮流、原型。","생명 지도, 관계, 회복탄력성, 부, 흐름, 원형.","Carte de vie, relations, résilience, richesse, marées et archétype.","Lebenskarte, Beziehungen, Resilienz, Wohlstand, Rhythmus und Archetyp.","Mapa vital, relaciones, resiliencia, riqueza, marea y arquetipo.","Mapa de vida, relações, resiliência, riqueza, maré e arquétipo.","خريطة الحياة والعلاقات والمرونة والثروة والمدّ والنمط الأصلي.")},
  {href:"/live-as",code:"MF",title:c("让改变进入现实","Bring change into reality","変化を現実へ","변화를 현실로","Faire entrer le changement dans le réel","Veränderung in die Realität bringen","Llevar el cambio a la realidad","Levar a mudança para a realidade","أدخل التغيير إلى الواقع"),desc:c("一念显化、潜意识重塑与练习，形成持续路径。","Manifestation, subconscious reshaping and practices as a continuing path.","顕現、潜在意識の再構築、実践を継続的な道へ。","현현, 잠재의식 재구성, 수행을 지속 가능한 경로로.","Manifestation, remodelage du subconscient et pratiques continues.","Manifestation, Unterbewusstseinsarbeit und Übungen als fortlaufender Weg.","Manifestación, reconfiguración subconsciente y prácticas continuas.","Manifestação, reconfiguração do subconsciente e práticas contínuas.","التجلّي وإعادة تشكيل اللاوعي والممارسات كمسار مستمر.")},
];

export default function ExplorePage(){
  const { lang } = useLingxiLang();
  return (
    <>
      <Nav />
      <main className="lx11-page lx-explore-v1241">
        <div className="lx11-wrap">
          <section className="lx-explore-v1241-hero">
            <span className="lx11-kicker">{C.kicker[lang]}</span>
            <h1>{C.title[lang]}</h1>
            <p>{C.lead[lang]}</p>
          </section>

          <section className="lx-explore-v1241-section">
            <div className="lx-explore-v1241-heading">
              <div><span>01</span><h2>{C.start[lang]}</h2></div>
              <p>{C.lead[lang]}</p>
            </div>
            <div className="lx-explore-v1241-intents">
              {intents.map((item,index)=>(
                <Link key={item.href} href={item.href} className="lx-explore-v1241-intent">
                  <div className={`lx-explore-v1241-cover tone-${(index%6)+1}`}>
                    <span>{item.code}</span>
                    <small>0{index+1}</small>
                  </div>
                  <div className="lx-explore-v1241-copy">
                    <h3>{item.title[lang]}</h3>
                    <p>{item.desc[lang]}</p>
                    <b>{C.open[lang]} →</b>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="lx-explore-v1241-section">
            <div className="lx-explore-v1241-heading">
              <div><span>02</span><h2>{C.deeper[lang]}</h2></div>
            </div>
            <div className="lx-explore-v1241-groups">
              {EXPLORE_GROUPS.map((group)=>(
                <section key={group.code} className="lx-explore-v1241-group">
                  <header>
                    <span>{group.code}</span>
                    <div>
                      <h3>{group.title[lang]}</h3>
                      <p>{group.lead[lang]}</p>
                    </div>
                  </header>
                  <div className="lx-explore-v1241-group-items">
                    {group.items.map(([href,code,title,desc],index)=>(
                      <Link href={href} key={href}>
                        <span className={`lx-explore-v1241-mini tone-${((Number(group.code)+index)%6)+1}`}>{code}</span>
                        <div>
                          <b>{title[lang]}</b>
                          <p>{desc[lang]}</p>
                        </div>
                        <em>→</em>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
