"use client";
import type { LingxiLang } from "@/lib/lingxi-i18n";

export type TempMailTextKey =
  | "title" | "lead" | "usageHint" | "start" | "generate" | "generating"
  | "freeDaily" | "freeLeft" | "address" | "expires" | "copyEmail" | "copied"
  | "refresh" | "extend" | "destroy" | "inbox" | "autoRefresh" | "waiting"
  | "messages" | "code" | "copyCode" | "batchTitle" | "batchLead" | "working"
  | "generateCount" | "unitPrice" | "copyAll" | "exportCsv" | "myMailboxes"
  | "myMailboxesLead" | "openInbox" | "hasMail" | "waitingShort" | "latest"
  | "restore" | "restoring" | "noActive" | "paidAfterFree" | "refreshAll"
  | "serviceBusy" | "tooMany" | "freeLimit" | "signInRequired"
  | "paidBatchRequired" | "batchAlreadyUsed" | "batchSizeInvalid"
  | "batchCreateFailed" | "createFailed" | "refreshFailed" | "extendFailed"
  | "paymentFailed" | "signInForWorkspace";

type Dict=Record<TempMailTextKey,string>;

const en:Dict={
 title:"Temporary Email",
 lead:"Create a disposable inbox for verification codes, sign-up confirmations and testing. It expires automatically when time runs out.",
 usageHint:"This page is your temporary inbox. Copy the address where you need it; new mail and verification codes appear here automatically.",
 start:"Create a temporary inbox in one click.",
 generate:"Create temporary email", generating:"Creating…",
 freeDaily:"Up to 10 free inboxes per day. Additional batch generation is paid.",
 freeLeft:"{count} free inboxes left today.",
 address:"Temporary email address", expires:"Time left", copyEmail:"Copy email", copied:"Copied",
 refresh:"Refresh", extend:"Add 10 minutes", destroy:"Destroy", inbox:"Inbox", autoRefresh:"Auto refresh",
 waiting:"Waiting for new mail…", messages:"messages", code:"Verification code", copyCode:"Copy code",
 batchTitle:"Batch temporary email", batchLead:"Create 11–100 inboxes in one paid batch. Each address is available in your mailbox workspace.",
 working:"Working…", generateCount:"Create {count} · ¥{price}", unitPrice:"¥0.05 each · billed per batch.",
 copyAll:"Copy all", exportCsv:"Export CSV", myMailboxes:"My temporary mailboxes",
 myMailboxesLead:"Active inboxes stay here until they expire. Sign in and you can come back later—even from another device—to continue receiving mail.",
 openInbox:"Open inbox", hasMail:"{count} messages", waitingShort:"Waiting", latest:"Latest",
 restore:"Restore inbox", restoring:"Restoring…", noActive:"No active temporary inboxes.",
 paidAfterFree:"After today’s 10 free inboxes, continue with paid batch generation.",
 refreshAll:"Refresh all", serviceBusy:"Service is recovering. Please try again shortly.",
 tooMany:"Too many requests. Please try again shortly.",
 freeLimit:"Today’s 10 free inboxes are used. Continue with paid batch generation.",
 signInRequired:"Sign in to use batch generation.", paidBatchRequired:"Complete payment for this batch first.",
 batchAlreadyUsed:"This paid batch has already been generated. Choose a new quantity to continue.",
 batchSizeInvalid:"Create 11–100 inboxes per batch.",
 batchCreateFailed:"Generation did not complete. This paid batch can be retried.",
 createFailed:"Unable to create an inbox right now.", refreshFailed:"Unable to refresh right now.",
 extendFailed:"Unable to extend right now.", paymentFailed:"Unable to open payment right now.",
 signInForWorkspace:"Sign in to keep active inboxes in your account and reopen them later."
};

