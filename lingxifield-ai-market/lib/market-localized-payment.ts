import type {Language} from './v2';
const paymentNames:Record<string,Partial<Record<Language,string>>>={
 'Credit / debit card':{zh:'信用卡 / 借记卡',ja:'クレジット / デビットカード',ko:'신용 / 체크카드',fr:'Carte de crédit / débit',de:'Kredit- / Debitkarte',es:'Tarjeta de crédito / débito',pt:'Cartão de crédito / débito',ar:'بطاقة ائتمان / خصم'},
 'Credit / debit card (web)':{zh:'信用卡 / 借记卡（网页版）',ja:'カード（ウェブ）',ko:'카드(웹)',fr:'Carte (web)',de:'Karte (Web)',es:'Tarjeta (web)',pt:'Cartão (web)',ar:'البطاقات (الموقع)'},
 'Apple App Store (mobile)':{zh:'Apple App Store（移动端）',ja:'Apple App Store（モバイル）',ko:'Apple App Store(모바일)',fr:'Apple App Store (mobile)',de:'Apple App Store (mobil)',es:'Apple App Store (móvil)',pt:'Apple App Store (celular)',ar:'متجر Apple (الهاتف)'},
 'Google Play (mobile)':{zh:'Google Play（移动端）',ja:'Google Play（モバイル）',ko:'Google Play(모바일)',fr:'Google Play (mobile)',de:'Google Play (mobil)',es:'Google Play (móvil)',pt:'Google Play (celular)',ar:'Google Play (الهاتف)'},
 'Apple App Store (iOS)':{zh:'Apple App Store（iOS）'},
 'Google Play (Android)':{zh:'Google Play（Android）'},
 'Apple Pay (some regions)':{zh:'Apple Pay（部分地区）',ja:'Apple Pay（一部地域）',ko:'Apple Pay(일부 지역)',fr:'Apple Pay (certaines régions)',de:'Apple Pay (in einigen Regionen)',es:'Apple Pay (algunas regiones)',pt:'Apple Pay (algumas regiões)',ar:'Apple Pay (في بعض المناطق)'},
 'Google Pay (some regions)':{zh:'Google Pay（部分地区）',ja:'Google Pay（一部地域）',ko:'Google Pay(일부 지역)',fr:'Google Pay (certaines régions)',de:'Google Pay (in einigen Regionen)',es:'Google Pay (algunas regiones)',pt:'Google Pay (algumas regiões)',ar:'Google Pay (في بعض المناطق)'},
 'Cash App Pay (some regions)':{zh:'Cash App Pay（部分地区）',ja:'Cash App Pay（一部地域）',ko:'Cash App Pay(일부 지역)',fr:'Cash App Pay (certaines régions)',de:'Cash App Pay (in einigen Regionen)',es:'Cash App Pay (algunas regiones)',pt:'Cash App Pay (algumas regiões)',ar:'Cash App Pay (في بعض المناطق)'},
 'Stablecoin (some regions)':{zh:'稳定币支付（部分地区）',ja:'ステーブルコイン（一部地域）',ko:'스테이블코인(일부 지역)',fr:'Stablecoin (certaines régions)',de:'Stablecoin (in einigen Regionen)',es:'Stablecoin (algunas regiones)',pt:'Stablecoin (algumas regiões)',ar:'عملة مستقرة (في بعض المناطق)'},
 'Korean local cards':{zh:'韩国本地银行卡',ja:'韓国の現地カード',ko:'한국 현지 카드',fr:'Cartes locales coréennes',de:'Koreanische lokale Karten',es:'Tarjetas locales coreanas',pt:'Cartões locais coreanos',ar:'بطاقات محلية كورية'},
 'UPI':{zh:'UPI（印度）',ja:'UPI（インド）',ko:'UPI(인도)',fr:'UPI (Inde)',de:'UPI (Indien)',es:'UPI (India)',pt:'UPI (Índia)',ar:'UPI (الهند)'},
 'KakaoPay':{zh:'KakaoPay（韩国）',ja:'KakaoPay（韓国）',ko:'KakaoPay',fr:'KakaoPay (Corée)',de:'KakaoPay (Korea)',es:'KakaoPay (Corea)',pt:'KakaoPay (Coreia)',ar:'KakaoPay (كوريا)'},
 'NaverPay':{zh:'NaverPay（韩国）',ja:'NaverPay（韓国）',ko:'NaverPay',fr:'NaverPay (Corée)',de:'NaverPay (Korea)',es:'NaverPay (Corea)',pt:'NaverPay (Coreia)',ar:'NaverPay (كوريا)'},
 'PayPal via App Store / Google Play (indirect only)':{zh:'PayPal（仅通过 App Store / Google Play 账户间接支付）',ja:'PayPal（App Store / Google Play経由のみ）',ko:'PayPal(App Store / Google Play 계정 경유만)',fr:'PayPal (uniquement via App Store / Google Play)',de:'PayPal (nur über App Store / Google Play)',es:'PayPal (solo mediante App Store / Google Play)',pt:'PayPal (somente via App Store / Google Play)',ar:'PayPal (عبر App Store أو Google Play فقط)'},
 'Korean local cards':{zh:'韩国本地银行卡',ja:'韓国現地カード',ko:'한국 국내 카드',fr:'Cartes bancaires coréennes',de:'Koreanische Bankkarten',es:'Tarjetas bancarias coreanas',pt:'Cartões bancários coreanos',ar:'بطاقات البنوك الكورية'},
 'Bank debit through Link (where available)':{zh:'Link 银行扣款（适用地区）',ja:'Link 銀行引落（対応地域）',ko:'Link 은행 자동이체(지원 지역)',fr:'Prélèvement via Link (selon pays)',de:'Bankeinzug über Link (wo verfügbar)',es:'Débito bancario con Link (si disponible)',pt:'Débito bancário via Link (onde disponível)',ar:'الخصم المصرفي عبر Link (حيث يتوفر)'},
 'Stripe Instant Bank Payments (US only)':{zh:'Stripe 银行即时支付（仅美国）',ja:'Stripe 即時銀行決済（米国のみ）',ko:'Stripe 즉시 은행결제(미국)',fr:'Virement instantané Stripe (États-Unis)',de:'Stripe Sofort-Bankzahlung (nur USA)',es:'Pago bancario instantáneo Stripe (solo EE. UU.)',pt:'Pagamento bancário instantâneo Stripe (só EUA)',ar:'الدفع المصرفي الفوري Stripe (الولايات المتحدة فقط)'},
 'UPI (Go / Plus only)':{zh:'UPI（仅 Go / Plus）'},
 'Pix (Go / Plus / Pro)':{zh:'Pix（Go / Plus / Pro）'},
 'GoPay (Go / Plus / Pro)':{zh:'GoPay（Go / Plus / Pro）'},
 'GCash (Go / Plus / Pro)':{zh:'GCash（Go / Plus / Pro）'},
 'MoMo (web checkout: Go / Plus / Pro)':{zh:'MoMo（越南网页购买 Go / Plus / Pro）'},
 'ChatGPT wallet balance (eligible US purchases)':{zh:'ChatGPT 钱包余额（符合条件的美国订单）',ja:'ChatGPT ウォレット（米国の対象購入）',ko:'ChatGPT 지갑 잔액(미국 일부 구매)',fr:'Solde ChatGPT (achats US éligibles)',de:'ChatGPT-Guthaben (bestimmte US-Käufe)',es:'Saldo ChatGPT (compras elegibles en EE. UU.)',pt:'Saldo ChatGPT (compras elegíveis nos EUA)',ar:'رصيد محفظة ChatGPT (مشتريات أمريكية مؤهلة)'}
};
export function localizedPaymentName(name:string,language:Language){
 const direct=paymentNames[name]?.[language];
 if(direct)return direct;
 if(language==='zh')return name;
 if(!/[\u4e00-\u9fff]/.test(name))return name;
 const methods:string[]=[];
 if(/支付宝|Alipay/i.test(name))methods.push('Alipay');
 if(/微信支付|WeChat Pay/i.test(name))methods.push('WeChat Pay');
 if(/银行卡|信用卡|借记卡|Visa|Mastercard|American Express/i.test(name))methods.push('Credit / debit card');
 if(/Apple App Store|苹果商店/i.test(name))methods.push('Apple App Store');
 if(/Google Play/i.test(name))methods.push('Google Play');
 if(/Amazon Pay/i.test(name))methods.push('Amazon Pay');
 if(/PayPal/i.test(name))methods.push('PayPal');
 if(/Stripe/i.test(name))methods.push('Stripe checkout');
 // Never display untranslated raw Chinese payment marketing notes in another locale.
 return methods.length? [...new Set(methods)].join(' · '):
  ({en:'See official payment policy',ja:'公式決済方法を確認',ko:'공식 결제 방법 확인',fr:'Voir les paiements officiels',de:'Offizielle Zahlungsmethoden prüfen',es:'Ver pagos oficiales',pt:'Ver pagamentos oficiais',ar:'راجع طرق الدفع الرسمية',zh:name} as Record<Language,string>)[language];
}
