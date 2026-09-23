import type { LingxiLang } from "@/lib/lingxi-i18n";

const COPY:Record<string,Record<LingxiLang,string>>={
  "返回我的场域": {
    "zh": "返回我的场域",
    "en": "Back to My Field",
    "ja": "マイフィールドへ戻る",
    "ko": "내 필드로 돌아가기",
    "fr": "Retour à Mon espace",
    "de": "Zurück zu Mein Feld",
    "es": "Volver a Mi campo",
    "pt": "Voltar ao Meu campo",
    "ar": "العودة إلى مجالي"
  },
  "返回八流进度": {
    "zh": "返回八流进度",
    "en": "Back to Eight Streams",
    "ja": "八流の進捗へ戻る",
    "ko": "8개 흐름 진행으로 돌아가기",
    "fr": "Retour aux huit flux",
    "de": "Zurück zu den acht Strömen",
    "es": "Volver a los ocho flujos",
    "pt": "Voltar aos oito fluxos",
    "ar": "العودة إلى المسارات الثمانية"
  },
  "我的场域": {
    "zh": "我的场域",
    "en": "My Field",
    "ja": "マイフィールド",
    "ko": "내 필드",
    "fr": "Mon espace",
    "de": "Mein Feld",
    "es": "Mi campo",
    "pt": "Meu campo",
    "ar": "مجالي"
  },
  "档案主体": {
    "zh": "档案主体",
    "en": "Archive subject",
    "ja": "アーカイブ対象",
    "ko": "아카이브 대상",
    "fr": "Sujet de l’archive",
    "de": "Archivsubjekt",
    "es": "Sujeto del archivo",
    "pt": "Sujeito do arquivo",
    "ar": "موضوع الأرشيف"
  },
  "正在准备当前语言…": {
    "zh": "正在准备当前语言…",
    "en": "Preparing current language…",
    "ja": "現在の言語を準備中…",
    "ko": "현재 언어 준비 중…",
    "fr": "Préparation de la langue actuelle…",
    "de": "Aktuelle Sprache wird vorbereitet…",
    "es": "Preparando el idioma actual…",
    "pt": "Preparando o idioma atual…",
    "ar": "جارٍ إعداد اللغة الحالية…"
  },
  "当前语言生成失败，请稍后重试。为避免语言不一致，PDF 下载已暂时关闭。": {
    "zh": "当前语言生成失败，请稍后重试。为避免语言不一致，PDF 下载已暂时关闭。",
    "en": "Could not prepare the current language. Please try again later. PDF download is disabled to avoid a language mismatch.",
    "ja": "現在の言語を準備できませんでした。後でもう一度お試しください。言語の不一致を防ぐため、PDFダウンロードは一時停止しています。",
    "ko": "현재 언어를 준비하지 못했습니다. 잠시 후 다시 시도하세요. 언어 불일치를 막기 위해 PDF 다운로드가 일시 중지되었습니다.",
    "fr": "Impossible de préparer la langue actuelle. Réessayez plus tard. Le téléchargement PDF est désactivé afin d’éviter une incohérence de langue.",
    "de": "Die aktuelle Sprache konnte nicht vorbereitet werden. Bitte später erneut versuchen. Der PDF-Download ist deaktiviert, um Sprachabweichungen zu vermeiden.",
    "es": "No se pudo preparar el idioma actual. Inténtalo más tarde. La descarga del PDF está desactivada para evitar inconsistencias de idioma.",
    "pt": "Não foi possível preparar o idioma atual. Tente novamente mais tarde. O download do PDF foi desativado para evitar divergência de idioma.",
    "ar": "تعذر إعداد اللغة الحالية. حاول لاحقًا. تم تعطيل تنزيل PDF لتجنب اختلاف اللغة."
  },
  "正在生成固定 A4 PDF…": {
    "zh": "正在生成固定 A4 PDF…",
    "en": "Generating fixed A4 PDF…",
    "ja": "固定A4 PDFを生成中…",
    "ko": "고정 A4 PDF 생성 중…",
    "fr": "Génération du PDF A4 fixe…",
    "de": "Festes A4-PDF wird erstellt…",
    "es": "Generando PDF A4 fijo…",
    "pt": "Gerando PDF A4 fixo…",
    "ar": "جارٍ إنشاء PDF A4 ثابت…"
  },
  "下载 16 页完整 PDF": {
    "zh": "下载 16 页完整 PDF",
    "en": "Download complete 16-page PDF",
    "ja": "16ページ完全版PDFをダウンロード",
    "ko": "16페이지 전체 PDF 다운로드",
    "fr": "Télécharger le PDF complet de 16 pages",
    "de": "Vollständiges 16-seitiges PDF herunterladen",
    "es": "Descargar PDF completo de 16 páginas",
    "pt": "Baixar PDF completo de 16 páginas",
    "ar": "تنزيل ملف PDF الكامل من 16 صفحة"
  },
  "PDF 未能完整生成。系统已阻止空图或残缺页面下载，请稍后重试；网页档案仍已保存。": {
    "zh": "PDF 未能完整生成。系统已阻止空图或残缺页面下载，请稍后重试；网页档案仍已保存。",
    "en": "The PDF could not be generated completely. Empty or incomplete pages were blocked; try again later. The web archive remains saved.",
    "ja": "PDFを完全に生成できませんでした。空白または不完全なページのダウンロードを防止しました。後で再試行してください。Webアーカイブは保存されています。",
    "ko": "PDF를 완전히 생성하지 못했습니다. 빈 페이지나 불완전한 페이지 다운로드를 차단했습니다. 나중에 다시 시도하세요. 웹 아카이브는 저장되어 있습니다.",
    "fr": "Le PDF n’a pas pu être généré entièrement. Les pages vides ou incomplètes ont été bloquées ; réessayez plus tard. L’archive web reste enregistrée.",
    "de": "Das PDF konnte nicht vollständig erstellt werden. Leere oder unvollständige Seiten wurden blockiert; bitte später erneut versuchen. Das Webarchiv bleibt gespeichert.",
    "es": "No se pudo generar el PDF completo. Se bloquearon páginas vacías o incompletas; inténtalo más tarde. El archivo web sigue guardado.",
    "pt": "O PDF não pôde ser gerado por completo. Páginas vazias ou incompletas foram bloqueadas; tente mais tarde. O arquivo web continua salvo.",
    "ar": "تعذر إنشاء ملف PDF بالكامل. تم منع تنزيل الصفحات الفارغة أو غير المكتملة؛ حاول لاحقًا. يبقى الأرشيف على الويب محفوظًا."
  },
  "完整档案已生成。": {
    "zh": "完整档案已生成。",
    "en": "Complete archive generated.",
    "ja": "完全版アーカイブを生成しました。",
    "ko": "전체 아카이브가 생성되었습니다.",
    "fr": "Archive complète générée.",
    "de": "Vollständiges Archiv erstellt.",
    "es": "Archivo completo generado.",
    "pt": "Arquivo completo gerado.",
    "ar": "تم إنشاء الأرشيف الكامل."
  },
  "二十四问 · 原始回声": {
    "zh": "二十四问 · 原始回声",
    "en": "Twenty-four questions · Original echoes",
    "ja": "24問 · 原初の反響",
    "ko": "24문 · 원초의 메아리",
    "fr": "Vingt-quatre questions · Échos originels",
    "de": "Vierundzwanzig Fragen · Ursprüngliche Echos",
    "es": "Veinticuatro preguntas · Ecos originales",
    "pt": "Vinte e quatro perguntas · Ecos originais",
    "ar": "أربعة وعشرون سؤالًا · أصداء أصلية"
  },
  "原始回声": {
    "zh": "原始回声",
    "en": "Original echo",
    "ja": "原初の反響",
    "ko": "원초의 메아리",
    "fr": "Écho originel",
    "de": "Ursprüngliches Echo",
    "es": "Eco original",
    "pt": "Eco original",
    "ar": "صدى أصلي"
  },
  "所应": {
    "zh": "所应",
    "en": "Response",
    "ja": "応答",
    "ko": "응답",
    "fr": "Réponse",
    "de": "Antwort",
    "es": "Respuesta",
    "pt": "Resposta",
    "ar": "الاستجابة"
  },
  "生命原型 · 八流归一": {
    "zh": "生命原型 · 八流归一",
    "en": "Life Archetype · Eight Streams Converged",
    "ja": "生命原型 · 八流統合",
    "ko": "생명 원형 · 여덟 흐름 통합",
    "fr": "Archétype de vie · Huit flux réunis",
    "de": "Lebensarchetyp · Acht Ströme vereint",
    "es": "Arquetipo de vida · Ocho flujos reunidos",
    "pt": "Arquétipo de vida · Oito fluxos reunidos",
    "ar": "نمط الحياة الأصلي · التقاء المسارات الثمانية"
  },
  "此卷尚未通过 V6 证据核验": {
    "zh": "此卷尚未通过 V6 证据核验",
    "en": "This archive has not passed V6 evidence verification",
    "ja": "このアーカイブはV6証拠検証を通過していません",
    "ko": "이 아카이브는 V6 증거 검증을 통과하지 못했습니다",
    "fr": "Cette archive n’a pas passé la vérification des preuves V6",
    "de": "Dieses Archiv hat die V6-Evidenzprüfung nicht bestanden",
    "es": "Este archivo no ha superado la verificación de evidencia V6",
    "pt": "Este arquivo não passou na verificação de evidências V6",
    "ar": "لم يجتز هذا الأرشيف تحقق الأدلة V6"
  },
  "旧档案、不同姓名档案或缺少底层证据的支流不会被补写成生命原型。请返回八流进度，按同一姓名重新核验。": {
    "zh": "旧档案、不同姓名档案或缺少底层证据的支流不会被补写成生命原型。请返回八流进度，按同一姓名重新核验。",
    "en": "Old archives, archives under a different name, or streams lacking source evidence are not rewritten into a Life Archetype. Return to Eight Streams and verify again under the same name.",
    "ja": "古いアーカイブ、異なる名前のアーカイブ、基礎証拠のない流れは生命原型として補完されません。八流の進捗へ戻り、同じ名前で再検証してください。",
    "ko": "이전 아카이브, 다른 이름의 아카이브, 기초 증거가 부족한 흐름은 생명 원형으로 보완되지 않습니다. 8개 흐름 진행으로 돌아가 같은 이름으로 다시 검증하세요.",
    "fr": "Les anciennes archives, celles sous un autre nom ou les flux sans preuves de base ne sont pas réécrits en Archétype de vie. Revenez aux huit flux et vérifiez à nouveau sous le même nom.",
    "de": "Alte Archive, Archive unter anderem Namen oder Ströme ohne Grundbelege werden nicht zum Lebensarchetyp ergänzt. Kehren Sie zu den acht Strömen zurück und prüfen Sie erneut unter demselben Namen.",
    "es": "Los archivos antiguos, los de otro nombre o los flujos sin evidencia de base no se completan como Arquetipo de vida. Vuelve a los ocho flujos y verifica de nuevo con el mismo nombre.",
    "pt": "Arquivos antigos, arquivos com outro nome ou fluxos sem evidência de base não são completados como Arquétipo de vida. Volte aos oito fluxos e verifique novamente com o mesmo nome.",
    "ar": "لا تُستكمل الأرشيفات القديمة أو ذات الأسماء المختلفة أو المسارات التي تفتقر إلى أدلة أساسية كنمط حياة أصلي. عد إلى المسارات الثمانية وأعد التحقق بالاسم نفسه."
  },
  "同账户 · 姓名完全核验 · 365 天窗口": {
    "zh": "同账户 · 姓名完全核验 · 365 天窗口",
    "en": "Same account · exact name verified · 365-day window",
    "ja": "同一アカウント · 名前完全照合 · 365日ウィンドウ",
    "ko": "동일 계정 · 이름 완전 검증 · 365일 기간",
    "fr": "Même compte · nom exactement vérifié · fenêtre de 365 jours",
    "de": "Gleiches Konto · Name exakt verifiziert · 365-Tage-Fenster",
    "es": "Misma cuenta · nombre verificado exactamente · ventana de 365 días",
    "pt": "Mesma conta · nome verificado exatamente · janela de 365 dias",
    "ar": "الحساب نفسه · تحقق كامل من الاسم · نافذة 365 يومًا"
  },
  "已核验": {
    "zh": "已核验",
    "en": "Verified",
    "ja": "検証済み",
    "ko": "검증 완료",
    "fr": "Vérifié",
    "de": "Verifiziert",
    "es": "Verificado",
    "pt": "Verificado",
    "ar": "تم التحقق"
  },
  "取证期": {
    "zh": "取证期",
    "en": "Evidence window",
    "ja": "証拠期間",
    "ko": "증거 기간",
    "fr": "Fenêtre de preuves",
    "de": "Evidenzzeitraum",
    "es": "Periodo de evidencia",
    "pt": "Período de evidências",
    "ar": "فترة الأدلة"
  },
  "成卷": {
    "zh": "成卷",
    "en": "Compiled",
    "ja": "成巻",
    "ko": "완성 시각",
    "fr": "Compilation",
    "de": "Erstellt",
    "es": "Compilado",
    "pt": "Compilado",
    "ar": "تاريخ التجميع"
  },
  "未记录": {
    "zh": "未记录",
    "en": "Not recorded",
    "ja": "記録なし",
    "ko": "기록 없음",
    "fr": "Non enregistré",
    "de": "Nicht erfasst",
    "es": "No registrado",
    "pt": "Não registrado",
    "ar": "غير مسجل"
  },
  "正在生成完整档案…": {
    "zh": "正在生成完整档案…",
    "en": "Generating complete archive…",
    "ja": "完全版アーカイブを生成中…",
    "ko": "전체 아카이브 생성 중…",
    "fr": "Génération de l’archive complète…",
    "de": "Vollständiges Archiv wird erstellt…",
    "es": "Generando archivo completo…",
    "pt": "Gerando arquivo completo…",
    "ar": "جارٍ إنشاء الأرشيف الكامل…"
  },
  "下载完整 PDF ↓": {
    "zh": "下载完整 PDF ↓",
    "en": "Download full PDF ↓",
    "ja": "完全版PDFをダウンロード ↓",
    "ko": "전체 PDF 다운로드 ↓",
    "fr": "Télécharger le PDF complet ↓",
    "de": "Vollständiges PDF herunterladen ↓",
    "es": "Descargar PDF completo ↓",
    "pt": "Baixar PDF completo ↓",
    "ar": "تنزيل PDF الكامل ↓"
  },
  "下载生命原型 V6 完整 PDF": {
    "zh": "下载生命原型 V6 完整 PDF",
    "en": "Download complete Life Archetype V6 PDF",
    "ja": "生命原型V6完全版PDFをダウンロード",
    "ko": "생명 원형 V6 전체 PDF 다운로드",
    "fr": "Télécharger le PDF complet Archétype de vie V6",
    "de": "Vollständiges Lebensarchetyp-V6-PDF herunterladen",
    "es": "Descargar PDF completo Arquetipo de vida V6",
    "pt": "Baixar PDF completo Arquétipo de vida V6",
    "ar": "تنزيل PDF الكامل لنمط الحياة الأصلي V6"
  },
  "已立": {
    "zh": "已立",
    "en": "Established",
    "ja": "確立",
    "ko": "확립",
    "fr": "Établi",
    "de": "Etabliert",
    "es": "Establecido",
    "pt": "Estabelecido",
    "ar": "راسخ"
  },
  "强证": {
    "zh": "强证",
    "en": "Strong evidence",
    "ja": "強い証拠",
    "ko": "강한 증거",
    "fr": "Preuve forte",
    "de": "Starke Evidenz",
    "es": "Evidencia fuerte",
    "pt": "Evidência forte",
    "ar": "دليل قوي"
  },
  "生长中": {
    "zh": "生长中",
    "en": "Developing",
    "ja": "形成中",
    "ko": "형성 중",
    "fr": "En développement",
    "de": "In Entwicklung",
    "es": "En desarrollo",
    "pt": "Em desenvolvimento",
    "ar": "قيد التطور"
  },
  "有条件": {
    "zh": "有条件",
    "en": "Conditional",
    "ja": "条件付き",
    "ko": "조건부",
    "fr": "Conditionnel",
    "de": "Bedingt",
    "es": "Condicional",
    "pt": "Condicional",
    "ar": "مشروط"
  },
  "证未足": {
    "zh": "证未足",
    "en": "Insufficient evidence",
    "ja": "証拠不足",
    "ko": "증거 부족",
    "fr": "Preuves insuffisantes",
    "de": "Unzureichende Evidenz",
    "es": "Evidencia insuficiente",
    "pt": "Evidência insuficiente",
    "ar": "أدلة غير كافية"
  },
  "生命图谱": {
    "zh": "生命图谱",
    "en": "Life Map",
    "ja": "生命マップ",
    "ko": "생명 지도",
    "fr": "Carte de vie",
    "de": "Lebenskarte",
    "es": "Mapa de vida",
    "pt": "Mapa da vida",
    "ar": "خريطة الحياة"
  },
  "关系共振": {
    "zh": "关系共振",
    "en": "Relationship Resonance",
    "ja": "関係共鳴",
    "ko": "관계 공명",
    "fr": "Résonance relationnelle",
    "de": "Beziehungsresonanz",
    "es": "Resonancia relacional",
    "pt": "Ressonância relacional",
    "ar": "رنين العلاقات"
  },
  "生命韧性": {
    "zh": "生命韧性",
    "en": "Life Resilience",
    "ja": "生命レジリエンス",
    "ko": "생명 회복탄력성",
    "fr": "Résilience de vie",
    "de": "Lebensresilienz",
    "es": "Resiliencia vital",
    "pt": "Resiliência de vida",
    "ar": "مرونة الحياة"
  },
  "桃花磁场": {
    "zh": "桃花磁场",
    "en": "Romance Field",
    "ja": "恋愛磁場",
    "ko": "로맨스 필드",
    "fr": "Champ relationnel",
    "de": "Romantikfeld",
    "es": "Campo romántico",
    "pt": "Campo romântico",
    "ar": "مجال العلاقات العاطفية"
  },
  "财富创造地图": {
    "zh": "财富创造地图",
    "en": "Wealth Creation Map",
    "ja": "富創造マップ",
    "ko": "부 창조 지도",
    "fr": "Carte de création de richesse",
    "de": "Vermögensschöpfungskarte",
    "es": "Mapa de creación de riqueza",
    "pt": "Mapa de criação de riqueza",
    "ar": "خريطة صناعة الثروة"
  },
  "今日潮汐": {
    "zh": "今日潮汐",
    "en": "Daily Tide",
    "ja": "今日の潮汐",
    "ko": "오늘의 조류",
    "fr": "Marée du jour",
    "de": "Tagesgezeiten",
    "es": "Marea diaria",
    "pt": "Maré diária",
    "ar": "مدّ اليوم"
  },
  "生命镜像": {
    "zh": "生命镜像",
    "en": "Life Mirror",
    "ja": "生命の鏡",
    "ko": "생명 거울",
    "fr": "Miroir de vie",
    "de": "Lebensspiegel",
    "es": "Espejo de vida",
    "pt": "Espelho da vida",
    "ar": "مرآة الحياة"
  },
  "生命灵签": {
    "zh": "生命灵签",
    "en": "Life Oracle",
    "ja": "生命オラクル",
    "ko": "생명 오라클",
    "fr": "Oracle de vie",
    "de": "Lebensorakel",
    "es": "Oráculo de vida",
    "pt": "Oráculo da vida",
    "ar": "وحي الحياة"
  }
};

export function miniText(lang:LingxiLang,zh:string,en:string){return COPY[zh]?.[lang] ?? (lang==="zh"?zh:en);}
export function miniLocale(lang:LingxiLang){return ({zh:"zh-CN",en:"en-US",ja:"ja-JP",ko:"ko-KR",fr:"fr-FR",de:"de-DE",es:"es-ES",pt:"pt-BR",ar:"ar"} as const)[lang];}
