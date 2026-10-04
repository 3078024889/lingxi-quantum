import type{LingxiLang}from"@/lib/lingxi-i18n";

export type ContinuationCopyKey=
 |"title"|"lead"|"busy"|"error"
 |"pdfCompress"|"pdfSplit"|"pdfImages"
 |"imageCompress"|"imageResize"|"imagePrivacy"|"imagePdf"
 |"xlsxCsv"|"csvXlsx";

type Row=Record<LingxiLang,string>;
const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Row=>({zh,en,ja,ko,fr,de,es,pt,ar});

const COPY:Record<ContinuationCopyKey,Row>={
 title:L("继续处理","Continue with this result","この結果を続けて処理","이 결과로 계속 작업","Continuer avec ce résultat","Mit diesem Ergebnis weiterarbeiten","Continuar con este resultado","Continuar com este resultado","متابعة العمل بهذه النتيجة"),
 lead:L("结果会留在这个浏览器里，直接交给下一个工具，不用重新上传。","The result stays in this browser and goes straight to the next tool — no re-upload needed.","結果はこのブラウザ内に残り、そのまま次のツールへ渡されます。再アップロードは不要です。","결과는 이 브라우저에 남아 다음 도구로 바로 전달됩니다. 다시 업로드할 필요가 없습니다.","Le résultat reste dans ce navigateur et passe directement à l’outil suivant, sans nouvel envoi.","Das Ergebnis bleibt in diesem Browser und wird direkt an das nächste Werkzeug übergeben – ohne erneuten Upload.","El resultado permanece en este navegador y pasa directamente a la siguiente herramienta, sin volver a subirlo.","O resultado permanece neste navegador e vai direto para a próxima ferramenta, sem novo envio.","تبقى النتيجة في هذا المتصفح وتنتقل مباشرة إلى الأداة التالية دون رفعها من جديد."),
 busy:L("正在接续…","Passing result…","結果を渡しています…","결과를 전달하는 중…","Transmission du résultat…","Ergebnis wird übergeben…","Pasando el resultado…","Enviando o resultado…","جارٍ تمرير النتيجة…"),
 error:L("暂时无法把结果交给下一个工具，请先保存文件。","Could not pass this result forward. Save the file first.","結果を次のツールへ渡せませんでした。先にファイルを保存してください。","결과를 다음 도구로 전달하지 못했습니다. 먼저 파일을 저장하세요.","Impossible de transmettre ce résultat. Enregistrez d’abord le fichier.","Das Ergebnis konnte nicht weitergegeben werden. Speichere die Datei zuerst.","No se pudo pasar este resultado. Guarda primero el archivo.","Não foi possível passar este resultado. Salve o arquivo primeiro.","تعذر تمرير هذه النتيجة. احفظ الملف أولًا."),
 pdfCompress:L("继续缩小 PDF 体积","Reduce the PDF size","PDFをさらに小さくする","PDF 용량 더 줄이기","Réduire encore le PDF","PDF weiter verkleinern","Reducir el tamaño del PDF","Reduzir o tamanho do PDF","تقليل حجم PDF"),
 pdfSplit:L("继续按页拆分","Split into pages","ページごとに分割","페이지별로 분할","Séparer en pages","In Seiten aufteilen","Dividir en páginas","Dividir em páginas","تقسيم إلى صفحات"),
 pdfImages:L("继续导出为图片","Export pages as images","ページを画像にする","페이지를 이미지로 내보내기","Exporter les pages en images","Seiten als Bilder exportieren","Exportar páginas como imágenes","Exportar páginas como imagens","تصدير الصفحات كصور"),
 imageCompress:L("继续压缩图片","Compress the image","画像をさらに圧縮","이미지 더 압축","Compresser l’image","Bild komprimieren","Comprimir la imagen","Comprimir a imagem","ضغط الصورة"),
 imageResize:L("继续修改尺寸","Resize the image","画像サイズを変更","이미지 크기 변경","Redimensionner l’image","Bildgröße ändern","Cambiar el tamaño","Alterar o tamanho","تغيير حجم الصورة"),
 imagePrivacy:L("继续清除隐私信息","Remove image metadata","画像の個人情報を削除","이미지 개인정보 제거","Supprimer les métadonnées","Bildmetadaten entfernen","Eliminar metadatos","Remover metadados","إزالة بيانات الصورة"),
 imagePdf:L("继续生成 PDF","Turn images into PDF","画像からPDFを作る","이미지를 PDF로 만들기","Créer un PDF","Bilder in PDF umwandeln","Crear un PDF","Criar um PDF","تحويل الصور إلى PDF"),
 xlsxCsv:L("继续转成 CSV","Continue to CSV","CSVに変換","CSV로 변환","Continuer en CSV","Als CSV fortfahren","Continuar a CSV","Continuar para CSV","المتابعة إلى CSV"),
 csvXlsx:L("继续转成 Excel","Continue to Excel","Excelに変換","Excel로 변환","Continuer vers Excel","Als Excel fortfahren","Continuar a Excel","Continuar para Excel","المتابعة إلى Excel")
};

export function continuationText(lang:LingxiLang,key:ContinuationCopyKey){return COPY[key][lang]||COPY[key].en}
