/** Public SASI language copy. Transaction and security status remains server-authored. */
export type SasiUiLocale="ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
const TABLE:Record<string,readonly string[]> = Object.freeze({
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
 "Seller application saved. Uploads open after approval.": ["販売者申請を保存しました。承認後にアップロードできます。","판매자 신청이 저장되었습니다. 승인 후 업로드할 수 있습니다.","Candidature enregistrée. Envoi autorisé après validation.","Antrag gespeichert. Upload nach Genehmigung möglich.","Solicitud guardada. La carga se habilita tras la aprobación.","Solicitação salva. Envio liberado após aprovação.","تم حفظ طلب البائع. يُسمح بالرفع بعد الموافقة."],
 "Draft saved. You can now upload its package.": ["下書きを保存しました。ファイルをアップロードできます。","초안이 저장되었습니다. 파일을 업로드할 수 있습니다.","Brouillon enregistré. Le fichier peut être envoyé.","Entwurf gespeichert. Paket kann hochgeladen werden.","Borrador guardado. Ya puede subir el archivo.","Rascunho salvo. O arquivo pode ser enviado.","تم حفظ المسودة. يمكن رفع الملف الآن."],
 "Submitted for review; security scanning is in progress.": ["審査申請済み。安全確認中です。","심사 접수 완료. 보안 검사가 진행 중입니다.","Soumis à validation. Analyse de sécurité en cours.","Eingereicht. Sicherheitsprüfung läuft.","Enviado a revisión. Análisis de seguridad en curso.","Enviado para revisão. Verificação de segurança em andamento.","تم الإرسال للمراجعة ويجري الفحص الأمني."],
 "Submitted for review; security scanning is pending.": ["審査申請済み。安全確認待ちです。","심사 접수 완료. 보안 검사 대기 중입니다.","Soumis à validation. Analyse de sécurité en attente.","Eingereicht. Sicherheitsprüfung steht aus.","Enviado a revisión. Análisis de seguridad pendiente.","Enviado para revisão. Verificação de segurança pendente.","تم الإرسال للمراجعة وبانتظار الفحص الأمني."],
 "Product link copied.": ["商品リンクをコピーしました。","상품 링크를 복사했습니다.","Lien du produit copié.","Produktlink kopiert.","Enlace del producto copiado.","Link do produto copiado.","تم نسخ رابط المنتج."],
 "Payout requested. Provider submission and arrival are separately verified.": ["出金申請済み。送金と着金は別々に確認されます。","출금 신청이 접수되었습니다. 송금과 입금은 별도로 확인합니다.","Versement demandé. Envoi et réception sont vérifiés séparément.","Auszahlung beantragt. Versand und Eingang werden getrennt geprüft.","Retiro solicitado. Envío y recepción se verifican por separado.","Saque solicitado. Envio e recebimento são verificados separadamente.","تم طلب السحب. يُتحقق من التحويل والوصول بشكل منفصل."],
 "Close workspace": ["作業エリアを閉じる","작업 공간 닫기","Fermer l’espace","Arbeitsbereich schließen","Cerrar área de trabajo","Fechar área de trabalho","إغلاق مساحة العمل"],
 "Seller profile": ["販売者プロフィール","판매자 정보","Profil vendeur","Verkäuferprofil","Perfil del vendedor","Perfil do vendedor","ملف البائع"],
 "Review status": ["審査状況","심사 상태","Statut de validation","Prüfstatus","Estado de revisión","Status da revisão","حالة المراجعة"],
 "Identity verification": ["本人確認","신원 확인","Vérification d’identité","Identitätsprüfung","Verificación de identidad","Verificação de identidade","التحقق من الهوية"],
 "Verified": ["確認済み","확인됨","Vérifié","Verifiziert","Verificado","Verificado","تم التحقق"],
 "Pending": ["保留中","대기 중","En attente","Ausstehend","Pendiente","Pendente","قيد الانتظار"],
 "Identity and payout verification are required before cash-out.": ["出金には本人確認と受取方法の承認が必要です。","출금 전 신원 및 지급 수단 확인이 필요합니다.","Identité et moyen de paiement doivent être validés avant le retrait.","Identität und Auszahlungsmethode müssen vorab geprüft sein.","Se requiere verificar identidad y cobro antes del retiro.","É necessário verificar identidade e recebimento antes do saque.","يجب التحقق من الهوية ووسيلة استلام المبالغ قبل السحب."],
 "Display name": ["表示名","표시 이름","Nom affiché","Anzeigename","Nombre público","Nome de exibição","اسم العرض"],
 "Developer / studio": ["開発者・スタジオ","개발자 / 스튜디오","Développeur / studio","Entwickler / Studio","Desarrollador / estudio","Desenvolvedor / estúdio","مطور / استوديو"],
 "I am at least 18 years old": ["18歳以上であることを確認します","만 18세 이상임을 확인합니다","Je confirme avoir au moins 18 ans","Ich bestätige, mindestens 18 Jahre alt zu sein","Confirmo tener al menos 18 años","Confirmo ter pelo menos 18 anos","أؤكد أن عمري 18 عاماً أو أكثر"],
 "I accept the SASI seller and settlement terms": ["SASI販売者・精算規約に同意します","SASI 판매자 및 정산 약관에 동의합니다","J’accepte les conditions vendeur et de règlement SASI","Ich akzeptiere die SASI-Verkäufer- und Abrechnungsbedingungen","Acepto los términos de venta y liquidación de SASI","Aceito os termos de venda e liquidação da SASI","أوافق على شروط البائع والتسوية في SASI"],
 "After a completed eligible sale, the seller receives 85% and the platform charges a 15% service fee. Settlement and refund rules follow the seller agreement.": ["対象の売上確定後、販売者は85%、プラットフォーム手数料は15%です。精算と返金は販売者規約に従います。","적격 판매 완료 시 판매자 85%, 플랫폼 수수료 15%입니다. 정산과 환불은 판매자 약관에 따릅니다.","Après une vente éligible finalisée, le vendeur reçoit 85 % et la plateforme facture 15 %. Règlements et remboursements suivent le contrat vendeur.","Nach einem abgeschlossenen berechtigten Verkauf erhält der Verkäufer 85 %, die Plattform 15 %. Abrechnung und Erstattung folgen den Verkäuferbedingungen.","Tras una venta válida completada, el vendedor recibe el 85 % y la plataforma cobra el 15 %. Liquidaciones y reembolsos siguen el acuerdo del vendedor.","Após uma venda elegível concluída, o vendedor recebe 85% e a plataforma cobra 15%. Liquidações e reembolsos seguem o acordo do vendedor.","بعد إتمام عملية بيع مؤهلة يحصل البائع على 85٪ وتأخذ المنصة رسوماً قدرها 15٪. تخضع التسوية والاسترداد لاتفاقية البائع."],
 "Apply as seller": ["販売者登録を申請","판매자 신청","Devenir vendeur","Als Verkäufer bewerben","Solicitar ser vendedor","Solicitar cadastro de vendedor","التقديم كبائع"],
 "Sign-in and verified email are required. No seller deposit.": ["登録にはログインとメール認証が必要です。保証金は不要です。","로그인과 이메일 인증이 필요합니다. 보증금은 없습니다.","Connexion et e-mail vérifié requis. Aucun dépôt vendeur.","Anmeldung und bestätigte E-Mail erforderlich. Keine Kaution.","Se requiere iniciar sesión y verificar el correo. Sin depósito.","É necessário entrar e verificar o e-mail. Sem caução.","يلزم تسجيل الدخول وتأكيد البريد الإلكتروني. لا توجد وديعة."],
 "Sign in": ["ログイン","로그인","Se connecter","Anmelden","Iniciar sesión","Entrar","تسجيل الدخول"],
 "Product name": ["商品名","상품명","Nom du produit","Produktname","Nombre del producto","Nome do produto","اسم المنتج"],
 "Software name, version, license": ["ソフトウェア名・版・ライセンス","소프트웨어명·버전·라이선스","Nom, version, licence du logiciel","Softwarename, Version, Lizenz","Nombre, versión y licencia","Nome, versão e licença","اسم البرنامج والإصدار والترخيص"],
 "Category": ["カテゴリ","카테고리","Catégorie","Kategorie","Categoría","Categoria","الفئة"],
 "Description": ["説明","설명","Description","Beschreibung","Descripción","Descrição","الوصف"],
 "Features, requirements, version and licensing": ["機能・要件・版・ライセンス","기능·요구 사항·버전·라이선스","Fonctions, exigences, version et licence","Funktionen, Anforderungen, Version und Lizenz","Funciones, requisitos, versión y licencia","Recursos, requisitos, versão e licença","الميزات والمتطلبات والإصدار والترخيص"],
 "CNY price": ["人民元価格","위안화 가격","Prix en CNY","Preis in CNY","Precio en CNY","Preço em CNY","السعر باليوان"],
 "USD price": ["米ドル価格","달러 가격","Prix en USD","Preis in USD","Precio en USD","Preço em USD","السعر بالدولار"],
 "Save product draft": ["下書きを保存","상품 초안 저장","Enregistrer le brouillon","Produktentwurf speichern","Guardar borrador","Salvar rascunho","حفظ المسودة"],
 "ZIP packages and product images undergo review; private packages are not served publicly.": ["ZIP と画像は審査されます。非公開ファイルは公開されません。","ZIP 파일과 이미지는 심사를 거칩니다. 비공개 파일은 공개되지 않습니다.","Les ZIP et images sont vérifiés ; les fichiers privés ne sont jamais publics.","ZIP-Pakete und Bilder werden geprüft; private Dateien bleiben geschützt.","Los ZIP y las imágenes pasan revisión; los archivos privados no son públicos.","ZIPs e imagens passam por revisão; arquivos privados não ficam públicos.","تخضع ملفات ZIP والصور للمراجعة وتبقى الملفات الخاصة غير عامة."],
 "My submissions": ["自分の申請","내 제출물","Mes publications","Meine Einreichungen","Mis envíos","Meus envios","طلباتي"],
 "Add cover": ["メイン画像を追加","대표 이미지 추가","Ajouter une couverture","Titelbild hinzufügen","Añadir portada","Adicionar capa","إضافة صورة رئيسية"],
 "Add detail photo": ["詳細画像を追加","상세 이미지 추가","Ajouter une image détaillée","Detailbild hinzufügen","Añadir imagen detallada","Adicionar imagem de detalhes","إضافة صورة تفاصيل"],
 "Upload software ZIP": ["ソフトウェア ZIP を送信","소프트웨어 ZIP 업로드","Envoyer le ZIP du logiciel","Software-ZIP hochladen","Subir ZIP del software","Enviar ZIP do software","رفع ملف ZIP للبرنامج"],
 "CNY available": ["出金可能額（CNY）","출금 가능 금액(CNY)","Disponible en CNY","Verfügbar in CNY","Disponible en CNY","Disponível em CNY","الرصيد المتاح باليوان"],
 "USD available": ["出金可能額（USD）","출금 가능 금액(USD)","Disponible en USD","Verfügbar in USD","Disponible en USD","Disponível em USD","الرصيد المتاح بالدولار"],
 "Withdrawal amount": ["出金額","출금 금액","Montant du retrait","Auszahlungsbetrag","Importe de retiro","Valor do saque","مبلغ السحب"],
 "Payout requests are checked and submitted to the provider; submission does not confirm arrival.": ["出金申請は確認後に送金先へ送られます。申請完了は着金を意味しません。","출금 요청은 확인 후 지급 기관에 전달됩니다. 접수는 입금 완료를 뜻하지 않습니다.","Les demandes sont vérifiées puis transmises au prestataire ; leur envoi ne garantit pas la réception.","Auszahlungen werden geprüft und an den Anbieter übermittelt; das bestätigt keinen Geldeingang.","Las solicitudes se revisan y envían al proveedor; el envío no confirma la recepción.","Os pedidos são verificados e enviados ao provedor; o envio não confirma o recebimento.","تُراجع طلبات السحب وتُرسل إلى المزود ولا يُعد إرسالها إثباتاً لوصول الأموال."],
 "Automated provider payouts are in integration testing and are not open.": ["自動送金は検証中のため現在利用できません。","자동 지급은 검증 중이며 아직 이용할 수 없습니다.","Les virements automatiques sont en validation et ne sont pas ouverts.","Automatische Auszahlungen werden geprüft und sind noch nicht verfügbar.","Los pagos automáticos siguen en pruebas y no están disponibles.","Pagamentos automáticos ainda estão em teste e indisponíveis.","المدفوعات الآلية قيد الاختبار وليست متاحة حالياً."],
 "MT5 indicator": ["MT5 インジケーター","MT5 지표","Indicateur MT5","MT5-Indikator","Indicador MT5","Indicador MT5","مؤشر MT5"],
 "Automation software": ["自動化ソフトウェア","자동화 소프트웨어","Logiciel d’automatisation","Automatisierungssoftware","Software de automatización","Software de automação","برامج الأتمتة"],
 "Desktop application": ["デスクトップアプリ","데스크톱 앱","Application de bureau","Desktop-Anwendung","Aplicación de escritorio","Aplicativo para desktop","تطبيق سطح المكتب"],
 "Developer tools": ["開発ツール","개발 도구","Outils de développement","Entwicklerwerkzeuge","Herramientas para desarrolladores","Ferramentas de desenvolvimento","أدوات المطورين"],
 "Other software": ["その他のソフトウェア","기타 소프트웨어","Autres logiciels","Weitere Software","Otro software","Outros softwares","برامج أخرى"],
 "Draft": ["下書き","초안","Brouillon","Entwurf","Borrador","Rascunho","مسودة"],
 "In review": ["審査中","심사 중","En cours de validation","In Prüfung","En revisión","Em revisão","قيد المراجعة"],
 "Published": ["公開済み","게시됨","Publié","Veröffentlicht","Publicado","Publicado","منشور"],
 "Changes required": ["修正が必要","수정 필요","Modifications nécessaires","Änderungen erforderlich","Se requieren cambios","Alterações necessárias","تعديلات مطلوبة"],
 "Unlisted": ["非公開","비공개","Retiré de la liste","Nicht gelistet","No publicado","Não listado","غير مدرج"],
 "Security check pending": ["安全確認待ち","보안 검사 대기","Analyse de sécurité en attente","Sicherheitsprüfung ausstehend","Análisis de seguridad pendiente","Verificação de segurança pendente","بانتظار الفحص الأمني"],
 "Security checked": ["安全確認完了","보안 검사 완료","Sécurité validée","Sicherheitsprüfung abgeschlossen","Seguridad verificada","Segurança verificada","اكتمل الفحص الأمني"],
 "File risk detected": ["危険なファイルを検出","위험 파일 감지","Fichier à risque détecté","Riskante Datei erkannt","Archivo de riesgo detectado","Arquivo de risco detectado","تم اكتشاف ملف خطر"],
 "Security check failed": ["安全確認に失敗","보안 검사 실패","Échec du contrôle de sécurité","Sicherheitsprüfung fehlgeschlagen","Error de análisis de seguridad","Falha na verificação de segurança","فشل الفحص الأمني"],
});
const PREMIUM_COPY:Record<string,readonly string[]> = Object.freeze({
 "Software Market": [
  "ソフトウェア市場",
  "소프트웨어 마켓",
  "Marché de logiciels",
  "Software-Marktplatz",
  "Mercado de software",
  "Mercado de software",
  "سوق البرمجيات"
 ],
 "Source licenses · Developer publishing · Verified digital delivery": [
  "ソースライセンス・開発者による公開・認証済みデジタル配信",
  "소스 라이선스 · 개발자 등록 · 검증된 디지털 전달",
  "Licences source · Publication des développeurs · Livraison vérifiée",
  "Quellcode-Lizenzen · Entwicklerveröffentlichung · Geprüfte Lieferung",
  "Licencias de código · Publicación de desarrolladores · Entrega verificada",
  "Licenças de código · Publicação de desenvolvedores · Entrega verificada",
  "تراخيص المصدر · نشر المطورين · تسليم رقمي موثق"
 ],
 "Source licensing": [
  "ソースコードのライセンス",
  "소스 코드 라이선스",
  "Licences de code source",
  "Quellcode-Lizenzierung",
  "Licencias de código fuente",
  "Licenciamento de código-fonte",
  "ترخيص الشيفرة المصدرية"
 ],
 "Clear license and ownership": [
  "明確なライセンスと権利",
  "명확한 라이선스와 권리",
  "Licences et droits transparents",
  "Klare Lizenzen und Rechte",
  "Licencias y derechos claros",
  "Licenças e direitos claros",
  "تراخيص وحقوق واضحة"
 ],
 "Digital delivery": [
  "デジタル配信",
  "디지털 전달",
  "Livraison numérique",
  "Digitale Lieferung",
  "Entrega digital",
  "Entrega digital",
  "التسليم الرقمي"
 ],
 "After verified payment": [
  "決済確認後に受け取り",
  "결제 확인 후 수령",
  "Après vérification du paiement",
  "Nach geprüfter Zahlung",
  "Tras verificar el pago",
  "Após a confirmação do pagamento",
  "بعد التحقق من الدفع"
 ],
 "Secure by design": [
  "安心のセキュリティ",
  "안전한 설계",
  "Sécurité intégrée",
  "Sicher konzipiert",
  "Diseñado con seguridad",
  "Segurança desde o início",
  "أمان مدمج في التصميم"
 ],
 "Private R2 storage": [
  "非公開R2ストレージ",
  "비공개 R2 저장소",
  "Stockage privé R2",
  "Privater R2-Speicher",
  "Almacenamiento privado R2",
  "Armazenamento privado R2",
  "تخزين R2 خاص"
 ],
 "Global access": [
  "世界中から利用可能",
  "전 세계에서 이용",
  "Accès mondial",
  "Weltweit verfügbar",
  "Acceso global",
  "Acesso global",
  "وصول عالمي"
 ],
 "Multilingual access": [
  "多言語で利用可能",
  "다국어 이용",
  "Accès multilingue",
  "Mehrsprachiger Zugang",
  "Acceso multilingüe",
  "Acesso multilíngue",
  "وصول متعدد اللغات"
 ],
 "Creator support": [
  "開発者サポート",
  "개발자 지원",
  "Accompagnement des développeurs",
  "Support für Entwickler",
  "Apoyo a desarrolladores",
  "Suporte a desenvolvedores",
  "دعم المطورين"
 ],
 "Publish, review and settle": [
  "公開・審査・精算",
  "등록 · 심사 · 정산",
  "Publication, validation et règlement",
  "Veröffentlichen, prüfen, abrechnen",
  "Publicar, revisar y liquidar",
  "Publicar, revisar e liquidar",
  "نشر ومراجعة وتسوية"
 ],
 "Software quick preview": [
  "ソフトウェアのクイックプレビュー",
  "소프트웨어 미리보기",
  "Aperçu rapide du logiciel",
  "Software-Kurzvorschau",
  "Vista rápida del software",
  "Prévia rápida do software",
  "معاينة سريعة للبرنامج"
 ],
 "View full details": [
  "詳細をすべて表示",
  "전체 상세 보기",
  "Voir la description complète",
  "Alle Details ansehen",
  "Ver toda la información",
  "Ver todos os detalhes",
  "عرض التفاصيل الكاملة"
 ],
 "Name, description, price": [
  "名前・説明・価格",
  "이름 · 설명 · 가격",
  "Nom, description, prix",
  "Name, Beschreibung, Preis",
  "Nombre, descripción y precio",
  "Nome, descrição e preço",
  "الاسم والوصف والسعر"
 ],
 "Upload source ZIP": [
  "ソースZIPをアップロード",
  "소스 ZIP 업로드",
  "Importer le ZIP source",
  "Quellcode-ZIP hochladen",
  "Subir ZIP de código fuente",
  "Enviar ZIP do código-fonte",
  "رفع ملف ZIP للمصدر"
 ],
 "Private ZIP and documentation": [
  "非公開ZIPと説明書",
  "비공개 ZIP 및 문서",
  "ZIP privé et documentation",
  "Privates ZIP und Dokumentation",
  "ZIP privado y documentación",
  "ZIP privado e documentação",
  "ملف ZIP خاص والوثائق"
 ],
 "Review and publish": [
  "審査して公開",
  "심사 후 게시",
  "Valider et publier",
  "Prüfen und veröffentlichen",
  "Revisar y publicar",
  "Revisar e publicar",
  "المراجعة والنشر"
 ],
 "Listed after security review": [
  "安全審査の完了後に公開",
  "보안 심사 후 공개",
  "Visible après contrôle de sécurité",
  "Sichtbar nach Sicherheitsprüfung",
  "Visible tras revisión de seguridad",
  "Visível após análise de segurança",
  "يُعرض بعد الفحص الأمني"
 ],
 "Automatic delivery": [
  "自動配信",
  "자동 전달",
  "Livraison automatique",
  "Automatische Lieferung",
  "Entrega automática",
  "Entrega automática",
  "تسليم تلقائي"
 ],
 "Download after verified payment": [
  "決済確認後に期限付きダウンロード",
  "결제 확인 후 기간 한정 다운로드",
  "Téléchargement temporaire après paiement vérifié",
  "Zeitlich begrenzter Download nach Zahlungsprüfung",
  "Descarga temporal tras pago verificado",
  "Download temporário após pagamento verificado",
  "تنزيل مؤقت بعد التحقق من الدفع"
 ],
 "Full software description (up to 100,000 characters)": [
  "ソフトウェア詳細（最大10万文字）",
  "소프트웨어 전체 설명(최대 100,000자)",
  "Description complète (jusqu’à 100 000 caractères)",
  "Vollständige Beschreibung (bis 100.000 Zeichen)",
  "Descripción completa (hasta 100.000 caracteres)",
  "Descrição completa (até 100.000 caracteres)",
  "الوصف الكامل (حتى 100,000 حرف)"
 ],
 "Explain features, uses, requirements, version and licensing. Paragraph breaks are preserved.": [
  "機能、用途、要件、バージョン、ライセンスを記載。改行は保持されます。",
  "기능, 용도, 요구 사항, 버전, 라이선스를 작성하세요. 줄바꿈은 유지됩니다.",
  "Précisez fonctions, usages, exigences, version et licences. Les paragraphes sont conservés.",
  "Funktionen, Einsatz, Anforderungen, Version und Lizenz angeben. Absätze bleiben erhalten.",
  "Describa funciones, usos, requisitos, versión y licencia. Se conservan los párrafos.",
  "Descreva recursos, usos, requisitos, versão e licença. Os parágrafos são mantidos.",
  "اذكر الميزات والاستخدامات والمتطلبات والإصدار والترخيص. تُحفظ الفقرات."
 ],
 "One main image and up to four optional detail images. Source ZIPs remain private and undergo review.": [
  "メイン画像1枚と任意の詳細画像最大4枚。ソースZIPは非公開で審査されます。",
  "대표 이미지 1장과 선택 상세 이미지 최대 4장. 소스 ZIP은 비공개로 검토합니다.",
  "Une image principale et jusqu’à quatre images facultatives. Les ZIP source restent privés et sont vérifiés.",
  "Ein Titelbild und bis zu vier optionale Detailbilder. Quellcode-ZIPs bleiben privat und werden geprüft.",
  "Una imagen principal y hasta cuatro opcionales. Los ZIP de código siguen privados y se revisan.",
  "Uma imagem principal e até quatro opcionais. Os ZIPs permanecem privados e são revisados.",
  "صورة رئيسية واحدة وحتى أربع صور تفاصيل اختيارية. تظل ملفات المصدر خاصة وتخضع للمراجعة."
 ],
 "Main image (one only)": [
  "メイン画像（1枚）",
  "대표 이미지(1장)",
  "Image principale (une seule)",
  "Titelbild (eins)",
  "Imagen principal (una)",
  "Imagem principal (uma)",
  "الصورة الرئيسية (واحدة)"
 ],
 "Detail image (optional, max 4)": [
  "詳細画像（任意、最大4枚）",
  "상세 이미지(선택, 최대 4장)",
  "Image détaillée (facultative, max. 4)",
  "Detailbild (optional, max. 4)",
  "Imagen de detalle (opcional, máx. 4)",
  "Imagem de detalhes (opcional, máx. 4)",
  "صورة تفاصيل (اختيارية، حتى 4)"
 ],
 "Images": [
  "画像",
  "이미지",
  "Images",
  "Bilder",
  "Imágenes",
  "Imagens",
  "الصور"
 ],
 "main": [
  "メイン",
  "대표",
  "principale",
  "Titelbild",
  "principal",
  "principal",
  "رئيسية"
 ],
 "optional details": [
  "任意の詳細画像",
  "선택 상세 이미지",
  "détails facultatifs",
  "optionale Detailbilder",
  "detalles opcionales",
  "detalhes opcionais",
  "تفاصيل اختيارية"
 ],
 "Main image": [
  "メイン画像",
  "대표 이미지",
  "Image principale",
  "Titelbild",
  "Imagen principal",
  "Imagem principal",
  "الصورة الرئيسية"
 ],
 "Detail image": [
  "詳細画像",
  "상세 이미지",
  "Image détaillée",
  "Detailbild",
  "Imagen de detalle",
  "Imagem de detalhes",
  "صورة التفاصيل"
 ],
 "Remove / replace": [
  "削除・差し替え",
  "삭제 / 교체",
  "Retirer / remplacer",
  "Entfernen / ersetzen",
  "Quitar / sustituir",
  "Remover / substituir",
  "حذف / استبدال"
 ],
 "Package uploaded. Add one main image; up to four detail images are optional.": [
  "ZIPをアップロードしました。メイン画像1枚を追加してください。詳細画像は最大4枚まで任意です。",
  "ZIP 업로드 완료. 대표 이미지 1장을 추가하세요. 상세 이미지는 최대 4장까지 선택입니다.",
  "ZIP importé. Ajoutez une image principale ; quatre images de détail sont facultatives.",
  "ZIP hochgeladen. Ein Titelbild hinzufügen; bis zu vier Detailbilder sind optional.",
  "ZIP subido. Añada una imagen principal; hasta cuatro imágenes adicionales son opcionales.",
  "ZIP enviado. Adicione uma imagem principal; até quatro imagens de detalhes são opcionais.",
  "تم رفع ZIP. أضف صورة رئيسية واحدة، ويمكن إضافة أربع صور تفاصيل اختيارية."
 ],
 "Image awaiting review. One main image; up to four optional detail images.": [
  "画像は審査待ちです。メイン1枚と任意の詳細最大4枚です。",
  "이미지 심사 대기 중. 대표 1장과 선택 상세 최대 4장입니다.",
  "Image en attente de validation. Une principale et jusqu’à quatre facultatives.",
  "Bild wartet auf Prüfung. Ein Titelbild und bis zu vier optionale Detailbilder.",
  "Imagen pendiente de revisión. Una principal y hasta cuatro opcionales.",
  "Imagem aguardando revisão. Uma principal e até quatro opcionais.",
  "الصورة بانتظار المراجعة. صورة رئيسية وأربع تفاصيل اختيارية كحد أقصى."
 ],
 "Image removed. You may now upload another.": [
  "画像を削除しました。新しい画像を追加できます。",
  "이미지가 삭제되었습니다. 새 이미지를 업로드할 수 있습니다.",
  "Image retirée. Vous pouvez en importer une autre.",
  "Bild entfernt. Sie können ein neues hochladen.",
  "Imagen eliminada. Puede subir otra.",
  "Imagem removida. Pode enviar outra.",
  "تم حذف الصورة. يمكن رفع صورة أخرى."
 ],
 "PayPal is currently unavailable.": [
  "現在PayPalをご利用いただけません。",
  "현재 PayPal을 이용할 수 없습니다.",
  "PayPal est actuellement indisponible.",
  "PayPal ist derzeit nicht verfügbar.",
  "PayPal no está disponible en este momento.",
  "PayPal está indisponível no momento.",
  "PayPal غير متاح حالياً."
 ],
 "← Back to SASI Intelligent Software": [
  "← SASIソフトウェアに戻る",
  "← SASI 소프트웨어로 돌아가기",
  "← Retour aux logiciels SASI",
  "← Zurück zu SASI-Software",
  "← Volver a software SASI",
  "← Voltar ao software SASI",
  "← العودة إلى برامج SASI"
 ],
 "Loading software details…": [
  "詳細を読み込み中…",
  "소프트웨어 상세 정보 불러오는 중…",
  "Chargement des détails…",
  "Softwaredetails werden geladen…",
  "Cargando detalles del software…",
  "Carregando detalhes do software…",
  "جارٍ تحميل تفاصيل البرنامج…"
 ],
 "This software is not published yet": [
  "このソフトウェアはまだ公開されていません",
  "이 소프트웨어는 아직 게시되지 않았습니다",
  "Ce logiciel n’est pas encore publié",
  "Diese Software ist noch nicht veröffentlicht",
  "Este software aún no está publicado",
  "Este software ainda não foi publicado",
  "لم يُنشر هذا البرنامج بعد"
 ],
 "Software main image": [
  "ソフトウェアのメイン画像",
  "소프트웨어 대표 이미지",
  "Image principale du logiciel",
  "Software-Titelbild",
  "Imagen principal del software",
  "Imagem principal do software",
  "الصورة الرئيسية للبرنامج"
 ],
 "One main image per listing; detail images are optional": [
  "商品ごとにメイン1枚、詳細画像は任意です",
  "상품당 대표 이미지 1장, 상세 이미지는 선택입니다",
  "Une image principale par produit ; les détails sont facultatifs",
  "Ein Titelbild pro Produkt; Detailbilder sind optional",
  "Una imagen principal por producto; detalles opcionales",
  "Uma imagem principal por produto; detalhes opcionais",
  "صورة رئيسية واحدة لكل منتج؛ صور التفاصيل اختيارية"
 ],
 "Connecting…": [
  "接続中…",
  "연결 중…",
  "Connexion…",
  "Verbinde…",
  "Conectando…",
  "Conectando…",
  "جارٍ الاتصال…"
 ],
 "Pay securely with PayPal": [
  "PayPalで安全に支払う",
  "PayPal로 안전하게 결제",
  "Payer en toute sécurité avec PayPal",
  "Sicher mit PayPal bezahlen",
  "Pagar de forma segura con PayPal",
  "Pagar com segurança via PayPal",
  "الدفع بأمان عبر PayPal"
 ],
 "Buy and receive securely": [
  "安全に購入・受け取り",
  "안전하게 구매 및 수령",
  "Acheter et recevoir en sécurité",
  "Sicher kaufen und erhalten",
  "Comprar y recibir con seguridad",
  "Comprar e receber com segurança",
  "شراء واستلام بأمان"
 ],
 "Checkout opens after merchant verification.": [
  "決済は加盟店審査完了後に利用できます。",
  "판매자 인증 완료 후 결제가 열립니다.",
  "Le paiement sera disponible après validation du marchand.",
  "Bezahlung nach Verifizierung des Händlers verfügbar.",
  "El pago se habilitará tras verificar al comerciante.",
  "O pagamento abre após a verificação do comerciante.",
  "تُفتح المدفوعات بعد التحقق من التاجر."
 ],
 "Link copied": [
  "リンクをコピーしました",
  "링크 복사됨",
  "Lien copié",
  "Link kopiert",
  "Enlace copiado",
  "Link copiado",
  "تم نسخ الرابط"
 ],
 "Share software": [
  "ソフトウェアを共有",
  "소프트웨어 공유",
  "Partager ce logiciel",
  "Software teilen",
  "Compartir software",
  "Compartilhar software",
  "مشاركة البرنامج"
 ],
 "Licensing and delivery": [
  "ライセンスと配信",
  "라이선스 및 전달",
  "Licence et livraison",
  "Lizenz und Lieferung",
  "Licencia y entrega",
  "Licença e entrega",
  "الترخيص والتسليم"
 ],
 "Only reviewed and published software is listed": [
  "審査・公開済みの商品だけ表示されます",
  "검토 후 게시된 소프트웨어만 표시됩니다",
  "Seuls les logiciels validés et publiés sont affichés",
  "Nur geprüfte und veröffentlichte Software wird gelistet",
  "Solo se muestra software revisado y publicado",
  "Somente software revisado e publicado é listado",
  "تُعرض البرامج التي تمت مراجعتها ونشرها فقط"
 ],
 "Downloads require confirmed payment and purchase authorization": [
  "ダウンロードには決済確認と購入者権限が必要です",
  "다운로드에는 결제 확인과 구매 권한이 필요합니다",
  "Le téléchargement exige un paiement confirmé et une autorisation",
  "Downloads erfordern bestätigte Zahlung und Kaufberechtigung",
  "Las descargas requieren pago confirmado y autorización",
  "Downloads exigem pagamento confirmado e autorização",
  "يتطلب التنزيل دفعاً مؤكداً وإذن شراء"
 ],
 "Updates and support follow the listing and order terms": [
  "更新とサポートは商品説明と注文規約に従います",
  "업데이트와 지원은 상품 및 주문 조건에 따릅니다",
  "Mises à jour et assistance selon la fiche produit et la commande",
  "Updates und Support gemäß Produkt- und Bestellbedingungen",
  "Actualizaciones y soporte según el producto y el pedido",
  "Atualizações e suporte conforme os termos do produto e pedido",
  "تخضع التحديثات والدعم لشروط المنتج والطلب"
 ],
 "Software details": [
  "ソフトウェア詳細",
  "소프트웨어 상세 정보",
  "Détails du logiciel",
  "Softwaredetails",
  "Detalles del software",
  "Detalhes do software",
  "تفاصيل البرنامج"
 ],
 "Detail images": [
  "詳細画像",
  "상세 이미지",
  "Images détaillées",
  "Detailbilder",
  "Imágenes detalladas",
  "Imagens de detalhes",
  "صور التفاصيل"
 ],
 "Show less": [
  "折りたたむ",
  "접기",
  "Réduire",
  "Weniger anzeigen",
  "Mostrar menos",
  "Mostrar menos",
  "عرض أقل"
 ],
 "Show more · Full description and images": [
  "もっと見る・説明と画像",
  "더 보기 · 전체 설명 및 이미지",
  "Afficher tout · Description et images",
  "Mehr anzeigen · Beschreibung und Bilder",
  "Mostrar más · Descripción e imágenes",
  "Ver mais · Descrição e imagens",
  "عرض المزيد · الوصف والصور"
 ]
});
const index:Record<SasiUiLocale,number>={ja:0,ko:1,fr:2,de:3,es:4,pt:5,ar:6};
export function sasiSoftwareUiText(lang:string,zh:string,en:string):string{
 if(lang==="zh")return zh;
 if(lang==="en")return en;
 const indexOf=index[lang as SasiUiLocale];
 const value=(PREMIUM_COPY[en]||TABLE[en])?.[indexOf];
 return typeof value==="string"&&value.trim()?value:en;
}
export const SASI_SOFTWARE_TRANSLATION_KEYS=Object.freeze([...Object.keys(TABLE),...Object.keys(PREMIUM_COPY)]);
