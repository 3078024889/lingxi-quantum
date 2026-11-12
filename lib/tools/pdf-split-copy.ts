import type {LingxiLang} from "@/lib/lingxi-i18n";
import type {PdfSplitMode} from "@/lib/tools/shared/practical-doc-tools";
type SplitWords={title:string;all:string;selected:string;extract:string;groups:string;range:string;size:string;help:string;rangeError:string;groupError:string};
export const pdfSplitCopy:Record<LingxiLang,SplitWords>={
 zh:{title:"拆分方式",all:"每页拆成单独 PDF",selected:"仅导出指定页（每页一份）",extract:"提取指定页（合成一份 PDF）",groups:"每 N 页分成一份 PDF",range:"选择页码或范围",size:"每份 PDF 页数",help:"例如 1,3-5,7-,last；保留原页顺序，重复页自动去重。",rangeError:"页码或范围无效。请输入 1,3-5,7-,last 这样的有效页码，不能超出文件总页数。",groupError:"每份页数必须是 1 到 1000 之间的整数。"},
 en:{title:"Split method",all:"One PDF per page",selected:"Selected pages (one PDF per page)",extract:"Extract selected pages into one PDF",groups:"One PDF for every N pages",range:"Pages or ranges",size:"Pages per PDF",help:"Example: 1,3-5,7-,last. Keeps original page order and removes duplicate selections.",rangeError:"Invalid page selection. Enter valid pages such as 1,3-5,7-,last within the document.",groupError:"Pages per PDF must be an integer between 1 and 1000."},
 ja:{title:"分割方法",all:"各ページを個別のPDFに",selected:"指定ページを個別のPDFに",extract:"指定ページを1つのPDFに",groups:"Nページごとに1つのPDF",range:"ページ番号・範囲",size:"PDFあたりのページ数",help:"例: 1,3-5,7-,last。元の順序で出力し、重複を除きます。",rangeError:"ページ範囲が無効です。",groupError:"1～1000の整数を指定してください。"},
 ko:{title:"분할 방식",all:"페이지별 PDF",selected:"선택한 페이지별 PDF",extract:"선택한 페이지를 하나의 PDF로",groups:"N페이지마다 PDF",range:"페이지 또는 범위",size:"PDF당 페이지 수",help:"예: 1,3-5,7-,last. 원본 순서를 유지하고 중복은 제거합니다.",rangeError:"페이지 범위가 올바르지 않습니다.",groupError:"1부터 1000 사이의 정수를 입력하세요."},
 fr:{title:"Méthode de division",all:"Un PDF par page",selected:"Pages choisies, fichiers séparés",extract:"Réunir les pages choisies en un PDF",groups:"Un PDF toutes les N pages",range:"Pages ou intervalles",size:"Pages par PDF",help:"Ex. 1,3-5,7-,last. Ordre d'origine conservé, doublons ignorés.",rangeError:"Sélection de pages invalide.",groupError:"Saisissez un entier entre 1 et 1000."},
 de:{title:"Aufteilungsart",all:"Ein PDF je Seite",selected:"Ausgewählte Seiten einzeln",extract:"Ausgewählte Seiten in ein PDF",groups:"Ein PDF alle N Seiten",range:"Seiten oder Bereiche",size:"Seiten je PDF",help:"Beispiel: 1,3-5,7-,last. Originalreihenfolge, ohne Duplikate.",rangeError:"Ungültige Seitenauswahl.",groupError:"Eine ganze Zahl zwischen 1 und 1000 eingeben."},
 es:{title:"Método de división",all:"Un PDF por página",selected:"Páginas seleccionadas por separado",extract:"Páginas seleccionadas en un PDF",groups:"Un PDF cada N páginas",range:"Páginas o intervalos",size:"Páginas por PDF",help:"Ejemplo: 1,3-5,7-,last. Mantiene el orden original y elimina duplicados.",rangeError:"Selección de páginas inválida.",groupError:"Introduce un entero entre 1 y 1000."},
 pt:{title:"Modo de divisão",all:"Um PDF por página",selected:"Páginas selecionadas separadamente",extract:"Páginas selecionadas em um PDF",groups:"Um PDF a cada N páginas",range:"Páginas ou intervalos",size:"Páginas por PDF",help:"Exemplo: 1,3-5,7-,last. Mantém a ordem original e remove duplicadas.",rangeError:"Seleção de páginas inválida.",groupError:"Digite um inteiro entre 1 e 1000."},
 ar:{title:"طريقة التقسيم",all:"ملف لكل صفحة",selected:"الصفحات المختارة بشكل منفصل",extract:"الصفحات المختارة في ملف واحد",groups:"ملف لكل N صفحات",range:"الصفحات أو النطاقات",size:"عدد الصفحات لكل ملف",help:"مثال: 1,3-5,7-,last. تُحفظ الصفحات بترتيبها الأصلي دون تكرار.",rangeError:"اختيار الصفحات غير صالح.",groupError:"أدخل عددًا صحيحًا من 1 إلى 1000."}
};
export const PDF_SPLIT_CHOICES:readonly {value:PdfSplitMode;key:keyof Pick<SplitWords,"all"|"selected"|"extract"|"groups">}[]=[
 {value:"every-page",key:"all"},
 {value:"selected-pages",key:"selected"},
 {value:"extract",key:"extract"},
 {value:"every-n",key:"groups"},
];
