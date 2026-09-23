import type { LingxiLang } from "@/lib/lingxi-i18n";

type UploadKey =
  | "dropOrChoose"
  | "dropImagesOrChoose"
  | "dropMediaOrChoose"
  | "dropPdfOrChoose"
  | "dropSubtitleOrChoose"
  | "maxFile"
  | "maxFiles"
  | "remove"
  | "selected"
  | "unsupported"
  | "tooLarge"
  | "dragActive";

const COPY: Record<UploadKey, Record<LingxiLang, string>> = {
  dropOrChoose: {
    zh: "把文件拖到这里，或点击选择",
    en: "Drop files here, or click to choose",
    ja: "ファイルをここにドロップするか、クリックして選択",
    ko: "파일을 여기로 끌어오거나 클릭해 선택하세요",
    fr: "Déposez les fichiers ici ou cliquez pour les choisir",
    de: "Dateien hierher ziehen oder zum Auswählen klicken",
    es: "Arrastra los archivos aquí o haz clic para elegirlos",
    pt: "Arraste os arquivos para cá ou clique para escolher",
    ar: "اسحب الملفات إلى هنا أو انقر للاختيار",
  },
  dropImagesOrChoose: {
    zh: "把图片拖到这里，或点击选择",
    en: "Drop images here, or click to choose",
    ja: "画像をここにドロップするか、クリックして選択",
    ko: "이미지를 여기로 끌어오거나 클릭해 선택하세요",
    fr: "Déposez les images ici ou cliquez pour les choisir",
    de: "Bilder hierher ziehen oder zum Auswählen klicken",
    es: "Arrastra las imágenes aquí o haz clic para elegirlas",
    pt: "Arraste as imagens para cá ou clique para escolher",
    ar: "اسحب الصور إلى هنا أو انقر للاختيار",
  },
  dropMediaOrChoose: {
    zh: "把图片、音频或视频拖到这里，或点击选择",
    en: "Drop images, audio or video here, or click to choose",
    ja: "画像・音声・動画をここにドロップするか、クリックして選択",
    ko: "이미지·오디오·비디오를 여기로 끌어오거나 클릭해 선택하세요",
    fr: "Déposez ici des images, de l’audio ou des vidéos, ou cliquez pour choisir",
    de: "Bilder, Audio oder Videos hierher ziehen oder zum Auswählen klicken",
    es: "Arrastra aquí imágenes, audio o vídeos, o haz clic para elegirlos",
    pt: "Arraste imagens, áudio ou vídeos para cá ou clique para escolher",
    ar: "اسحب الصور أو الصوت أو الفيديو إلى هنا أو انقر للاختيار",
  },
  dropPdfOrChoose: {
    zh: "把 PDF 拖到这里，或点击选择",
    en: "Drop PDF files here, or click to choose",
    ja: "PDF をここにドロップするか、クリックして選択",
    ko: "PDF를 여기로 끌어오거나 클릭해 선택하세요",
    fr: "Déposez les PDF ici ou cliquez pour les choisir",
    de: "PDF-Dateien hierher ziehen oder zum Auswählen klicken",
    es: "Arrastra los PDF aquí o haz clic para elegirlos",
    pt: "Arraste os PDFs para cá ou clique para escolher",
    ar: "اسحب ملفات PDF إلى هنا أو انقر للاختيار",
  },
  dropSubtitleOrChoose: {
    zh: "把 SRT / VTT 字幕拖到这里，或点击选择",
    en: "Drop SRT / VTT subtitles here, or click to choose",
    ja: "SRT / VTT 字幕をここにドロップするか、クリックして選択",
    ko: "SRT / VTT 자막을 여기로 끌어오거나 클릭해 선택하세요",
    fr: "Déposez les sous-titres SRT / VTT ici ou cliquez pour les choisir",
    de: "SRT-/VTT-Untertitel hierher ziehen oder zum Auswählen klicken",
    es: "Arrastra subtítulos SRT / VTT aquí o haz clic para elegirlos",
    pt: "Arraste legendas SRT / VTT para cá ou clique para escolher",
    ar: "اسحب ملفات الترجمة SRT / VTT إلى هنا أو انقر للاختيار",
  },
  maxFile: {
    zh: "单文件上限 {size}MB",
    en: "Max {size}MB per file",
    ja: "1ファイル最大 {size}MB",
    ko: "파일당 최대 {size}MB",
    fr: "{size} Mo max. par fichier",
    de: "Max. {size} MB pro Datei",
    es: "Máx. {size} MB por archivo",
    pt: "Máx. {size} MB por arquivo",
    ar: "الحد الأقصى {size} ميغابايت لكل ملف",
  },
  maxFiles: {
    zh: "最多 {count} 个",
    en: "up to {count} files",
    ja: "最大 {count} 件",
    ko: "최대 {count}개",
    fr: "jusqu’à {count} fichiers",
    de: "bis zu {count} Dateien",
    es: "hasta {count} archivos",
    pt: "até {count} arquivos",
    ar: "حتى {count} ملفات",
  },
  remove: {
    zh: "移除",
    en: "Remove",
    ja: "削除",
    ko: "삭제",
    fr: "Retirer",
    de: "Entfernen",
    es: "Quitar",
    pt: "Remover",
    ar: "إزالة",
  },
  selected: {
    zh: "已选择 {count} 个文件",
    en: "{count} files selected",
    ja: "{count} 件のファイルを選択済み",
    ko: "파일 {count}개 선택됨",
    fr: "{count} fichiers sélectionnés",
    de: "{count} Dateien ausgewählt",
    es: "{count} archivos seleccionados",
    pt: "{count} arquivos selecionados",
    ar: "تم اختيار {count} ملفات",
  },
  unsupported: {
    zh: "文件类型不受支持",
    en: "Unsupported file type",
    ja: "このファイル形式には対応していません",
    ko: "지원하지 않는 파일 형식입니다",
    fr: "Type de fichier non pris en charge",
    de: "Nicht unterstützter Dateityp",
    es: "Tipo de archivo no compatible",
    pt: "Tipo de arquivo não suportado",
    ar: "نوع الملف غير مدعوم",
  },
  tooLarge: {
    zh: "文件过大：{name}（上限 {size}MB）",
    en: "File too large: {name} (limit {size}MB)",
    ja: "ファイルが大きすぎます：{name}（上限 {size}MB）",
    ko: "파일이 너무 큽니다: {name} (최대 {size}MB)",
    fr: "Fichier trop volumineux : {name} (limite {size} Mo)",
    de: "Datei zu groß: {name} (Limit {size} MB)",
    es: "Archivo demasiado grande: {name} (límite {size} MB)",
    pt: "Arquivo muito grande: {name} (limite {size} MB)",
    ar: "الملف كبير جدًا: {name} (الحد {size} ميغابايت)",
  },
  dragActive: {
    zh: "松开即可添加",
    en: "Release to add",
    ja: "ここで離すと追加されます",
    ko: "놓으면 추가됩니다",
    fr: "Relâchez pour ajouter",
    de: "Loslassen zum Hinzufügen",
    es: "Suelta para añadir",
    pt: "Solte para adicionar",
    ar: "أفلت للإضافة",
  },
};

export function uploadText(
  lang: LingxiLang,
  key: UploadKey,
  vars: Record<string, string | number> = {}
) {
  let value = COPY[key][lang] ?? COPY[key].en;
  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
}
