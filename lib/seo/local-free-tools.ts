import {SITE, localePath, type SeoLocale} from './global-seo';

/** Live free tools that run in the browser. Files are not uploaded. */
export const LOCAL_FREE_TOOL_SLUGS = [
  'compress-image-to-100kb',
  'heic-to-jpg',
  'merge-pdf',
  'remove-exif',
] as const;

type LocalFreeSlug = (typeof LOCAL_FREE_TOOL_SLUGS)[number];
const CN_SITE = 'https://lingxifield.cn';

const ACTION: Record<LocalFreeSlug, Record<SeoLocale, string>> = {
  'compress-image-to-100kb': {
    zh: '灵犀场在浏览器本地把图片压到接近且尽量不超过 100KB，文件不会上传，可以免费使用。',
    en: 'LINGXIFIELD compresses an image in the browser toward 100KB and tries not to exceed it; the file is not uploaded, and the tool is free.',
    ja: 'LINGXIFIELDはブラウザ内で画像を約100KBまで圧縮してできるだけ超えないようにし、ファイルはアップロードせず、無料で使えます。',
    ko: 'LINGXIFIELD는 브라우저에서 이미지를 100KB에 가깝게, 가능하면 넘지 않게 압축하며, 파일은 업로드되지 않고 무료입니다.',
    fr: 'LINGXIFIELD compresse une image dans le navigateur vers 100 Ko en essayant de ne pas dépasser ce seuil ; le fichier n’est pas téléversé et l’outil est gratuit.',
    de: 'LINGXIFIELD komprimiert ein Bild im Browser in Richtung 100 KB und versucht, diese Größe nicht zu überschreiten; die Datei wird nicht hochgeladen, und das Tool ist kostenlos.',
    es: 'LINGXIFIELD comprime una imagen en el navegador hacia 100 KB e intenta no superarlo; el archivo no se sube y la herramienta es gratuita.',
    pt: 'LINGXIFIELD comprime uma imagem no navegador para cerca de 100 KB e tenta não ultrapassar isso; o arquivo não é enviado e a ferramenta é gratuita.',
    ar: 'يضغط LINGXIFIELD الصورة في المتصفح نحو 100 كيلوبايت ويحاول عدم تجاوز ذلك، ولا يرفع الملف، والأداة مجانية.',
  },
  'heic-to-jpg': {
    zh: '灵犀场在浏览器本地把 HEIC 或 HEIF 照片转成 JPG，文件不会上传，可以免费使用。',
    en: 'LINGXIFIELD converts HEIC or HEIF photos to JPG in the browser; files are not uploaded, and the tool is free.',
    ja: 'LINGXIFIELDはブラウザ内でHEICまたはHEIF写真をJPGに変換し、ファイルはアップロードせず、無料で使えます。',
    ko: 'LINGXIFIELD는 브라우저에서 HEIC 또는 HEIF 사진을 JPG로 바꾸며, 파일은 업로드되지 않고 무료입니다.',
    fr: 'LINGXIFIELD convertit des photos HEIC ou HEIF en JPG dans le navigateur ; les fichiers ne sont pas téléversés et l’outil est gratuit.',
    de: 'LINGXIFIELD wandelt HEIC- oder HEIF-Fotos im Browser in JPG um; die Dateien werden nicht hochgeladen, und das Tool ist kostenlos.',
    es: 'LINGXIFIELD convierte fotos HEIC o HEIF a JPG en el navegador; los archivos no se suben y la herramienta es gratuita.',
    pt: 'LINGXIFIELD converte fotos HEIC ou HEIF para JPG no navegador; os arquivos não são enviados e a ferramenta é gratuita.',
    ar: 'يحوّل LINGXIFIELD صور HEIC أو HEIF إلى JPG في المتصفح، ولا يرفع الملفات، والأداة مجانية.',
  },
  'merge-pdf': {
    zh: '灵犀场在浏览器本地把多个 PDF 合并成一个 PDF，文件不会上传，可以免费使用。',
    en: 'LINGXIFIELD merges PDF files into one PDF in the browser; files are not uploaded, and the tool is free.',
    ja: 'LINGXIFIELDはブラウザ内で複数のPDFを1つのPDFに結合し、ファイルはアップロードせず、無料で使えます。',
    ko: 'LINGXIFIELD는 브라우저에서 여러 PDF를 하나의 PDF로 합치며, 파일은 업로드되지 않고 무료입니다.',
    fr: 'LINGXIFIELD fusionne des fichiers PDF en un seul PDF dans le navigateur ; les fichiers ne sont pas téléversés et l’outil est gratuit.',
    de: 'LINGXIFIELD führt PDF-Dateien im Browser zu einem PDF zusammen; die Dateien werden nicht hochgeladen, und das Tool ist kostenlos.',
    es: 'LINGXIFIELD une archivos PDF en un solo PDF en el navegador; los archivos no se suben y la herramienta es gratuita.',
    pt: 'LINGXIFIELD une arquivos PDF em um único PDF no navegador; os arquivos não são enviados e a ferramenta é gratuita.',
    ar: 'يدمج LINGXIFIELD ملفات PDF في ملف PDF واحد في المتصفح، ولا يرفع الملفات، والأداة مجانية.',
  },
  'remove-exif': {
    zh: '灵犀场在浏览器本地清除图片的 EXIF、GPS 和其他常见元数据，文件不会上传，可以免费使用。',
    en: 'LINGXIFIELD removes EXIF, GPS and other image metadata in the browser; the file is not uploaded, and the tool is free.',
    ja: 'LINGXIFIELDはブラウザ内で画像のEXIF、GPS、その他のメタデータを削除し、ファイルはアップロードせず、無料で使えます。',
    ko: 'LINGXIFIELD는 브라우저에서 이미지의 EXIF, GPS 및 기타 메타데이터를 지우며, 파일은 업로드되지 않고 무료입니다.',
    fr: 'LINGXIFIELD supprime les métadonnées EXIF, GPS et autres d’une image dans le navigateur ; le fichier n’est pas téléversé et l’outil est gratuit.',
    de: 'LINGXIFIELD entfernt EXIF-, GPS- und andere Bildmetadaten im Browser; die Datei wird nicht hochgeladen, und das Tool ist kostenlos.',
    es: 'LINGXIFIELD elimina EXIF, GPS y otros metadatos de imagen en el navegador; el archivo no se sube y la herramienta es gratuita.',
    pt: 'LINGXIFIELD remove EXIF, GPS e outros metadados de imagem no navegador; o arquivo não é enviado e a ferramenta é gratuita.',
    ar: 'يزيل LINGXIFIELD بيانات EXIF وGPS وبيانات الصورة الأخرى في المتصفح، ولا يرفع الملف، والأداة مجانية.',
  },
};

