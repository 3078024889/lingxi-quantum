import type {Language} from './v2';
/** The same 10 dimensions across all locale routes. Order is tied to compareRows. */
export const COMPARE_LABELS:Record<Language,string[]>={
 zh:['能做什么','最擅长','理解与推理','免费的功能','付费增加什么','参考价格','图片／视频水印','地区可用性','付款方式','短剧生成能力'],
 en:['What it does','Best at','Reasoning & understanding','Free features','Paid features','Reference price','Image/video watermark','Region availability','Payment methods','Short-film capability'],
 ja:['主な機能','得意分野','推論・理解','無料機能','有料機能','参考料金','画像・動画の透かし','提供地域','決済方法','短編動画制作'],
 ko:['주요 기능','강점','추론·이해','무료 기능','유료 기능','참고 가격','이미지·영상 워터마크','지역 지원','결제 수단','단편 영상 제작'],
 fr:['Fonctionnalités','Points forts','Raisonnement et compréhension','Fonctions gratuites','Fonctions payantes','Prix indicatif','Filigrane image/vidéo','Disponibilité régionale','Moyens de paiement','Création de courts métrages'],
 de:['Funktionen','Stärken','Denken und Verstehen','Gratis-Funktionen','Kostenpflichtige Funktionen','Richtpreis','Bild-/Video-Wasserzeichen','Regionale Verfügbarkeit','Zahlungsmethoden','Kurzfilm-Funktionen'],
 es:['Qué puede hacer','Puntos fuertes','Razonamiento y comprensión','Funciones gratis','Funciones de pago','Precio orientativo','Marca de agua','Disponibilidad regional','Formas de pago','Creación de cortos'],
 pt:['O que faz','Destaques','Raciocínio e compreensão','Funções gratuitas','Funções pagas','Preço de referência','Marca d’água','Disponibilidade regional','Formas de pagamento','Criação de curtas'],
 ar:['الوظائف','أهم المزايا','الفهم والاستدلال','ميزات مجانية','ميزات مدفوعة','سعر مرجعي','علامة مائية للصور والفيديو','التوفر حسب المنطقة','طرق الدفع','إنشاء أفلام قصيرة']
};