const zh:Dict={
 title:"临时邮箱", lead:"即时生成可丢弃的收件箱，用来接收验证码、注册确认和测试邮件，到期自动销毁。",
 usageHint:"这个页面就是你的临时收件箱。复制邮箱去使用，新邮件和验证码会自动出现在这里。",
 start:"点击即可生成一个临时收件箱。", generate:"生成临时邮箱", generating:"正在生成…",
 freeDaily:"每天前 10 个免费；超过后可使用付费批量生成。",
 freeLeft:"今日免费还可生成 {count} 个。",
 address:"临时邮箱地址", expires:"剩余时间", copyEmail:"复制邮箱", copied:"已复制",
 refresh:"刷新", extend:"延长 10 分钟", destroy:"销毁", inbox:"收件箱", autoRefresh:"自动刷新",
 waiting:"正在等待新邮件…", messages:"封邮件", code:"验证码", copyCode:"复制验证码",
 batchTitle:"批量临时邮箱", batchLead:"一次生成 11–100 个付费邮箱，生成后全部进入你的临时邮箱工作台。",
 working:"处理中…", generateCount:"生成 {count} 个 · ¥{price}", unitPrice:"¥0.05/个 · 每批单独计费。",
 copyAll:"复制全部", exportCsv:"导出 CSV", myMailboxes:"我的临时邮箱",
 myMailboxesLead:"有效邮箱会一直留在这里直到到期。登录后，即使离开页面或换设备，也能回来继续收件。",
 openInbox:"打开收件箱", hasMail:"{count} 封邮件", waitingShort:"等待邮件", latest:"最新",
 restore:"恢复收件箱", restoring:"正在恢复…", noActive:"当前没有有效的临时邮箱。",
 paidAfterFree:"当天前 10 个免费；第 11 个起进入付费批量生成。",
 refreshAll:"全部刷新", serviceBusy:"服务正在恢复，请稍后再试。",
 tooMany:"操作有点频繁，请稍后再试。",
 freeLimit:"今天的 10 个免费邮箱已经用完；继续使用可选择付费批量生成。",
 signInRequired:"批量生成需要先登录。", paidBatchRequired:"请先完成本次批量生成支付。",
 batchAlreadyUsed:"这次批量已经生成完成，请重新选择数量。",
 batchSizeInvalid:"每次批量可生成 11–100 个邮箱。",
 batchCreateFailed:"生成没有完成，本次支付仍可重试。",
 createFailed:"暂时无法生成，请稍后再试。", refreshFailed:"刷新失败，请稍后再试。",
 extendFailed:"暂时无法延长，请稍后再试。", paymentFailed:"暂时无法打开支付，请稍后再试。",
 signInForWorkspace:"登录后，有效邮箱会保存在你的账户中，离开页面后也能回来继续收件。"
};

const ja:Dict={...en,
 title:"一時メール",lead:"認証コード、登録確認、テスト用メールを受け取る使い捨て受信箱をすぐ作成できます。期限が切れると自動的に破棄されます。",
 usageHint:"このページが一時受信箱です。アドレスをコピーして使うと、新着メールや認証コードが自動的にここへ表示されます。",
 start:"ワンクリックで一時受信箱を作成します。",generate:"一時メールを作成",generating:"作成中…",
 freeDaily:"1日10個まで無料。以降の一括生成は有料です。",freeLeft:"本日の無料枠はあと {count} 個です。",
 address:"一時メールアドレス",expires:"残り時間",copyEmail:"アドレスをコピー",copied:"コピー済み",
 refresh:"更新",extend:"10分延長",destroy:"破棄",inbox:"受信箱",autoRefresh:"自動更新",waiting:"新着メールを待っています…",
 messages:"通",code:"認証コード",copyCode:"コードをコピー",batchTitle:"一括一時メール",
 batchLead:"11〜100個を有料で一括作成し、すべて受信箱ワークスペースで管理できます。",working:"処理中…",
 generateCount:"{count} 個作成 · ¥{price}",unitPrice:"1個 ¥0.05 · バッチごとに課金",copyAll:"すべてコピー",exportCsv:"CSVを書き出す",
 myMailboxes:"マイ一時メール",myMailboxesLead:"有効な受信箱は期限まで保持されます。ログインすると後で別の端末からでも再開できます。",
 openInbox:"受信箱を開く",hasMail:"{count} 通",waitingShort:"待機中",latest:"最新",restore:"受信箱を復元",restoring:"復元中…",
 noActive:"有効な一時受信箱はありません。",paidAfterFree:"本日の無料10個を使い切った後は、有料の一括生成を利用できます。",
 refreshAll:"すべて更新",serviceBusy:"サービスを復旧中です。しばらくしてから再試行してください。",tooMany:"操作が多すぎます。しばらくしてから再試行してください。",
 freeLimit:"本日の無料10個を使い切りました。有料一括生成を利用できます。",signInRequired:"一括生成にはログインが必要です。",
 paidBatchRequired:"先にこのバッチの支払いを完了してください。",batchAlreadyUsed:"この有料バッチは作成済みです。",batchSizeInvalid:"1回に11〜100個作成できます。",
 batchCreateFailed:"作成が完了しませんでした。この有料バッチは再試行できます。",createFailed:"現在は作成できません。",refreshFailed:"更新できませんでした。",
 extendFailed:"延長できませんでした。",paymentFailed:"支払い画面を開けませんでした。",signInForWorkspace:"ログインすると、有効な受信箱をアカウントに保存して後で再開できます。"
};

