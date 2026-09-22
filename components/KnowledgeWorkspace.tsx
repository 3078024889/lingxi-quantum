"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KnowledgeSource,
  readSources,
  saveSource,
  searchKnowledge,
} from "@/lib/ai-knowledge/local-index";
import { openPdf } from "@/lib/tools/pdf-render-client";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Mode = "book" | "learning" | "research";
type Intelligence = "light" | "standard" | "high";

type Copy = Record<LingxiLang, string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const COPY = {
  browserUnavailable:c("浏览器资料库暂时无法打开，请检查浏览器存储权限。","The browser library cannot be opened right now. Check browser storage permission.","ブラウザ資料庫を開けません。ブラウザの保存権限を確認してください。","브라우저 자료 보관함을 열 수 없습니다. 브라우저 저장 권한을 확인하세요.","La bibliothèque du navigateur est indisponible. Vérifiez l’autorisation de stockage.","Die Browser-Bibliothek kann derzeit nicht geöffnet werden. Prüfen Sie die Speicherberechtigung.","La biblioteca del navegador no está disponible. Revisa el permiso de almacenamiento.","A biblioteca do navegador não pode ser aberta agora. Verifique a permissão de armazenamento.","تعذر فتح مكتبة المتصفح الآن. تحقق من إذن التخزين."),
  needTitle:c("请先提供资料名称与正文。","Add a source title and text first.","資料名と本文を先に入力してください。","자료 이름과 본문을 먼저 입력하세요.","Ajoutez d’abord un titre et le texte de la source.","Geben Sie zuerst Titel und Text der Quelle ein.","Añade primero un título y el texto de la fuente.","Adicione primeiro um título e o texto da fonte.","أدخل اسم المصدر والنص أولًا."),
  capacity:c("当前本地资料库最多 60 份，每份约 150 万字符。大书请按章节拆分。","The local library currently supports up to 60 sources, about 1.5 million characters each. Split large books by chapter.","ローカル資料庫は最大60件、1件あたり約150万文字です。大きな本は章ごとに分けてください。","로컬 자료함은 최대 60개, 각 약 150만 자까지 지원합니다. 큰 책은 장별로 나눠 주세요.","La bibliothèque locale accepte jusqu’à 60 sources, environ 1,5 million de caractères chacune. Divisez les gros livres par chapitre.","Die lokale Bibliothek unterstützt bis zu 60 Quellen mit jeweils etwa 1,5 Mio. Zeichen. Große Bücher bitte nach Kapiteln aufteilen.","La biblioteca local admite hasta 60 fuentes de unos 1,5 millones de caracteres cada una. Divide los libros grandes por capítulos.","A biblioteca local aceita até 60 fontes, com cerca de 1,5 milhão de caracteres cada. Divida livros grandes por capítulos.","تدعم المكتبة المحلية حتى 60 مصدرًا، بنحو 1.5 مليون حرف لكل مصدر. قسّم الكتب الكبيرة حسب الفصول."),
  saved:c("资料已保存在这个浏览器。现在可以直接提问。","Saved in this browser. You can ask questions now.","このブラウザに保存しました。すぐに質問できます。","이 브라우저에 저장했습니다. 이제 바로 질문할 수 있습니다.","Enregistré dans ce navigateur. Vous pouvez poser vos questions.","In diesem Browser gespeichert. Sie können jetzt Fragen stellen.","Guardado en este navegador. Ya puedes hacer preguntas.","Salvo neste navegador. Agora você já pode perguntar.","تم الحفظ في هذا المتصفح. يمكنك طرح الأسئلة الآن."),
  saveFailed:c("保存失败，可能是浏览器存储空间不足。","Could not save. Browser storage may be full.","保存できませんでした。ブラウザの保存容量が不足している可能性があります。","저장에 실패했습니다. 브라우저 저장 공간이 부족할 수 있습니다.","Échec de l’enregistrement. Le stockage du navigateur est peut-être plein.","Speichern fehlgeschlagen. Der Browserspeicher ist möglicherweise voll.","No se pudo guardar. Puede que el almacenamiento del navegador esté lleno.","Falha ao salvar. O armazenamento do navegador pode estar cheio.","تعذر الحفظ. قد تكون مساحة تخزين المتصفح ممتلئة."),
  file30:c("单个文件暂时限制 30MB。","Files are currently limited to 30 MB each.","1ファイルは現在30MBまでです。","파일은 현재 개당 30MB로 제한됩니다.","Chaque fichier est actuellement limité à 30 Mo.","Dateien sind derzeit auf 30 MB begrenzt.","Cada archivo está limitado actualmente a 30 MB.","Cada arquivo está limitado a 30 MB.","الحد الحالي لكل ملف هو 30 ميجابايت."),
  scannedPdf:c("这个 PDF 几乎没有可提取文字，可能是扫描版。请先使用【PDF OCR】或上传页面图片。","This PDF has almost no extractable text and may be scanned. Use PDF OCR first or upload page images.","このPDFには抽出できる文字がほとんどありません。スキャン版の可能性があります。先に【PDF OCR】を使うか、ページ画像をアップロードしてください。","이 PDF에는 추출 가능한 텍스트가 거의 없습니다. 스캔본일 수 있으니 먼저 PDF OCR을 사용하거나 페이지 이미지를 업로드하세요.","Ce PDF contient très peu de texte extractible et peut être scanné. Utilisez d’abord PDF OCR ou importez des images de pages.","Diese PDF enthält kaum extrahierbaren Text und ist möglicherweise gescannt. Nutzen Sie zuerst PDF OCR oder laden Sie Seitenbilder hoch.","Este PDF casi no contiene texto extraíble y puede ser escaneado. Usa primero PDF OCR o sube imágenes de las páginas.","Este PDF quase não contém texto extraível e pode ser digitalizado. Use primeiro PDF OCR ou envie imagens das páginas.","لا يحتوي ملف PDF هذا تقريبًا على نص قابل للاستخراج وقد يكون ممسوحًا ضوئيًا. استخدم PDF OCR أولًا أو ارفع صور الصفحات."),
  imageNoText:c("没有从图片中识别出文字。","No text was recognized in the image.","画像から文字を認識できませんでした。","이미지에서 텍스트를 인식하지 못했습니다.","Aucun texte n’a été reconnu dans l’image.","Im Bild wurde kein Text erkannt.","No se reconoció texto en la imagen.","Nenhum texto foi reconhecido na imagem.","لم يتم التعرف على نص في الصورة."),
  supported:c("目前支持 PDF、TXT、Markdown 和图片。","Supported formats: PDF, TXT, Markdown and images.","現在対応している形式はPDF、TXT、Markdown、画像です。","현재 PDF, TXT, Markdown, 이미지를 지원합니다.","Formats pris en charge : PDF, TXT, Markdown et images.","Unterstützte Formate: PDF, TXT, Markdown und Bilder.","Formatos compatibles: PDF, TXT, Markdown e imágenes.","Formatos compatíveis: PDF, TXT, Markdown e imagens.","الصيغ المدعومة: PDF وTXT وMarkdown والصور."),
  fileReadFailed:c("文件读取失败。","Could not read the file.","ファイルを読み取れませんでした。","파일을 읽지 못했습니다.","Impossible de lire le fichier.","Datei konnte nicht gelesen werden.","No se pudo leer el archivo.","Não foi possível ler o arquivo.","تعذر قراءة الملف."),
  noEvidence:c("本地没有找到足够相关的原文。换一个更接近资料原词的问题，或继续加入资料。","Not enough relevant source text was found locally. Try wording the question closer to the source, or add more material.","関連する原文が十分に見つかりませんでした。資料中の言葉に近い質問にするか、資料を追加してください。","관련 원문을 충분히 찾지 못했습니다. 자료의 실제 표현에 더 가까운 질문을 하거나 자료를 추가하세요.","Pas assez de texte source pertinent trouvé localement. Reformulez avec les termes de la source ou ajoutez des documents.","Lokal wurde nicht genug relevanter Quelltext gefunden. Formulieren Sie näher an der Quelle oder fügen Sie Material hinzu.","No se encontró suficiente texto fuente relevante. Formula la pregunta con términos más cercanos a la fuente o añade material.","Não foi encontrado texto-fonte relevante suficiente. Reformule com termos mais próximos da fonte ou adicione material.","لم يتم العثور محليًا على نص مصدر ذي صلة بما يكفي. قرّب صياغة السؤال من كلمات المصدر أو أضف مواد أخرى."),
  sending:c("正在基于原文回答；这一步会把当前命中的证据片段发送给 AI。","Answering from the source text. Only the evidence snippets matched for this question are sent to AI.","原文に基づいて回答しています。この質問で一致した証拠断片だけをAIへ送信します。","원문을 바탕으로 답변 중입니다. 이번 질문에 매칭된 증거 조각만 AI로 전송됩니다.","Réponse fondée sur le texte source. Seuls les extraits de preuve correspondant à cette question sont envoyés à l’IA.","Antwort auf Grundlage des Quelltexts. Nur die für diese Frage gefundenen Belegstellen werden an die KI gesendet.","Respondiendo desde el texto fuente. Solo se envían a la IA los fragmentos de evidencia encontrados para esta pregunta.","Respondendo com base no texto-fonte. Apenas os trechos de evidência encontrados para esta pergunta são enviados à IA.","جارٍ الإجابة اعتمادًا على النص الأصلي. تُرسل إلى الذكاء الاصطناعي فقط مقتطفات الأدلة المطابقة لهذا السؤال."),
  aiFailed:c("AI 回答失败。","AI answer failed.","AIの回答に失敗しました。","AI 답변에 실패했습니다.","La réponse de l’IA a échoué.","KI-Antwort fehlgeschlagen.","Falló la respuesta de la IA.","A resposta da IA falhou.","فشلت إجابة الذكاء الاصطناعي."),
  done:c("回答完成。编号 [1]、[2] 对应下方真实原文证据。","Answer complete. [1], [2], etc. refer to the real source evidence below.","回答が完了しました。[1]、[2]などは下の実際の原文証拠に対応します。","답변이 완료되었습니다. [1], [2] 등은 아래 실제 원문 증거와 연결됩니다.","Réponse terminée. [1], [2], etc. renvoient aux preuves réelles ci-dessous.","Antwort fertig. [1], [2] usw. verweisen auf die echten Belege unten.","Respuesta completada. [1], [2], etc. corresponden a la evidencia real de abajo.","Resposta concluída. [1], [2] etc. correspondem às evidências reais abaixo.","اكتملت الإجابة. تشير [1] و[2] وغيرها إلى أدلة المصدر الحقيقية أدناه."),
  realApi:c("现在是真实接口：","现在是真实接口：","現在は実際のインターフェース：","현재 실제 인터페이스:","Interface réelle :","Echte Schnittstelle:","Interfaz real:","Interface real:","واجهة فعلية:"),
  privacy:c("资料默认保存在本机浏览器；本地先检索原文。只有你点“基于原文回答”时，当前命中的证据片段才会发送给 AI。PDF、TXT、Markdown 与图片 OCR 已可直接加入。","Sources stay in this browser by default and are searched locally first. Only when you choose “Answer from source text” are matched evidence snippets sent to AI. PDF, TXT, Markdown and image OCR can be added directly.","資料は既定でこのブラウザに保存され、まずローカル検索されます。「原文から回答」を押したときだけ、一致した証拠断片がAIへ送信されます。PDF、TXT、Markdown、画像OCRを直接追加できます。","자료는 기본적으로 이 브라우저에 저장되고 먼저 로컬에서 검색됩니다. ‘원문 기반 답변’을 누를 때만 매칭된 증거 조각이 AI로 전송됩니다. PDF, TXT, Markdown, 이미지 OCR을 바로 추가할 수 있습니다.","Les sources restent par défaut dans ce navigateur et sont d’abord recherchées localement. Seuls les extraits correspondants sont envoyés à l’IA lorsque vous choisissez « Répondre à partir du texte source ». PDF, TXT, Markdown et OCR d’image peuvent être ajoutés directement.","Quellen bleiben standardmäßig in diesem Browser und werden zuerst lokal durchsucht. Nur wenn Sie „Aus Quelltext antworten“ wählen, werden passende Belegstellen an die KI gesendet. PDF, TXT, Markdown und Bild-OCR können direkt hinzugefügt werden.","Las fuentes se guardan por defecto en este navegador y se buscan primero de forma local. Solo cuando eliges «Responder desde el texto fuente» se envían a la IA los fragmentos encontrados. Puedes añadir PDF, TXT, Markdown e imágenes con OCR.","As fontes ficam por padrão neste navegador e são pesquisadas localmente primeiro. Apenas ao escolher “Responder com base no texto-fonte” os trechos encontrados são enviados à IA. PDF, TXT, Markdown e OCR de imagens podem ser adicionados diretamente.","تظل المصادر افتراضيًا في هذا المتصفح ويجري البحث فيها محليًا أولًا. لا تُرسل مقتطفات الأدلة إلى الذكاء الاصطناعي إلا عند اختيار «الإجابة من النص الأصلي». يمكن إضافة PDF وTXT وMarkdown وصور OCR مباشرة."),
  add:c("加入","Add ","追加：","추가: ","Ajouter ","Hinzufügen: ","Añadir ","Adicionar ","إضافة "),
  reading:c("正在读取…","Reading…","読み込み中…","읽는 중…","Lecture…","Wird gelesen…","Leyendo…","Lendo…","جارٍ القراءة…"),
  upload:c("上传 PDF / TXT / Markdown / 图片","Upload PDF / TXT / Markdown / Image","PDF / TXT / Markdown / 画像をアップロード","PDF / TXT / Markdown / 이미지 업로드","Importer PDF / TXT / Markdown / Image","PDF / TXT / Markdown / Bild hochladen","Subir PDF / TXT / Markdown / Imagen","Enviar PDF / TXT / Markdown / Imagem","رفع PDF / TXT / Markdown / صورة"),
  pdfNote:c("PDF 会保留页码定位；图片会先在浏览器 OCR。","PDF page references are preserved; images are OCRed in the browser first.","PDFはページ位置を保持し、画像はまずブラウザ内でOCRされます。","PDF는 페이지 위치를 유지하며 이미지는 브라우저에서 먼저 OCR합니다.","Les références de page PDF sont conservées ; les images passent d’abord par l’OCR dans le navigateur.","PDF-Seitenangaben bleiben erhalten; Bilder werden zuerst im Browser per OCR verarbeitet.","Se conservan las referencias de página del PDF; las imágenes pasan primero por OCR en el navegador.","As referências de página do PDF são preservadas; imagens passam primeiro por OCR no navegador.","يتم الاحتفاظ بمراجع صفحات PDF، وتُجرى OCR للصور أولًا داخل المتصفح."),
  paste:c("或粘贴正文","or paste text","または本文を貼り付け","또는 본문 붙여넣기","ou collez le texte","oder Text einfügen","o pega el texto","ou cole o texto","أو الصق النص"),
  sourceName:c("资料名称","Source title","資料名","자료 이름","Titre de la source","Quellentitel","Título de la fuente","Título da fonte","عنوان المصدر"),
  pastePlaceholder:c("粘贴书本、论文、笔记或资料正文…","Paste book, paper, notes or source text…","本・論文・ノート・資料本文を貼り付け…","책, 논문, 노트 또는 자료 본문 붙여넣기…","Collez le texte d’un livre, article, note ou document…","Buch-, Paper-, Notiz- oder Quelltext einfügen…","Pega texto de libro, artículo, notas o fuente…","Cole texto de livro, artigo, notas ou fonte…","الصق نص كتاب أو بحث أو ملاحظات أو مصدر…"),
  addLibrary:c("加入我的资料库","Add to my library","自分の資料庫に追加","내 자료함에 추가","Ajouter à ma bibliothèque","Zu meiner Bibliothek hinzufügen","Añadir a mi biblioteca","Adicionar à minha biblioteca","إضافة إلى مكتبتي"),
  askSource:c("询问资料","Ask sources","資料に質問","자료 질문","Interroger les sources","Quellen befragen","Preguntar a las fuentes","Perguntar às fontes","اسأل المصادر"),
  askBatch:c("直接问这批资料","Ask this collection directly","この資料群に直接質問","이 자료 묶음에 직접 질문","Interroger directement cette collection","Diese Sammlung direkt befragen","Preguntar directamente a esta colección","Perguntar diretamente a esta coleção","اسأل هذه المجموعة مباشرة"),
  smart:c("智能模式","Intelligence mode","知能モード","지능 모드","Mode d’intelligence","Intelligenzmodus","Modo de inteligencia","Modo de inteligência","وضع الذكاء"),
  billed:c("实际按本次模型用量结算","Billed by actual model usage","今回の実際のモデル使用量で精算","이번 실제 모델 사용량으로 정산","Facturé selon l’usage réel du modèle","Abrechnung nach tatsächlicher Modellnutzung","Cobro según el uso real del modelo","Cobrado pelo uso real do modelo","تُحاسب حسب الاستخدام الفعلي للنموذج"),
  light:c("轻量","Light","軽量","라이트","Léger","Leicht","Ligero","Leve","خفيف"),
  standard:c("标准","Standard","標準","표준","Standard","Standard","Estándar","Padrão","قياسي"),
  high:c("高智能","High intelligence","高知能","고지능","Haute intelligence","Hohe Intelligenz","Alta inteligencia","Alta inteligência","ذكاء عالٍ"),
  factor:c("消耗","usage","消費","소모","consommation","Verbrauch","consumo","consumo","استهلاك"),
  modeHelp:c("轻量适合快速摘要与简单问答；标准为默认推荐；高智能适合复杂研究、多步骤推理和更长回答。","Light is for quick summaries and simple Q&A; Standard is the default; High intelligence suits complex research, multi-step reasoning and longer answers.","軽量は短い要約や簡単なQ&A、標準は既定、高知能は複雑な研究・多段階推論・長い回答向けです。","라이트는 빠른 요약과 간단한 Q&A, 표준은 기본 추천, 고지능은 복잡한 연구와 다단계 추론, 긴 답변에 적합합니다.","Léger convient aux résumés rapides et questions simples ; Standard est recommandé par défaut ; Haute intelligence convient aux recherches complexes, au raisonnement multi-étapes et aux réponses longues.","Leicht eignet sich für schnelle Zusammenfassungen und einfache Fragen; Standard ist die Voreinstellung; Hohe Intelligenz für komplexe Forschung, mehrstufiges Denken und längere Antworten.","Ligero sirve para resúmenes rápidos y preguntas simples; Estándar es la opción predeterminada; Alta inteligencia para investigación compleja, razonamiento de varios pasos y respuestas largas.","Leve serve para resumos rápidos e perguntas simples; Padrão é o recomendado; Alta inteligência para pesquisa complexa, raciocínio em várias etapas e respostas longas.","الخفيف للملخصات السريعة والأسئلة البسيطة، والقياسي هو الافتراضي، والذكاء العالي للبحث المعقد والاستدلال متعدد الخطوات والإجابات الأطول."),
  answer:c("基于原文回答","Answer from source text","原文から回答","원문 기반 답변","Répondre à partir du texte source","Aus Quelltext antworten","Responder desde el texto fuente","Responder com base no texto-fonte","الإجابة من النص الأصلي"),
  readingSource:c("正在阅读原文…","Reading source text…","原文を読んでいます…","원문 읽는 중…","Lecture du texte source…","Quelltext wird gelesen…","Leyendo el texto fuente…","Lendo o texto-fonte…","جارٍ قراءة النص الأصلي…"),
  aiPrivacy:c("AI 不会读取你的整个浏览器资料库，只发送本次问题命中的原文片段。","AI does not read your entire browser library; only source snippets matched to this question are sent.","AIはブラウザ資料庫全体を読みません。この質問で一致した原文断片だけが送信されます。","AI는 브라우저 자료함 전체를 읽지 않습니다. 이번 질문에 매칭된 원문 조각만 전송됩니다.","L’IA ne lit pas toute votre bibliothèque ; seuls les extraits correspondant à cette question sont envoyés.","Die KI liest nicht Ihre gesamte Browser-Bibliothek; nur passende Quellstellen dieser Frage werden gesendet.","La IA no lee toda tu biblioteca; solo se envían los fragmentos encontrados para esta pregunta.","A IA não lê toda a biblioteca; apenas trechos encontrados para esta pergunta são enviados.","لا يقرأ الذكاء الاصطناعي مكتبتك كاملة؛ تُرسل فقط مقتطفات النص المطابقة لهذا السؤال."),
  evidence:c("本次原文证据","Source evidence for this answer","今回の原文証拠","이번 원문 증거","Preuves source de cette réponse","Quellbelege für diese Antwort","Evidencia fuente de esta respuesta","Evidências-fonte desta resposta","أدلة المصدر لهذه الإجابة"),
  none:c("没有找到相关原文。","No relevant source text found.","関連する原文が見つかりません。","관련 원문을 찾지 못했습니다.","Aucun texte source pertinent trouvé.","Kein relevanter Quelltext gefunden.","No se encontró texto fuente relevante.","Nenhum texto-fonte relevante encontrado.","لم يتم العثور على نص مصدر ذي صلة."),
  myLocal:c("我的本机资料","My local sources","ローカル資料","내 로컬 자료","Mes sources locales","Meine lokalen Quellen","Mis fuentes locales","Minhas fontes locais","مصادري المحلية"),
  export:c("导出备份 ↓","Export backup ↓","バックアップを書き出す ↓","백업 내보내기 ↓","Exporter la sauvegarde ↓","Backup exportieren ↓","Exportar copia ↓","Exportar backup ↓","تصدير نسخة احتياطية ↓"),
  delete:c("删除","Delete","削除","삭제","Supprimer","Löschen","Eliminar","Excluir","حذف"),
  research:c("研究资料","Research sources","研究資料","연구 자료","Sources de recherche","Forschungsquellen","Fuentes de investigación","Fontes de pesquisa","مصادر البحث"),
  learning:c("教材与笔记","Study materials & notes","教材とノート","교재와 노트","Supports d’étude et notes","Lernmaterialien & Notizen","Materiales y notas","Materiais e notas","مواد دراسية وملاحظات"),
  book:c("书本与资料","Books & sources","本と資料","책과 자료","Livres & sources","Bücher & Quellen","Libros y fuentes","Livros e fontes","كتب ومصادر"),
  qResearch:c("例如：这几篇论文的方法差异在哪里？哪条结论证据更强？","Example: How do the methods in these papers differ? Which conclusion has stronger evidence?","例：これらの論文の方法はどう違う？どの結論の証拠がより強い？","예: 이 논문들의 방법은 어떻게 다른가요? 어떤 결론의 근거가 더 강한가요?","Ex. : En quoi les méthodes de ces articles diffèrent-elles ? Quelle conclusion est la mieux étayée ?","Beispiel: Wie unterscheiden sich die Methoden dieser Arbeiten? Welche Schlussfolgerung ist besser belegt?","Ej.: ¿En qué difieren los métodos de estos artículos? ¿Qué conclusión tiene mejor evidencia?","Ex.: Como os métodos desses artigos diferem? Qual conclusão tem evidência mais forte?","مثال: كيف تختلف منهجيات هذه الأبحاث؟ وأي نتيجة أدلتها أقوى؟"),
  qLearning:c("例如：这一章最难理解的概念是什么？用原文解释给我。","Example: What is the hardest concept in this chapter? Explain it using the source text.","例：この章で最も難しい概念は？原文を使って説明して。","예: 이 장에서 가장 이해하기 어려운 개념은 무엇인가요? 원문으로 설명해 주세요.","Ex. : Quel est le concept le plus difficile de ce chapitre ? Expliquez-le à partir du texte source.","Beispiel: Was ist das schwierigste Konzept dieses Kapitels? Erklären Sie es anhand des Quelltexts.","Ej.: ¿Cuál es el concepto más difícil de este capítulo? Explícalo con el texto fuente.","Ex.: Qual é o conceito mais difícil deste capítulo? Explique com o texto-fonte.","مثال: ما أصعب مفهوم في هذا الفصل؟ اشرحه بالاعتماد على النص الأصلي."),
  qBook:c("例如：作者为什么在第三章改变了这个观点？请用原文说明。","Example: Why did the author change this view in chapter 3? Explain from the source text.","例：著者はなぜ第3章でこの見方を変えた？原文から説明して。","예: 저자는 왜 3장에서 이 관점을 바꿨나요? 원문으로 설명해 주세요.","Ex. : Pourquoi l’auteur change-t-il ce point de vue au chapitre 3 ? Expliquez à partir du texte source.","Beispiel: Warum ändert der Autor diese Sicht in Kapitel 3? Erklären Sie es anhand des Quelltexts.","Ej.: ¿Por qué el autor cambia esta idea en el capítulo 3? Explícalo con el texto fuente.","Ex.: Por que o autor muda essa visão no capítulo 3? Explique com o texto-fonte.","مثال: لماذا غيّر المؤلف هذا الرأي في الفصل الثالث؟ اشرح من النص الأصلي."),
} as const;

