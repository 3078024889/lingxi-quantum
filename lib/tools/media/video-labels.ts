import type {LingxiLang} from "@/lib/lingxi-i18n";
import {toolUiText} from "@/lib/tool-ui-i18n";

/** Complete nine-locale wording for the shared media workbench. */
export const VIDEO_LABELS:Record<string,Record<LingxiLang,string>> = {
  "压缩": {
    "zh": "压缩",
    "en": "Compress",
    "ja": "圧縮",
    "ko": "압축",
    "fr": "Compresser",
    "de": "Komprimieren",
    "es": "Comprimir",
    "pt": "Comprimir",
    "ar": "ضغط"
  },
  "截取": {
    "zh": "截取",
    "en": "Trim",
    "ja": "トリミング",
    "ko": "자르기",
    "fr": "Découper",
    "de": "Zuschneiden",
    "es": "Recortar",
    "pt": "Cortar",
    "ar": "قص"
  },
  "静音": {
    "zh": "静音",
    "en": "Mute",
    "ja": "ミュート",
    "ko": "음소거",
    "fr": "Couper le son",
    "de": "Stummschalten",
    "es": "Silenciar",
    "pt": "Silenciar",
    "ar": "كتم الصوت"
  },
  "转 MP4": {
    "zh": "转 MP4",
    "en": "Convert to MP4",
    "ja": "MP4に変換",
    "ko": "MP4로 변환",
    "fr": "Convertir en MP4",
    "de": "In MP4 umwandeln",
    "es": "Convertir a MP4",
    "pt": "Converter para MP4",
    "ar": "تحويل إلى MP4"
  },
  "旋转": {
    "zh": "旋转",
    "en": "Rotate",
    "ja": "回転",
    "ko": "회전",
    "fr": "Pivoter",
    "de": "Drehen",
    "es": "Girar",
    "pt": "Girar",
    "ar": "تدوير"
  },
  "变速": {
    "zh": "变速",
    "en": "Speed",
    "ja": "再生速度",
    "ko": "재생 속도",
    "fr": "Vitesse",
    "de": "Geschwindigkeit",
    "es": "Velocidade",
    "pt": "Velocidade",
    "ar": "السرعة"
  },
  "压缩强度": {
    "zh": "压缩强度",
    "en": "Compression level",
    "ja": "圧縮レベル",
    "ko": "압축 수준",
    "fr": "Niveau de compression",
    "de": "Komprimierungsgrad",
    "es": "Nivel de compresión",
    "pt": "Nível de compressão",
    "ar": "مستوى الضغط"
  },
  "高清": {
    "zh": "高清",
    "en": "High quality",
    "ja": "高画質",
    "ko": "고화질",
    "fr": "Haute qualité",
    "de": "Hohe Qualität",
    "es": "Alta calidad",
    "pt": "Alta qualidade",
    "ar": "جودة عالية"
  },
  "均衡": {
    "zh": "均衡",
    "en": "Balanced",
    "ja": "バランス",
    "ko": "균형",
    "fr": "Équilibré",
    "de": "Ausgewogen",
    "es": "Equilibrado",
    "pt": "Equilibrado",
    "ar": "متوازن"
  },
  "更小体积": {
    "zh": "更小体积",
    "en": "Smaller file",
    "ja": "ファイルを小さく",
    "ko": "더 작은 파일",
    "fr": "Fichier plus léger",
    "de": "Kleinere Datei",
    "es": "Archivo más pequeño",
    "pt": "Ficheiro menor",
    "ar": "حجم أصغر"
  },
  "旋转角度": {
    "zh": "旋转角度",
    "en": "Rotation angle",
    "ja": "回転角度",
    "ko": "회전 각도",
    "fr": "Angle de rotation",
    "de": "Drehwinkel",
    "es": "Ángulo de giro",
    "pt": "Ângulo de rotação",
    "ar": "زاوية التدوير"
  },
  "顺时针 90°": {
    "zh": "顺时针 90°",
    "en": "90° clockwise",
    "ja": "右に90°回転",
    "ko": "시계 방향 90°",
    "fr": "90° dans le sens horaire",
    "de": "90° im Uhrzeigersinn",
    "es": "90° en sentido horario",
    "pt": "90° no sentido horário",
    "ar": "90° مع عقارب الساعة"
  },
  "旋转 180°": {
    "zh": "旋转 180°",
    "en": "Rotate 180°",
    "ja": "180°回転",
    "ko": "180° 회전",
    "fr": "Rotation de 180°",
    "de": "180° drehen",
    "es": "Girar 180°",
    "pt": "Girar 180°",
    "ar": "تدوير 180°"
  },
  "逆时针 90°": {
    "zh": "逆时针 90°",
    "en": "90° counterclockwise",
    "ja": "左に90°回転",
    "ko": "반시계 방향 90°",
    "fr": "90° dans le sens antihoraire",
    "de": "90° gegen den Uhrzeigersinn",
    "es": "90° en sentido antihorario",
    "pt": "90° no sentido anti-horário",
    "ar": "90° عكس عقارب الساعة"
  },
  "播放速度": {
    "zh": "播放速度",
    "en": "Playback speed",
    "ja": "再生速度",
    "ko": "재생 속도",
    "fr": "Vitesse de lecture",
    "de": "Wiedergabegeschwindigkeit",
    "es": "Velocidad de reproducción",
    "pt": "Velocidade de reprodução",
    "ar": "سرعة التشغيل"
  },
  "输出分辨率": {
    "zh": "输出分辨率",
    "en": "Output resolution",
    "ja": "出力解像度",
    "ko": "출력 해상도",
    "fr": "Résolution de sortie",
    "de": "Ausgabeauflösung",
    "es": "Resolución de salida",
    "pt": "Resolução de saída",
    "ar": "دقة الإخراج"
  },
  "保持原尺寸": {
    "zh": "保持原尺寸",
    "en": "Keep original size",
    "ja": "元のサイズを維持",
    "ko": "원본 크기 유지",
    "fr": "Conserver la taille d’origine",
    "de": "Originalgröße beibehalten",
    "es": "Mantener tamaño original",
    "pt": "Manter tamanho original",
    "ar": "الإبقاء على الحجم الأصلي"
  },
  "输出帧率（0=保持原帧率）": {
    "zh": "输出帧率（0=保持原帧率）",
    "en": "Output FPS (0 = original)",
    "ja": "出力FPS（0 = 元のまま）",
    "ko": "출력 FPS (0 = 원본 유지)",
    "fr": "Images/s (0 = original)",
    "de": "Ausgabe-FPS (0 = Original)",
    "es": "FPS de salida (0 = original)",
    "pt": "FPS de saída (0 = original)",
    "ar": "معدل الإطارات (0 = الأصلي)"
  },
  "压缩后体积没有变小，已保留原文件": {
    "zh": "压缩后体积没有变小，已保留原文件",
    "en": "The encoded file was not smaller; the original file is provided instead.",
    "ja": "圧縮後のファイルが小さくならなかったため、元のファイルを保持しました。",
    "ko": "압축 후 크기가 줄지 않아 원본 파일을 유지했습니다.",
    "fr": "Le fichier compressé n’étant pas plus petit, le fichier original est conservé.",
    "de": "Die komprimierte Datei ist nicht kleiner; die Originaldatei bleibt erhalten.",
    "es": "El archivo comprimido no es más pequeño; se conserva el original.",
    "pt": "O ficheiro comprimido não ficou menor; foi mantido o original.",
    "ar": "لم يصبح الملف أصغر بعد الضغط، لذا تم الاحتفاظ بالملف الأصلي."
  },
  "已按指定尺寸或帧率导出，但文件体积比原文件大": {
    "zh": "已按指定尺寸或帧率导出，但文件体积比原文件大",
    "en": "The requested size or frame rate was applied, but the resulting file is larger.",
    "ja": "指定された解像度またはフレームレートで出力しましたが、元のファイルより大きくなりました。",
    "ko": "요청한 해상도 또는 프레임 속도로 내보냈지만 원본보다 파일이 큽니다.",
    "fr": "La taille ou la fréquence d’images demandée a été appliquée, mais le fichier est plus volumineux.",
    "de": "Die gewünschte Auflösung oder Bildrate wurde angewendet, doch die Datei ist größer.",
    "es": "Se aplicó el tamaño o la frecuencia solicitados, pero el archivo es más grande.",
    "pt": "A resolução ou taxa de fotogramas foi aplicada, mas o ficheiro ficou maior.",
    "ar": "تم تطبيق الدقة أو معدل الإطارات المطلوب، لكن حجم الملف الناتج أكبر."
  },
  "一次最多处理 400MB 视频，请分批处理。": {
    "zh": "一次最多处理 400MB 视频，请分批处理。",
    "en": "This batch exceeds 400 MB. Process fewer files at a time.",
    "ja": "一度に処理できる動画は合計400MBまでです。分けて処理してください。",
    "ko": "한 번에 처리할 수 있는 동영상은 총 400MB까지입니다. 나눠서 처리하세요.",
    "fr": "Ce lot dépasse 400 Mo. Traitez moins de fichiers à la fois.",
    "de": "Dieser Stapel überschreitet 400 MB. Bitte weniger Dateien gleichzeitig verarbeiten.",
    "es": "Este lote supera los 400 MB. Procesa menos archivos a la vez.",
    "pt": "Este lote excede 400 MB. Processe menos ficheiros de cada vez.",
    "ar": "يتجاوز هذا الحجم 400 ميغابايت. عالج ملفات أقل في كل مرة."
  }
};

export function videoUiText(lang:LingxiLang,zh:string,en:string):string{
  return VIDEO_LABELS[zh]?.[lang] ?? toolUiText(lang,zh,en);
}
