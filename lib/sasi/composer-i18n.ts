import {COMPOSER_ACTION_COPY} from "./composer-action-copy";
import type {LingxiLang} from "@/lib/lingxi-i18n";

export type ComposerKey=
 |"dramaTitle"|"buildTitle"|"dramaSubtitle"|"buildSubtitle"|"loginRequired"|"projectFailed"|"projectIdMissing"
 |"uploading"|"assetReady"|"assetReview"|"assetFailed"|"uploadFailed"|"organizing"|"partialUploadFailed"
 |"contextReadFailed"|"websiteBriefDefault"|"websiteReadyWithService"|"websiteDraftReady"|"websiteDraftDone"
 |"websiteRouteUnavailable"|"rightsRequired"|"ratioUnavailable"|"ratioSaved"|"resolutionUnavailable"|"resolutionSaved"
 |"managedReady"|"providerResolutionMismatch"|"specMismatch"|"byokReady"|"noVideoRoute"|"starting"
 |"websiteStartFailed"|"websiteGenerated"|"taskSubmitted"|"balanceLow"|"videoStartFailed"|"supplierStartFailed"
 |"genericUnavailable"|"progressUnavailable"|"videoChecking"|"videoDone"|"videoFailed"|"queued"|"generating"
 |"supplierNeedsCheck"|"deliveryUnavailable"|"websitePreview"|"downloadWebsite"|"pendingAdd"
 |"promptDrama"|"promptWebsite"|"addAttachment"|"creationSettings"|"resolution"|"ratio"|"duration"
 |"seconds"|"confirm"|"processing"|"rightsConsent"|"dramaFootnote"|"buildFootnote"
 |"readme"
 |"projectRestored"|"transcribeMedia"|"transcribing"|"transcriptSaved"|"transcriptFailed"|"continueSeries"|"assembleClips"|"sendDrama"|"sendWebsite";