function tr(lang:LingxiLang,key:keyof typeof COPY){return COPY[key][lang] ?? COPY[key].en}

function pageLabel(lang:LingxiLang,n:number){
  if(lang==="zh")return `第 ${n} 页`;
  if(lang==="ja")return `${n}ページ`;
  if(lang==="ko")return `${n}페이지`;
  if(lang==="fr")return `Page ${n}`;
  if(lang==="de")return `Seite ${n}`;
  if(lang==="es"||lang==="pt")return `Página ${n}`;
  if(lang==="ar")return `الصفحة ${n}`;
  return `Page ${n}`;
}

async function pdfToSource(file: File, lang:LingxiLang): Promise<Pick<KnowledgeSource, "text" | "locators">> {
  const pdf = await openPdf(file);
  const pieces:string[]=[];
  const locators:NonNullable<KnowledgeSource["locators"]>=[];
  let offset=0;
  try{
    for(let n=1;n<=pdf.numPages;n++){
      const page=await pdf.getPage(n);
      const content=await page.getTextContent();
      const text=(content.items||[]).map((item:any)=>String(item?.str||"")).join(" ").replace(/\s+/g," ").trim();
      const label=pageLabel(lang,n);
      const pageText=`${label}\n${text}`;
      const start=offset;
      pieces.push(pageText);
      offset+=pageText.length+2;
      locators.push({start,end:offset,label});
    }
  }finally{pdf.destroy?.()}
  return{text:pieces.join("\n\n"),locators};
}

