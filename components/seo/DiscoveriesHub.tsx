import Link from "next/link";
import type {SeoLocale} from "@/lib/seo/global-seo";

type DiscoverySource={label:string;url:string};
type DiscoveryTool={label:string;href:string};
type DiscoveryArticle={id:string;tag:string;status:string;title:string;summary:string;known:string;open:string;sources:DiscoverySource[];tools:DiscoveryTool[]};
type DiscoveryCopy={
 title:string;description:string;eyebrow:string;methodTitle:string;methodIntro:string;
 knownLabel:string;openLabel:string;sourcesLabel:string;toolsLabel:string;
 articles:DiscoveryArticle[];workflowTitle:string;workflowIntro:string;steps:string[];
 toolsTitle:string;toolsIntro:string;tools:DiscoveryTool[];note:string;
};
const YALE="https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript";
const NASA="https://science.nasa.gov/uap/";
const NASA_FAQ="https://science.nasa.gov/uap/faqs/";
const AARO="https://www.aaro.mil/Portals/136/PDFs/AARO_Historical_Record_Report_Volume_1_2024.pdf";
const SOURCE_VOYNICH=[{label:"Yale Beinecke · MS 408",url:YALE}];
const SOURCE_UAP=[{label:"NASA · UAP Independent Study",url:NASA},{label:"NASA · UAP FAQs",url:NASA_FAQ},{label:"AARO · Historical Record Report (2024)",url:AARO}];
const COPY:Record<SeoLocale,DiscoveryCopy>={
 zh:{
  title:"奇闻发现与资料核验",description:"从伏尼契手稿到 UAP 公开报告，区分已确认记录、尚未解释的问题与推测，并用真实工具处理公开资料。",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"未知可以保持未知，证据必须可追溯",
  methodIntro:"奇闻内容不把猜测写成事实。每个专题分开呈现公开来源、已知事实、仍未解决的问题，以及能够实际完成的资料处理任务。",
  knownLabel:"公开资料确认了什么",openLabel:"仍然未知什么",sourcesLabel:"原始来源",toolsLabel:"相关工具",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"历史馆藏 · 原始来源可查",title:"伏尼契手稿：文字未解，不等于来源神秘",
    summary:"耶鲁贝内克图书馆将其编目为 Beinecke MS 408，认为它制作于 15 世纪末或 16 世纪初的中欧；作者与文字系统仍未知。",
    known:"手稿包含植物、天文与占星图、沐浴场景、宇宙图和药用植物插图。耶鲁提供整部手稿的高分辨率数字图像，便于逐页查看。",
    open:"文字是否编码、如何阅读以及具体内容，仍没有被广泛接受的解读。OCR 可以辅助识别可读的目录、注释或现代研究文字，但不能自动破解未知文字系统。",
    sources:SOURCE_VOYNICH,tools:[{label:"图片 OCR",href:"/tools/ocr"},{label:"PDF 转 TXT",href:"/tools/pdf-to-text"},{label:"文档翻译",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"官方报告 · 证据边界明确",title:"UAP 公开报告：未识别，不等于外星技术",
    summary:"NASA 2023 年独立研究强调高质量观测数据不足；NASA FAQ 表示目前没有可信的地外生命证据，也没有证据证明 UAP 来自外星。AARO 2024 年历史报告同样未发现官方调查确认目击事件代表地外技术。",
    known:"NASA 的研究重点是数据质量、未来观测与科学分析方法。AARO 2024 年历史审查报告称，没有任何美国政府调查、学术研究或官方评审小组确认 UAP 目击事件代表地外技术；多数调查结果指向普通物体、自然现象或误认。",
    open:"个别事件仍可能没有结论，因为影像、遥测、距离、速度或多传感器资料不足。“未识别”描述的是证据尚不足，不是对来源作出的解释。",
    sources:SOURCE_UAP,tools:[{label:"PDF 转 TXT",href:"/tools/pdf-to-text"},{label:"PDF 比较",href:"/tools/pdf-compare"},{label:"文档翻译",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"把好奇心变成可复核的资料工作",workflowIntro:"从原始来源开始，保留版本与日期，再处理文件；不把 OCR 结果、模型判断或单段影像直接当成最终结论。",
  steps:["先保存原始来源、发布机构与发布日期。","从公开 PDF 提取文字，保留原文件作为对照。","需要跨语言阅读时再翻译；不同版本用 PDF 比较核对。","把已确认事实、合理推断和未知事项分栏记录。","分享原始公开来源，不传播私人文件或未经核实的结论。"],
  toolsTitle:"真实工具问题与 Before / After",toolsIntro:"压缩前后的文件体积由工具读取实际文件计算，不预设节省比例；文档提取、翻译与比较也以真实输出为准。",
  tools:[{label:"PDF 转 TXT",href:"/tools/pdf-to-text"},{label:"PDF 比较",href:"/tools/pdf-compare"},{label:"文档翻译",href:"/tools/document-translate"},{label:"图片 OCR",href:"/tools/ocr"},{label:"PDF 压缩前后对比",href:"/tools/compress-pdf"},{label:"图片压缩前后对比",href:"/tools/compress-image"}],
  note:"工具负责提取、转换、比较和整理资料，不替代事实核查。未知文字不能靠普通 OCR 自动解密；UAP 未识别也不能直接推导为地外技术。"
 },
 en:{
  title:"Unusual Discoveries & Source Verification",description:"Explore the Voynich Manuscript and public UAP reports by separating documented facts, unresolved questions and speculation, then work with the original material using practical tools.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"The unknown can remain unknown. Evidence must remain traceable.",
  methodIntro:"Curiosity is not a license to present speculation as fact. Each topic separates primary sources, documented facts, unresolved questions and practical file tasks.",
  knownLabel:"What public records establish",openLabel:"What remains unresolved",sourcesLabel:"Primary sources",toolsLabel:"Related tools",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"Catalogued collection · source available",title:"The Voynich Manuscript: an undeciphered text is not proof of a hidden origin",
    summary:"Yale's Beinecke Library catalogues it as Beinecke MS 408 and dates its production to Central Europe in the late fifteenth or sixteenth century. Its author and script remain unidentified.",
    known:"The manuscript contains botanical, astronomical and astrological drawings, bathing scenes, cosmological diagrams and pharmaceutical illustrations. Yale provides high-resolution digital images of the manuscript.",
    open:"There is no widely accepted reading of the script or its contents. OCR may help with readable catalogues, annotations or modern research notes; it cannot automatically decipher an unknown writing system.",
    sources:SOURCE_VOYNICH,tools:[{label:"Image OCR",href:"/tools/ocr"},{label:"PDF to TXT",href:"/tools/pdf-to-text"},{label:"Document translation",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"Official reports · evidence boundaries",title:"UAP reports: unidentified does not mean extraterrestrial technology",
    summary:"NASA's 2023 independent study emphasized the shortage of high-quality observations. NASA's FAQ says there is no credible evidence of extraterrestrial life and no evidence UAP are extraterrestrial. AARO's 2024 historical report found no official investigation confirming sightings as extraterrestrial technology.",
    known:"NASA focused on data quality, future observations and scientific methods. AARO's 2024 historical review found that no U.S. government investigation, academic-sponsored research or official review panel had confirmed a UAP sighting as extraterrestrial technology; most reviewed sightings were ordinary objects, phenomena or misidentifications.",
    open:"Individual events may remain unresolved when imagery, telemetry, distance, speed or multi-sensor records are missing. 'Unidentified' describes an evidence gap, not an explanation of origin.",
    sources:SOURCE_UAP,tools:[{label:"PDF to TXT",href:"/tools/pdf-to-text"},{label:"Compare PDFs",href:"/tools/pdf-compare"},{label:"Document translation",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"Turn curiosity into verifiable research",workflowIntro:"Start from the original source, preserve its date and version, then process the file. Do not treat OCR, model scores or a single clip as a final conclusion.",
  steps:["Record the original source, publisher and publication date.","Extract text from a public PDF while keeping the original for comparison.","Translate only when needed; compare versions to identify changes.","Separate confirmed facts, reasonable interpretations and unknowns.","Share the original public source, not private files or unsupported conclusions."],
  toolsTitle:"Real tool problems and Before / After",toolsIntro:"Before-and-after file sizes are calculated from the actual input and output. No savings percentage is pre-filled or promised.",
  tools:[{label:"PDF to TXT",href:"/tools/pdf-to-text"},{label:"Compare PDFs",href:"/tools/pdf-compare"},{label:"Document translation",href:"/tools/document-translate"},{label:"Image OCR",href:"/tools/ocr"},{label:"PDF compression comparison",href:"/tools/compress-pdf"},{label:"Image compression comparison",href:"/tools/compress-image"}],
  note:"Tools extract, convert, compare and organize material; they do not replace fact-checking. Ordinary OCR cannot decrypt an unknown script, and an unresolved UAP does not establish an extraterrestrial origin."
 },
 ja:{
  title:"不思議な発見と資料検証",description:"ヴォイニッチ手稿やUAP公開報告を、確認済みの記録・未解決の問い・推測に分け、実用ツールで一次資料を扱います。",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"未知は未知のままでよい。証拠は追跡可能にする。",
  methodIntro:"好奇心を理由に推測を事実として扱いません。一次資料、確認できる事実、未解決の問い、実際のファイル作業を分けて示します。",
  knownLabel:"公開資料で確認できること",openLabel:"まだ解決していないこと",sourcesLabel:"一次資料",toolsLabel:"関連ツール",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"図書館所蔵 · 出典確認可能",title:"ヴォイニッチ手稿：未解読の文字は、謎の起源の証拠ではない",
    summary:"イェール大学ベイネッケ図書館は Beinecke MS 408 として登録し、15世紀末または16世紀初頭の中欧で制作されたと説明しています。作者と文字体系は不明です。",
    known:"植物、天文・占星術、入浴、宇宙図、薬用植物などの挿絵があります。イェール大学は全ページの高解像度デジタル画像を公開しています。",
    open:"文字の読み方や内容について、広く受け入れられた解読はありません。OCRは読める目録や注釈の補助には使えますが、未知の文字体系を自動解読するものではありません。",
    sources:SOURCE_VOYNICH,tools:[{label:"画像 OCR",href:"/tools/ocr"},{label:"PDF から TXT",href:"/tools/pdf-to-text"},{label:"文書翻訳",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"公式報告 · 証拠の範囲を明示",title:"UAP公開報告：未確認であることは、地球外技術を意味しない",
    summary:"NASAの2023年独立研究は高品質な観測データの不足を指摘しました。NASA FAQは地球外生命の確かな証拠も、UAPが地球外由来である証拠もないと説明しています。AAROの2024年報告も、公式調査が地球外技術と確認した事例はないとしています。",
    known:"NASAはデータ品質、将来の観測、科学的分析手法に焦点を当てています。AAROの2024年歴史報告は、米政府調査・学術研究・公式審査委員会のいずれもUAP目撃を地球外技術と確認していないとし、多くの事例は通常の物体や誤認と結論づけています。",
    open:"映像、テレメトリー、距離、速度、複数センサーの記録が不足すれば、個別事例は未解決のままです。「未確認」は証拠不足を示し、起源の説明ではありません。",
    sources:SOURCE_UAP,tools:[{label:"PDF から TXT",href:"/tools/pdf-to-text"},{label:"PDF 比較",href:"/tools/pdf-compare"},{label:"文書翻訳",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"好奇心を検証可能な資料作業へ",workflowIntro:"一次資料から始め、公開日と版を保存してから処理します。OCRやモデル判定、単一の映像だけを最終結論にしません。",
  steps:["原資料、発行機関、公開日を記録する。","公開PDFからテキストを抽出し、原本を保管する。","必要な場合だけ翻訳し、PDF比較で版の差を確認する。","確認済み事実、推論、未知の事項を分けて記録する。","非公開ファイルではなく、公開された一次資料を共有する。"],
  toolsTitle:"実際のツール課題と Before / After",toolsIntro:"圧縮前後の容量は実ファイルから計算し、削減率を事前に決めません。",
  tools:[{label:"PDF から TXT",href:"/tools/pdf-to-text"},{label:"PDF 比較",href:"/tools/pdf-compare"},{label:"文書翻訳",href:"/tools/document-translate"},{label:"画像 OCR",href:"/tools/ocr"},{label:"PDF圧縮の比較",href:"/tools/compress-pdf"},{label:"画像圧縮の比較",href:"/tools/compress-image"}],
  note:"ツールは資料の抽出・変換・比較・整理を支援しますが、事実確認の代わりにはなりません。通常のOCRで未知の文字を解読することはできず、未確認のUAPから地球外起源を結論づけることもできません。"
 },
 ko:{
  title:"미스터리 발견과 자료 검증",description:"보이니치 필사본과 공개 UAP 보고서를 확인된 기록, 미해결 질문, 추측으로 구분하고 실제 도구로 원자료를 다룹니다.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"모르는 것은 미지로 남겨도 됩니다. 증거는 추적 가능해야 합니다.",
  methodIntro:"호기심을 이유로 추측을 사실처럼 쓰지 않습니다. 원출처, 확인된 사실, 미해결 질문과 실제 파일 작업을 구분합니다.",
  knownLabel:"공개 기록으로 확인된 내용",openLabel:"아직 해결되지 않은 내용",sourcesLabel:"원자료",toolsLabel:"관련 도구",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"도서관 소장 자료 · 출처 확인 가능",title:"보이니치 필사본: 해독되지 않은 문자가 숨겨진 기원을 증명하지는 않습니다",
    summary:"예일대 베이니키 도서관은 이 자료를 Beinecke MS 408로 분류하며 15세기 말 또는 16세기 초 중부 유럽에서 제작된 것으로 설명합니다. 저자와 문자 체계는 알려져 있지 않습니다.",
    known:"식물, 천문·점성술, 목욕 장면, 우주 도표, 약용 식물 삽화가 포함되어 있습니다. 예일대는 전체 필사본의 고해상도 디지털 이미지를 제공합니다.",
    open:"문자 체계와 내용에 대해 널리 인정된 해독은 없습니다. OCR은 읽을 수 있는 목록이나 주석을 처리하는 데 도움을 줄 수 있지만 미지의 문자 체계를 자동 해독하지는 못합니다.",
    sources:SOURCE_VOYNICH,tools:[{label:"이미지 OCR",href:"/tools/ocr"},{label:"PDF를 TXT로",href:"/tools/pdf-to-text"},{label:"문서 번역",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"공식 보고서 · 증거 범위 명시",title:"UAP 공개 보고서: 미확인은 외계 기술을 뜻하지 않습니다",
    summary:"NASA의 2023년 독립 연구는 고품질 관측 자료 부족을 강조했습니다. NASA FAQ는 외계 생명체의 신뢰할 만한 증거나 UAP가 외계에서 왔다는 증거가 없다고 설명합니다. AARO의 2024년 보고서도 공식 조사에서 외계 기술로 확인된 사례를 찾지 못했다고 밝혔습니다.",
    known:"NASA는 데이터 품질, 향후 관측과 과학적 분석 방법에 초점을 둡니다. AARO의 2024년 역사 검토는 미국 정부 조사, 학술 연구 또는 공식 검토 패널 중 UAP 목격을 외계 기술로 확인한 사례가 없었으며, 대부분은 일반 물체나 오인으로 설명됐다고 밝혔습니다.",
    open:"영상, 원격측정, 거리, 속도 또는 다중 센서 기록이 부족하면 개별 사례는 미해결로 남을 수 있습니다. '미확인'은 증거 부족을 뜻하며 기원을 설명하지 않습니다.",
    sources:SOURCE_UAP,tools:[{label:"PDF를 TXT로",href:"/tools/pdf-to-text"},{label:"PDF 비교",href:"/tools/pdf-compare"},{label:"문서 번역",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"호기심을 검증 가능한 자료 작업으로",workflowIntro:"원출처에서 시작해 날짜와 버전을 보존한 뒤 파일을 처리합니다. OCR, 모델 점수 또는 단일 영상만으로 결론을 내리지 않습니다.",
  steps:["원출처, 발행 기관과 게시 날짜를 기록합니다.","공개 PDF에서 텍스트를 추출하고 원본을 보관합니다.","필요할 때 번역하고 PDF 비교로 버전 차이를 확인합니다.","확인된 사실, 합리적 추론과 미지의 사항을 분리합니다.","비공개 파일이 아니라 공개된 원출처를 공유합니다."],
  toolsTitle:"실제 도구 문제와 Before / After",toolsIntro:"압축 전후 파일 크기는 실제 입력과 출력에서 계산하며 절감률을 미리 약속하지 않습니다.",
  tools:[{label:"PDF를 TXT로",href:"/tools/pdf-to-text"},{label:"PDF 비교",href:"/tools/pdf-compare"},{label:"문서 번역",href:"/tools/document-translate"},{label:"이미지 OCR",href:"/tools/ocr"},{label:"PDF 압축 비교",href:"/tools/compress-pdf"},{label:"이미지 압축 비교",href:"/tools/compress-image"}],
  note:"도구는 자료 추출, 변환, 비교와 정리를 지원하며 사실 확인을 대신하지 않습니다. 일반 OCR은 미지의 문자를 해독하지 못하며 미확인 UAP가 외계 기원임을 입증하지 않습니다."
 },
 fr:{
  title:"Découvertes insolites et vérification des sources",description:"Du manuscrit de Voynich aux rapports publics sur les UAP, distinguer les faits documentés, les questions ouvertes et les hypothèses, puis traiter les sources avec des outils pratiques.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"L’inconnu peut rester inconnu. Les preuves doivent rester traçables.",
  methodIntro:"La curiosité ne transforme pas une hypothèse en fait. Chaque dossier sépare les sources primaires, les faits établis, les questions ouvertes et les tâches documentaires.",
  knownLabel:"Ce que les sources établissent",openLabel:"Ce qui reste sans réponse",sourcesLabel:"Sources primaires",toolsLabel:"Outils associés",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"Collection cataloguée · source consultable",title:"Le manuscrit de Voynich : un texte indéchiffré ne prouve pas une origine cachée",
    summary:"La bibliothèque Beinecke de Yale le catalogue sous le nom Beinecke MS 408 et situe sa production en Europe centrale à la fin du XVe ou au XVIe siècle. Son auteur et son écriture restent inconnus.",
    known:"Le manuscrit contient des dessins botaniques, astronomiques et astrologiques, des scènes de bains, des diagrammes cosmologiques et des illustrations pharmaceutiques. Yale propose des images numériques haute résolution.",
    open:"Aucune lecture largement reconnue du texte n’existe. L’OCR peut aider à traiter des catalogues ou annotations lisibles, mais ne déchiffre pas automatiquement un système d’écriture inconnu.",
    sources:SOURCE_VOYNICH,tools:[{label:"OCR d’image",href:"/tools/ocr"},{label:"PDF vers TXT",href:"/tools/pdf-to-text"},{label:"Traduction de document",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"Rapports officiels · limites des preuves",title:"Rapports UAP : non identifié ne signifie pas technologie extraterrestre",
    summary:"L’étude indépendante de la NASA publiée en 2023 souligne le manque d’observations de haute qualité. La FAQ de la NASA indique qu’il n’existe aucune preuve crédible de vie extraterrestre ni de lien extraterrestre des UAP. Le rapport historique 2024 de l’AARO ne trouve aucune enquête officielle confirmant une technologie extraterrestre.",
    known:"La NASA se concentre sur la qualité des données, les observations futures et les méthodes scientifiques. L’examen historique 2024 de l’AARO indique qu’aucune enquête du gouvernement américain, recherche universitaire ou commission officielle n’a confirmé qu’une observation UAP représentait une technologie extraterrestre ; la plupart des cas examinés correspondaient à des objets ordinaires ou à des erreurs d’identification.",
    open:"Un cas peut rester non résolu lorsque l’image, la télémétrie, la distance, la vitesse ou les données multisenseurs manquent. « Non identifié » décrit une lacune de preuve, pas une origine.",
    sources:SOURCE_UAP,tools:[{label:"PDF vers TXT",href:"/tools/pdf-to-text"},{label:"Comparer des PDF",href:"/tools/pdf-compare"},{label:"Traduction de document",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"Transformer la curiosité en recherche vérifiable",workflowIntro:"Partir de la source originale, conserver sa date et sa version, puis traiter le fichier. Un résultat OCR ou un extrait vidéo ne constitue pas une conclusion.",
  steps:["Noter la source originale, l’organisme et la date de publication.","Extraire le texte d’un PDF public et conserver l’original.","Traduire si nécessaire et comparer les versions PDF.","Séparer les faits confirmés, les interprétations et les inconnues.","Partager la source publique, pas des fichiers privés ni des conclusions non vérifiées."],
  toolsTitle:"Problèmes réels et Before / After",toolsIntro:"Les tailles avant et après compression sont calculées à partir des fichiers réels ; aucun pourcentage n’est promis à l’avance.",
  tools:[{label:"PDF vers TXT",href:"/tools/pdf-to-text"},{label:"Comparer des PDF",href:"/tools/pdf-compare"},{label:"Traduction",href:"/tools/document-translate"},{label:"OCR d’image",href:"/tools/ocr"},{label:"Comparer la compression PDF",href:"/tools/compress-pdf"},{label:"Comparer la compression d’image",href:"/tools/compress-image"}],
  note:"Les outils extraient, convertissent, comparent et organisent les documents ; ils ne remplacent pas la vérification des faits. L’OCR ordinaire ne déchiffre pas une écriture inconnue et un UAP non identifié ne prouve pas une origine extraterrestre."
 },
 de:{
  title:"Ungewöhnliche Entdeckungen und Quellenprüfung",description:"Vom Voynich-Manuskript bis zu öffentlichen UAP-Berichten: dokumentierte Fakten, offene Fragen und Vermutungen trennen und Originalmaterial mit praktischen Tools bearbeiten.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"Unbekanntes darf unbekannt bleiben. Belege müssen nachvollziehbar sein.",
  methodIntro:"Neugier macht eine Vermutung nicht zur Tatsache. Jedes Dossier trennt Primärquellen, belegte Fakten, offene Fragen und konkrete Dateiaufgaben.",
  knownLabel:"Was öffentliche Quellen belegen",openLabel:"Was ungeklärt bleibt",sourcesLabel:"Primärquellen",toolsLabel:"Passende Tools",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"Katalogisierter Bestand · Quelle verfügbar",title:"Das Voynich-Manuskript: eine unentzifferte Schrift beweist keine verborgene Herkunft",
    summary:"Die Beinecke Library der Yale University führt es als Beinecke MS 408 und datiert seine Entstehung auf Mitteleuropa im späten 15. oder 16. Jahrhundert. Autor und Schriftsystem sind unbekannt.",
    known:"Das Manuskript enthält botanische, astronomische und astrologische Zeichnungen, Badeszenen, kosmologische Diagramme und pharmazeutische Illustrationen. Yale stellt hochauflösende digitale Bilder bereit.",
    open:"Es gibt keine allgemein anerkannte Lesung des Textes. OCR kann lesbare Kataloge oder Anmerkungen unterstützen, aber kein unbekanntes Schriftsystem automatisch entschlüsseln.",
    sources:SOURCE_VOYNICH,tools:[{label:"Bild-OCR",href:"/tools/ocr"},{label:"PDF zu TXT",href:"/tools/pdf-to-text"},{label:"Dokumentübersetzung",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"Offizielle Berichte · klare Beweisgrenzen",title:"UAP-Berichte: nicht identifiziert bedeutet nicht außerirdische Technologie",
    summary:"Die unabhängige NASA-Studie von 2023 betont den Mangel an hochwertigen Beobachtungsdaten. Die NASA-FAQ nennt keine glaubwürdigen Belege für außerirdisches Leben oder einen außerirdischen Ursprung von UAP. Der AARO-Bericht von 2024 fand keine offizielle Untersuchung, die Sichtungen als außerirdische Technologie bestätigte.",
    known:"NASA konzentriert sich auf Datenqualität, künftige Beobachtungen und wissenschaftliche Methoden. Der historische Bericht 2024 von AARO stellte fest, dass weder eine US-Regierungsuntersuchung noch akademische Forschung oder ein offizielles Prüfungsgremium eine UAP-Sichtung als außerirdische Technologie bestätigt hatte; die meisten untersuchten Sichtungen waren gewöhnliche Objekte oder Fehlidentifizierungen.",
    open:"Ein Fall kann ungelöst bleiben, wenn Bildmaterial, Telemetrie, Entfernung, Geschwindigkeit oder Multisensordaten fehlen. „Nicht identifiziert“ beschreibt eine Beweislücke, keine Herkunft.",
    sources:SOURCE_UAP,tools:[{label:"PDF zu TXT",href:"/tools/pdf-to-text"},{label:"PDF vergleichen",href:"/tools/pdf-compare"},{label:"Dokumentübersetzung",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"Neugier in überprüfbare Recherche verwandeln",workflowIntro:"Bei der Originalquelle beginnen, Datum und Version sichern und erst dann Dateien bearbeiten. OCR oder ein einzelner Clip ist kein abschließendes Urteil.",
  steps:["Originalquelle, herausgebende Stelle und Veröffentlichungsdatum notieren.","Text aus einem öffentlichen PDF extrahieren und das Original behalten.","Bei Bedarf übersetzen und PDF-Versionen vergleichen.","Bestätigte Fakten, Schlussfolgerungen und Unbekanntes trennen.","Öffentliche Originalquellen teilen, keine privaten Dateien oder unbelegten Schlussfolgerungen."],
  toolsTitle:"Echte Tool-Probleme und Before / After",toolsIntro:"Dateigrößen vor und nach der Komprimierung werden aus den tatsächlichen Dateien berechnet; es wird keine Einsparquote vorgegeben.",
  tools:[{label:"PDF zu TXT",href:"/tools/pdf-to-text"},{label:"PDF vergleichen",href:"/tools/pdf-compare"},{label:"Dokumentübersetzung",href:"/tools/document-translate"},{label:"Bild-OCR",href:"/tools/ocr"},{label:"PDF-Komprimierung vergleichen",href:"/tools/compress-pdf"},{label:"Bildkomprimierung vergleichen",href:"/tools/compress-image"}],
  note:"Tools extrahieren, konvertieren, vergleichen und organisieren Material; sie ersetzen keine Faktenprüfung. Normale OCR entschlüsselt keine unbekannte Schrift, und ein ungelöstes UAP belegt keinen außerirdischen Ursprung."
 },
 es:{
  title:"Descubrimientos y verificación de fuentes",description:"Del manuscrito Voynich a los informes públicos sobre UAP: separar hechos documentados, preguntas abiertas y especulación, y trabajar con fuentes originales mediante herramientas prácticas.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"Lo desconocido puede seguir siendo desconocido. La evidencia debe poder rastrearse.",
  methodIntro:"La curiosidad no convierte una hipótesis en un hecho. Cada dossier separa fuentes primarias, hechos documentados, preguntas abiertas y tareas reales con archivos.",
  knownLabel:"Qué confirman las fuentes públicas",openLabel:"Qué sigue sin resolverse",sourcesLabel:"Fuentes primarias",toolsLabel:"Herramientas relacionadas",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"Colección catalogada · fuente disponible",title:"El manuscrito Voynich: una escritura sin descifrar no demuestra un origen oculto",
    summary:"La Biblioteca Beinecke de Yale lo cataloga como Beinecke MS 408 y sitúa su producción en Europa central a finales del siglo XV o durante el XVI. Se desconocen el autor y el sistema de escritura.",
    known:"El manuscrito contiene dibujos botánicos, astronómicos y astrológicos, escenas de baños, diagramas cosmológicos e ilustraciones farmacéuticas. Yale ofrece imágenes digitales de alta resolución.",
    open:"No existe una lectura ampliamente aceptada del texto. El OCR puede ayudar con catálogos o anotaciones legibles, pero no descifra automáticamente un sistema de escritura desconocido.",
    sources:SOURCE_VOYNICH,tools:[{label:"OCR de imagen",href:"/tools/ocr"},{label:"PDF a TXT",href:"/tools/pdf-to-text"},{label:"Traducción de documentos",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"Informes oficiales · límites de la evidencia",title:"Informes UAP: no identificado no significa tecnología extraterrestre",
    summary:"El estudio independiente de la NASA de 2023 destacó la falta de observaciones de alta calidad. La FAQ de NASA dice que no hay pruebas creíbles de vida extraterrestre ni evidencia de que los UAP sean extraterrestres. El informe histórico de AARO de 2024 no encontró investigaciones oficiales que confirmaran tecnología extraterrestre.",
    known:"NASA se centra en la calidad de los datos, futuras observaciones y métodos científicos. El informe histórico de AARO de 2024 concluyó que ninguna investigación del Gobierno estadounidense, estudio académico o panel oficial había confirmado que un avistamiento UAP representara tecnología extraterrestre; la mayoría de los casos revisados eran objetos ordinarios o identificaciones erróneas.",
    open:"Un caso puede seguir sin resolverse cuando faltan imágenes, telemetría, distancia, velocidad o registros multisensor. «No identificado» describe una carencia de evidencia, no un origen.",
    sources:SOURCE_UAP,tools:[{label:"PDF a TXT",href:"/tools/pdf-to-text"},{label:"Comparar PDF",href:"/tools/pdf-compare"},{label:"Traducción de documentos",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"Convertir la curiosidad en investigación verificable",workflowIntro:"Empieza por la fuente original, conserva la fecha y la versión y después procesa el archivo. Un resultado OCR o un solo vídeo no es una conclusión definitiva.",
  steps:["Anota la fuente original, la institución y la fecha de publicación.","Extrae texto de un PDF público y conserva el original.","Traduce cuando haga falta y compara las versiones del PDF.","Separa hechos confirmados, interpretaciones razonables y desconocidos.","Comparte la fuente pública original, no archivos privados ni conclusiones sin verificar."],
  toolsTitle:"Problemas reales y Before / After",toolsIntro:"El tamaño antes y después de comprimir se calcula con los archivos reales; no se promete un porcentaje de ahorro por adelantado.",
  tools:[{label:"PDF a TXT",href:"/tools/pdf-to-text"},{label:"Comparar PDF",href:"/tools/pdf-compare"},{label:"Traducción de documentos",href:"/tools/document-translate"},{label:"OCR de imagen",href:"/tools/ocr"},{label:"Comparar compresión PDF",href:"/tools/compress-pdf"},{label:"Comparar compresión de imagen",href:"/tools/compress-image"}],
  note:"Las herramientas extraen, convierten, comparan y organizan documentos; no sustituyen la verificación de hechos. El OCR común no descifra escrituras desconocidas y un UAP no identificado no demuestra un origen extraterrestre."
 },
 pt:{
  title:"Descobertas e verificação de fontes",description:"Do manuscrito Voynich aos relatórios públicos de UAP: separar fatos documentados, perguntas em aberto e especulação, trabalhando com fontes originais por meio de ferramentas práticas.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"O desconhecido pode continuar desconhecido. A evidência precisa ser rastreável.",
  methodIntro:"Curiosidade não transforma hipótese em fato. Cada dossiê separa fontes primárias, fatos documentados, questões em aberto e tarefas reais com arquivos.",
  knownLabel:"O que as fontes públicas confirmam",openLabel:"O que continua sem resposta",sourcesLabel:"Fontes primárias",toolsLabel:"Ferramentas relacionadas",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"Coleção catalogada · fonte disponível",title:"O manuscrito Voynich: uma escrita não decifrada não prova uma origem oculta",
    summary:"A Biblioteca Beinecke de Yale cataloga o manuscrito como Beinecke MS 408 e situa sua produção na Europa Central no fim do século XV ou durante o século XVI. Autor e sistema de escrita são desconhecidos.",
    known:"O manuscrito contém desenhos botânicos, astronômicos e astrológicos, cenas de banho, diagramas cosmológicos e ilustrações farmacêuticas. Yale disponibiliza imagens digitais em alta resolução.",
    open:"Não existe uma leitura amplamente aceita do texto. OCR pode ajudar com catálogos ou anotações legíveis, mas não decifra automaticamente um sistema de escrita desconhecido.",
    sources:SOURCE_VOYNICH,tools:[{label:"OCR de imagem",href:"/tools/ocr"},{label:"PDF para TXT",href:"/tools/pdf-to-text"},{label:"Tradução de documentos",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"Relatórios oficiais · limites da evidência",title:"Relatórios de UAP: não identificado não significa tecnologia extraterrestre",
    summary:"O estudo independente da NASA de 2023 destacou a falta de observações de alta qualidade. A FAQ da NASA diz que não há evidência confiável de vida extraterrestre nem de origem extraterrestre dos UAP. O relatório histórico da AARO de 2024 não encontrou investigação oficial que confirmasse tecnologia extraterrestre.",
    known:"A NASA se concentra na qualidade dos dados, observações futuras e métodos científicos. O relatório histórico da AARO de 2024 concluiu que nenhuma investigação do governo dos EUA, pesquisa acadêmica ou painel oficial confirmou que um avistamento UAP representasse tecnologia extraterrestre; a maioria dos casos analisados era de objetos comuns ou identificação incorreta.",
    open:"Um caso pode continuar sem solução quando faltam imagens, telemetria, distância, velocidade ou registros de vários sensores. 'Não identificado' descreve uma lacuna de evidência, não uma origem.",
    sources:SOURCE_UAP,tools:[{label:"PDF para TXT",href:"/tools/pdf-to-text"},{label:"Comparar PDFs",href:"/tools/pdf-compare"},{label:"Tradução de documentos",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"Transformar curiosidade em pesquisa verificável",workflowIntro:"Comece pela fonte original, preserve data e versão e só então processe o arquivo. OCR ou um único vídeo não constituem uma conclusão final.",
  steps:["Registre a fonte original, a instituição e a data de publicação.","Extraia texto de um PDF público e mantenha o original.","Traduza quando necessário e compare versões do PDF.","Separe fatos confirmados, interpretações razoáveis e incógnitas.","Compartilhe a fonte pública original, não arquivos privados ou conclusões sem verificação."],
  toolsTitle:"Problemas reais e Before / After",toolsIntro:"O tamanho antes e depois da compressão é calculado com os arquivos reais; nenhuma taxa de economia é prometida antecipadamente.",
  tools:[{label:"PDF para TXT",href:"/tools/pdf-to-text"},{label:"Comparar PDFs",href:"/tools/pdf-compare"},{label:"Tradução de documentos",href:"/tools/document-translate"},{label:"OCR de imagem",href:"/tools/ocr"},{label:"Comparar compressão PDF",href:"/tools/compress-pdf"},{label:"Comparar compressão de imagem",href:"/tools/compress-image"}],
  note:"As ferramentas extraem, convertem, comparam e organizam materiais; não substituem a verificação dos fatos. OCR comum não decifra escrita desconhecida e um UAP não identificado não comprova origem extraterrestre."
 },
 ar:{
  title:"اكتشافات غير مألوفة والتحقق من المصادر",description:"من مخطوطة فوينيتش إلى تقارير UAP العامة: افصل بين الوقائع الموثقة والأسئلة المفتوحة والتكهنات، ثم عالج المصادر الأصلية بأدوات عملية.",
  eyebrow:"DISCOVERY LAB · EVIDENCE FIRST",methodTitle:"يمكن أن يبقى المجهول مجهولًا. ويجب أن تظل الأدلة قابلة للتتبع.",
  methodIntro:"الفضول لا يحوّل الفرضية إلى حقيقة. يفصل كل ملف بين المصادر الأولية والوقائع المثبتة والأسئلة المفتوحة ومهام الملفات العملية.",
  knownLabel:"ما الذي تثبته السجلات العامة",openLabel:"ما الذي لا يزال غير محسوم",sourcesLabel:"المصادر الأولية",toolsLabel:"الأدوات المرتبطة",
  articles:[
   {id:"voynich",tag:"HISTORICAL MANUSCRIPT · MS 408",status:"مجموعة مفهرسة · المصدر متاح",title:"مخطوطة فوينيتش: النص غير المفكوك لا يثبت أصلًا خفيًا",
    summary:"تفهرس مكتبة Beinecke في جامعة Yale المخطوطة باسم Beinecke MS 408، وتؤرخ إنتاجها إلى أوروبا الوسطى في أواخر القرن الخامس عشر أو القرن السادس عشر. المؤلف ونظام الكتابة غير معروفين.",
    known:"تضم المخطوطة رسومات نباتية وفلكية وتنجيمية ومشاهد للاستحمام ومخططات كونية ورسومًا صيدلانية. توفر Yale صورًا رقمية عالية الدقة للمخطوطة كاملة.",
    open:"لا توجد قراءة مقبولة على نطاق واسع للنص. يمكن أن يساعد OCR في فهرسة أو ملاحظات مقروءة، لكنه لا يفك تلقائيًا نظام كتابة مجهولًا.",
    sources:SOURCE_VOYNICH,tools:[{label:"OCR للصور",href:"/tools/ocr"},{label:"تحويل PDF إلى TXT",href:"/tools/pdf-to-text"},{label:"ترجمة المستندات",href:"/tools/document-translate"}]},
   {id:"uap",tag:"UAP · PUBLIC RECORDS",status:"تقارير رسمية · حدود الأدلة واضحة",title:"تقارير UAP: غير محدد لا يعني تقنية من خارج الأرض",
    summary:"أكدت دراسة NASA المستقلة لعام 2023 نقص الملاحظات عالية الجودة. وتقول أسئلة NASA الشائعة إنه لا يوجد دليل موثوق على حياة خارج الأرض ولا دليل على أن UAP من أصل خارج الأرض. ولم يجد تقرير AARO التاريخي لعام 2024 تحقيقًا رسميًا أكد أن المشاهدات تمثل تقنية خارج الأرض.",
    known:"تركز NASA على جودة البيانات والملاحظات المستقبلية والأساليب العلمية. وخلص التقرير التاريخي لـAARO لعام 2024 إلى أن أي تحقيق حكومي أمريكي أو بحث أكاديمي أو لجنة مراجعة رسمية لم يؤكد أن مشاهدة UAP تمثل تقنية من خارج الأرض؛ وكانت معظم الحالات التي راجعها أجسامًا عادية أو حالات التباس في التعرف.",
    open:"قد تبقى الحالة دون حل عند غياب الصور أو القياس عن بُعد أو المسافة أو السرعة أو بيانات المستشعرات المتعددة. تعني عبارة «غير محدد» نقص الأدلة لا تفسير الأصل.",
    sources:SOURCE_UAP,tools:[{label:"تحويل PDF إلى TXT",href:"/tools/pdf-to-text"},{label:"مقارنة ملفات PDF",href:"/tools/pdf-compare"},{label:"ترجمة المستندات",href:"/tools/document-translate"}]}
  ],
  workflowTitle:"حوّل الفضول إلى بحث قابل للتحقق",workflowIntro:"ابدأ بالمصدر الأصلي، واحتفظ بتاريخ النشر والإصدار، ثم عالج الملف. لا تجعل OCR أو درجة نموذج أو مقطعًا واحدًا حكمًا نهائيًا.",
  steps:["سجّل المصدر الأصلي والجهة الناشرة وتاريخ النشر.","استخرج النص من PDF عام واحتفظ بالملف الأصلي للمقارنة.","ترجم عند الحاجة وقارن إصدارات PDF.","افصل الوقائع المؤكدة عن التفسيرات المعقولة والمجهول.","شارك المصدر العام الأصلي، لا الملفات الخاصة أو الاستنتاجات غير المتحققة."],
  toolsTitle:"مشكلات أدوات حقيقية وBefore / After",toolsIntro:"يُحسب حجم الملف قبل الضغط وبعده من الملفات الفعلية؛ ولا تُفترض نسبة توفير مسبقًا.",
  tools:[{label:"تحويل PDF إلى TXT",href:"/tools/pdf-to-text"},{label:"مقارنة PDF",href:"/tools/pdf-compare"},{label:"ترجمة المستندات",href:"/tools/document-translate"},{label:"OCR للصور",href:"/tools/ocr"},{label:"مقارنة ضغط PDF",href:"/tools/compress-pdf"},{label:"مقارنة ضغط الصور",href:"/tools/compress-image"}],
  note:"تساعد الأدوات على استخراج المواد وتحويلها ومقارنتها وتنظيمها، لكنها لا تحل محل التحقق من الوقائع. لا يفك OCR العادي كتابة مجهولة، ولا يثبت UAP غير المحدد أصلًا خارج الأرض."
 }
};
export const DISCOVERIES_META=Object.fromEntries(Object.entries(COPY).map(([locale,value])=>[locale,{title:value.title,description:value.description}])) as Record<SeoLocale,{title:string;description:string}>;

export default function DiscoveriesHub({locale}:{locale:SeoLocale}){
 const c=COPY[locale]||COPY.en;
 return <div data-lx-discovery>
  <section className="lx-growth-panel lx-discovery-method">
   <p className="lx-growth-eyebrow">{c.eyebrow}</p>
   <h2>{c.methodTitle}</h2>
   <p>{c.methodIntro}</p>
  </section>
  <div className="lx-discovery-grid">
   {c.articles.map(article=><article className="lx-discovery-card" key={article.id}>
    <div className="lx-discovery-card-meta"><span>{article.tag}</span><span>{article.status}</span></div>
    <h2>{article.title}</h2><p>{article.summary}</p>
    <div className="lx-discovery-facts">
     <section><h3>{c.knownLabel}</h3><p>{article.known}</p></section>
     <section><h3>{c.openLabel}</h3><p>{article.open}</p></section>
    </div>
    <div className="lx-discovery-links">
     <strong>{c.sourcesLabel}</strong><div>{article.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</div>
    </div>
    <div className="lx-discovery-links">
     <strong>{c.toolsLabel}</strong><div>{article.tools.map(tool=><Link key={tool.href} href={tool.href}>{tool.label} →</Link>)}</div>
    </div>
   </article>)}
  </div>
  <section className="lx-growth-panel lx-discovery-workflow" id="use-cases">
   <h2>{c.workflowTitle}</h2><p>{c.workflowIntro}</p>
   <ol className="lx-growth-steps">{c.steps.map((step,index)=><li key={step}><strong>{String(index+1).padStart(2,"0")}</strong><span>{step}</span></li>)}</ol>
  </section>
  <section className="lx-growth-panel lx-discovery-tools" id="before-after">
   <h2>{c.toolsTitle}</h2><p>{c.toolsIntro}</p>
   <div className="lx-growth-tool-grid">{c.tools.map(tool=><Link className="lx-growth-tool-card" key={tool.href} href={tool.href}><strong>{tool.label}</strong><span>LINGXIFIELD · Open tool →</span></Link>)}</div>
  </section>
  <p className="lx-discovery-note">{c.note}</p>
 </div>;
}
