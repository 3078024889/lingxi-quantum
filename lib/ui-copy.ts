import type { LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Partial<Record<LingxiLang,string>>;
const C:Record<string,Copy>={
  "请输入有效的邮箱地址":{en:"Please enter a valid email address",ja:"有効なメールアドレスを入力してください。",ko:"유효한 이메일 주소를 입력하세요.",fr:"Veuillez saisir une adresse e-mail valide.",de:"Bitte geben Sie eine gültige E-Mail-Adresse ein.",es:"Introduce una dirección de correo válida.",pt:"Digite um endereço de e-mail válido.",ar:"أدخل عنوان بريد إلكتروني صالحًا."},
  "密码至少 6 位":{en:"Password must be at least 6 characters",ja:"パスワードは6文字以上必要です。",ko:"비밀번호는 6자 이상이어야 합니다.",fr:"Le mot de passe doit comporter au moins 6 caractères.",de:"Das Passwort muss mindestens 6 Zeichen lang sein.",es:"La contraseña debe tener al menos 6 caracteres.",pt:"A senha deve ter pelo menos 6 caracteres.",ar:"يجب ألا تقل كلمة المرور عن 6 أحرف."},
  "场域登录配置正在同步，请稍后再试":{en:"Field login configuration is syncing. Please try again shortly.",ja:"ログイン設定を同期しています。しばらくしてから再試行してください。",ko:"로그인 설정을 동기화 중입니다. 잠시 후 다시 시도하세요.",fr:"La configuration de connexion est en cours de synchronisation. Réessayez bientôt.",de:"Die Anmeldekonfiguration wird synchronisiert. Bitte versuchen Sie es gleich erneut.",es:"La configuración de acceso se está sincronizando. Inténtalo de nuevo en breve.",pt:"A configuração de login está sendo sincronizada. Tente novamente em instantes.",ar:"تجري مزامنة إعدادات تسجيل الدخول. حاول مرة أخرى بعد قليل."},
  "注册失败：":{en:"Sign-up failed: ",ja:"登録に失敗しました：",ko:"가입 실패: ",fr:"Échec de l’inscription : ",de:"Registrierung fehlgeschlagen: ",es:"Error al registrarse: ",pt:"Falha no cadastro: ",ar:"فشل التسجيل: "},
  "注册成功，请用刚才的密码登录。":{en:"Registered — please sign in with the password you just set.",ja:"登録が完了しました。設定したパスワードでログインしてください。",ko:"가입이 완료되었습니다. 방금 설정한 비밀번호로 로그인하세요.",fr:"Inscription réussie — connectez-vous avec le mot de passe que vous venez de définir.",de:"Registrierung erfolgreich — melden Sie sich mit dem gerade festgelegten Passwort an.",es:"Registro completado — inicia sesión con la contraseña que acabas de configurar.",pt:"Cadastro concluído — entre com a senha que acabou de definir.",ar:"تم التسجيل — سجّل الدخول بكلمة المرور التي أنشأتها."},
  "登录失败：":{en:"Sign-in failed: ",ja:"ログインに失敗しました：",ko:"로그인 실패: ",fr:"Échec de la connexion : ",de:"Anmeldung fehlgeschlagen: ",es:"Error al iniciar sesión: ",pt:"Falha no login: ",ar:"فشل تسجيل الدخول: "},
  "登录":{en:"Sign in",ja:"ログイン",ko:"로그인",fr:"Connexion",de:"Anmelden",es:"Iniciar sesión",pt:"Entrar",ar:"تسجيل الدخول"},
  "注册":{en:"Register",ja:"登録",ko:"가입",fr:"S’inscrire",de:"Registrieren",es:"Registrarse",pt:"Cadastrar",ar:"إنشاء حساب"},
  "邮箱":{en:"Email",ja:"メール",ko:"이메일",fr:"E-mail",de:"E-Mail",es:"Correo",pt:"E-mail",ar:"البريد الإلكتروني"},
  "设置密码（至少 6 位）":{en:"Set a password (min. 6 characters)",ja:"パスワードを設定（6文字以上）",ko:"비밀번호 설정(6자 이상)",fr:"Définir un mot de passe (6 caractères min.)",de:"Passwort festlegen (mind. 6 Zeichen)",es:"Configura una contraseña (mín. 6 caracteres)",pt:"Defina uma senha (mín. 6 caracteres)",ar:"أنشئ كلمة مرور (6 أحرف على الأقل)"},
  "密码":{en:"Password",ja:"パスワード",ko:"비밀번호",fr:"Mot de passe",de:"Passwort",es:"Contraseña",pt:"Senha",ar:"كلمة المرور"},
  "处理中…":{en:"Processing…",ja:"処理中…",ko:"처리 중…",fr:"Traitement…",de:"Wird verarbeitet…",es:"Procesando…",pt:"Processando…",ar:"جارٍ المعالجة…"},
  "注册并进入场域":{en:"Register & enter the field",ja:"登録してフィールドへ",ko:"가입하고 필드 입장",fr:"S’inscrire et entrer dans le champ",de:"Registrieren & Feld betreten",es:"Registrarse y entrar al campo",pt:"Cadastrar e entrar no campo",ar:"أنشئ حسابًا وادخل المجال"},
  "进入场域":{en:"Enter the field",ja:"フィールドへ",ko:"필드 입장",fr:"Entrer dans le champ",de:"Das Feld betreten",es:"Entrar en el campo",pt:"Entrar no campo",ar:"الدخول إلى المجال"},
  "首次使用？点上方「注册」创建你的场域账户。":{en:"First time? Choose Register above to create your field account.",ja:"初めてですか？上の「登録」からフィールドアカウントを作成してください。",ko:"처음이신가요? 위의 ‘가입’을 눌러 필드 계정을 만드세요.",fr:"Première visite ? Choisissez « S’inscrire » ci-dessus pour créer votre compte.",de:"Zum ersten Mal hier? Wählen Sie oben „Registrieren“, um Ihr Feldkonto zu erstellen.",es:"¿Primera vez? Elige «Registrarse» arriba para crear tu cuenta.",pt:"Primeira vez? Escolha “Cadastrar” acima para criar sua conta.",ar:"أول مرة؟ اختر «إنشاء حساب» أعلاه لإنشاء حسابك."},
  "已有账户？点上方「登录」。请牢记你的密码。":{en:"Already have an account? Choose Sign in above. Keep your password safe.",ja:"すでにアカウントがありますか？上の「ログイン」を選び、パスワードを安全に保管してください。",ko:"이미 계정이 있나요? 위의 ‘로그인’을 선택하고 비밀번호를 안전하게 보관하세요.",fr:"Vous avez déjà un compte ? Choisissez « Connexion » ci-dessus. Conservez votre mot de passe en sécurité.",de:"Sie haben bereits ein Konto? Wählen Sie oben „Anmelden“. Bewahren Sie Ihr Passwort sicher auf.",es:"¿Ya tienes una cuenta? Elige «Iniciar sesión» arriba. Guarda tu contraseña de forma segura.",pt:"Já tem uma conta? Escolha “Entrar” acima. Guarde sua senha com segurança.",ar:"لديك حساب بالفعل؟ اختر «تسجيل الدخول» أعلاه واحتفظ بكلمة مرورك بأمان."},

  "已取消支付":{en:"Payment canceled",ja:"支払いをキャンセルしました。",ko:"결제가 취소되었습니다.",fr:"Paiement annulé",de:"Zahlung abgebrochen",es:"Pago cancelado",pt:"Pagamento cancelado",ar:"تم إلغاء الدفع"},
  "支付调起失败":{en:"Failed to open WeChat Pay",ja:"WeChat Payを開けませんでした。",ko:"WeChat Pay를 열지 못했습니다.",fr:"Impossible d’ouvrir WeChat Pay",de:"WeChat Pay konnte nicht geöffnet werden",es:"No se pudo abrir WeChat Pay",pt:"Não foi possível abrir o WeChat Pay",ar:"تعذر فتح WeChat Pay"},
  "连接场域时出错，请稍后再试。":{en:"Error connecting to the field — please try again.",ja:"フィールドへの接続でエラーが発生しました。後でもう一度お試しください。",ko:"필드 연결 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.",fr:"Erreur de connexion au champ — réessayez plus tard.",de:"Fehler beim Verbinden mit dem Feld — bitte später erneut versuchen.",es:"Error al conectar con el campo — inténtalo de nuevo.",pt:"Erro ao conectar ao campo — tente novamente.",ar:"حدث خطأ أثناء الاتصال بالمجال — حاول مرة أخرى."},
  "支付宝订单创建失败":{en:"Could not create the Alipay order",ja:"Alipay注文を作成できませんでした。",ko:"Alipay 주문을 생성하지 못했습니다.",fr:"Impossible de créer la commande Alipay",de:"Alipay-Bestellung konnte nicht erstellt werden",es:"No se pudo crear el pedido de Alipay",pt:"Não foi possível criar o pedido do Alipay",ar:"تعذر إنشاء طلب Alipay"},
  "连接支付宝时出错，请稍后再试。":{en:"Could not connect to Alipay — please try again.",ja:"Alipayに接続できませんでした。後でもう一度お試しください。",ko:"Alipay 연결에 실패했습니다. 잠시 후 다시 시도하세요.",fr:"Impossible de se connecter à Alipay — réessayez.",de:"Verbindung zu Alipay fehlgeschlagen — bitte erneut versuchen.",es:"No se pudo conectar con Alipay — inténtalo de nuevo.",pt:"Não foi possível conectar ao Alipay — tente novamente.",ar:"تعذر الاتصال بـ Alipay — حاول مرة أخرى."},
  "微信支付":{en:"WeChat Pay",ja:"WeChat Pay",ko:"WeChat Pay",fr:"WeChat Pay",de:"WeChat Pay",es:"WeChat Pay",pt:"WeChat Pay",ar:"WeChat Pay"},
  "支付宝":{en:"Alipay",ja:"Alipay",ko:"Alipay",fr:"Alipay",de:"Alipay",es:"Alipay",pt:"Alipay",ar:"Alipay"},
  "网页安全收银台":{en:"Secure web checkout",ja:"安全なWeb決済",ko:"안전한 웹 결제",fr:"Paiement web sécurisé",de:"Sicherer Web-Checkout",es:"Pago web seguro",pt:"Checkout web seguro",ar:"دفع آمن عبر الويب"},
  "审核完成后开放":{en:"Pending approval",ja:"審査完了後に利用可能",ko:"승인 후 이용 가능",fr:"En attente d’approbation",de:"Freigabe ausstehend",es:"Pendiente de aprobación",pt:"Aguardando aprovação",ar:"بانتظار الموافقة"},
  "提交支付后生成":{en:"Created on payment",ja:"支払い送信後に生成",ko:"결제 제출 후 생성",fr:"Créé lors du paiement",de:"Wird bei Zahlung erstellt",es:"Se crea al pagar",pt:"Criado no pagamento",ar:"يُنشأ عند الدفع"},
};

export function uiCopy(lang:LingxiLang,zh:string,en?:string){
  if(lang==="zh")return zh;
  const hit=C[zh]?.[lang];
  return hit ?? en ?? C[zh]?.en ?? zh;
}

export function durationCopy(lang:LingxiLang,days:number){
  const unit=(one:string,m:string,y:string,d:string)=>{
    if(days===1)return one;if(days===30)return m;if(days===365)return y;return d.replace("{n}",String(days));
  };
  if(lang==="zh")return unit("1 天","1 个月","1 年","{n} 天");
  if(lang==="ja")return unit("1日","1か月","1年","{n}日");
  if(lang==="ko")return unit("1일","1개월","1년","{n}일");
  if(lang==="fr")return unit("1 jour","1 mois","1 an","{n} jours");
  if(lang==="de")return unit("1 Tag","1 Monat","1 Jahr","{n} Tage");
  if(lang==="es")return unit("1 día","1 mes","1 año","{n} días");
  if(lang==="pt")return unit("1 dia","1 mês","1 ano","{n} dias");
  if(lang==="ar")return unit("يوم واحد","شهر واحد","سنة واحدة","{n} يومًا");
  return unit("1 day","1 month","1 year","{n} days");
}

export function validForCopy(lang:LingxiLang,days:number){
  const d=durationCopy(lang,days);
  const prefix:Record<LingxiLang,string>={
    zh:`有效期：${d}（从支付成功那一刻开始计算）`,
    en:`Valid for: ${d} (starting when payment is confirmed)`,
    ja:`有効期間：${d}（支払い確認時から開始）`,
    ko:`이용 기간: ${d} (결제 확인 시점부터 시작)`,
    fr:`Valable ${d} à partir de la confirmation du paiement`,
    de:`Gültig für ${d}, ab Zahlungsbestätigung`,
    es:`Válido durante ${d} desde la confirmación del pago`,
    pt:`Válido por ${d} a partir da confirmação do pagamento`,
    ar:`صالحة لمدة ${d} بدءًا من تأكيد الدفع`,
  };
  return prefix[lang]??prefix.en;
}