const ko:Dict={...en,
 title:"임시 이메일",lead:"인증 코드, 가입 확인, 테스트 메일을 받을 일회용 받은편지함을 즉시 만듭니다. 시간이 끝나면 자동 삭제됩니다.",
 usageHint:"이 페이지가 임시 받은편지함입니다. 주소를 복사해 사용하면 새 메일과 인증 코드가 자동으로 여기에 표시됩니다.",
 start:"한 번의 클릭으로 임시 받은편지함을 만드세요.",generate:"임시 이메일 만들기",generating:"생성 중…",
 freeDaily:"하루 10개까지 무료이며 이후 일괄 생성은 유료입니다.",freeLeft:"오늘 무료 받은편지함 {count}개 남음.",
 address:"임시 이메일 주소",expires:"남은 시간",copyEmail:"이메일 복사",copied:"복사됨",refresh:"새로고침",extend:"10분 연장",destroy:"삭제",
 inbox:"받은편지함",autoRefresh:"자동 새로고침",waiting:"새 메일을 기다리는 중…",messages:"개 메일",code:"인증 코드",copyCode:"코드 복사",
 batchTitle:"임시 이메일 일괄 생성",batchLead:"11–100개를 유료로 한 번에 만들고 받은편지함 작업공간에서 관리합니다.",working:"처리 중…",
 generateCount:"{count}개 생성 · ¥{price}",unitPrice:"개당 ¥0.05 · 배치별 결제",copyAll:"모두 복사",exportCsv:"CSV 내보내기",
 myMailboxes:"내 임시 이메일",myMailboxesLead:"유효한 받은편지함은 만료될 때까지 유지됩니다. 로그인하면 나중에 다른 기기에서도 다시 열 수 있습니다.",
 openInbox:"받은편지함 열기",hasMail:"메일 {count}개",waitingShort:"대기 중",latest:"최근",restore:"받은편지함 복원",restoring:"복원 중…",noActive:"활성 임시 받은편지함이 없습니다.",
 paidAfterFree:"오늘 무료 10개 사용 후에는 유료 일괄 생성을 이용하세요.",refreshAll:"모두 새로고침",serviceBusy:"서비스 복구 중입니다. 잠시 후 다시 시도하세요.",
 tooMany:"요청이 너무 많습니다. 잠시 후 다시 시도하세요.",freeLimit:"오늘 무료 10개를 모두 사용했습니다. 유료 일괄 생성을 이용하세요.",
 signInRequired:"일괄 생성은 로그인이 필요합니다.",paidBatchRequired:"먼저 이 배치 결제를 완료하세요.",batchAlreadyUsed:"이 유료 배치는 이미 생성되었습니다.",
 batchSizeInvalid:"배치당 11–100개를 생성할 수 있습니다.",batchCreateFailed:"생성이 완료되지 않았습니다. 이 유료 배치는 다시 시도할 수 있습니다.",
 createFailed:"지금은 받은편지함을 만들 수 없습니다.",refreshFailed:"새로고침에 실패했습니다.",extendFailed:"연장할 수 없습니다.",paymentFailed:"결제를 열 수 없습니다.",
 signInForWorkspace:"로그인하면 활성 받은편지함을 계정에 보관하고 나중에 다시 열 수 있습니다."
};

