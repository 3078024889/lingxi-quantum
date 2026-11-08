/** Public SASI language copy. Transaction and security status remains server-authored. */
export type SasiUiLocale="ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
const TABLE:Record<string,readonly [string,string,string,string,string,string,string]> = Object.freeze({
 "SASI Intelligent Software": ["SASI インテリジェントソフトウェア","SASI 지능형 소프트웨어","Logiciels intelligents SASI","SASI Intelligente Software","Software inteligente SASI","Software inteligente SASI","برمجيات SASI الذكية"],
 "Source licenses · Developer publishing · Secure delivery": ["ソースライセンス · 開発者による公開 · 安全な配信","소스 라이선스 · 개발자 게시 · 안전한 전달","Licences source · Publication · Livraison sécurisée","Quellcode-Lizenzen · Veröffentlichung · Sichere Lieferung","Licencias de código · Publicación · Entrega segura","Licenças de código · Publicação · Entrega segura","ترخيص المصدر · نشر المطورين · تسليم آمن"],
 "Explore software": ["ソフトウェアを見る","소프트웨어 살펴보기","Explorer les logiciels","Software entdecken","Explorar software","Explorar software","استعراض البرامج"],
 "Publish software": ["ソフトウェアを公開","소프트웨어 게시","Publier un logiciel","Software veröffentlichen","Publicar software","Publicar software","نشر برنامج"],
 "Software licensing": ["ソフトウェアライセンス","소프트웨어 라이선스","Licences logicielles","Softwarelizenzen","Licencias de software","Licenças de software","تراخيص البرامج"],
 "Creator publishing": ["開発者による公開","개발자 게시","Publication des créateurs","Entwickler veröffentlichen","Publicación de desarrolladores","Publicação de desenvolvedores","نشر المطورين"],
 "Private delivery": ["非公開ファイル配信","비공개 파일 전달","Livraison privée","Private Bereitstellung","Entrega privada","Entrega privada","تسليم خاص"],
 "Order & licenses": ["注文とライセンス","주문 및 라이선스","Commandes et licences","Bestellungen und Lizenzen","Pedidos y licencias","Pedidos e licenças","الطلبات والتراخيص"],
 "Featured software": ["注目のソフトウェア","추천 소프트웨어","Logiciels à la une","Ausgewählte Software","Software destacado","Software em destaque","برامج مميزة"],
 "Browse creator software": ["開発者の作品を見る","개발자 작품 보기","Voir les créations","Software der Entwickler","Ver obras de creadores","Ver software de criadores","عرض برامج المطورين"],
 "Source code license only": ["ソースコードライセンスのみ","소스 코드 라이선스 전용","Licence du code source uniquement","Nur Quellcode-Lizenz","Solo licencia de código fuente","Apenas licença do código-fonte","ترخيص الشيفرة المصدرية فقط"],
 "Source delivery": ["ソースコード配信","소스 코드 전달","Livraison du code source","Quellcode-Lieferung","Entrega del código fuente","Entrega do código-fonte","تسليم الشيفرة المصدرية"],
 "Documentation": ["ドキュメント","설명서","Documentation","Dokumentation","Documentación","Documentação","الوثائق"],
 "Read-only observation": ["閲覧専用","읽기 전용 관찰","Observation en lecture seule","Nur lesender Zugriff","Observación de solo lectura","Observação somente leitura","اطلاع للقراءة فقط"],
 "Choose payment": ["支払い方法を見る","결제 방법 선택","Choisir le paiement","Zahlungsart wählen","Elegir pago","Escolher pagamento","اختيار الدفع"],
 "View details": ["詳細を見る","상세 정보","Voir les détails","Details ansehen","Ver detalles","Ver detalhes","عرض التفاصيل"],
 "Software & seller services": ["ソフトウェアと販売者サービス","소프트웨어 및 판매자 서비스","Logiciels et services vendeurs","Software und Verkäuferdienste","Software y servicios de vendedores","Software e serviços de vendedores","البرامج وخدمات البائعين"],
 "Search software": ["ソフトウェアを検索","소프트웨어 검색","Rechercher un logiciel","Software suchen","Buscar software","Buscar software","البحث عن برنامج"],
 "Find EAs and software…": ["EA・指標・アプリを検索…","EA·지표·앱 검색…","Rechercher des EA et logiciels…","EAs und Software suchen…","Buscar EA y software…","Buscar EA e software…","ابحث عن روبوتات التداول والبرامج…"],
 "All": ["すべて","전체","Tout","Alle","Todos","Todos","الكل"],
 "Details": ["詳細","상세","Détails","Details","Detalles","Detalhes","التفاصيل"],
 "Share": ["共有","공유","Partager","Teilen","Compartir","Partilhar","مشاركة"],
 "No reviewed and published software matches this search.": ["該当する承認済みソフトウェアはありません。","검색 조건에 맞는 승인된 소프트웨어가 없습니다.","Aucun logiciel approuvé ne correspond à cette recherche.","Keine geprüfte Software gefunden.","No hay software aprobado para esta búsqueda.","Nenhum software aprovado corresponde à busca.","لا توجد برامج معتمدة تطابق البحث."],
 "Software publishing steps": ["ソフトウェア公開手順","소프트웨어 게시 단계","Étapes de publication","Schritte zur Veröffentlichung","Pasos de publicación","Etapas de publicação","خطوات نشر البرامج"],
 "Publish and deliver": ["公開と配信","게시 및 전달","Publier et livrer","Veröffentlichen und liefern","Publicar y entregar","Publicar e entregar","النشر والتسليم"],
 "Product details": ["商品情報","상품 정보","Détails du produit","Produktdetails","Detalles del producto","Dados do produto","تفاصيل المنتج"],
 "Name, license, price": ["名前・ライセンス・価格","이름·라이선스·가격","Nom, licence, prix","Name, Lizenz, Preis","Nombre, licencia, precio","Nome, licença, preço","الاسم والترخيص والسعر"],
 "Upload private ZIP": ["非公開 ZIP をアップロード","비공개 ZIP 업로드","Importer le ZIP privé","Privates ZIP hochladen","Subir ZIP privado","Enviar ZIP privado","رفع ملف ZIP خاص"],
 "File and image review": ["ファイル・画像の審査","파일 및 이미지 심사","Vérification des fichiers et images","Datei- und Bildprüfung","Revisión de archivos e imágenes","Revisão de arquivos e imagens","فحص الملفات والصور"],
 "Publish after review": ["審査後に公開","심사 후 게시","Publier après validation","Nach Prüfung veröffentlichen","Publicar tras revisión","Publicar após revisão","النشر بعد المراجعة"],
 "Only reviewed listings appear": ["審査済みの作品のみ表示","심사 완료 작품만 표시","Seuls les produits validés sont visibles","Nur geprüfte Produkte sind sichtbar","Solo se muestran los productos aprobados","Somente produtos aprovados aparecem","تظهر المنتجات المعتمدة فقط"],
 "Verified payment & delivery": ["決済確認と配信","결제 확인 및 전달","Paiement vérifié et livraison","Verifizierte Zahlung und Lieferung","Pago verificado y entrega","Pagamento verificado e entrega","دفع موثق وتسليم"],
 "Entitled time-limited access": ["購入者限定の期限付きダウンロード","구매자 한정 기간제 다운로드","Accès limité aux acheteurs autorisés","Zeitlich begrenzter Download für Käufer","Descarga temporal para compradores autorizados","Download temporário para compradores autorizados","تنزيل مؤقت للمشترين المخولين"],
 "Seller workspace": ["販売者ワークスペース","판매자 작업 공간","Espace vendeur","Verkäuferbereich","Área del vendedor","Área do vendedor","مساحة عمل البائع"],
 "Apply to sell for free": ["無料で販売者登録","무료 판매자 신청","Devenir vendeur gratuitement","Kostenlos als Verkäufer anmelden","Solicitar venta sin coste","Solicitar venda sem custo","التقديم كبائع مجاناً"],
 "Purchased software": ["購入済みソフトウェア","구매한 소프트웨어","Logiciels achetés","Gekaufte Software","Software comprado","Software adquirido","البرامج المشتراة"],
 "Create a software listing": ["ソフトウェアを登録","소프트웨어 등록","Créer une fiche logicielle","Softwareangebot erstellen","Crear una ficha de software","Criar anúncio de software","إنشاء عرض برنامج"],
 "Seller earnings & payouts": ["売上と出金","판매 수익 및 지급","Revenus et versements","Einnahmen und Auszahlungen","Ingresos y retiros","Receitas e saques","أرباح البائع والسحوبات"],
 "Request payout": ["出金申請","출금 신청","Demander un versement","Auszahlung beantragen","Solicitar retiro","Solicitar saque","طلب سحب"],
 "Submit for review": ["審査を申請","심사 제출","Soumettre à validation","Zur Prüfung einreichen","Enviar a revisión","Enviar para revisão","إرسال للمراجعة"],
});
const index:Record<SasiUiLocale,number>={ja:0,ko:1,fr:2,de:3,es:4,pt:5,ar:6};
export function sasiSoftwareUiText(lang:string,zh:string,en:string):string{
 if(lang==="zh")return zh;
 if(lang==="en")return en;
 const indexOf=index[lang as SasiUiLocale];
 const value=TABLE[en]?.[indexOf];
 return typeof value==="string"&&value.trim()?value:en;
}
export const SASI_SOFTWARE_TRANSLATION_KEYS=Object.freeze(Object.keys(TABLE));
