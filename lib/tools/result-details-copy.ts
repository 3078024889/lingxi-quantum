import{plainText}from'./plain-copy';
import type{LingxiLang}from'@/lib/lingxi-i18n';
const languages=['zh','en','ja','ko','fr','de','es','pt','ar']as const;
type Labels=readonly[string,string,string,string,string,string,string,string,string];
const labels:Record<string,Labels>={
 ISO:['ISO 时间（UTC）','ISO time (UTC)','ISO日時（UTC）','ISO 시간(UTC)','Date ISO (UTC)','ISO-Zeit (UTC)','Fecha ISO (UTC)','Data ISO (UTC)','وقت ISO (UTC)'],
 local:['本地时间','Local time','現地時刻','현지 시간','Heure locale','Ortszeit','Hora local','Hora local','الوقت المحلي'],
 relative:['距现在','Relative time','現在との差','상대 시간','Temps relatif','Relative Zeit','Tiempo relativo','Tempo relativo','الوقت النسبي'],
 detected:['输入格式','Input format','入力形式','입력 형식','Format d’entrée','Eingabeformat','Formato de entrada','Formato de entrada','صيغة الإدخال'],
 unixSec:['Unix 时间（秒）','Unix time (seconds)','Unix時刻（秒）','Unix 시간(초)','Temps Unix (secondes)','Unix-Zeit (Sekunden)','Tiempo Unix (segundos)','Tempo Unix (segundos)','وقت Unix (ثوانٍ)'],
 unixMs:['Unix 时间（毫秒）','Unix time (milliseconds)','Unix時刻（ミリ秒）','Unix 시간(밀리초)','Temps Unix (millisecondes)','Unix-Zeit (Millisekunden)','Tiempo Unix (milisegundos)','Tempo Unix (milissegundos)','وقت Unix (مللي ثانية)'],
 unixUs:['Unix 时间（微秒）','Unix time (microseconds)','Unix時刻（マイクロ秒）','Unix 시간(마이크로초)','Temps Unix (microsecondes)','Unix-Zeit (Mikrosekunden)','Tiempo Unix (microsegundos)','Tempo Unix (microssegundos)','وقت Unix (ميكروثانية)'],
 unixNs:['Unix 时间（纳秒）','Unix time (nanoseconds)','Unix時刻（ナノ秒）','Unix 시간(나노초)','Temps Unix (nanosecondes)','Unix-Zeit (Nanosekunden)','Tiempo Unix (nanosegundos)','Tempo Unix (nanossegundos)','وقت Unix (نانوثانية)'],
 file:['文件名','Filename','ファイル名','파일 이름','Nom du fichier','Dateiname','Nombre del archivo','Nome do arquivo','اسم الملف'],
 originalKB:['原文件大小（KB）','Original size (KB)','元のサイズ（KB）','원본 크기(KB)','Taille originale (Ko)','Originalgröße (KB)','Tamaño original (KB)','Tamanho original (KB)','الحجم الأصلي (KB)'],
 inputFiles:['输入文件数','Input files','入力ファイル数','입력 파일 수','Fichiers source','Eingabedateien','Archivos de entrada','Arquivos de entrada','عدد الملفات المدخلة'],
 outputFiles:['输出文件数','Output files','出力ファイル数','출력 파일 수','Fichiers créés','Ausgabedateien','Archivos de salida','Arquivos de saída','عدد الملفات الناتجة'],
 slides:['幻灯片数','Slides','スライド数','슬라이드 수','Diapositives','Folien','Diapositivas','Slides','عدد الشرائح'],
 characters:['字符数','Characters','文字数','문자 수','Caractères','Zeichen','Caracteres','Caracteres','عدد الأحرف'],
 rows:['行数','Rows','行数','행 수','Lignes','Zeilen','Filas','Linhas','عدد الصفوف'],
 columns:['列数','Columns','列数','열 수','Colonnes','Spalten','Columnas','Colunas','عدد الأعمدة'],
 images:['图片数','Images','画像数','이미지 수','Images','Bilder','Imágenes','Imagens','عدد الصور'],
 content:['识别内容','Recognized content','認識内容','인식 내용','Contenu reconnu','Erkannter Inhalt','Contenido reconocido','Conteúdo reconhecido','المحتوى المستخرج'],
 quality:['图片质量','Image quality','画質','이미지 품질','Qualité de l’image','Bildqualität','Calidad de imagen','Qualidade da imagem','جودة الصورة'],
};

/** Show curated user summaries; never fall back to exposing an internal key. */
export function resultDetail(lang:LingxiLang,key:string,value:string|number|boolean):{label:string;value:string}|null{
 const direct:Record<string,'files'|'pages'|'resultKB'|'w'|'h'>={files:'files',pages:'pages',resultKB:'resultKB',width:'w',height:'h',sizeA:'resultKB',sizeB:'resultKB',size:'resultKB',bytes:'resultKB'};
 const alias=key==='fileA'||key==='fileB'?'file':key==='totalRows'?'rows':key==='totalCharacters'?'characters':key;
 let label=Object.hasOwn(direct,key)?plainText(lang,direct[key]):Object.hasOwn(labels,alias)?labels[alias][languages.indexOf(lang)]:undefined;
 if(key==='MD5'||key==='SHA256'||key==='RFC 2822')label=key;
 if(key==='sha256A'||key==='sha256B')label=`SHA256 ${key.endsWith('A')?'A':'B'}`;
 if(!label)return null;
 if(['fileA','fileB','sizeA','sizeB'].includes(key))label+=` ${key.endsWith('A')?'A':'B'}`;
 if(['bytes','size','sizeA','sizeB'].includes(key)&&typeof value==='number')value=Math.round(value/1024*10)/10;
 return{label,value:typeof value==='number'?new Intl.NumberFormat(lang,{maximumFractionDigits:3}).format(value):String(value)};
}