type Dict=Record<ComposerKey,string>;
const zh:Dict={
 dramaTitle:"想拍什么，直接告诉 SASI",buildTitle:"想做什么网站，直接告诉 SASI",
 dramaSubtitle:"剧本、参考图、声音或现有素材都可以直接拖进来。先把项目建立好，再选择生成路线。",
 buildSubtitle:"添加需求、品牌资料、图片或文档，生成可预览和下载的静态网站。",
 loginRequired:"请先登录，再开始这个项目。",projectFailed:"项目没有成功建立，请稍后重试。",projectIdMissing:"项目没有返回有效编号。",
 uploading:"正在上传",assetReady:"已加入项目",assetReview:"已上传，等待深度读取",assetFailed:"文件检查未通过",uploadFailed:"上传失败，可以重试",
 organizing:"正在整理项目…",partialUploadFailed:"部分资料还没有上传成功，请重试后再继续。",contextReadFailed:"资料暂时无法读取，请稍后继续。",
 websiteBriefDefault:"根据所附资料制作一个网站起稿",websiteReadyWithService:"项目与资料已经准备好。本次预计 {price}。",
 websiteDraftReady:"网站起稿已准备好，可以继续完善、预览和下载。",websiteDraftDone:"本地网站起稿已完成。",
 websiteRouteUnavailable:"网站项目已保存，但当前生成路线暂时不可用。",rightsRequired:"项目已保存。生成前，请确认相关素材的使用权。",
 ratioUnavailable:"项目和素材已经保存。暂时没有可用的 {value} 生成方式，本次不会收费。",ratioSaved:"项目已保存，可以更换画幅后继续。",
 resolutionUnavailable:"项目和素材已经保存。暂时没有可用的 {value} 生成方式。",resolutionSaved:"项目已保存；请选择当前可用的清晰度后继续。",
 managedReady:"可以开始。完成这一镜 {price}。",providerResolutionMismatch:"项目和素材已经保存。当前可用的最高规格是 {value}。",
 specMismatch:"请选择当前可用的规格后继续。",byokReady:"已经准备好。本次预计 {price}。",
 noVideoRoute:"项目、剧本和素材已经保存。连接我的智能服务后，就可以继续制作视频。",starting:"正在开始…",
 websiteStartFailed:"网站生成没有成功开始。",websiteGenerated:"网站已经生成，可以直接预览并下载。",taskSubmitted:"任务已经提交，请稍后在项目中查看结果。",
 balanceLow:"SASI 余额不足，请先充值。",videoStartFailed:"视频没有成功开始。",supplierStartFailed:"这次生成没有成功开始，请稍后重试。",
 genericUnavailable:"暂时无法继续。",progressUnavailable:"进度暂时无法读取，请稍后到项目中查看。",
 videoChecking:"视频仍在检查中，请稍后到项目中领取。",videoDone:"视频已经完成。",videoFailed:"这次没有交付成功，预留金额会按现有规则释放。",
 queued:"已经排好，正在等待处理…",generating:"正在生成并检查结果…",supplierNeedsCheck:"这次生成需要确认，请稍后回到项目查看。",
 deliveryUnavailable:"视频已生成，暂时无法领取，请稍后到项目中查看。",websitePreview:"网站预览",downloadWebsite:"下载网站文件",pendingAdd:"待加入",
 promptDrama:"描述你想完成的短剧、镜头或故事…",promptWebsite:"描述你想做的网站、品牌、页面或功能…",addAttachment:"添加附件",
 creationSettings:"连接我的智能服务",resolution:"清晰度",ratio:"画幅",duration:"时长",seconds:"秒",confirm:"确认",processing:"处理中",
 rightsConsent:"我拥有相关素材的使用权，并同意按平台要求标注生成内容。",
 dramaFootnote:"",
 buildFootnote:"",
 readme:"灵犀场 SASI 网站交付\n打开 index.html 即可预览。正式发布前请检查链接、文字、图片授权以及收款/登录等真实后端能力。\n",


 projectRestored:"已恢复项目：{value}",transcribeMedia:"提取音视频文字",transcribing:"正在本机识别语音…",transcriptSaved:"文字已加入项目上下文",transcriptFailed:"这段音视频暂时无法转成文字",continueSeries:"连续短剧",assembleClips:"合成成片",sendDrama:"生成视频",sendWebsite:"生成网站"
};
const en:Dict={
 dramaTitle:"Tell SASI what you want to make",buildTitle:"Tell SASI what website you want",
 dramaSubtitle:"Drop in scripts, reference images, audio, or existing media. SASI saves the project first, then chooses a usable creation route.",
 buildSubtitle:"Add a brief, brand materials, images or documents to create a static website you can preview and download.",
 loginRequired:"Sign in before starting this project.",projectFailed:"The project could not be created. Please try again.",projectIdMissing:"The project did not return a valid ID.",
 uploading:"Uploading",assetReady:"Added to project",assetReview:"Uploaded, waiting for deeper reading",assetFailed:"File check failed",uploadFailed:"Upload failed. You can retry.",
 organizing:"Organizing the project…",partialUploadFailed:"Some files are not ready yet. Retry them before continuing.",contextReadFailed:"The project files cannot be read right now.",
 websiteBriefDefault:"Create a website draft from the attached materials",websiteReadyWithService:"Project and materials are ready. Estimated total: {price}.",
 websiteDraftReady:"A website draft is ready to preview and download. Connect a creation service to keep refining it.",websiteDraftDone:"Local website draft completed.",
 websiteRouteUnavailable:"The website project is saved, but no generation route is currently available.",rightsRequired:"Project saved. Confirm you have the right to use the attached materials before generation.",
 ratioUnavailable:"Project and assets are saved. No verified {value} route is available, so you will not be charged.",ratioSaved:"Project saved. Choose another aspect ratio or connect a service that supports it.",
 resolutionUnavailable:"Project and assets are saved. No verified {value} route is available yet.",resolutionSaved:"Project saved. Choose a verified resolution or wait until a higher tier passes validation.",
 managedReady:"Ready to start. Complete this shot for {price}.",providerResolutionMismatch:"Project and assets are saved. Your connected service currently supports up to {value}.",
 specMismatch:"SASI will not substitute a different specification.",byokReady:"Your creation service is connected. Estimated total: {price}.",
 noVideoRoute:"Project, script, and assets are saved. Connect an available creation service to continue producing the video.",starting:"Starting…",
 websiteStartFailed:"Website generation did not start.",websiteGenerated:"The website is ready to preview and download.",taskSubmitted:"Task submitted. You can return to the project later.",
 balanceLow:"Your SASI balance is too low. Please top up first.",videoStartFailed:"Video generation did not start.",supplierStartFailed:"This generation did not start. Please try again.",
 genericUnavailable:"Unable to continue right now.",progressUnavailable:"Progress cannot be read right now. Check the project again later.",
 videoChecking:"The video is still being checked. Return to the project shortly.",videoDone:"Video completed.",videoFailed:"This attempt was not delivered. Reserved funds will be released under the current settlement rules.",
 queued:"Queued and waiting to run…",generating:"Generating and checking the result…",supplierNeedsCheck:"This task needs verification. Check the connected service usage history.",
 deliveryUnavailable:"The video finished, but the delivery link is not ready yet.",websitePreview:"Website preview",downloadWebsite:"Download website files",pendingAdd:"Pending",
 promptDrama:"Describe the drama, shot, story, or ad you want to make…",promptWebsite:"Describe the website, brand, page, or feature you want…",addAttachment:"Add attachment",
 creationSettings:"Connect my intelligence service",resolution:"Resolution",ratio:"Aspect ratio",duration:"Duration",seconds:"sec",confirm:"Confirm",processing:"Working",
 rightsConsent:"I have the right to use these materials and agree to required generated-content labeling.",
 dramaFootnote:"",
 buildFootnote:"",
 readme:"LINGXIFIELD SASI website delivery\nOpen index.html to preview. Before publishing, verify links, copy, image rights, and any real backend for payments or sign-in.\n",


 projectRestored:"Project restored: {value}",transcribeMedia:"Transcribe media",transcribing:"Transcribing locally…",transcriptSaved:"Transcript added to project context",transcriptFailed:"This media could not be transcribed",continueSeries:"Multi-episode",assembleClips:"Assemble film",sendDrama:"Generate video",sendWebsite:"Generate website"
};
const ja:Dict={...en,
 dramaTitle:"作りたい映像を SASI にそのまま伝える",buildTitle:"作りたいサイトを SASI にそのまま伝える",
 dramaSubtitle:"脚本、参考画像、音声、既存素材をそのまま追加できます。まずプロジェクトを保存し、その後利用可能な制作ルートを選びます。",
 buildSubtitle:"要件、ブランド資料、画像、文書を追加し、プレビュー・ダウンロードできる静的サイトを作れます。",
 loginRequired:"先にログインしてください。",projectFailed:"プロジェクトを作成できませんでした。もう一度お試しください。",
 uploading:"アップロード中",assetReady:"プロジェクトに追加済み",assetReview:"アップロード済み・読み取り待ち",assetFailed:"ファイル確認に失敗",uploadFailed:"アップロードに失敗しました。再試行できます。",
 organizing:"プロジェクトを整理しています…",partialUploadFailed:"一部の資料がまだ準備できていません。再試行してから続けてください。",
 creationSettings:"自分のスマートサービスを接続",resolution:"解像度",ratio:"画面比率",duration:"長さ",seconds:"秒",confirm:"確認",processing:"処理中",
 addAttachment:"添付を追加",promptDrama:"作りたい短編ドラマ、ショット、物語を入力…",promptWebsite:"作りたいサイト、ブランド、ページ、機能を入力…",
 rightsConsent:"素材の利用権を保有し、必要な生成コンテンツ表示に同意します。",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"プロジェクトを復元しました：{value}",transcribeMedia:"音声・動画を文字にする",transcribing:"端末内で音声認識中…",transcriptSaved:"文字をプロジェクトに追加しました",transcriptFailed:"このメディアを文字にできませんでした",continueSeries:"連続ドラマ",assembleClips:"動画を結合",sendDrama:"動画を生成",sendWebsite:"サイトを生成"
};
const ko:Dict={...en,
 dramaTitle:"만들고 싶은 영상을 SASI에게 바로 말하세요",buildTitle:"만들고 싶은 웹사이트를 SASI에게 바로 말하세요",
 dramaSubtitle:"대본, 참고 이미지, 음성, 기존 자료를 바로 넣을 수 있습니다. 먼저 프로젝트를 저장한 뒤 사용 가능한 제작 경로를 선택합니다.",
 buildSubtitle:"요구사항, 브랜드 자료, 이미지나 문서를 추가해 미리 보고 다운로드할 정적 웹사이트를 만드세요.",
 loginRequired:"먼저 로그인하세요.",projectFailed:"프로젝트를 만들지 못했습니다. 다시 시도하세요.",
 uploading:"업로드 중",assetReady:"프로젝트에 추가됨",assetReview:"업로드 완료 · 추가 읽기 대기",assetFailed:"파일 확인 실패",uploadFailed:"업로드 실패. 다시 시도할 수 있습니다.",
 organizing:"프로젝트를 정리하는 중…",partialUploadFailed:"일부 자료가 아직 준비되지 않았습니다. 다시 시도한 뒤 계속하세요.",
 creationSettings:"내 지능형 서비스 연결",resolution:"해상도",ratio:"화면 비율",duration:"길이",seconds:"초",confirm:"확인",processing:"처리 중",
 addAttachment:"첨부 추가",promptDrama:"만들고 싶은 숏드라마, 장면, 이야기를 설명하세요…",promptWebsite:"만들고 싶은 웹사이트, 브랜드, 페이지, 기능을 설명하세요…",
 rightsConsent:"이 자료의 사용 권한을 보유하고 있으며 필요한 생성 콘텐츠 표시에 동의합니다.",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"프로젝트 복원됨: {value}",transcribeMedia:"오디오/영상 텍스트 추출",transcribing:"기기에서 음성 인식 중…",transcriptSaved:"텍스트를 프로젝트에 추가했습니다",transcriptFailed:"이 미디어를 텍스트로 변환하지 못했습니다",continueSeries:"연속 숏드라마",assembleClips:"영상 합치기",sendDrama:"영상 생성",sendWebsite:"웹사이트 생성"
};
const fr:Dict={...en,
 dramaTitle:"Dites simplement à SASI ce que vous voulez filmer",buildTitle:"Dites simplement à SASI quel site vous voulez",
 dramaSubtitle:"Déposez scénario, images de référence, audio ou médias existants. SASI enregistre d’abord le projet puis choisit une voie de création disponible.",
 buildSubtitle:"Ajoutez vos besoins, contenus de marque, images ou documents pour créer un site statique à prévisualiser et télécharger.",
 loginRequired:"Connectez-vous avant de commencer.",projectFailed:"Le projet n’a pas pu être créé. Réessayez.",
 uploading:"Téléversement",assetReady:"Ajouté au projet",assetReview:"Téléversé, lecture approfondie en attente",assetFailed:"Échec du contrôle du fichier",uploadFailed:"Échec du téléversement. Vous pouvez réessayer.",
 organizing:"Organisation du projet…",partialUploadFailed:"Certains fichiers ne sont pas prêts. Réessayez avant de continuer.",
 creationSettings:"Connecter mon service intelligent",resolution:"Résolution",ratio:"Format",duration:"Durée",seconds:"s",confirm:"Confirmer",processing:"Traitement",
 addAttachment:"Ajouter une pièce jointe",promptDrama:"Décrivez le drama, le plan, l’histoire ou la publicité à créer…",promptWebsite:"Décrivez le site, la marque, la page ou la fonction à créer…",
 rightsConsent:"Je possède les droits d’utilisation de ces éléments et j’accepte le marquage requis des contenus générés.",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"Projet restauré : {value}",transcribeMedia:"Transcrire le média",transcribing:"Transcription locale…",transcriptSaved:"Transcription ajoutée au projet",transcriptFailed:"Impossible de transcrire ce média",continueSeries:"Série multi-épisodes",assembleClips:"Assembler le film",sendDrama:"Générer la vidéo",sendWebsite:"Générer le site"
};
const de:Dict={...en,
 dramaTitle:"Sag SASI direkt, welches Video du erstellen willst",buildTitle:"Sag SASI direkt, welche Website du erstellen willst",
 dramaSubtitle:"Ziehe Skripte, Referenzbilder, Audio oder vorhandenes Material hinein. SASI speichert zuerst das Projekt und wählt dann einen verfügbaren Erstellungsweg.",
 buildSubtitle:"Anforderungen, Markenmaterial, Bilder oder Dokumente hinzufügen und eine statische Website zur Vorschau und zum Download erstellen.",
 loginRequired:"Bitte zuerst anmelden.",projectFailed:"Das Projekt konnte nicht erstellt werden. Bitte erneut versuchen.",
 uploading:"Wird hochgeladen",assetReady:"Zum Projekt hinzugefügt",assetReview:"Hochgeladen, vertiefte Prüfung ausstehend",assetFailed:"Dateiprüfung fehlgeschlagen",uploadFailed:"Upload fehlgeschlagen. Erneut versuchen.",
 organizing:"Projekt wird vorbereitet…",partialUploadFailed:"Einige Dateien sind noch nicht bereit. Bitte erneut versuchen.",
 creationSettings:"Meinen intelligenten Dienst verbinden",resolution:"Auflösung",ratio:"Seitenverhältnis",duration:"Dauer",seconds:"Sek.",confirm:"Bestätigen",processing:"Verarbeitung",
 addAttachment:"Anhang hinzufügen",promptDrama:"Beschreibe Drama, Szene, Geschichte oder Werbung…",promptWebsite:"Beschreibe Website, Marke, Seite oder Funktion…",
 rightsConsent:"Ich besitze die Nutzungsrechte an diesen Materialien und stimme der erforderlichen Kennzeichnung generierter Inhalte zu.",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"Projekt wiederhergestellt: {value}",transcribeMedia:"Audio/Video transkribieren",transcribing:"Lokale Transkription läuft…",transcriptSaved:"Transkript zum Projekt hinzugefügt",transcriptFailed:"Dieses Medium konnte nicht transkribiert werden",continueSeries:"Mehrteilige Serie",assembleClips:"Film zusammensetzen",sendDrama:"Video generieren",sendWebsite:"Website generieren"
};
const es:Dict={...en,
 dramaTitle:"Dile a SASI qué quieres crear",buildTitle:"Dile a SASI qué sitio quieres crear",
 dramaSubtitle:"Arrastra guiones, imágenes de referencia, audio o material existente. SASI guarda primero el proyecto y luego elige una ruta de creación disponible.",
 buildSubtitle:"Añade tus requisitos, materiales de marca, imágenes o documentos para crear un sitio estático que puedas previsualizar y descargar.",
 loginRequired:"Inicia sesión antes de empezar.",projectFailed:"No se pudo crear el proyecto. Inténtalo de nuevo.",
 uploading:"Subiendo",assetReady:"Añadido al proyecto",assetReview:"Subido, pendiente de lectura profunda",assetFailed:"Falló la revisión del archivo",uploadFailed:"Falló la subida. Puedes reintentar.",
 organizing:"Organizando el proyecto…",partialUploadFailed:"Algunos archivos aún no están listos. Reintenta antes de continuar.",
 creationSettings:"Conectar mi servicio inteligente",resolution:"Resolución",ratio:"Relación de aspecto",duration:"Duración",seconds:"s",confirm:"Confirmar",processing:"Procesando",
 addAttachment:"Añadir archivo",promptDrama:"Describe el drama, plano, historia o anuncio que quieres crear…",promptWebsite:"Describe el sitio, marca, página o función que quieres crear…",
 rightsConsent:"Tengo derecho a usar estos materiales y acepto el etiquetado requerido del contenido generado.",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"Proyecto restaurado: {value}",transcribeMedia:"Transcribir audio/vídeo",transcribing:"Transcribiendo en el dispositivo…",transcriptSaved:"Transcripción añadida al proyecto",transcriptFailed:"No se pudo transcribir este archivo",continueSeries:"Serie de varios episodios",assembleClips:"Montar vídeo",sendDrama:"Generar vídeo",sendWebsite:"Generar sitio"
};
const pt:Dict={...en,
 dramaTitle:"Diga ao SASI o que você quer criar",buildTitle:"Diga ao SASI qual site você quer criar",
 dramaSubtitle:"Arraste roteiros, imagens de referência, áudio ou material existente. O SASI salva primeiro o projeto e depois escolhe uma rota de criação disponível.",
 buildSubtitle:"Adicione requisitos, materiais da marca, imagens ou documentos para criar um site estático que possa visualizar e baixar.",
 loginRequired:"Entre na sua conta antes de começar.",projectFailed:"Não foi possível criar o projeto. Tente novamente.",
 uploading:"Enviando",assetReady:"Adicionado ao projeto",assetReview:"Enviado, aguardando leitura aprofundada",assetFailed:"Falha na verificação do arquivo",uploadFailed:"Falha no envio. Você pode tentar novamente.",
 organizing:"Organizando o projeto…",partialUploadFailed:"Alguns arquivos ainda não estão prontos. Tente novamente antes de continuar.",
 creationSettings:"Conectar meu serviço inteligente",resolution:"Resolução",ratio:"Proporção",duration:"Duração",seconds:"s",confirm:"Confirmar",processing:"Processando",
 addAttachment:"Adicionar anexo",promptDrama:"Descreva o drama, cena, história ou anúncio que deseja criar…",promptWebsite:"Descreva o site, marca, página ou recurso que deseja criar…",
 rightsConsent:"Tenho direito de usar estes materiais e concordo com a rotulagem exigida para conteúdo gerado.",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"Projeto restaurado: {value}",transcribeMedia:"Transcrever áudio/vídeo",transcribing:"Transcrevendo no dispositivo…",transcriptSaved:"Transcrição adicionada ao projeto",transcriptFailed:"Não foi possível transcrever esta mídia",continueSeries:"Série com vários episódios",assembleClips:"Montar vídeo",sendDrama:"Gerar vídeo",sendWebsite:"Gerar site"
};
const ar:Dict={...en,
 dramaTitle:"أخبر SASI مباشرة بما تريد إنشاءه",buildTitle:"أخبر SASI مباشرة بالموقع الذي تريد إنشاءه",
 dramaSubtitle:"اسحب النصوص والصور المرجعية والصوت أو المواد الموجودة. يحفظ SASI المشروع أولًا ثم يختار مسار إنشاء متاحًا.",
 buildSubtitle:"أضف المتطلبات ومواد العلامة والصور أو المستندات لإنشاء موقع ثابت يمكنك معاينته وتنزيله.",
 loginRequired:"سجّل الدخول قبل بدء المشروع.",projectFailed:"تعذر إنشاء المشروع. حاول مرة أخرى.",
 uploading:"جارٍ الرفع",assetReady:"تمت الإضافة إلى المشروع",assetReview:"تم الرفع وبانتظار قراءة أعمق",assetFailed:"فشل فحص الملف",uploadFailed:"فشل الرفع. يمكنك إعادة المحاولة.",
 organizing:"جارٍ تنظيم المشروع…",partialUploadFailed:"بعض الملفات غير جاهزة بعد. أعد المحاولة قبل المتابعة.",
 creationSettings:"ربط خدمتي الذكية",resolution:"الدقة",ratio:"نسبة العرض",duration:"المدة",seconds:"ث",confirm:"تأكيد",processing:"جارٍ المعالجة",
 addAttachment:"إضافة مرفق",promptDrama:"صف الدراما أو اللقطة أو القصة أو الإعلان الذي تريد إنشاءه…",promptWebsite:"صف الموقع أو العلامة أو الصفحة أو الميزة التي تريد إنشاءها…",
 rightsConsent:"أملك حق استخدام هذه المواد وأوافق على وسم المحتوى المُنشأ كما هو مطلوب.",
 dramaFootnote:"",
 buildFootnote:"",
 projectRestored:"تمت استعادة المشروع: {value}",transcribeMedia:"تحويل الصوت/الفيديو إلى نص",transcribing:"جارٍ التعرف على الكلام محليًا…",transcriptSaved:"تمت إضافة النص إلى المشروع",transcriptFailed:"تعذر تحويل هذا الملف إلى نص",continueSeries:"سلسلة متعددة الحلقات",assembleClips:"تجميع الفيديو",sendDrama:"إنشاء فيديو",sendWebsite:"إنشاء موقع"
};

const D:Record<LingxiLang,Dict>={zh,en,ja,ko,fr,de,es,pt,ar};
export function composerText(lang:LingxiLang,key:ComposerKey,vars?:Record<string,string|number>){
 let out=COMPOSER_ACTION_COPY[key]?.[lang]??(D[lang]??en)[key]??en[key]??zh[key];
 for(const[k,v]of Object.entries(vars??{}))out=out.replaceAll(`{${k}}`,String(v));
 return out;
}
