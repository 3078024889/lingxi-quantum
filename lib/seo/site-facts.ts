import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SITE,localePath,toolTitle,toolDescription,type SeoLocale} from './global-seo';
import {FACT_LABELS} from './product-facts';
import {getTool} from '@/lib/tools/registry';
import {isPublicPaidToolId} from '@/lib/tools/paid-catalog';
import {allToolBillingPolicies} from '@/lib/pricing/tool-policy-data';
export type {SeoLocale} from './global-seo';

const LOCALES:SeoLocale[]=['zh','en','ja','ko','fr','de','es','pt','ar'];
function text(values:string[],locale:SeoLocale){return values[LOCALES.indexOf(locale)];}
const POLICY=new Map(allToolBillingPolicies().map(p=>[p.toolId,p]));
const CN_SITE='https://lingxifield.cn';
export const GEO_PAGE_IDS=['home','products','tools','about','sasi','sasi-pricing'] as const;
export const GEO_TOOL_SLUGS=GLOBAL_TOOL_CATALOG.map(t=>t.slug);
type PageId=(typeof GEO_PAGE_IDS)[number];
type FactKind='free-local'|'free-online'|'paid-local'|'paid-online'|'later';
export type GeoFact={title:string;description:string;question:string;answer:string;com:string;cn:string;kind?:FactKind};
const LOCAL=['在浏览器本地处理，文件不会上传。','Processing runs in your browser; files are not uploaded.','ブラウザ内で処理し、ファイルはアップロードしません。','브라우저에서 처리하며 파일은 업로드되지 않습니다.','Le traitement se fait dans le navigateur ; les fichiers ne sont pas téléversés.','Die Verarbeitung erfolgt im Browser; Dateien werden nicht hochgeladen.','El procesamiento se realiza en el navegador; los archivos no se suben.','O processamento ocorre no navegador; os arquivos não são enviados.','تجري المعالجة في المتصفح ولا تُرفع الملفات.'];
const ONLINE=['使用在线处理，请先查看页面中的隐私说明。','Uses online processing; review the privacy information on the page first.','オンライン処理を使用します。事前にプライバシー説明を確認してください。','온라인 처리를 사용합니다. 먼저 페이지의 개인정보 안내를 확인하세요.','Utilise un traitement en ligne ; consultez d’abord les informations de confidentialité.','Nutzt Online-Verarbeitung; prüfe zuerst die Datenschutzhinweise der Seite.','Utiliza procesamiento en línea; consulta primero la información de privacidad.','Usa processamento online; confira primeiro as informações de privacidade.','يستخدم المعالجة عبر الإنترنت؛ راجع معلومات الخصوصية في الصفحة أولاً.'];
const FREE=['可以免费使用。','Free to use.','無料で使えます。','무료로 사용할 수 있습니다.','Utilisation gratuite.','Kostenlos nutzbar.','Uso gratuito.','Uso gratuito.','يمكن استخدامه مجاناً.'];
const PAID=['需要付费，请在执行前确认页面显示的费用。','Paid processing; confirm the price shown before proceeding.','有料処理です。実行前に表示料金を確認してください。','유료 처리입니다. 실행 전에 표시된 요금을 확인하세요.','Traitement payant ; confirmez le tarif affiché avant de continuer.','Kostenpflichtige Verarbeitung; bestätige vorab den angezeigten Preis.','Procesamiento de pago; confirma el precio indicado antes de continuar.','Processamento pago; confirme o preço exibido antes de continuar.','المعالجة مدفوعة؛ أكد السعر المعروض قبل المتابعة.'];
const MIXED=['部分功能免费，文件分享或批量处理等功能需要付费，请在执行前确认费用。','Some features are free; file sharing or batch processing is paid. Confirm the price before proceeding.','一部は無料です。ファイル共有や一括処理などは有料のため、実行前に料金を確認してください。','일부 기능은 무료이며 파일 공유나 일괄 처리 등은 유료입니다. 실행 전 요금을 확인하세요.','Certaines fonctions sont gratuites ; le partage de fichiers ou le traitement par lots est payant. Confirmez le tarif avant de continuer.','Einige Funktionen sind kostenlos; Dateifreigabe oder Stapelverarbeitung sind kostenpflichtig. Bestätige den Preis vorab.','Algunas funciones son gratuitas; compartir archivos o procesar lotes es de pago. Confirma el precio antes de continuar.','Algumas funções são gratuitas; compartilhar arquivos ou processar lotes é pago. Confirme o preço antes de continuar.','بعض الوظائف مجانية؛ مشاركة الملفات أو المعالجة المجمعة مدفوعة. أكد السعر قبل المتابعة.'];
const LATER=['尚未开放，暂时不能使用。','Not open yet; currently unavailable.','未公開のため、現在は利用できません。','아직 공개되지 않아 현재 사용할 수 없습니다.','Pas encore ouvert ; indisponible pour le moment.','Noch nicht freigegeben; derzeit nicht verfügbar.','Aún no está abierto; no está disponible actualmente.','Ainda não está aberto; indisponível no momento.','لم يُفتح بعد وهو غير متاح حالياً.'];
const QUESTION=['文件如何处理？这个工具收费吗？','How are files processed, and is this tool paid?','ファイルはどのように処理されますか。有料ですか。','파일은 어떻게 처리되나요? 유료 도구인가요?','Comment les fichiers sont-ils traités et cet outil est-il payant ?','Wie werden Dateien verarbeitet und ist das Tool kostenpflichtig?','¿Cómo se procesan los archivos y esta herramienta es de pago?','Como os arquivos são processados e esta ferramenta é paga?','كيف تُعالج الملفات وهل هذه الأداة مدفوعة؟'];
function fact(title:string,description:string,path:string,locale:SeoLocale,kind?:FactKind):GeoFact{
 const hasLocaleRoute=path==='/'||path==='/products'||path.startsWith('/tools');
 const localized=hasLocaleRoute?localePath(locale,path):path+(locale==='zh'?'':'?lang='+locale),com=SITE+localized,cn=CN_SITE+localized;
 return {title,description,question:text(QUESTION,locale),answer:description+' '+com+' '+cn,com,cn,kind};
}
export function toolGeoFact(slug:string,locale:SeoLocale):GeoFact|null{
 const tool=GLOBAL_TOOL_CATALOG.find(t=>t.slug===slug);if(!tool)return null;
 const billingSlug=slug==='burn-after-read'?'burn-after-read-file':slug==='temp-mail'?'temp-mail-batch':slug;
 const mixed=billingSlug!==slug;
 const meta=getTool(slug),policy=POLICY.get(billingSlug);
 const unavailable=meta?.status==='planned'||policy?.billingClass==='DISABLED';
 const local=policy?policy.executionMode==='local':meta?.localOnly??tool.mode==='local';
 const paid=isPublicPaidToolId(billingSlug)||policy?.billingClass==='PAID_TOOL'||policy?.billingClass==='SASI_BALANCE';
 const kind:FactKind=unavailable?'later':paid?(local?'paid-local':'paid-online'):(local?'free-local':'free-online');
 const description=unavailable?toolTitle(locale,tool)+' · '+text(LATER,locale):[toolDescription(locale,tool),text(local?LOCAL:ONLINE,locale),text(mixed?MIXED:paid?PAID:FREE,locale)].join(' ');
 return fact(toolTitle(locale,tool),description,'/tools/'+slug,locale,kind);
}
const DIRECTORY=['查看实用工具与 SASI，按页面说明选择处理方式。免费和付费功能分别标明，尚未开放的工具不能使用。','Explore practical tools and SASI. Free and paid features are labeled separately; tools not open yet are unavailable.','実用ツールとSASIを確認できます。無料・有料機能を区別し、未公開ツールは利用できません。','실용 도구와 SASI를 확인하세요. 무료와 유료 기능을 구분하며 미공개 도구는 사용할 수 없습니다.','Découvrez les outils pratiques et SASI. Les fonctions gratuites et payantes sont distinguées ; les outils non ouverts sont indisponibles.','Entdecke praktische Tools und SASI. Kostenlose und kostenpflichtige Funktionen sind gekennzeichnet; nicht freigegebene Tools sind nicht nutzbar.','Explora herramientas prácticas y SASI. Las funciones gratuitas y de pago se identifican; las herramientas no abiertas no están disponibles.','Explore ferramentas práticas e SASI. Funções gratuitas e pagas são identificadas; ferramentas não abertas estão indisponíveis.','استكشف الأدوات العملية وSASI. تُميّز الوظائف المجانية والمدفوعة، والأدوات غير المفتوحة غير متاحة.'];
const SASI=['SASI 使用预充值余额，不是会员。短剧、导演和网站构建尚不是已完成的产品。','SASI uses a prepaid balance, not a membership. Short drama, directing and website building are not finished products.','SASIは会員制ではなく、事前入金の残高を使用します。短編ドラマ・演出・サイト構築は完成済みの製品ではありません。','SASI는 멤버십이 아닌 선불 잔액을 사용합니다. 숏폼 드라마, 연출, 웹사이트 제작은 아직 완성된 제품이 아닙니다.','SASI utilise un solde prépayé, sans abonnement. La mini-série, la réalisation et la création de sites ne sont pas des produits achevés.','SASI nutzt ein vorausbezahltes Guthaben ohne Mitgliedschaft. Kurzdrama, Regie und Website-Erstellung sind keine fertigen Produkte.','SASI utiliza saldo prepago, sin membresía. El minidrama, la dirección y la creación de sitios no son productos terminados.','SASI usa saldo pré-pago, sem assinatura. Minidramas, direção e criação de sites não são produtos concluídos.','يستخدم SASI رصيداً مدفوعاً مسبقاً وليس عضوية. الدراما القصيرة والإخراج وبناء المواقع ليست منتجات مكتملة.'];
const BALANCE=['管理人民币和美元余额，充值并查看原路退款进度。费用以付款前显示为准。','Manage CNY and USD balances, top up and track refunds to the original payment method. Confirm the displayed price before payment.','人民元・米ドル残高を管理し、入金と元の支払い方法への返金状況を確認できます。支払い前に料金を確認してください。','위안화와 달러 잔액을 관리하고 충전 및 원 결제수단 환불 진행을 확인하세요. 결제 전 표시 요금을 확인하세요.','Gérez les soldes CNY et USD, rechargez et suivez les remboursements vers le moyen d’origine. Vérifiez le prix avant paiement.','Verwalte CNY- und USD-Guthaben, lade auf und verfolge Erstattungen zur ursprünglichen Zahlungsart. Prüfe den Preis vor der Zahlung.','Gestiona saldos CNY y USD, recarga y consulta reembolsos al método original. Confirma el precio antes del pago.','Gerencie saldos CNY e USD, recarregue e acompanhe reembolsos ao método original. Confirme o preço antes de pagar.','أدر أرصدة CNY وUSD واشحنها وتابع الاسترداد إلى وسيلة الدفع الأصلية. أكد السعر قبل الدفع.'];
export function pageGeoFact(id:PageId,locale:SeoLocale):GeoFact{
 const c=SEO_LOCALES[locale];const titles:Record<PageId,string>={home:c.brand,tools:c.toolsTitle,products:FACT_LABELS.products[locale],about:text(['关于灵犀场','About LINGXIFIELD','LINGXIFIELDについて','LINGXIFIELD 소개','À propos de LINGXIFIELD','Über LINGXIFIELD','Acerca de LINGXIFIELD','Sobre o LINGXIFIELD','حول LINGXIFIELD'],locale),sasi:'SASI','sasi-pricing':text(['余额','Balance','残高','잔액','Solde','Guthaben','Saldo','Saldo','الرصيد'],locale)};
 const paths:Record<PageId,string>={home:'/',tools:'/tools',products:'/products',about:'/about',sasi:'/sasi','sasi-pricing':'/sasi/pricing'};
 return fact(titles[id],text(id==='sasi'?SASI:id==='sasi-pricing'?BALANCE:DIRECTORY,locale),paths[id],locale);
}