const fr:Dict={...en,
 title:"E-mail temporaire",lead:"Créez immédiatement une boîte jetable pour recevoir codes de vérification, confirmations d’inscription et e-mails de test. Elle disparaît à l’expiration.",
 usageHint:"Cette page est votre boîte temporaire. Copiez l’adresse et utilisez-la : les nouveaux messages et codes apparaîtront ici automatiquement.",
 start:"Créez une boîte temporaire en un clic.",generate:"Créer un e-mail temporaire",generating:"Création…",freeDaily:"10 boîtes gratuites par jour ; les lots supplémentaires sont payants.",
 freeLeft:"Il reste {count} boîtes gratuites aujourd’hui.",address:"Adresse temporaire",expires:"Temps restant",copyEmail:"Copier l’adresse",copied:"Copié",refresh:"Actualiser",extend:"Ajouter 10 min",destroy:"Détruire",
 inbox:"Boîte de réception",autoRefresh:"Actualisation auto",waiting:"En attente de nouveaux messages…",messages:"messages",code:"Code de vérification",copyCode:"Copier le code",
 batchTitle:"E-mails temporaires en lot",batchLead:"Créez 11 à 100 boîtes payantes en une fois et gérez-les dans votre espace.",working:"Traitement…",
 generateCount:"Créer {count} · ¥{price}",unitPrice:"¥0,05 chacun · facturé par lot",copyAll:"Tout copier",exportCsv:"Exporter CSV",
 myMailboxes:"Mes boîtes temporaires",myMailboxesLead:"Les boîtes actives restent disponibles jusqu’à expiration. Connecté, vous pouvez revenir plus tard, même depuis un autre appareil.",
 openInbox:"Ouvrir",hasMail:"{count} messages",waitingShort:"En attente",latest:"Dernier",restore:"Restaurer",restoring:"Restauration…",noActive:"Aucune boîte temporaire active.",
 paidAfterFree:"Après les 10 gratuites du jour, continuez avec la génération payante en lot.",refreshAll:"Tout actualiser",serviceBusy:"Service en cours de rétablissement. Réessayez bientôt.",
 tooMany:"Trop de requêtes. Réessayez bientôt.",freeLimit:"Les 10 boîtes gratuites du jour sont utilisées. Passez au lot payant.",signInRequired:"Connectez-vous pour la génération en lot.",
 paidBatchRequired:"Terminez d’abord le paiement du lot.",batchAlreadyUsed:"Ce lot payé a déjà été généré.",batchSizeInvalid:"Créez 11 à 100 boîtes par lot.",
 batchCreateFailed:"La génération n’a pas abouti. Vous pouvez réessayer ce lot payé.",createFailed:"Impossible de créer une boîte maintenant.",refreshFailed:"Actualisation impossible.",
 extendFailed:"Impossible de prolonger.",paymentFailed:"Impossible d’ouvrir le paiement.",signInForWorkspace:"Connectez-vous pour garder vos boîtes actives dans votre compte et les rouvrir plus tard."
};