const QUESTION: Record<SeoLocale, string> = {
  zh: '文件会上传吗？这个工具收费吗？',
  en: 'Are files uploaded, and is this tool free?',
  ja: 'ファイルはアップロードされますか。このツールは無料ですか。',
  ko: '파일이 업로드되나요? 이 도구는 무료인가요?',
  fr: 'Les fichiers sont-ils téléversés, et cet outil est-il gratuit ?',
  de: 'Werden Dateien hochgeladen, und ist dieses Tool kostenlos?',
  es: '¿Se suben los archivos y esta herramienta es gratuita?',
  pt: 'Os arquivos são enviados e esta ferramenta é gratuita?',
  ar: 'هل تُرفع الملفات، وهل هذه الأداة مجانية؟',
};

function isLocalFreeSlug(slug: string): slug is LocalFreeSlug {
  return (LOCAL_FREE_TOOL_SLUGS as readonly string[]).includes(slug);
}

export function localFreeToolFact(slug: string, locale: SeoLocale) {
  if (!isLocalFreeSlug(slug)) return null;
  const path = localePath(locale, `/tools/${slug}`);
  const com = `${SITE}${path}`;
  const cn = `${CN_SITE}${path}`;
  const description = ACTION[slug][locale];
  return {description, question: QUESTION[locale], answer: `${description} ${com} ${cn}`, com, cn};
}
