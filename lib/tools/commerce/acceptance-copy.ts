import type {SeoLocale} from '@/lib/seo/global-seo';

const COPY:Record<SeoLocale,string>={
 zh:'目前可免费反复使用，无需购买工具包。保存或发送同一份结果不会重复计次。',
 en:'You can currently use this tool repeatedly for free, without a ToolPass. Saving or sharing the same result does not count again.',
 ja:'現在はツールパスを購入せず、何度でも無料で使えます。同じ結果の保存や共有は重複計上されません。',
 ko:'현재 도구 이용권 없이 여러 번 무료로 사용할 수 있습니다. 같은 결과를 저장하거나 공유해도 다시 계산하지 않습니다.',
 fr:'Utilisation gratuite et répétée actuellement, sans ToolPass. Enregistrer ou partager le même résultat ne compte pas à nouveau.',
 de:'Derzeit wiederholt kostenlos ohne ToolPass nutzbar. Erneutes Speichern oder Teilen desselben Ergebnisses zählt nicht erneut.',
 es:'Actualmente puedes usar esta herramienta varias veces gratis, sin ToolPass. Guardar o compartir el mismo resultado no vuelve a contar.',
 pt:'Atualmente pode usar esta ferramenta repetidamente de graça, sem ToolPass. Salvar ou compartilhar o mesmo resultado não conta novamente.',
 ar:'يمكنك حالياً استخدام هذه الأداة مجاناً مراراً دون شراء ToolPass. لا يُحتسب حفظ النتيجة نفسها أو مشاركتها مرة أخرى.',
};
export function acceptanceNotice(locale:SeoLocale){return COPY[locale]||COPY.en}