async function imageToText(file:File):Promise<string>{
  const {createWorker}=await import("tesseract.js");
  const worker=await createWorker("chi_sim+eng");
  try{
    const result=await worker.recognize(file);
    return result.data.text.trim();
  }finally{await worker.terminate()}
}

export default function KnowledgeWorkspace({mode="book"}:{mode?:Mode}){
  const {lang}=useLingxiLang();
  const [sources,setSources]=useState<KnowledgeSource[]>([]);
  const [title,setTitle]=useState("");
  const [text,setText]=useState("");
  const [query,setQuery]=useState("");
  const [question,setQuestion]=useState("");
  const [answer,setAnswer]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [askBusy,setAskBusy]=useState(false);
  const [intelligence,setIntelligence]=useState<Intelligence>("standard");
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    readSources().then(rows=>{setSources(rows);setReady(true)})
      .catch(()=>setNotice(tr(lang,"browserUnavailable")));
  },[lang]);

  const activeQuery=(query||question).trim();
  const results=useMemo(()=>searchKnowledge(sources,activeQuery),[sources,activeQuery]);

  async function saveCurrent(){
    if(!title.trim()||!text.trim()){setNotice(tr(lang,"needTitle"));return}
    if(text.length>1_500_000||sources.length>=60){setNotice(tr(lang,"capacity"));return}
    setBusy(true);
    try{
      const source:KnowledgeSource={id:crypto.randomUUID(),title:title.trim().slice(0,200),text:text.trim(),createdAt:new Date().toISOString(),kind:"text"};
      await saveSource(source);
      setSources(previous=>[...previous,source]);setTitle("");setText("");setNotice(tr(lang,"saved"));
    }catch{setNotice(tr(lang,"saveFailed"))}
    finally{setBusy(false)}
  }

  async function importFile(file:File){
    setBusy(true);setNotice("");
    try{
      if(file.size>30*1024*1024)throw new Error(tr(lang,"file30"));
      let parsedText="",locators:KnowledgeSource["locators"]|undefined,kind:KnowledgeSource["kind"]="text";
      if(/\.pdf$/i.test(file.name)||file.type==="application/pdf"){
        kind="pdf";const parsed=await pdfToSource(file,lang);parsedText=parsed.text;locators=parsed.locators;
        if(parsedText.replace(/(?:第\s*\d+\s*页|Page\s+\d+|Seite\s+\d+|Página\s+\d+|\d+ページ|\d+페이지|الصفحة\s+\d+)/g,"").trim().length<80)throw new Error(tr(lang,"scannedPdf"));
      }else if(file.type.startsWith("image/")){
        kind="image";parsedText=await imageToText(file);if(!parsedText.trim())throw new Error(tr(lang,"imageNoText"));
      }else if(/\.(txt|md)$/i.test(file.name)||/text\//.test(file.type)){parsedText=await file.text()}
      else throw new Error(tr(lang,"supported"));

      const source:KnowledgeSource={id:crypto.randomUUID(),title:file.name.slice(0,200),text:parsedText.slice(0,1_500_000),createdAt:new Date().toISOString(),kind,locators};
      await saveSource(source);setSources(previous=>[...previous,source]);
      setNotice(lang==="zh"?`已加入「${source.title}」。${kind==="pdf"?"PDF 页码定位已保留。":""}`:`${source.title} · ${tr(lang,"saved")}`);
    }catch(e){setNotice(e instanceof Error?e.message:tr(lang,"fileReadFailed"))}
    finally{setBusy(false)}
  }

  async function ask(){
    const q=question.trim();if(!q)return;
    if(!results.length){setNotice(tr(lang,"noEvidence"));return}
    setAskBusy(true);setAnswer("");setNotice(tr(lang,"sending"));
    try{
      const response=await fetch("/api/knowledge/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        question:q,mode,intelligence,evidence:results.map((r,i)=>({index:i+1,title:r.title,locator:r.locator,text:r.text}))
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||tr(lang,"aiFailed"));
      setAnswer(data.answer||"");
      const charged=Number(data.chargedRmb);
      setNotice(Number.isFinite(charged)
        ? `${tr(lang,"done")} · ¥${charged.toFixed(2)}`
        : tr(lang,"done"));
    }catch(e){setNotice(e instanceof Error?e.message:tr(lang,"aiFailed"))}
    finally{setAskBusy(false)}
  }

  async function remove(source:KnowledgeSource){
    const prompt=lang==="zh"?`删除本机资料「${source.title}」？原文件不会受影响。`:`Delete local source “${source.title}”? The original file is not affected.`;
    if(!window.confirm(prompt))return;
    await saveSource(source.id);setSources(rows=>rows.filter(row=>row.id!==source.id));
  }

  function exportSources(){
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:2,sources},null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="lingxifield-knowledge-backup.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  const heading=mode==="research"?tr(lang,"research"):mode==="learning"?tr(lang,"learning"):tr(lang,"book");
  const qPlaceholder=mode==="research"?tr(lang,"qResearch"):mode==="learning"?tr(lang,"qLearning"):tr(lang,"qBook");
  const intelligenceLabels:{value:Intelligence;label:string;factor:string}[]=[
    {value:"light",label:tr(lang,"light"),factor:"1×"},
    {value:"standard",label:tr(lang,"standard"),factor:"2×"},
    {value:"high",label:tr(lang,"high"),factor:"5×"},
  ];

  return <section className="mt-8 space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
      <b className="text-slate-900">{tr(lang,"realApi")}</b>{" "}{tr(lang,"privacy")}
    </div>

    <div className="grid gap-5 xl:grid-cols-[.88fr_1.12fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">{tr(lang,"add")}{heading}</h2>
        <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <input type="file" className="hidden" accept=".pdf,.txt,.md,image/*,application/pdf,text/plain,text/markdown" disabled={busy}
            onChange={e=>{const file=e.target.files?.[0];if(file)void importFile(file);e.currentTarget.value=""}}/>
          <span className="font-medium text-slate-900">{busy?tr(lang,"reading"):tr(lang,"upload")}</span>
          <span className="mt-1 block text-sm text-slate-500">{tr(lang,"pdfNote")}</span>
        </label>
        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200"/>{tr(lang,"paste")}<span className="h-px flex-1 bg-slate-200"/>
        </div>
        <input className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-400" value={title} maxLength={200}
          onChange={e=>setTitle(e.target.value)} placeholder={tr(lang,"sourceName")}/>
        <textarea className="mt-3 min-h-44 w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-400"
          value={text} maxLength={1_500_001} onChange={e=>setText(e.target.value)} placeholder={tr(lang,"pastePlaceholder")}/>
        <button className="mt-3 rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white disabled:opacity-40" disabled={!ready||busy} onClick={saveCurrent}>
          {tr(lang,"addLibrary")}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">{tr(lang,"askSource")}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{tr(lang,"askBatch")}</h2>
        <textarea value={question} onChange={e=>{setQuestion(e.target.value);setQuery(e.target.value)}} rows={3}
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-400"
          placeholder={qPlaceholder}/>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-800">{tr(lang,"smart")}</span>
            <span className="text-xs text-slate-400">{tr(lang,"billed")}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {intelligenceLabels.map(({value,label,factor})=><button key={value} type="button" onClick={()=>setIntelligence(value)}
              className={`rounded-xl border px-3 py-3 text-left transition ${intelligence===value?"border-blue-400 bg-blue-50 text-blue-950":"border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
              <span className="block text-sm font-semibold">{label}</span>
              <span className="mt-1 block text-xs opacity-70">{factor} {tr(lang,"factor")}</span>
            </button>)}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{tr(lang,"modeHelp")}</p>
        </div>

        <button onClick={ask} disabled={askBusy||!question.trim()||!sources.length}
          className="mt-3 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">
          {askBusy?tr(lang,"readingSource"):tr(lang,"answer")}
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">{tr(lang,"aiPrivacy")}</p>

        {answer&&<article className="mt-6 whitespace-pre-wrap rounded-2xl bg-blue-50 p-5 leading-8 text-slate-800">{answer}</article>}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">{tr(lang,"evidence")}</h3>
          <div className="mt-3 max-h-[420px] space-y-3 overflow-auto">
            {results.map((r,i)=><article key={`${r.sourceId}:${r.paragraph}:${i}`} className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900">[{i+1}] {r.title} · {r.locator}</h4>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{r.text}</p>
            </article>)}
            {activeQuery&&!results.length&&<p className="text-sm text-slate-500">{tr(lang,"none")}</p>}
          </div>
        </div>
      </section>
    </div>

    <p role="status" className="text-sm text-slate-600">{notice}</p>

    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950">{tr(lang,"myLocal")} · {sources.length}</h2>
        <button disabled={!sources.length} onClick={exportSources} className="text-sm text-blue-600 disabled:opacity-30">{tr(lang,"export")}</button>
      </div>
      <ul className="mt-4 divide-y divide-slate-100">
        {sources.map(source=><li className="flex items-center justify-between gap-4 py-3" key={source.id}>
          <span className="min-w-0 truncate text-sm text-slate-700">{source.title}</span>
          <button className="shrink-0 text-sm text-rose-600" onClick={()=>void remove(source)}>{tr(lang,"delete")}</button>
        </li>)}
      </ul>
    </section>
  </section>;
}
