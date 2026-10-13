import type {LingxiLang} from '@/lib/lingxi-i18n';
const COPY:Record<LingxiLang,{notice:string;confirm:string}>={
 zh:{notice:'PDF 和图片在此设备处理；Word、PPT、Excel 等文档需要发送至转换服务，并会在上传前征求确认。',confirm:'选中的文档需要发送至转换服务。是否继续？如需仅在本机处理，请先转换为 PDF。'},
 en:{notice:'PDF and image files are processed on this device. Office documents are sent to the conversion service only after your confirmation.',confirm:'Send the selected documents to the conversion service? For device-only processing, convert them to PDF first.'},
 ja:{notice:'PDFと画像はこの端末で処理します。Office文書は確認後に変換サービスへ送信します。',confirm:'選択した文書を変換サービスへ送信しますか？端末だけで処理する場合は先にPDFへ変換してください。'},
 ko:{notice:'PDF와 이미지는 이 기기에서 처리합니다. Office 문서는 확인 후 변환 서비스로 전송합니다.',confirm:'선택한 문서를 변환 서비스로 전송할까요? 기기에서만 처리하려면 먼저 PDF로 변환하세요.'},
 fr:{notice:'PDF et images sont traités sur cet appareil. Les documents Office sont envoyés au service de conversion après confirmation.',confirm:'Envoyer les documents au service de conversion ? Pour un traitement sur cet appareil uniquement, convertissez-les d’abord en PDF.'},
 de:{notice:'PDFs und Bilder werden auf diesem Gerät verarbeitet. Office-Dokumente werden erst nach Bestätigung an den Konvertierungsdienst gesendet.',confirm:'Dokumente an den Konvertierungsdienst senden? Für reine Geräteverarbeitung zuerst in PDF umwandeln.'},
 es:{notice:'PDF e imágenes se procesan en este dispositivo. Los documentos Office se envían al servicio de conversión tras tu confirmación.',confirm:'¿Enviar los documentos al servicio de conversión? Para procesarlos solo en el dispositivo, conviértelos primero a PDF.'},
 pt:{notice:'PDFs e imagens são processados neste dispositivo. Documentos Office são enviados ao serviço de conversão após sua confirmação.',confirm:'Enviar os documentos ao serviço de conversão? Para processar apenas no dispositivo, converta-os primeiro em PDF.'},
 ar:{notice:'تُعالج ملفات PDF والصور على هذا الجهاز. تُرسل مستندات Office إلى خدمة التحويل بعد تأكيدك فقط.',confirm:'هل تريد إرسال المستندات إلى خدمة التحويل؟ للمعالجة على الجهاز فقط، حوّلها إلى PDF أولًا.'},
};
export function documentUploadDisclosure(lang:LingxiLang){return COPY[lang]||COPY.en}
