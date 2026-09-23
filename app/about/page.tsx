import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";

export const metadata: Metadata = {
  title: "关于灵犀场｜LINGXIFIELD",
  description:
    "灵犀场是一个把想法、资料和日常问题真正处理起来的场智能数字空间，连接实用工具、SASI、知识工作区与场域体验。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="lx11-page lx-about-v126">
        <div className="lx11-narrow">
          <section className="lx-about-v126-hero">
            <p className="lx11-kicker">LINGXIFIELD</p>
            <h1>
              <LxText
                zh="一个把想法、资料和日常问题真正处理起来的场智能数字空间。"
                en="A field-intelligence digital space that helps turn ideas, sources, and everyday problems into real progress."
                ja="アイデア、資料、日常の問題を、実際の前進へ変えていくフィールド・インテリジェンスのデジタル空間。"
                ko="아이디어, 자료, 일상의 문제를 실제 진행으로 바꾸는 필드 인텔리전스 디지털 공간."
                fr="Un espace numérique d’intelligence de champ qui transforme idées, sources et problèmes quotidiens en avancées concrètes."
                de="Ein digitaler Raum für Feldintelligenz, der Ideen, Quellen und Alltagsprobleme in konkrete Fortschritte übersetzt."
                es="Un espacio digital de inteligencia de campo que convierte ideas, fuentes y problemas cotidianos en avances reales."
                pt="Um espaço digital de inteligência de campo que transforma ideias, fontes e problemas do dia a dia em progresso real."
                ar="مساحة رقمية لذكاء المجال تساعد على تحويل الأفكار والمصادر والمشكلات اليومية إلى تقدم حقيقي."
              />
            </h1>
            <p>
              <LxText
                zh="一键即达，一念显化。你可以从一个文件、一张图片、一段视频开始，也可以从一本书、一个研究问题、一个故事，或一个还没有理清的念头开始。"
                en="One step to the right entrance, one thought toward realization. Start from a file, image, video, book, research question, story, or an idea that is not yet fully formed."
                ja="ひとつの操作で入口へ、ひとつの思いから実現へ。ファイル、画像、動画、本、研究テーマ、物語、まだ整理されていない考えから始められます。"
                ko="한 번에 맞는 입구로, 하나의 생각에서 현실화로. 파일, 이미지, 영상, 책, 연구 질문, 이야기, 아직 정리되지 않은 생각에서 시작할 수 있습니다."
                fr="Un accès direct, une idée qui prend forme. Commencez par un fichier, une image, une vidéo, un livre, une question de recherche, une histoire ou une pensée encore floue."
                de="Direkt zum passenden Einstieg, von einem Gedanken zur Umsetzung. Beginnen Sie mit Datei, Bild, Video, Buch, Forschungsfrage, Geschichte oder einer noch ungeklärten Idee."
                es="Un acceso directo, una idea que empieza a tomar forma. Comienza con un archivo, una imagen, un vídeo, un libro, una pregunta de investigación, una historia o una idea aún sin ordenar."
                pt="Um acesso direto, uma ideia começando a ganhar forma. Comece com um arquivo, imagem, vídeo, livro, pergunta de pesquisa, história ou uma ideia ainda não organizada."
                ar="وصول مباشر إلى المدخل المناسب، وفكرة تبدأ بالتحول إلى واقع. ابدأ بملف أو صورة أو فيديو أو كتاب أو سؤال بحث أو قصة أو فكرة لم تتضح بعد."
              />
            </p>
          </section>

          <section className="lx-about-v126-grid">
            <article>
              <span>01</span>
              <h2>
                <LxText
                  zh="把事情做完"
                  en="Get the task done"
                  ja="作業を完了する"
                  ko="작업을 끝내기"
                  fr="Accomplir la tâche"
                  de="Aufgaben erledigen"
                  es="Resolver la tarea"
                  pt="Concluir a tarefa"
                  ar="أنجز المهمة"
                />
              </h2>
              <p>
                <LxText
                  zh="图片、PDF、视频、字幕、OCR、隐私处理、格式转换与日常文件工具，尽量让简单任务在浏览器里直接完成。"
                  en="Images, PDFs, video, subtitles, OCR, privacy cleanup, format conversion and everyday file tools are designed to finish simple work directly in the browser whenever possible."
                  ja="画像、PDF、動画、字幕、OCR、プライバシー処理、形式変換など、日常の作業をできるだけブラウザ内で完結させます。"
                  ko="이미지, PDF, 영상, 자막, OCR, 개인정보 정리, 형식 변환 등 일상 작업을 가능한 한 브라우저에서 바로 끝냅니다."
                  fr="Images, PDF, vidéo, sous-titres, OCR, confidentialité et conversions sont pensés pour être traités directement dans le navigateur lorsque c’est possible."
                  de="Bilder, PDFs, Video, Untertitel, OCR, Datenschutz und Konvertierung sollen möglichst direkt im Browser erledigt werden."
                  es="Imágenes, PDF, vídeo, subtítulos, OCR, privacidad y conversiones se resuelven directamente en el navegador siempre que sea posible."
                  pt="Imagens, PDFs, vídeo, legendas, OCR, privacidade e conversões são resolvidos diretamente no navegador sempre que possível."
                  ar="تُنجز مهام الصور وPDF والفيديو والترجمة وOCR والخصوصية والتحويل مباشرة في المتصفح كلما أمكن."
                />
              </p>
            </article>

            <article>
              <span>02</span>
              <h2>
                <LxText
                  zh="把想法变成作品"
                  en="Turn ideas into work"
                  ja="アイデアを作品へ"
                  ko="아이디어를 작품으로"
                  fr="Transformer les idées en œuvres"
                  de="Ideen in Werke verwandeln"
                  es="Convertir ideas en obras"
                  pt="Transformar ideias em obras"
                  ar="حوّل الأفكار إلى أعمال"
                />
              </h2>
              <p>
                <LxText
                  zh="SASI 用来理解你真正想完成什么，再把任务引向短剧、影像、网站、应用、研究或其他生产路径。"
                  en="SASI interprets what you actually want to accomplish and routes the task toward short drama, visual creation, websites, apps, research, or other production paths."
                  ja="SASI は本当に実現したいことを理解し、短編ドラマ、映像、Web、アプリ、研究などの制作経路へ導きます。"
                  ko="SASI는 실제로 무엇을 완성하고 싶은지 이해한 뒤 숏드라마, 영상, 웹사이트, 앱, 연구 등의 제작 경로로 연결합니다."
                  fr="SASI comprend ce que vous voulez réellement accomplir et oriente la tâche vers la fiction courte, l’image, le web, les apps, la recherche ou d’autres parcours de production."
                  de="SASI versteht das gewünschte Ergebnis und leitet Aufgaben in Kurzdrama, Visuals, Websites, Apps, Forschung oder andere Produktionspfade."
                  es="SASI interpreta lo que realmente quieres lograr y dirige la tarea hacia cortos, imagen, web, apps, investigación u otros flujos de producción."
                  pt="SASI entende o que você realmente quer realizar e direciona a tarefa para curtas, visuais, sites, apps, pesquisa ou outros fluxos de produção."
                  ar="يفهم SASI ما تريد إنجازه فعليًا ثم يوجه المهمة نحو الدراما القصيرة أو المرئيات أو المواقع أو التطبيقات أو البحث أو مسارات إنتاج أخرى."
                />
              </p>
            </article>

            <article>
              <span>03</span>
              <h2>
                <LxText
                  zh="让资料成为可以继续追问的知识"
                  en="Turn sources into knowledge you can keep questioning"
                  ja="資料を問い続けられる知識へ"
                  ko="자료를 계속 질문할 수 있는 지식으로"
                  fr="Transformer les sources en savoir interrogeable"
                  de="Quellen in weiter befragbares Wissen verwandeln"
                  es="Convertir fuentes en conocimiento consultable"
                  pt="Transformar fontes em conhecimento consultável"
                  ar="حوّل المصادر إلى معرفة يمكن مواصلة سؤالها"
                />
              </h2>
              <p>
                <LxText
                  zh="Book SASI、学习 SASI 与科研 SASI 让书本、论文、笔记和私人资料留在同一个工作区，并保留可追溯的原文证据。"
                  en="Book SASI, Learning SASI and Research SASI keep books, papers, notes and private sources in one workspace with traceable source evidence."
                  ja="Book SASI、学習 SASI、研究 SASI は、本・論文・ノート・個人資料を一つのワークスペースにまとめ、追跡可能な原文証拠を残します。"
                  ko="Book SASI, 학습 SASI, 연구 SASI는 책, 논문, 노트, 개인 자료를 한 작업 공간에 모으고 추적 가능한 원문 근거를 유지합니다."
                  fr="Book SASI, Learning SASI et Research SASI réunissent livres, articles, notes et sources privées avec des preuves textuelles traçables."
                  de="Book SASI, Lern-SASI und Forschungs-SASI bündeln Bücher, Papers, Notizen und private Quellen mit nachvollziehbaren Originalbelegen."
                  es="Book SASI, Learning SASI y Research SASI reúnen libros, artículos, notas y fuentes privadas con evidencia textual rastreable."
                  pt="Book SASI, Learning SASI e Research SASI reúnem livros, artigos, notas e fontes privadas com evidências textuais rastreáveis."
                  ar="يجمع Book SASI وLearning SASI وResearch SASI الكتب والأبحاث والملاحظات والمصادر الخاصة مع أدلة نصية قابلة للتتبع."
                />
              </p>
            </article>

            <article>
              <span>04</span>
              <h2>
                <LxText
                  zh="看见正在发生的自己"
                  en="See what is unfolding in you"
                  ja="自分の中で起きていることを見る"
                  ko="내 안에서 일어나는 것을 보기"
                  fr="Voir ce qui se déploie en vous"
                  de="Sehen, was sich in Ihnen entfaltet"
                  es="Ver lo que se está desplegando en ti"
                  pt="Ver o que está se desdobrando em você"
                  ar="انظر إلى ما يتكشف بداخلك"
                />
              </h2>
              <p>
                <LxText
                  zh="场域精测、生命图谱、关系、韧性、财富、今日潮汐、潜意识重塑与修炼技术，为自我观察提供不同入口。"
                  en="Field Insights, Life Map, relationship, resilience, wealth, Today’s Tide, subconscious work and practices provide different entrances for self-observation."
                  ja="フィールド分析、生命図、関係、レジリエンス、富、今日の潮流、潜在意識、実践は、自己観察への異なる入口です。"
                  ko="필드 분석, 생명 지도, 관계, 회복탄력성, 부, 오늘의 흐름, 잠재의식, 수련은 자기 관찰을 위한 서로 다른 입구입니다."
                  fr="Field Insights, carte de vie, relations, résilience, richesse, marée du jour, subconscient et pratiques offrent plusieurs portes d’observation de soi."
                  de="Field Insights, Lebenskarte, Beziehungen, Resilienz, Wohlstand, Tagesrhythmus, Unterbewusstsein und Übungen bieten unterschiedliche Zugänge zur Selbstbeobachtung."
                  es="Field Insights, mapa vital, relaciones, resiliencia, riqueza, marea del día, subconsciente y prácticas ofrecen distintas entradas para la autoobservación."
                  pt="Field Insights, mapa de vida, relações, resiliência, riqueza, maré do dia, subconsciente e práticas oferecem diferentes entradas para auto-observação."
                  ar="تقدم Field Insights وخريطة الحياة والعلاقات والمرونة والثروة ومدّ اليوم والعمل مع اللاوعي والممارسات مداخل مختلفة للملاحظة الذاتية."
                />
              </p>
            </article>
          </section>

          <section className="lx-about-v126-note">
            <h2>
              <LxText
                zh="关于使用边界"
                en="Use boundaries"
                ja="利用上の境界"
                ko="이용 범위"
                fr="Limites d’usage"
                de="Nutzungsgrenzen"
                es="Límites de uso"
                pt="Limites de uso"
                ar="حدود الاستخدام"
              />
            </h2>
            <p>
              <LxText
                zh="灵犀场中的场域、自我探索与象征性内容用于个人反思、体验与创意用途，不替代医疗、心理、法律、金融或其他专业服务。工具与 AI 功能也应结合你自己的判断核对结果。"
                en="Field, reflective and symbolic experiences in LINGXIFIELD are for personal reflection, experience and creative use. They do not replace medical, mental-health, legal, financial or other professional services. Tool and AI outputs should also be checked with your own judgment."
                ja="フィールド、自己探究、象徴的コンテンツは個人の振り返り・体験・創作のためのもので、医療・心理・法律・金融などの専門サービスを代替しません。ツールやAIの結果もご自身で確認してください。"
                ko="필드, 자기 탐색, 상징적 콘텐츠는 개인 성찰·경험·창작을 위한 것이며 의료, 정신건강, 법률, 금융 등 전문 서비스를 대체하지 않습니다. 도구와 AI 결과도 직접 판단해 확인하세요."
                fr="Les expériences de champ, de réflexion et symboliques servent à l’exploration personnelle et à la création ; elles ne remplacent aucun service médical, psychologique, juridique, financier ou professionnel. Vérifiez aussi les résultats des outils et de l’IA."
                de="Feld-, Reflexions- und Symbolinhalte dienen persönlicher Reflexion, Erfahrung und Kreativität und ersetzen keine medizinische, psychologische, rechtliche, finanzielle oder andere professionelle Beratung. Prüfen Sie auch Tool- und KI-Ergebnisse selbst."
                es="Las experiencias de campo, reflexión y simbolismo sirven para exploración personal y creatividad; no sustituyen servicios médicos, psicológicos, legales, financieros ni profesionales. Comprueba también por tu cuenta los resultados de herramientas e IA."
                pt="As experiências de campo, reflexão e simbolismo servem para exploração pessoal e criatividade; não substituem serviços médicos, psicológicos, jurídicos, financeiros ou profissionais. Confira também por conta própria os resultados de ferramentas e IA."
                ar="تُستخدم تجارب المجال والتأمل والمحتوى الرمزي للاستكشاف الشخصي والإبداع، ولا تحل محل الخدمات الطبية أو النفسية أو القانونية أو المالية أو غيرها من الخدمات المهنية. كما ينبغي التحقق من نتائج الأدوات والذكاء الاصطناعي بحكمك الشخصي."
              />
            </p>
          </section>

          <section className="lx-about-v126-contact">
            <div>
              <p className="lx11-kicker">
                <LxText
                  zh="联系"
                  en="Contact"
                  ja="お問い合わせ"
                  ko="문의"
                  fr="Contact"
                  de="Kontakt"
                  es="Contacto"
                  pt="Contato"
                  ar="تواصل"
                />
              </p>
              <h2>
                <LxText
                  zh="问题、反馈与合作，都可以从这里找到我们。"
                  en="Questions, feedback and collaboration can all start here."
                  ja="質問、フィードバック、協業はこちらから。"
                  ko="질문, 피드백, 협업은 여기에서 시작할 수 있습니다."
                  fr="Questions, retours et collaborations peuvent commencer ici."
                  de="Fragen, Feedback und Zusammenarbeit beginnen hier."
                  es="Preguntas, comentarios y colaboraciones pueden empezar aquí."
                  pt="Perguntas, feedback e colaboração podem começar aqui."
                  ar="يمكن أن تبدأ الأسئلة والملاحظات والتعاون من هنا."
                />
              </h2>
            </div>
            <div className="lx-about-v126-contact-links">
              <a href="mailto:support@lingxifield.com">support@lingxifield.com</a>
              <a href="mailto:business@lingxifield.com">business@lingxifield.com</a>
              <a href="mailto:contact@lingxifield.com">contact@lingxifield.com</a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
