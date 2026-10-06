"use client";
import {knowledgeActionText as actionText} from "@/lib/sasi/knowledge-action-copy";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {sasiCommonText} from "@/lib/sasi/common-ui-copy";
import {WEB_RESEARCH_UNAVAILABLE} from "@/lib/sasi/research-ui-copy";
import JSZip from "jszip";
import SasiByokTextWorkbench from "./SasiByokTextWorkbench";
import {
  KnowledgeSource,
  readSources,
  saveSource,
  searchKnowledge,
} from "@/lib/ai-knowledge/local-index";
import { openPdf } from "@/lib/tools/pdf-render-client";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_BATCH_MAX_FILES,
  DOCUMENT_BATCH_MAX_BYTES,
  DOCUMENT_FILE_MAX_BYTES,
  isLegacyOffice,
  parseGenericDocument,
} from "@/lib/files/document-intake";

import { KNOWLEDGE_SOURCE_MAX } from "@/lib/ai-knowledge/local-index";
import{SASI_UNIFIED_ACCEPT}from"@/lib/sasi/composer-core";
import{downloadSasiDocx}from"@/lib/sasi/export-docx";
import{SasiComposerSurface,SasiComposerTextarea}from"@/components/SasiComposerCore";
import{SasiConversationTurns,SasiStatusLine}from"@/components/SasiResultCore";
import{createSasiTurn,type SasiConversationTurn}from"@/lib/sasi/core/session-contract";
import{selectSasiSkills}from"@/lib/sasi/skills/router";
import SasiSkillPicker from"@/components/SasiSkillPicker";
import type{SasiSkillId}from"@/lib/sasi/skills/types";
async function zipText(file:File){
 const zip=await JSZip.loadAsync(file);
 const allowed=/\.(txt|md|json|csv|ya?ml|js|jsx|ts|tsx|css|html|sql|py)$/i;
 const parts:string[]=[];
 const entries=Object.values(zip.files).filter(x=>!x.dir&&allowed.test(x.name)).slice(0,60);
 for(const item of entries){
  const value=(await item.async("string")).slice(0,120000);
  if(value.trim())parts.push(`[${item.name}]\n${value}`);
 }
 if(!parts.length)throw new Error("ZIP_TEXT_NOT_FOUND");
 return parts.join("\n\n").slice(0,1_500_000);
}

type Mode = "book" | "learning" | "research";
type Intelligence = "light" | "standard" | "high";

type FeedbackSignal = "helpful" | "not-helpful" | "incorrect" | "insufficient-evidence";
const FEEDBACK_COPY:Record<FeedbackSignal,Record<LingxiLang,string>>={
 helpful:{zh:"有帮助",en:"Helpful",ja:"役に立った",ko:"도움됨",fr:"Utile",de:"Hilfreich",es:"Útil",pt:"Útil",ar:"مفيد"},
 "not-helpful":{zh:"没帮助",en:"Not helpful",ja:"役に立たない",ko:"도움 안 됨",fr:"Peu utile",de:"Nicht hilfreich",es:"No fue útil",pt:"Não ajudou",ar:"غير مفيد"},
 incorrect:{zh:"有错误",en:"Incorrect",ja:"誤りあり",ko:"오류 있음",fr:"Incorrect",de:"Fehlerhaft",es:"Incorrecto",pt:"Incorreto",ar:"غير صحيح"},
 "insufficient-evidence":{zh:"证据不足",en:"Insufficient evidence",ja:"証拠不足",ko:"근거 부족",fr:"Preuves insuffisantes",de:"Unzureichende Belege",es:"Evidencia insuficiente",pt:"Evidência insuficiente",ar:"أدلة غير كافية"}
};
const feedbackText=(lang:LingxiLang,signal:FeedbackSignal)=>FEEDBACK_COPY[signal][lang]||FEEDBACK_COPY[signal].en;