const de:Dict={...en,
 title:"Temporäre E-Mail",lead:"Erstelle sofort ein Wegwerf-Postfach für Bestätigungscodes, Registrierungen und Tests. Nach Ablauf wird es automatisch gelöscht.",
 usageHint:"Diese Seite ist dein temporäres Postfach. Adresse kopieren und verwenden – neue Mails und Codes erscheinen hier automatisch.",
 start:"Temporäres Postfach mit einem Klick erstellen.",generate:"Temporäre E-Mail erstellen",generating:"Wird erstellt…",freeDaily:"Bis zu 10 Postfächer pro Tag kostenlos; weitere Stapel sind kostenpflichtig.",
 freeLeft:"Heute sind noch {count} kostenlose Postfächer verfügbar.",address:"Temporäre E-Mail-Adresse",expires:"Restzeit",copyEmail:"E-Mail kopieren",copied:"Kopiert",refresh:"Aktualisieren",extend:"10 Min. verlängern",destroy:"Löschen",
 inbox:"Posteingang",autoRefresh:"Auto-Aktualisierung",waiting:"Warte auf neue E-Mails…",messages:"Nachrichten",code:"Bestätigungscode",copyCode:"Code kopieren",
 batchTitle:"Temporäre E-Mails im Stapel",batchLead:"11–100 kostenpflichtige Postfächer auf einmal erstellen und im Arbeitsbereich verwalten.",working:"Wird verarbeitet…",
 generateCount:"{count} erstellen · ¥{price}",unitPrice:"¥0,05 pro Adresse · je Stapel",copyAll:"Alle kopieren",exportCsv:"CSV exportieren",
 myMailboxes:"Meine temporären Postfächer",myMailboxesLead:"Aktive Postfächer bleiben bis zum Ablauf erhalten. Angemeldet kannst du später auch von einem anderen Gerät zurückkehren.",
 openInbox:"Posteingang öffnen",hasMail:"{count} Nachrichten",waitingShort:"Wartet",latest:"Neueste",restore:"Postfach wiederherstellen",restoring:"Wiederherstellen…",noActive:"Keine aktiven temporären Postfächer.",
 paidAfterFree:"Nach den 10 kostenlosen Postfächern heute geht es mit kostenpflichtiger Stapelerstellung weiter.",refreshAll:"Alle aktualisieren",serviceBusy:"Dienst wird wiederhergestellt. Bitte gleich erneut versuchen.",
 tooMany:"Zu viele Anfragen. Bitte gleich erneut versuchen.",freeLimit:"Die 10 kostenlosen Postfächer heute sind verbraucht. Nutze die kostenpflichtige Stapelerstellung.",signInRequired:"Für Stapelerstellung anmelden.",
 paidBatchRequired:"Bitte zuerst den Stapel bezahlen.",batchAlreadyUsed:"Dieser bezahlte Stapel wurde bereits erstellt.",batchSizeInvalid:"11–100 Postfächer pro Stapel.",
 batchCreateFailed:"Erstellung nicht abgeschlossen. Der bezahlte Stapel kann erneut versucht werden.",createFailed:"Postfach kann derzeit nicht erstellt werden.",refreshFailed:"Aktualisierung fehlgeschlagen.",
 extendFailed:"Verlängerung fehlgeschlagen.",paymentFailed:"Zahlung kann derzeit nicht geöffnet werden.",signInForWorkspace:"Melde dich an, um aktive Postfächer im Konto zu behalten und später erneut zu öffnen."
};

const es:Dict={...en,
 title:"Correo temporal",lead:"Crea al instante un buzón desechable para códigos, confirmaciones de registro y pruebas. Se destruye automáticamente al vencer.",
 usageHint:"Esta página es tu buzón temporal. Copia la dirección y úsala; los mensajes y códigos aparecerán aquí automáticamente.",
 start:"Crea un buzón temporal con un clic.",generate:"Crear correo temporal",generating:"Creando…",freeDaily:"Hasta 10 buzones gratis al día; los lotes adicionales son de pago.",
 freeLeft:"Quedan {count} buzones gratis hoy.",address:"Dirección temporal",expires:"Tiempo restante",copyEmail:"Copiar correo",copied:"Copiado",refresh:"Actualizar",extend:"Añadir 10 min",destroy:"Destruir",
 inbox:"Bandeja de entrada",autoRefresh:"Actualización automática",waiting:"Esperando mensajes nuevos…",messages:"mensajes",code:"Código de verificación",copyCode:"Copiar código",
 batchTitle:"Correos temporales por lote",batchLead:"Crea 11–100 buzones de pago y gestiónalos desde tu espacio.",working:"Procesando…",
 generateCount:"Crear {count} · ¥{price}",unitPrice:"¥0,05 cada uno · cobro por lote",copyAll:"Copiar todos",exportCsv:"Exportar CSV",
 myMailboxes:"Mis buzones temporales",myMailboxesLead:"Los buzones activos permanecen hasta caducar. Con sesión iniciada puedes volver más tarde, incluso desde otro dispositivo.",
 openInbox:"Abrir buzón",hasMail:"{count} mensajes",waitingShort:"Esperando",latest:"Último",restore:"Restaurar buzón",restoring:"Restaurando…",noActive:"No hay buzones temporales activos.",
 paidAfterFree:"Tras los 10 gratuitos del día, continúa con generación de pago por lote.",refreshAll:"Actualizar todos",serviceBusy:"El servicio se está recuperando. Inténtalo de nuevo en breve.",
 tooMany:"Demasiadas solicitudes. Inténtalo de nuevo en breve.",freeLimit:"Ya usaste los 10 buzones gratis de hoy. Continúa con un lote de pago.",signInRequired:"Inicia sesión para generar lotes.",
 paidBatchRequired:"Completa primero el pago del lote.",batchAlreadyUsed:"Este lote pagado ya fue generado.",batchSizeInvalid:"Crea 11–100 buzones por lote.",
 batchCreateFailed:"La generación no terminó. Puedes reintentar este lote pagado.",createFailed:"No se puede crear un buzón ahora.",refreshFailed:"No se pudo actualizar.",
 extendFailed:"No se pudo ampliar.",paymentFailed:"No se pudo abrir el pago.",signInForWorkspace:"Inicia sesión para guardar los buzones activos en tu cuenta y volver a abrirlos después."
};

