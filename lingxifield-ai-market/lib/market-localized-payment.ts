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
 'Bank debit through Link (where available)':{zh:'Link 银行扣款（适用地区）',ja:'Link 銀行引落（対応地域）',ko:'Link 은행 자동이체(지원 지역)',fr:'Prélèvement via Link (selon pays)',de:'Bankeinzug über Link (wo verfügbar)',es:'Débito bancario con Link (si disponible)',pt:'Débito bancário via Link (onde disponível)',ar:'الخصم المصرفي عبر Link (حيث يتوفر)'},
 'Stripe Instant Bank Payments (US only)':{zh:'Stripe 银行即时支付（仅美国）',ja:'Stripe 即時銀行決済（米国のみ）',ko:'Stripe 즉시 은행결제(미국)',fr:'Virement instantané Stripe (États-Unis)',de:'Stripe Sofort-Bankzahlung (nur USA)',es:'Pago bancario instantáneo Stripe (solo EE. UU.)',pt:'Pagamento bancário instantâneo Stripe (só EUA)',ar:'الدفع المصرفي الفوري Stripe (الولايات المتحدة فقط)'},
 'UPI (Go / Plus only)':{zh:'UPI（仅 Go / Plus）'},
 'Pix (Go / Plus / Pro)':{zh:'Pix（Go / Plus / Pro）'},
 'GoPay (Go / Plus / Pro)':{zh:'GoPay（Go / Plus / Pro）'},
 'GCash (Go / Plus / Pro)':{zh:'GCash（Go / Plus / Pro）'},
 'MoMo (web checkout: Go / Plus / Pro)':{zh:'MoMo（越南网页购买 Go / Plus / Pro）'},
 'ChatGPT wallet balance (eligible US purchases)':{zh:'ChatGPT 钱包余额（符合条件的美国订单）',ja:'ChatGPT ウォレット（米国の対象購入）',ko:'ChatGPT 지갑 잔액(미국 일부 구매)',fr:'Solde ChatGPT (achats US éligibles)',de:'ChatGPT-Guthaben (bestimmte US-Käufe)',es:'Saldo ChatGPT (compras elegibles en EE. UU.)',pt:'Saldo ChatGPT (compras elegíveis nos EUA)',ar:'رصيد محفظة ChatGPT (مشتريات أمريكية مؤهلة)'}
};
const PAYMENT_COPY:Record<Language,{
 noSoftwareFee:string;separateCosts:string;card:string;cardWeb:string;apiCard:string;appleStore:string;googlePlay:string;
 applePay:string;googlePay:string;amazonPay:string;alipay:string;wechatPay:string;cashAppPay:string;stablecoin:string;
 stripeInstant:string;webStripe:string;ach:string;noPaypalVenmo:string;noPaypal:string;paypalIndirect:string;
 googleOne:string;regionCheckout:string;cloudCheckout:string;link:string;upi:string;kakaoPay:string;naverPay:string;
 koreanCards:string;paypal:string;
}>={
 zh:{noSoftwareFee:'软件本身免费；自托管无需支付软件订阅费',separateCosts:'云服务、算力、托管或模型 API 费用另计',card:'信用卡 / 借记卡',cardWeb:'信用卡 / 借记卡（网页结账）',apiCard:'信用卡 / 借记卡（API 账单）',appleStore:'Apple App Store（iOS）',googlePlay:'Google Play（Android）',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'支付宝',wechatPay:'微信支付',cashAppPay:'Cash App Pay',stablecoin:'稳定币支付',stripeInstant:'Stripe 银行即时支付（仅美国）',webStripe:'网页结账（Stripe）',ach:'ACH 银行转账（符合条件的 API 月结账户）',noPaypalVenmo:'不支持 PayPal / Venmo',noPaypal:'不支持 PayPal',paypalIndirect:'PayPal（仅通过 App Store / Google Play 账户间接支付）',googleOne:'Google One / Google Play 账单',regionCheckout:'付款方式按国家/地区结账页面显示',cloudCheckout:'云端套餐通过结账页面付费',link:'Link',upi:'UPI（印度）',kakaoPay:'KakaoPay（韩国）',naverPay:'NaverPay（韩国）',koreanCards:'韩国本地银行卡',paypal:'PayPal'},
 en:{noSoftwareFee:'No software payment for the self-hosted/open-source edition',separateCosts:'Cloud hosting, compute and model API costs are billed separately',card:'Credit / debit card',cardWeb:'Credit / debit card (web checkout)',apiCard:'Credit / debit card (API billing)',appleStore:'Apple App Store (iOS)',googlePlay:'Google Play (Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'Stablecoin',stripeInstant:'Stripe Instant Bank Payments (US only)',webStripe:'Web checkout via Stripe',ach:'ACH bank transfer (eligible API monthly-invoice accounts)',noPaypalVenmo:'PayPal and Venmo are not accepted',noPaypal:'PayPal is not supported',paypalIndirect:'PayPal via App Store / Google Play account billing only',googleOne:'Google One / Google Play billing',regionCheckout:'Payment options vary by country at checkout',cloudCheckout:'Cloud plans are paid at checkout',link:'Link',upi:'UPI (India)',kakaoPay:'KakaoPay (South Korea)',naverPay:'NaverPay (South Korea)',koreanCards:'Korean local cards',paypal:'PayPal'},
 ja:{noSoftwareFee:'セルフホスト版・オープンソース版のソフトウェア料金は不要',separateCosts:'クラウド、計算資源、ホスティング、モデルAPI料金は別途',card:'クレジット / デビットカード',cardWeb:'クレジット / デビットカード（Web決済）',apiCard:'クレジット / デビットカード（API請求）',appleStore:'Apple App Store（iOS）',googlePlay:'Google Play（Android）',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'ステーブルコイン',stripeInstant:'Stripe即時銀行決済（米国のみ）',webStripe:'Web決済（Stripe）',ach:'ACH銀行振込（対象API月次請求アカウント）',noPaypalVenmo:'PayPal / Venmo非対応',noPaypal:'PayPal非対応',paypalIndirect:'PayPal（App Store / Google Play経由のみ）',googleOne:'Google One / Google Play決済',regionCheckout:'決済方法は国・地域の購入画面に表示',cloudCheckout:'クラウドプランは購入画面で決済',link:'Link',upi:'UPI（インド）',kakaoPay:'KakaoPay（韓国）',naverPay:'NaverPay（韓国）',koreanCards:'韓国の現地カード',paypal:'PayPal'},
 ko:{noSoftwareFee:'셀프 호스팅 오픈소스 소프트웨어 비용 없음',separateCosts:'클라우드, 컴퓨팅, 호스팅 및 모델 API 비용 별도',card:'신용 / 체크카드',cardWeb:'신용 / 체크카드(웹 결제)',apiCard:'신용 / 체크카드(API 결제)',appleStore:'Apple App Store(iOS)',googlePlay:'Google Play(Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'스테이블코인',stripeInstant:'Stripe 즉시 은행결제(미국만)',webStripe:'웹 결제(Stripe)',ach:'ACH 은행 송금(일부 API 월별 청구 계정)',noPaypalVenmo:'PayPal / Venmo 미지원',noPaypal:'PayPal 미지원',paypalIndirect:'PayPal(App Store / Google Play 계정 결제 경유만)',googleOne:'Google One / Google Play 결제',regionCheckout:'결제 수단은 국가별 결제 화면에 표시',cloudCheckout:'클라우드 요금제는 결제 화면에서 결제',link:'Link',upi:'UPI(인도)',kakaoPay:'KakaoPay(한국)',naverPay:'NaverPay(한국)',koreanCards:'한국 현지 카드',paypal:'PayPal'},
 fr:{noSoftwareFee:'Aucun paiement logiciel pour la version libre ou auto-hébergée',separateCosts:'Hébergement cloud, calcul et API de modèles facturés séparément',card:'Carte de crédit / débit',cardWeb:'Carte de crédit / débit (paiement Web)',apiCard:'Carte de crédit / débit (facturation API)',appleStore:'Apple App Store (iOS)',googlePlay:'Google Play (Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'Stablecoin',stripeInstant:'Paiement bancaire instantané Stripe (États-Unis)',webStripe:'Paiement Web via Stripe',ach:'Virement ACH (comptes API mensuels éligibles)',noPaypalVenmo:'PayPal et Venmo non acceptés',noPaypal:'PayPal non pris en charge',paypalIndirect:'PayPal uniquement via App Store / Google Play',googleOne:'Facturation Google One / Google Play',regionCheckout:'Les moyens de paiement varient selon le pays au paiement',cloudCheckout:'Forfaits cloud payés au paiement',link:'Link',upi:'UPI (Inde)',kakaoPay:'KakaoPay (Corée du Sud)',naverPay:'NaverPay (Corée du Sud)',koreanCards:'Cartes locales coréennes',paypal:'PayPal'},
 de:{noSoftwareFee:'Keine Softwaregebühr für selbst gehostete Open-Source-Versionen',separateCosts:'Cloud-Hosting, Rechenleistung und Modell-APIs werden separat berechnet',card:'Kredit- / Debitkarte',cardWeb:'Kredit- / Debitkarte (Web-Checkout)',apiCard:'Kredit- / Debitkarte (API-Abrechnung)',appleStore:'Apple App Store (iOS)',googlePlay:'Google Play (Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'Stablecoin',stripeInstant:'Stripe-Sofortüberweisung (nur USA)',webStripe:'Web-Checkout über Stripe',ach:'ACH-Banküberweisung (berechtigte API-Monatskonten)',noPaypalVenmo:'PayPal und Venmo werden nicht akzeptiert',noPaypal:'PayPal wird nicht unterstützt',paypalIndirect:'PayPal nur über App Store / Google Play',googleOne:'Google One / Google Play-Abrechnung',regionCheckout:'Zahlungsarten variieren je nach Land im Checkout',cloudCheckout:'Cloud-Tarife werden beim Checkout bezahlt',link:'Link',upi:'UPI (Indien)',kakaoPay:'KakaoPay (Südkorea)',naverPay:'NaverPay (Südkorea)',koreanCards:'Koreanische lokale Karten',paypal:'PayPal'},
 es:{noSoftwareFee:'Sin pago de software para la versión autoalojada/de código abierto',separateCosts:'El alojamiento, el cómputo y las API de modelos se cobran por separado',card:'Tarjeta de crédito / débito',cardWeb:'Tarjeta de crédito / débito (pago web)',apiCard:'Tarjeta de crédito / débito (facturación API)',appleStore:'Apple App Store (iOS)',googlePlay:'Google Play (Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'Stablecoin',stripeInstant:'Pago bancario instantáneo Stripe (solo EE. UU.)',webStripe:'Pago web mediante Stripe',ach:'Transferencia ACH (cuentas API mensuales elegibles)',noPaypalVenmo:'No se aceptan PayPal ni Venmo',noPaypal:'PayPal no es compatible',paypalIndirect:'PayPal solo mediante App Store / Google Play',googleOne:'Facturación de Google One / Google Play',regionCheckout:'Los métodos varían según el país en el checkout',cloudCheckout:'Los planes cloud se pagan en el checkout',link:'Link',upi:'UPI (India)',kakaoPay:'KakaoPay (Corea del Sur)',naverPay:'NaverPay (Corea del Sur)',koreanCards:'Tarjetas locales coreanas',paypal:'PayPal'},
 pt:{noSoftwareFee:'Sem cobrança de software para a versão auto-hospedada/de código aberto',separateCosts:'Hospedagem, computação e APIs de modelos são cobradas separadamente',card:'Cartão de crédito / débito',cardWeb:'Cartão de crédito / débito (checkout web)',apiCard:'Cartão de crédito / débito (cobrança de API)',appleStore:'Apple App Store (iOS)',googlePlay:'Google Play (Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'Stablecoin',stripeInstant:'Pagamento bancário instantâneo Stripe (somente EUA)',webStripe:'Checkout web via Stripe',ach:'Transferência ACH (contas API mensais elegíveis)',noPaypalVenmo:'PayPal e Venmo não são aceitos',noPaypal:'PayPal não é aceito',paypalIndirect:'PayPal somente via App Store / Google Play',googleOne:'Cobrança Google One / Google Play',regionCheckout:'Métodos variam por país no checkout',cloudCheckout:'Planos cloud pagos no checkout',link:'Link',upi:'UPI (Índia)',kakaoPay:'KakaoPay (Coreia do Sul)',naverPay:'NaverPay (Coreia do Sul)',koreanCards:'Cartões locais coreanos',paypal:'PayPal'},
 ar:{noSoftwareFee:'لا توجد رسوم للبرنامج ذاتي الاستضافة أو مفتوح المصدر',separateCosts:'تُحاسب تكاليف السحابة والحوسبة والاستضافة وواجهات النماذج بشكل منفصل',card:'بطاقة ائتمان / خصم',cardWeb:'بطاقة ائتمان / خصم (الدفع عبر الويب)',apiCard:'بطاقة ائتمان / خصم (فوترة API)',appleStore:'Apple App Store (iOS)',googlePlay:'Google Play (Android)',applePay:'Apple Pay',googlePay:'Google Pay',amazonPay:'Amazon Pay',alipay:'Alipay',wechatPay:'WeChat Pay',cashAppPay:'Cash App Pay',stablecoin:'عملة مستقرة',stripeInstant:'دفع مصرفي فوري من Stripe (الولايات المتحدة فقط)',webStripe:'الدفع عبر الويب بواسطة Stripe',ach:'تحويل ACH (حسابات API المؤهلة للفوترة الشهرية)',noPaypalVenmo:'PayPal وVenmo غير مقبولين',noPaypal:'PayPal غير مدعوم',paypalIndirect:'PayPal عبر App Store / Google Play فقط',googleOne:'فوترة Google One / Google Play',regionCheckout:'تختلف طرق الدفع حسب البلد وتظهر عند إتمام الشراء',cloudCheckout:'تُدفع خطط السحابة عند إتمام الشراء',link:'Link',upi:'UPI (الهند)',kakaoPay:'KakaoPay (كوريا الجنوبية)',naverPay:'NaverPay (كوريا الجنوبية)',koreanCards:'بطاقات محلية كورية',paypal:'PayPal'}
};
export function localizedPaymentName(name:string,language:Language){
 const exact=paymentNames[name]?.[language];
 if(exact)return exact;
 const n=name.toLowerCase(),t=PAYMENT_COPY[language];
 if(/no payment|no software payment|no software fee|sdk: no payment/.test(n))return t.noSoftwareFee;
 if(/billed separately|costs are separate|paid separately/.test(n))return t.separateCosts;
 if(/checkout options vary|payment options vary/.test(n))return t.regionCheckout;
 if(/cloud plans.*checkout|cloud subscription.*checkout/.test(n))return t.cloudCheckout;
 if(/credit.*debit/.test(n))return /api/.test(n)?t.apiCard:/web/.test(n)?t.cardWeb:t.card;
 if(/apple app store/.test(n))return t.appleStore;
 if(/google play/.test(n)&&/google one/.test(n))return t.googleOne;
 if(/google one/.test(n))return t.googleOne;
 if(/google play/.test(n))return t.googlePlay;
 if(/apple pay/.test(n))return t.applePay;
 if(/google pay/.test(n))return t.googlePay;
 if(/amazon pay/.test(n))return t.amazonPay;
 if(/alipay/.test(n))return t.alipay;
 if(/wechat pay/.test(n))return t.wechatPay;
 if(/cash app pay/.test(n))return t.cashAppPay;
 if(/stablecoin/.test(n))return t.stablecoin;
 if(/stripe instant bank/.test(n))return t.stripeInstant;
 if(/web checkout via stripe/.test(n))return t.webStripe;
 if(/ach bank/.test(n))return t.ach;
 if(/paypal.*venmo.*not accepted/.test(n))return t.noPaypalVenmo;
 if(/paypal.*not supported/.test(n))return t.noPaypal;
 if(/paypal via app store/.test(n))return t.paypalIndirect;
 if(/paypal/.test(n))return t.paypal;
 if(/korean local cards/.test(n))return t.koreanCards;
 if(/^upi/.test(n))return t.upi;
 if(/^kakaopay/.test(n))return t.kakaoPay;
 if(/^naverpay/.test(n))return t.naverPay;
 if(/^link/.test(n))return t.link;
 if(language==='zh')return name;
 if(/[\u4e00-\u9fff]/.test(name)){
  const methods:string[]=[];
  if(/支付宝|Alipay/i.test(name))methods.push(t.alipay);
  if(/微信支付|WeChat Pay/i.test(name))methods.push(t.wechatPay);
  if(/银行卡|信用卡|借记卡|Visa|Mastercard|American Express/i.test(name))methods.push(t.card);
  if(/Apple App Store|苹果商店/i.test(name))methods.push(t.appleStore);
  if(/Google Play/i.test(name))methods.push(t.googlePlay);
  if(/Amazon Pay/i.test(name))methods.push(t.amazonPay);
  if(/PayPal/i.test(name))methods.push(t.paypal);
  if(/Stripe/i.test(name))methods.push('Stripe');
  return methods.length?[...new Set(methods)].join(' · '):
   ({en:'See official payment policy',ja:'公式決済方法を確認',ko:'공식 결제 방법 확인',fr:'Voir les paiements officiels',de:'Offizielle Zahlungsmethoden prüfen',es:'Ver pagos oficiales',pt:'Ver pagamentos oficiais',ar:'راجع طرق الدفع الرسمية'} as Record<Exclude<Language,'zh'>,string>)[language as Exclude<Language,'zh'>];
 }
 return name;
}