type Copy = Record<LingxiLang, string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const COPY = {
  browserUnavailable:c("浏览器资料库暂时无法打开，请检查浏览器存储权限。","The browser library cannot be opened right now. Check browser storage permission.","ブラウザ資料庫を開けません。ブラウザの保存権限を確認してください。","브라우저 자료 보관함을 열 수 없습니다. 브라우저 저장 권한을 확인하세요.","La bibliothèque du navigateur est indisponible. Vérifiez l’autorisation de stockage.","Die Browser-Bibliothek kann derzeit nicht geöffnet werden. Prüfen Sie die Speicherberechtigung.","La biblioteca del navegador no está disponible. Revisa el permiso de almacenamiento.","A biblioteca do navegador não pode ser aberta agora. Verifique a permissão de armazenamento.","تعذر فتح مكتبة المتصفح الآن. تحقق من إذن التخزين."),
capacity:c("一次最多可加入 60 份资料；较大的书建议按章节加入。","The local library currently supports up to 60 sources, about 1.5 million characters each. Split large books by chapter.","ローカル資料庫は最大60件、1件あたり約150万文字です。大きな本は章ごとに分けてください。","로컬 자료함은 최대 60개, 각 약 150만 자까지 지원합니다. 큰 책은 장별로 나눠 주세요.","La bibliothèque locale accepte jusqu’à 60 sources, environ 1,5 million de caractères chacune. Divisez les gros livres par chapitre.","Die lokale Bibliothek unterstützt bis zu 60 Quellen mit jeweils etwa 1,5 Mio. Zeichen. Große Bücher bitte nach Kapiteln aufteilen.","La biblioteca local admite hasta 60 fuentes de unos 1,5 millones de caracteres cada una. Divide los libros grandes por capítulos.","A biblioteca local aceita até 60 fontes, com cerca de 1,5 milhão de caracteres cada. Divida livros grandes por capítulos.","تدعم المكتبة المحلية حتى 60 مصدرًا، بنحو 1.5 مليون حرف لكل مصدر. قسّم الكتب الكبيرة حسب الفصول."),
saveFailed:c("保存失败，可能是浏览器存储空间不足。","Could not save. Browser storage may be full.","保存できませんでした。ブラウザの保存容量が不足している可能性があります。","저장에 실패했습니다. 브라우저 저장 공간이 부족할 수 있습니다.","Échec de l’enregistrement. Le stockage du navigateur est peut-être plein.","Speichern fehlgeschlagen. Der Browserspeicher ist möglicherweise voll.","No se pudo guardar. Puede que el almacenamiento del navegador esté lleno.","Falha ao salvar. O armazenamento do navegador pode estar cheio.","تعذر الحفظ. قد تكون مساحة تخزين المتصفح ممتلئة."),
  file30:c("单个文件暂时限制 30MB。","Files are currently limited to 30 MB each.","1ファイルは現在30MBまでです。","파일은 현재 개당 30MB로 제한됩니다.","Chaque fichier est actuellement limité à 30 Mo.","Dateien sind derzeit auf 30 MB begrenzt.","Cada archivo está limitado actualmente a 30 MB.","Cada arquivo está limitado a 30 MB.","الحد الحالي لكل ملف هو 30 ميجابايت."),
  scannedPdf:c("这个 PDF 几乎没有可提取文字，可能是扫描版。请先使用【PDF OCR】或上传页面图片。","This PDF has almost no extractable text and may be scanned. Use PDF OCR first or upload page images.","このPDFには抽出できる文字がほとんどありません。スキャン版の可能性があります。先に【PDF OCR】を使うか、ページ画像をアップロードしてください。","이 PDF에는 추출 가능한 텍스트가 거의 없습니다. 스캔본일 수 있으니 먼저 PDF OCR을 사용하거나 페이지 이미지를 업로드하세요.","Ce PDF contient très peu de texte extractible et peut être scanné. Utilisez d’abord PDF OCR ou importez des images de pages.","Diese PDF enthält kaum extrahierbaren Text und ist möglicherweise gescannt. Nutzen Sie zuerst PDF OCR oder laden Sie Seitenbilder hoch.","Este PDF casi no contiene texto extraíble y puede ser escaneado. Usa primero PDF OCR o sube imágenes de las páginas.","Este PDF quase não contém texto extraível e pode ser digitalizado. Use primeiro PDF OCR ou envie imagens das páginas.","لا يحتوي ملف PDF هذا تقريبًا على نص قابل للاستخراج وقد يكون ممسوحًا ضوئيًا. استخدم PDF OCR أولًا أو ارفع صور الصفحات."),
  imageNoText:c("没有从图片中识别出文字。","No text was recognized in the image.","画像から文字を認識できませんでした。","이미지에서 텍스트를 인식하지 못했습니다.","Aucun texte n’a été reconnu dans l’image.","Im Bild wurde kein Text erkannt.","No se reconoció texto en la imagen.","Nenhum texto foi reconhecido na imagem.","لم يتم التعرف على نص في الصورة."),
  supported:c("支持 PDF、EPUB、DOCX、PPTX、XLSX、CSV、TSV、ODS、RTF、TXT、Markdown、JSON / YAML / XML / HTML、常见代码文件和图片。旧版 DOC / XLS / PPT 可拖入识别，但需要先转为 DOCX / XLSX / PPTX 才能可靠提取正文。","Supports PDF, EPUB, DOCX, PPTX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown, JSON/YAML/XML/HTML, common code files and images. Legacy DOC/XLS/PPT should be converted to DOCX/XLSX/PPTX for reliable extraction.","PDF、DOCX、XLSX、CSV、TSV、ODS、RTF、TXT、Markdown、画像に対応します。旧DOC/XLSはDOCX/XLSXへの変換が必要です。","PDF, DOCX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown, 이미지를 지원합니다. 구형 DOC/XLS는 DOCX/XLSX로 변환해 주세요.","PDF, DOCX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown et images sont pris en charge. Convertissez les anciens DOC/XLS en DOCX/XLSX.","PDF, DOCX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown und Bilder werden unterstützt. Alte DOC/XLS bitte in DOCX/XLSX umwandeln.","Se admiten PDF, DOCX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown e imágenes. Convierte DOC/XLS antiguos a DOCX/XLSX.","Compatível com PDF, DOCX, XLSX, CSV, TSV, ODS, RTF, TXT, Markdown e imagens. Converta DOC/XLS antigos para DOCX/XLSX.","يدعم PDF وDOCX وXLSX وCSV وTSV وODS وRTF وTXT وMarkdown والصور. حوّل DOC/XLS القديمة إلى DOCX/XLSX."),
  fileReadFailed:c("文件读取失败。","Could not read the file.","ファイルを読み取れませんでした。","파일을 읽지 못했습니다.","Impossible de lire le fichier.","Datei konnte nicht gelesen werden.","No se pudo leer el archivo.","Não foi possível ler o arquivo.","تعذر قراءة الملف."),
copyAll:c("复制全部","Copy all","すべてコピー","전체 복사","Tout copier","Alles kopieren","Copiar todo","Copiar tudo","نسخ الكل"),
  copied:c("已复制","Copied","コピー済み","복사됨","Copié","Kopiert","Copiado","Copiado","تم النسخ"),
  balance:c("余额","Balance","AI 残高","AI 잔액","Solde","Guthaben","Saldo","Saldo","الرصيد"),
  minCharge:c("最低扣费","Minimum charge","最低料金","최소 차감","Minimum facturé","Mindestbetrag","Cobro mínimo","Cobrança mínima","الحد الأدنى للخصم"),
  lightHelp:c("快速摘要与简单问答；读取更少证据，输出更短。","Quick summaries and simple Q&A; fewer evidence snippets and shorter output.","短い要約と簡単なQ&A。証拠数と出力を抑えます。","빠른 요약과 간단한 Q&A. 근거와 출력이 더 짧습니다.","Résumés rapides et Q&R simples ; moins de preuves et réponse plus courte.","Schnelle Zusammenfassungen und einfache Fragen; weniger Belege, kürzere Antwort.","Resúmenes rápidos y preguntas simples; menos evidencia y respuesta más corta.","Resumos rápidos e perguntas simples; menos evidências e resposta mais curta.","ملخصات سريعة وأسئلة بسيطة مع أدلة أقل وإجابة أقصر."),
  standardHelp:c("默认推荐；结构化回答，兼顾速度、证据与完整性。","Recommended default; structured answers balancing speed, evidence and completeness.","標準推奨。速度・証拠・完全性をバランスします。","기본 추천. 속도, 근거, 완성도를 균형 있게 제공합니다.","Recommandé ; réponse structurée équilibrant vitesse, preuves et exhaustivité.","Empfohlen; strukturierte Antwort mit ausgewogenem Tempo, Belegen und Vollständigkeit.","Recomendado; respuesta estructurada que equilibra velocidad, evidencia y completitud.","Recomendado; resposta estruturada equilibrando velocidade, evidências e completude.","الخيار الموصى به؛ إجابة منظمة توازن السرعة والأدلة والاكتمال."),
  highHelp:c("复杂研究与多步骤推理；读取更多证据，允许更长、更深入的综合。","For complex research and multi-step reasoning; more evidence and deeper, longer synthesis.","複雑な研究と多段階推論。より多くの証拠を使い、長く深く統合します。","복잡한 연구와 다단계 추론. 더 많은 근거로 더 깊고 긴 종합을 제공합니다.","Recherche complexe et raisonnement multi-étapes ; davantage de preuves et synthèse plus profonde.","Komplexe Forschung und mehrstufiges Denken; mehr Belege und tiefere Synthese.","Investigación compleja y razonamiento en varios pasos; más evidencia y síntesis profunda.","Pesquisa complexa e raciocínio em várias etapas; mais evidências e síntese profunda.","للبحث المعقد والاستدلال متعدد الخطوات؛ أدلة أكثر وتركيب أعمق وأطول."),  noEvidence:c("没有找到足够相关的原文。换一个更接近资料原词的问题，或继续加入资料。","Not enough relevant source text was found. Try wording the question closer to the source, or add more material.","関連する原文が十分に見つかりませんでした。資料中の言葉に近い質問にするか、資料を追加してください。","관련 원문을 충분히 찾지 못했습니다. 자료의 실제 표현에 더 가까운 질문을 하거나 자료를 추가하세요.","Pas assez de texte source pertinent trouvé localement. Reformulez avec les termes de la source ou ajoutez des documents.","Lokal wurde nicht genug relevanter Quelltext gefunden. Formulieren Sie näher an der Quelle oder fügen Sie Material hinzu.","No se encontró suficiente texto fuente relevante. Formula la pregunta con términos más cercanos a la fuente o añade material.","Não foi encontrado texto-fonte relevante suficiente. Reformule com termos mais próximos da fonte ou adicione material.","لم يتم العثور محليًا على نص مصدر ذي صلة بما يكفي. قرّب صياغة السؤال من كلمات المصدر أو أضف مواد أخرى."),
  sending:c("正在结合相关原文整理回答，并保留可核对的出处。","Working from the relevant source text and keeping the answer traceable to its evidence.","関連する原文をもとに回答を整理し、確認できる出典を残しています。","관련 원문을 바탕으로 답변을 정리하고 확인할 수 있는 출처를 남기고 있습니다.","Réponse en cours à partir des sources pertinentes, avec des références vérifiables.","Die Antwort wird aus den relevanten Quellen erstellt und bleibt anhand der Belege nachvollziehbar.","Preparando la respuesta a partir de las fuentes relevantes y conservando referencias verificables.","Preparando a resposta a partir das fontes relevantes e mantendo referências verificáveis.","جارٍ إعداد الإجابة من المصادر ذات الصلة مع إبقاء المراجع قابلة للتحقق."),
  aiFailed:c("这次没有生成回答，请重试。","The answer could not be generated. Try again.","AIの回答に失敗しました。","AI 답변에 실패했습니다.","La réponse de l’IA a échoué.","KI-Antwort fehlgeschlagen.","Falló la respuesta de la IA.","A resposta da IA falhou.","فشلت إجابة الذكاء الاصطناعي."),
  done:c("回答完成。编号 [1]、[2] 对应下方真实原文证据。","Answer complete. [1], [2], etc. refer to the real source evidence below.","回答が完了しました。[1]、[2]などは下の実際の原文証拠に対応します。","답변이 완료되었습니다. [1], [2] 등은 아래 실제 원문 증거와 연결됩니다.","Réponse terminée. [1], [2], etc. renvoient aux preuves réelles ci-dessous.","Antwort fertig. [1], [2] usw. verweisen auf die echten Belege unten.","Respuesta completada. [1], [2], etc. corresponden a la evidencia real de abajo.","Resposta concluída. [1], [2] etc. correspondem às evidências reais abaixo.","اكتملت الإجابة. تشير [1] و[2] وغيرها إلى أدلة المصدر الحقيقية أدناه."),
  realApi:c("现在可以直接使用：","现在可以直接使用：","現在は実際のインターフェース：","현재 실제 인터페이스:","Interface réelle :","Echte Schnittstelle:","Interfaz real:","Interface real:","واجهة فعلية:"),
  privacy:c("资料按原文建立可追溯的私人资料库。提问、比较与复习时都能回到具体出处。","Build a private, traceable source library so every answer, comparison and review can return to the exact source.","原文に戻れるプライベートな資料庫を作り、質問・比較・復習を具体的な出典と結び付けます。","원문으로 돌아갈 수 있는 개인 자료함을 만들고 질문·비교·복습을 실제 출처와 연결합니다.","Créez une bibliothèque privée et traçable afin que chaque réponse, comparaison ou révision puisse revenir à la source précise.","Erstellen Sie eine private, nachvollziehbare Quellenbibliothek, damit Antworten, Vergleiche und Wiederholungen immer zur konkreten Quelle zurückführen.","Crea una biblioteca privada y trazable para que cada respuesta, comparación o repaso pueda volver a la fuente exacta.","Crie uma biblioteca privada e rastreável para que cada resposta, comparação ou revisão volte à fonte exata.","أنشئ مكتبة مصادر خاصة وقابلة للتتبع بحيث يمكن لكل إجابة أو مقارنة أو مراجعة الرجوع إلى المصدر المحدد."),
  add:c("加入","Add ","追加：","추가: ","Ajouter ","Hinzufügen: ","Añadir ","Adicionar ","إضافة "),
  reading:c("正在读取…","Reading…","読み込み中…","읽는 중…","Lecture…","Wird gelesen…","Leyendo…","Lendo…","جارٍ القراءة…"),
  upload:c("批量拖入 PDF / EPUB / Word / PPTX / Excel / CSV / TXT / 代码 / 图片","Drop PDF / EPUB / Word / PPTX / Excel / CSV / TXT / code / images in batches","PDF / Word / Excel / CSV / TXT / 画像をまとめてドロップ","PDF / Word / Excel / CSV / TXT / 이미지를 일괄 드롭","Déposez plusieurs PDF / Word / Excel / CSV / TXT / images","PDF / Word / Excel / CSV / TXT / Bilder stapelweise ablegen","Suelta varios PDF / Word / Excel / CSV / TXT / imágenes","Solte vários PDF / Word / Excel / CSV / TXT / imagens","أسقط عدة ملفات PDF / Word / Excel / CSV / TXT / صور"),
  pdfNote:c("支持 PDF、EPUB、Word、PPTX、Excel、TXT、代码与图片；页码与可识别文字会一起进入资料库。","Supports PDF, EPUB, Word, PPTX, Excel, TXT, code and images; page references and readable text stay attached to the source.","PDF、EPUB、Word、PPTX、Excel、TXT、コード、画像に対応し、ページ位置と読み取れる文字を資料と一緒に保持します。","PDF, EPUB, Word, PPTX, Excel, TXT, 코드와 이미지를 지원하며 페이지 위치와 읽을 수 있는 텍스트를 자료와 함께 보존합니다.","PDF, EPUB, Word, PPTX, Excel, TXT, code et images sont pris en charge ; les pages et le texte lisible restent liés à la source.","PDF, EPUB, Word, PPTX, Excel, TXT, Code und Bilder werden unterstützt; Seitenangaben und lesbarer Text bleiben mit der Quelle verknüpft.","Admite PDF, EPUB, Word, PPTX, Excel, TXT, código e imágenes; las páginas y el texto legible permanecen ligados a la fuente.","Compatível com PDF, EPUB, Word, PPTX, Excel, TXT, código e imagens; páginas e texto legível permanecem ligados à fonte.","يدعم PDF وEPUB وWord وPPTX وExcel وTXT والبرمجيات والصور، مع إبقاء مراجع الصفحات والنص المقروء مرتبطين بالمصدر."),
askSource:c("询问资料","Ask sources","資料に質問","자료 질문","Interroger les sources","Quellen befragen","Preguntar a las fuentes","Perguntar às fontes","اسأل المصادر"),
  askBatch:c("问问 SASI","Ask SASI","SASI に質問","SASI에게 질문","Demander à SASI","SASI fragen","Preguntar a SASI","Perguntar ao SASI","اسأل SASI"),
  smart:c("模式","Intelligence mode","知能モード","지능 모드","Mode d’intelligence","Intelligenzmodus","Modo de inteligencia","Modo de inteligência","وضع الذكاء"),
  billed:c("资料已准备好，可以继续提问","Your sources are ready for the next question","現在の資料Q&Aでは残高を消費しません","현재 자료 Q&A는 잔액을 차감하지 않습니다","Les Q&R sur les sources ne déduisent actuellement pas le solde","Quellen-Q&A zieht derzeit kein Guthaben ab","Las preguntas sobre fuentes no descuentan saldo actualmente","Perguntas sobre fontes não descontam saldo atualmente","لا تخصم أسئلة المصادر من الرصيد حاليًا"),
  light:c("轻量","Light","軽量","라이트","Léger","Leicht","Ligero","Leve","خفيف"),
  standard:c("标准","Standard","標準","표준","Standard","Standard","Estándar","Padrão","قياسي"),
  high:c("高智能","High intelligence","高知能","고지능","Haute intelligence","Hohe Intelligenz","Alta inteligencia","Alta inteligência","ذكاء عالٍ"),
  factor:c("消耗","usage","消費","소모","consommation","Verbrauch","consumo","consumo","استهلاك"),
  modeHelp:c("轻量适合快速摘要与简单问答；标准为默认推荐；高智能适合复杂研究、多步骤推理和更长回答。","Light is for quick summaries and simple Q&A; Standard is the default; High intelligence suits complex research, multi-step reasoning and longer answers.","軽量は短い要約や簡単なQ&A、標準は既定、高知能は複雑な研究・多段階推論・長い回答向けです。","라이트는 빠른 요약과 간단한 Q&A, 표준은 기본 추천, 고지능은 복잡한 연구와 다단계 추론, 긴 답변에 적합합니다.","Léger convient aux résumés rapides et questions simples ; Standard est recommandé par défaut ; Haute intelligence convient aux recherches complexes, au raisonnement multi-étapes et aux réponses longues.","Leicht eignet sich für schnelle Zusammenfassungen und einfache Fragen; Standard ist die Voreinstellung; Hohe Intelligenz für komplexe Forschung, mehrstufiges Denken und längere Antworten.","Ligero sirve para resúmenes rápidos y preguntas simples; Estándar es la opción predeterminada; Alta inteligencia para investigación compleja, razonamiento de varios pasos y respuestas largas.","Leve serve para resumos rápidos e perguntas simples; Padrão é o recomendado; Alta inteligência para pesquisa complexa, raciocínio em várias etapas e respostas longas.","الخفيف للملخصات السريعة والأسئلة البسيطة، والقياسي هو الافتراضي، والذكاء العالي للبحث المعقد والاستدلال متعدد الخطوات والإجابات الأطول."),
  answer:c("基于原文回答","Answer from source text","原文から回答","원문 기반 답변","Répondre à partir du texte source","Aus Quelltext antworten","Responder desde el texto fuente","Responder com base no texto-fonte","الإجابة من النص الأصلي"),
  readingSource:c("正在阅读原文…","Reading source text…","原文を読んでいます…","원문 읽는 중…","Lecture du texte source…","Quelltext wird gelesen…","Leyendo el texto fuente…","Lendo o texto-fonte…","جارٍ قراءة النص الأصلي…"),
  aiPrivacy:c("回答围绕本次问题所需的资料展开，并把可核对的原文证据留在结果下方。","The answer stays focused on the sources needed for this question, with checkable evidence shown below.","回答は今回の質問に必要な資料に沿って作成され、確認できる原文証拠を下に残します。","답변은 이번 질문에 필요한 자료를 중심으로 구성되며 확인 가능한 원문 근거가 아래에 남습니다.","La réponse reste centrée sur les sources nécessaires à cette question, avec les preuves vérifiables affichées ci-dessous.","Die Antwort bleibt auf die für diese Frage relevanten Quellen fokussiert; überprüfbare Belege erscheinen darunter.","La respuesta se centra en las fuentes necesarias para esta pregunta y deja evidencia verificable debajo.","A resposta se concentra nas fontes necessárias para esta pergunta e mantém evidências verificáveis abaixo.","تركّز الإجابة على المصادر اللازمة لهذا السؤال وتعرض أدلة قابلة للتحقق أسفلها."),
  evidence:c("本次原文证据","Source evidence for this answer","今回の原文証拠","이번 원문 증거","Preuves source de cette réponse","Quellbelege für diese Antwort","Evidencia fuente de esta respuesta","Evidências-fonte desta resposta","أدلة المصدر لهذه الإجابة"),
  none:c("没有找到相关原文。","No relevant source text found.","関連する原文が見つかりません。","관련 원문을 찾지 못했습니다.","Aucun texte source pertinent trouvé.","Kein relevanter Quelltext gefunden.","No se encontró texto fuente relevante.","Nenhum texto-fonte relevante encontrado.","لم يتم العثور على نص مصدر ذي صلة."),
  myLocal:c("我的资料","My sources","マイ資料","내 자료","Mes sources","Meine Quellen","Mis fuentes","Minhas fontes","مصادري"),
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

export default function KnowledgeWorkspace({mode="book",initialPrompt="",initialFiles=[],initialSkillIds=[]}:{mode?:Mode;initialPrompt?:string;initialFiles?:File[];initialSkillIds?:SasiSkillId[]}){
  const {lang}=useLingxiLang();
  const [sources,setSources]=useState<KnowledgeSource[]>([]);
  const [question,setQuestion]=useState(initialPrompt);const [useConnectedService,setUseConnectedService]=useState(false);
  const [selectedSkillIds,setSelectedSkillIds]=useState<SasiSkillId[]>(initialSkillIds);
  const [answer,setAnswer]=useState("");
  const [learningEventId,setLearningEventId]=useState("");
  const [feedbackSignal,setFeedbackSignal]=useState<FeedbackSignal|null>(null);
  const [feedbackBusy,setFeedbackBusy]=useState(false);
  const [feedbackNotice,setFeedbackNotice]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [askBusy,setAskBusy]=useState(false);
  const [intelligence,setIntelligence]=useState<Intelligence>("standard");
  const [lastIntelligence,setLastIntelligence]=useState<Intelligence|null>(null);
  const [ready,setReady]=useState(false);
  const [copied,setCopied]=useState(false);
  const [addOpen,setAddOpen]=useState(false);
  const [dragging,setDragging]=useState(false);
  const [needsConnection,setNeedsConnection]=useState(false);
  const [thread,setThread]=useState<SasiConversationTurn[]>([]);
  const fileInputRef=useRef<HTMLInputElement|null>(null);

  const initialFilesRef=useRef(initialFiles);
  const initialFilesImportedRef=useRef(false);
  useEffect(()=>{
    readSources().then(async rows=>{
      setSources(rows);setReady(true);
      if(!initialFilesImportedRef.current&&initialFilesRef.current.length){
        initialFilesImportedRef.current=true;
        await importFiles(initialFilesRef.current);
      }
    }).catch(()=>setNotice(tr(lang,"browserUnavailable")));
  },[lang]);

  async function importOneFile(file:File){
    if(file.size>DOCUMENT_FILE_MAX_BYTES)throw new Error(tr(lang,"file30"));
    if(isLegacyOffice(file)){
      throw new Error(actionText(lang,"legacy",{format:/\.doc$/i.test(file.name)?"DOCX":/\.xls$/i.test(file.name)?"XLSX":"PPTX"}));
    }

    let parsedText="",locators:KnowledgeSource["locators"]|undefined,kind:KnowledgeSource["kind"]="text";
    if(/\.pdf$/i.test(file.name)||file.type==="application/pdf"){
      kind="pdf";
      const parsed=await pdfToSource(file,lang);
      parsedText=parsed.text;
      locators=parsed.locators;
      if(parsedText.replace(/(?:第\s*\d+\s*页|Page\s+\d+|Seite\s+\d+|Página\s+\d+|\d+ページ|\d+페이지|الصفحة\s+\d+)/g,"").trim().length<80){
        throw new Error(tr(lang,"scannedPdf"));
      }
    }else if(file.type.startsWith("image/")){
      kind="image";
      parsedText="";
    }else if(/\.(mp3|wav|m4a|mp4|mov|webm)$/i.test(file.name)||file.type.startsWith("audio/")||file.type.startsWith("video/")){
      parsedText="";
      kind="text";
    }else if(/\.zip$/i.test(file.name)||file.type==="application/zip"){
      parsedText=await zipText(file);
      kind="structured";
    }else{
      const parsed=await parseGenericDocument(file);
      if(!parsed)throw new Error(tr(lang,"supported"));
      parsedText=parsed.text;
      kind=parsed.kind;
    }

    const source:KnowledgeSource={
      id:crypto.randomUUID(),
      title:file.name.slice(0,200),
      text:parsedText.slice(0,1_500_000),
      createdAt:new Date().toISOString(),
      kind,
      locators,
    };
    await saveSource(source);
    setSources(previous=>[...previous,source]);
    return source;
  }

  async function importFiles(list:FileList|File[]){
    let __lingxiBatchBytes = 0;

    const files=Array.from(list).slice(0,DOCUMENT_BATCH_MAX_FILES);
    if(!files.length||busy)return;
    setBusy(true);setNotice("");
    const ok:string[]=[];const failed:string[]=[];let mediaWithoutText=0;
    try{
      for(const file of files){
        try{
          if (__lingxiBatchBytes + Number(file.size || 0) > DOCUMENT_BATCH_MAX_BYTES) {
            const maxMb = Math.round(DOCUMENT_BATCH_MAX_BYTES / 1024 / 1024);
            throw new Error(actionText(lang,"batch",{n:maxMb}));
          }
          __lingxiBatchBytes += Number(file.size || 0);
          const source = await importOneFile(file);
          ok.push(source.title);
          if(!source.text.trim())mediaWithoutText++;
        }catch(error){
          failed.push(error instanceof Error?error.message:`${file.name}: ${tr(lang,"fileReadFailed")}`);
        }
      }
      if(ok.length&&failed.length){
        setNotice(`${actionText(lang,"added",{n:ok.length})} ${failed.slice(0,3).join("; ")}`);
      }else if(ok.length){
        setNotice(actionText(lang,"added",{n:ok.length}));
      }else{
        setNotice(failed[0]||tr(lang,"fileReadFailed"));
      }
    }finally{
      setBusy(false);
    }
    if(mediaWithoutText>0){
      setNeedsConnection(true);
      setNotice(actionText(lang,"media"));
    }
  }

  const asking=useRef(false);
  async function ask(){
    if(asking.current||askBusy||busy)return;
    const raw=question.trim();if(!raw)return;
    setNeedsConnection(false);

    let onlineSources:KnowledgeSource[]=[];
    if(mode==="research"&&selectedSkillIds.includes("web-research")){
      asking.current=true;setAskBusy(true);
      try{
        const response=await fetch("/api/sasi/research/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:raw.slice(0,1200)})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!Array.isArray(data.sources)||!data.sources.length)throw new Error("WEB_SEARCH_UNAVAILABLE");
        onlineSources=data.sources.map((item:{title:string;url:string;text:string})=>({id:item.url,title:`${item.title} — ${item.url}`,text:item.text,createdAt:new Date().toISOString(),locators:[{start:0,end:item.text.length,label:item.url}]}));
      }catch{setNotice(WEB_RESEARCH_UNAVAILABLE[lang]);return}finally{asking.current=false;setAskBusy(false)}
    }
    const textSources=[...sources,...onlineSources].filter(source=>source.text.trim().length>0);
    const largeDirectPaste=raw.length>=800||(raw.length>=300&&(raw.includes("\n")||raw.includes("\r")));
    let evidence=largeDirectPaste?[]:searchKnowledge(textSources,raw.length>4000?raw.slice(-4000):raw,{limit:selectedSkillIds.includes("semantic-retrieval")?9:18,perSource:selectedSkillIds.includes("semantic-retrieval")?2:4});
    if(onlineSources.length&&!evidence.length)evidence=onlineSources.map(source=>({sourceId:source.id,title:source.title,paragraph:1,locator:source.id,text:source.text,score:1}));
    let apiQuestion=raw.slice(0,4000);

    if(largeDirectPaste){
      const chunks=Array.from({length:Math.min(9,Math.ceil(raw.length/8000))},(_,index)=>raw.slice(index*8000,(index+1)*8000));
      evidence=chunks.map((chunk,index)=>({
        sourceId:"__direct_paste__",
        title:actionText(lang,"pasted"),
        paragraph:index+1,
        locator:`${actionText(lang,"pasted")} ${index+1}`,
        text:chunk,
        score:100-index,
      }));
      apiQuestion="Use this pasted content as source material. Respond in the language of the user’s text, summarize it, and complete any explicit request in it.";
    }

    if(!evidence.length){
      setNeedsConnection(true);
      const hasMedia=sources.some(source=>!source.text.trim());
      setNotice(actionText(lang,hasMedia?"media":"noEvidence"));
      return;
    }

    const pendingTurn=createSasiTurn(raw,"");


    setThread(rows=>[...rows,pendingTurn]);


    setQuestion("");


    asking.current=true;setAskBusy(true);setAnswer("");setLearningEventId("");setFeedbackSignal(null);setFeedbackNotice("");setLastIntelligence(null);setNotice(tr(lang,"sending"));
    try{
      const skillPlan=selectSasiSkills({mode,prompt:raw,files:sources.map(source=>source.title),hasEvidence:evidence.length>0});
      const skillIds=[...new Set([...selectedSkillIds,...skillPlan.ids])].slice(0,8);
      const response=await fetch("/api/knowledge/ask",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":pendingTurn.id},body:JSON.stringify({clientTurnId:pendingTurn.id,acceptConnectedBilling:useConnectedService,
        question:apiQuestion,mode,intelligence,useConnectedService,skillIds,evidence:evidence.map((r,i)=>({index:i+1,title:r.title,locator:r.locator,text:r.text}))
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(tr(lang,"aiFailed"));
      setAnswer(data.answer||"");
      setThread(rows=>rows.map(row=>row.id===pendingTurn.id?{...row,assistant:String(data.answer||"")}:row));
      setLearningEventId(String(data.learningEventId||""));
      setLastIntelligence((data.intelligence||intelligence) as Intelligence);
      setNotice(tr(lang,"done"));
    }catch(e:unknown){
      const message=e instanceof Error?e.message:tr(lang,"aiFailed");
      setNotice(message);setQuestion(current=>current||raw);
    }finally{asking.current=false;setAskBusy(false)}
  }

  async function sendFeedback(signal:FeedbackSignal){
    if(!learningEventId||feedbackBusy)return;
    setFeedbackBusy(true);setFeedbackNotice("");
    try{
      const response=await fetch("/api/sasi/learning/feedback",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({learningEventId,signal})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(actionText(lang,"feedbackFailed"));
      setFeedbackSignal(signal);
      setFeedbackNotice(actionText(lang,"feedbackSaved"));
    }catch(e){
      setFeedbackNotice(actionText(lang,"feedbackFailed"));
    }finally{setFeedbackBusy(false)}
  }

  async function remove(source:KnowledgeSource){
    const prompt=`${actionText(lang,"remove")} ${source.title}`;
    if(!window.confirm(prompt))return;
    await saveSource(source.id);setSources(rows=>rows.filter(row=>row.id!==source.id));
  }

  function exportSources(){
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:2,sources},null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="lingxifield-knowledge-backup.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function copyAnswer(){
    if(!answer)return;
    try{
      await navigator.clipboard.writeText(answer);
    }catch{
      const area=document.createElement("textarea");
      area.value=answer;area.style.position="fixed";area.style.opacity="0";
      document.body.appendChild(area);area.focus();area.select();document.execCommand("copy");area.remove();
    }
    setCopied(true);setTimeout(()=>setCopied(false),1600);
  }

  function threadMarkdown(){
    const rows=thread.length?thread:(answer?[{id:"current",user:question,assistant:answer,createdAt:""}]:[]);
    return rows.map((row,i)=>`## ${i+1}. ${row.user}\n\n${row.assistant}\n`).join("\n");
  }
  async function downloadThreadDoc(){
    const rows=thread.length?thread:(answer?[{id:"current",user:question,assistant:answer,createdAt:""}]:[]);
    await downloadSasiDocx(rows.map(row=>({question:row.user,answer:row.assistant})),"sasi-discussion.docx");
  }
  async function downloadThreadZip(){
    const zip=new JSZip();
    zip.file("discussion.md",`# SASI\n\n${threadMarkdown()}`);
    zip.file("sources.txt",sources.map(x=>x.title).join("\n"));
    const blob=await zip.generateAsync({type:"blob"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="sasi-discussion.zip";a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }

  const heading=mode==="research"?tr(lang,"research"):mode==="learning"?tr(lang,"learning"):tr(lang,"book");
  const qPlaceholder=mode==="research"?tr(lang,"qResearch"):mode==="learning"?tr(lang,"qLearning"):tr(lang,"qBook");
  const intelligenceLabels:{value:Intelligence;label:string;help:string}[]=[
    {value:"light",label:lang==="zh"?"快速理解":tr(lang,"light"),help:tr(lang,"lightHelp")},
    {value:"standard",label:lang==="zh"?"深入理解":tr(lang,"standard"),help:tr(lang,"standardHelp")},
    {value:"high",label:lang==="zh"?"深度研究":tr(lang,"high"),help:tr(lang,"highHelp")},
  ];
  const selectedTier=intelligenceLabels.find(row=>row.value===intelligence)!;
  return <section className="mx-auto flex min-h-[calc(100vh-152px)] w-full max-w-4xl flex-col px-2 pb-14 sm:px-4 lx-knowledge-workspace">
    <div className="flex-1 pt-8 sm:pt-12">
      <SasiConversationTurns turns={thread.length?thread:(answer?[{id:"current",user:question,assistant:answer,createdAt:""}]:[])}/>

      {(thread.length>0||answer)&&<div className="mb-10 flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={downloadThreadDoc} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5">{sasiCommonText(lang,"downloadDocument")}</button>
        <button type="button" onClick={()=>void downloadThreadZip()} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5">ZIP</button>
        <button type="button" onClick={()=>void copyAnswer()} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5">{copied?tr(lang,"copied"):tr(lang,"copyAll")}</button>
      </div>}

      {answer&&learningEventId&&<div className="mb-8 flex flex-wrap gap-2">
        {(["helpful","not-helpful","incorrect","insufficient-evidence"] as FeedbackSignal[]).map(signal=><button key={signal} type="button" disabled={feedbackBusy} onClick={()=>void sendFeedback(signal)}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${feedbackSignal===signal?"border-blue-500 bg-blue-50 text-blue-700":"border-[var(--lx-line)] text-[var(--lx-muted)]"} disabled:opacity-40`}>
          {feedbackText(lang,signal)}
        </button>)}
      </div>}
    </div>

    <div className="lx-sasi-composer-dock sticky bottom-3 z-30 mt-auto">
      {sources.length>0&&<div className="mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {sources.slice(-10).map(source=><span key={source.id} className="inline-flex max-w-[220px] shrink-0 items-center gap-2 rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-1.5 text-xs text-[var(--lx-muted)]">
          <span className="truncate">{source.title}</span>{!source.text.trim()&&<span className="shrink-0 text-[10px] text-blue-600">{actionText(lang,"pending")}</span>}
          <button type="button" onClick={()=>void remove(source)} className="opacity-50 hover:opacity-100">×</button>
        </span>)}
      </div>}

      <SasiComposerSurface
        dragging={dragging}
        onDragEnter={e=>{e.preventDefault();setDragging(true)}}
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={e=>{if(e.currentTarget===e.target)setDragging(false)}}
        onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files?.length)void importFiles(e.dataTransfer.files)}}
        className="relative">
        <SasiComposerTextarea value={question}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229){e.preventDefault();void ask()}}}
          aria-label={sasiCommonText(lang,"ask")} onChange={e=>setQuestion(e.target.value)}
          onPaste={e=>{
            const files=Array.from(e.clipboardData.files||[]);
            if(files.length){e.preventDefault();void importFiles(files)}
          }}
          rows={1}
          placeholder={sasiCommonText(lang,"ask")}/>

        <div className="mt-1 flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" accept={SASI_UNIFIED_ACCEPT} multiple disabled={busy}
            onChange={e=>{if(e.target.files?.length)void importFiles(e.target.files);e.currentTarget.value=""}}/>

          <div className="relative">
            <button type="button" aria-label={actionText(lang,"add")} onClick={()=>setAddOpen(v=>!v)}
              className="grid h-9 w-9 place-items-center rounded-full text-2xl hover:bg-[var(--lx-soft)]">＋</button>
            {addOpen&&<div className="absolute bottom-11 left-0 z-50 w-[300px] rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 shadow-[0_14px_48px_rgba(0,0,0,.16)]">
              <button type="button" onClick={()=>{setAddOpen(false);fileInputRef.current?.click()}} className="block w-full rounded-xl px-3 py-3 text-left text-sm hover:bg-[var(--lx-soft)]">
                <b>{actionText(lang,"files")}</b>
                <span className="mt-1 block text-xs text-[var(--lx-faint)]">PDF · EPUB · Word · PPTX · Excel · CSV · TXT · 图片 · 音频 · 视频 · 代码 · ZIP</span>
              </button>
              <div className="mt-1 border-t border-[var(--lx-line)] px-3 pb-1 pt-3 text-xs text-[var(--lx-muted)]">{actionText(lang,"depth")}</div>
              {intelligenceLabels.map(x=><button key={x.value} type="button" onClick={()=>{setIntelligence(x.value);setAddOpen(false)}}
                className="flex w-full items-start justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[var(--lx-soft)]">
                <span>{x.label}<span className="mt-0.5 block text-xs text-[var(--lx-muted)]">{x.help}</span></span>
                {intelligence===x.value?<span className="text-xs text-[var(--lx-muted)]">✓</span>:null}
              </button>)}
              <SasiSkillPicker mode={mode} selected={selectedSkillIds} onChange={setSelectedSkillIds}/>
              <Link href="/sasi/connections" className="block rounded-xl px-3 py-3 text-sm hover:bg-[var(--lx-soft)]">{actionText(lang,"connect")} <span className="float-right">↗</span></Link>
              <Link href="/sasi/connections#tools" className="block rounded-xl px-3 py-3 text-sm hover:bg-[var(--lx-soft)]">{actionText(lang,"tools")} <span className="float-right">↗</span></Link>
            </div>}
          </div>

          <button onClick={ask} disabled={askBusy||!question.trim()}
            className="ml-auto grid h-9 min-w-9 place-items-center rounded-full bg-[var(--lx-ink)] px-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-30">
            {askBusy?"…":"↑"}
          </button>
        </div>

        {notice&&<div className="flex flex-wrap items-center gap-2 px-3 pt-2 text-[11px] leading-5 text-[var(--lx-muted)]">
          <SasiStatusLine>{notice}</SasiStatusLine>
          {needsConnection&&<Link href="/sasi/connections" className="font-medium text-blue-600 hover:underline">{`${actionText(lang,"connect")} →`}</Link>}
        </div>}
      </SasiComposerSurface>
    </div>
  </section>;
}