const pt:Dict={...en,
 title:"E-mail temporário",lead:"Crie na hora uma caixa descartável para códigos, confirmações de cadastro e testes. Ela é destruída automaticamente ao expirar.",
 usageHint:"Esta página é sua caixa temporária. Copie o endereço e use; novos e-mails e códigos aparecem aqui automaticamente.",
 start:"Crie uma caixa temporária em um clique.",generate:"Criar e-mail temporário",generating:"Criando…",freeDaily:"Até 10 caixas grátis por dia; lotes adicionais são pagos.",
 freeLeft:"Restam {count} caixas grátis hoje.",address:"Endereço temporário",expires:"Tempo restante",copyEmail:"Copiar e-mail",copied:"Copiado",refresh:"Atualizar",extend:"Adicionar 10 min",destroy:"Destruir",
 inbox:"Caixa de entrada",autoRefresh:"Atualização automática",waiting:"Aguardando novos e-mails…",messages:"mensagens",code:"Código de verificação",copyCode:"Copiar código",
 batchTitle:"E-mails temporários em lote",batchLead:"Crie 11–100 caixas pagas de uma vez e gerencie todas no seu espaço.",working:"Processando…",
 generateCount:"Criar {count} · ¥{price}",unitPrice:"¥0,05 cada · cobrança por lote",copyAll:"Copiar tudo",exportCsv:"Exportar CSV",
 myMailboxes:"Minhas caixas temporárias",myMailboxesLead:"As caixas ativas ficam disponíveis até expirar. Logado, você pode voltar depois, inclusive em outro dispositivo.",
 openInbox:"Abrir caixa",hasMail:"{count} mensagens",waitingShort:"Aguardando",latest:"Mais recente",restore:"Restaurar caixa",restoring:"Restaurando…",noActive:"Nenhuma caixa temporária ativa.",
 paidAfterFree:"Depois das 10 grátis do dia, continue com geração paga em lote.",refreshAll:"Atualizar tudo",serviceBusy:"O serviço está se recuperando. Tente novamente em breve.",
 tooMany:"Muitas solicitações. Tente novamente em breve.",freeLimit:"As 10 caixas grátis de hoje foram usadas. Continue com lote pago.",signInRequired:"Entre para usar geração em lote.",
 paidBatchRequired:"Conclua primeiro o pagamento deste lote.",batchAlreadyUsed:"Este lote pago já foi gerado.",batchSizeInvalid:"Crie 11–100 caixas por lote.",
 batchCreateFailed:"A geração não terminou. Você pode tentar novamente este lote pago.",createFailed:"Não foi possível criar uma caixa agora.",refreshFailed:"Falha ao atualizar.",
 extendFailed:"Não foi possível estender.",paymentFailed:"Não foi possível abrir o pagamento.",signInForWorkspace:"Entre para manter as caixas ativas na sua conta e reabri-las depois."
};

