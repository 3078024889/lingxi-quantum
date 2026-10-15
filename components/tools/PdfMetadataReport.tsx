"use client";
import {useLingxiLang} from '@/lib/lingxi-i18n';
import type {PdfMetadataSnapshot} from '@/lib/tools/shared/pdf-metadata';
const copy={
 zh:['已重新打开输出文件核验','属性','清理前','清理后','已移除','未发现文档属性。页面上的作者、标题和图片不会删除；注释、附件与图片 EXIF 不在此工具清理范围内。'],
 en:['Output reopened and verified','Property','Before','After','Removed','No document properties found. Visible authors, titles and images stay. Annotations, attachments and image EXIF are outside this tool’s scope.'],
 ja:['出力を再度開いて検証済み','属性','処理前','処理後','削除済み','文書属性はありません。ページ上の著者・表題・画像は保持します。注釈、添付ファイル、画像EXIFは対象外です。'],
 ko:['출력 파일을 다시 열어 검증했습니다','속성','처리 전','처리 후','삭제됨','문서 속성이 없습니다. 페이지의 저자, 제목, 이미지는 유지됩니다. 주석, 첨부 파일, 이미지 EXIF는 대상이 아닙니다.'],
 fr:['Fichier de sortie rouvert et vérifié','Propriété','Avant','Après','Supprimé','Aucune propriété trouvée. Auteurs, titres et images visibles sont conservés. Annotations, pièces jointes et EXIF des images sont exclus.'],
 de:['Ausgabedatei erneut geöffnet und geprüft','Eigenschaft','Vorher','Nachher','Entfernt','Keine Dokumenteigenschaften gefunden. Sichtbare Autoren, Titel und Bilder bleiben erhalten. Anmerkungen, Anhänge und Bild-EXIF sind ausgenommen.'],
 es:['Archivo de salida reabierto y verificado','Propiedad','Antes','Después','Eliminado','Sin propiedades de documento. Se conservan autores, títulos e imágenes visibles. Se excluyen anotaciones, adjuntos y EXIF de imágenes.'],
 pt:['Arquivo de saída reaberto e verificado','Propriedade','Antes','Depois','Removido','Nenhuma propriedade encontrada. Autores, títulos e imagens visíveis são preservados. Anotações, anexos e EXIF de imagens estão fora do escopo.'],
 ar:['أعيد فتح الملف الناتج والتحقق منه','الخاصية','قبل','بعد','تمت الإزالة','لم توجد خصائص للمستند. تبقى أسماء المؤلفين والعناوين والصور الظاهرة. لا تشمل الأداة التعليقات والمرفقات وبيانات EXIF للصور.'],
};
export default function PdfMetadataReport({before,after}:{before:PdfMetadataSnapshot;after:PdfMetadataSnapshot}){
 const {lang}=useLingxiLang(),t=copy[lang];
 const rows=Object.entries(before.fields);
 return <section aria-live="polite" className="space-y-3 rounded-xl border border-[var(--lx-line)] p-4 text-sm" data-metadata-verified="true">
  <h3 className="font-semibold">{t[0]}</h3>
  <div className="overflow-x-auto"><table className="w-full text-start"><thead><tr>{[t[1],t[2],t[3]].map(x=><th key={x} className="p-2 text-start">{x}</th>)}</tr></thead><tbody>
   {rows.map(([key,value])=><tr key={key}><td className="p-2">{key}</td><td className="max-w-xs break-words p-2 whitespace-pre-wrap">{value||'—'}</td><td className="p-2">{after.fields[key]||t[4]}</td></tr>)}
   <tr><td className="p-2">XMP</td><td className="p-2">{before.xmpStreams}</td><td className="p-2">{after.xmpStreams}</td></tr>
  </tbody></table></div><p className="text-[var(--lx-muted)]">{t[5]}</p>
 </section>;
}