const ar:Dict={...en,
 title:"بريد مؤقت",lead:"أنشئ فوراً صندوق بريد مؤقتاً لاستقبال رموز التحقق ورسائل تأكيد التسجيل والاختبار، ويُحذف تلقائياً عند انتهاء المدة.",
 usageHint:"هذه الصفحة هي صندوق بريدك المؤقت. انسخ العنوان واستخدمه، وستظهر الرسائل الجديدة ورموز التحقق هنا تلقائياً.",
 start:"أنشئ صندوق بريد مؤقتاً بنقرة واحدة.",generate:"إنشاء بريد مؤقت",generating:"جارٍ الإنشاء…",freeDaily:"حتى 10 صناديق مجانية يومياً، وما بعدها عبر إنشاء دفعات مدفوعة.",
 freeLeft:"تبقى {count} صناديق مجانية اليوم.",address:"عنوان البريد المؤقت",expires:"الوقت المتبقي",copyEmail:"نسخ البريد",copied:"تم النسخ",refresh:"تحديث",extend:"إضافة 10 دقائق",destroy:"إتلاف",
 inbox:"صندوق الوارد",autoRefresh:"تحديث تلقائي",waiting:"بانتظار رسائل جديدة…",messages:"رسائل",code:"رمز التحقق",copyCode:"نسخ الرمز",
 batchTitle:"بريد مؤقت دفعة واحدة",batchLead:"أنشئ 11–100 صندوقاً مدفوعاً دفعة واحدة وأدرها من مساحة العمل.",working:"جارٍ التنفيذ…",
 generateCount:"إنشاء {count} · ¥{price}",unitPrice:"¥0.05 لكل عنوان · تُحاسب كل دفعة مستقلة",copyAll:"نسخ الكل",exportCsv:"تصدير CSV",
 myMailboxes:"صناديق بريدي المؤقتة",myMailboxesLead:"تبقى الصناديق النشطة حتى انتهاء صلاحيتها. بعد تسجيل الدخول يمكنك العودة إليها لاحقاً حتى من جهاز آخر.",
 openInbox:"فتح الوارد",hasMail:"{count} رسائل",waitingShort:"بانتظار البريد",latest:"الأحدث",restore:"استعادة الصندوق",restoring:"جارٍ الاستعادة…",noActive:"لا توجد صناديق بريد مؤقتة نشطة.",
 paidAfterFree:"بعد استخدام 10 صناديق مجانية اليوم، تابع عبر الإنشاء المدفوع على دفعات.",refreshAll:"تحديث الكل",serviceBusy:"الخدمة قيد الاستعادة. حاول بعد قليل.",
 tooMany:"طلبات كثيرة جداً. حاول بعد قليل.",freeLimit:"استخدمت 10 صناديق مجانية اليوم. تابع عبر الدفعات المدفوعة.",signInRequired:"سجّل الدخول لاستخدام الإنشاء على دفعات.",
 paidBatchRequired:"أكمل دفع هذه الدفعة أولاً.",batchAlreadyUsed:"تم إنشاء هذه الدفعة المدفوعة مسبقاً.",batchSizeInvalid:"يمكن إنشاء 11–100 صندوق في كل دفعة.",
 batchCreateFailed:"لم يكتمل الإنشاء. يمكنك إعادة محاولة هذه الدفعة المدفوعة.",createFailed:"تعذر إنشاء صندوق بريد الآن.",refreshFailed:"تعذر التحديث.",
 extendFailed:"تعذر تمديد المدة.",paymentFailed:"تعذر فتح الدفع.",signInForWorkspace:"سجّل الدخول للاحتفاظ بالصناديق النشطة في حسابك وإعادة فتحها لاحقاً."
};

const map:Record<LingxiLang,Dict>={zh,en,ja,ko,fr,de,es,pt,ar};

export function tempMailText(lang:LingxiLang,key:TempMailTextKey,vars:Record<string,string|number>={}){
 let value=map[lang]?.[key]??en[key];
 for(const [k,v] of Object.entries(vars))value=value.replaceAll(`{${k}}`,String(v));
 return value;
}
