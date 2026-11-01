import type {Language} from './v2';

/**
 * Codex is the OpenAI software-engineering agent, not a chat model or an
 * API token bundle. The publisher's current account entitlements control use.
 * Keep citations and product distinctions here rather than in consumer UI.
 */
export const CODEX_OFFICIAL={
 product:'https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan',
 workflows:'https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex',
 cloud:'https://help.openai.com/en/articles/20001545-using-codex-cloud',
 review:'https://help.openai.com/en/articles/20001552-review-pull-requests-with-codex',
 direct:'https://chatgpt.com/codex'
} as const;

type CodexCopy={
 title:string;intro:string;tasks:readonly [string,string,string,string,string,string];
 waysTitle:string;ways:string;planTitle:string;plan:string;limitTitle:string;limit:string;
 linkLabel:string;guideLabel:string
};
export const CODEX_COPY:Readonly<Record<Language,CodexCopy>>={
 zh:{
 title:'Codex · AI 编程代理',
 intro:'从读取整个代码库到交付新功能：分析源码、开发网站和应用、修复 BUG、执行测试、检查代码安全并提交可审核的改动。',
 tasks:['理解 GitHub 仓库与项目结构','编写网页、应用、API 和自动化程序','排查错误、重构代码与修复 BUG','执行命令、单元测试与构建检查','审查代码变更与 GitHub PR','使用本地终端、IDE 或云端任务'],
 waysTitle:'使用入口',ways:'桌面端、命令行（CLI）、IDE 插件；符合套餐条件时可使用云端任务。',
 planTitle:'套餐与费用',plan:'可使用 ChatGPT 账户对应的 Codex 权益；免费及付费套餐用量不同。使用独立 API Key 时按 API 价格收费，不与 ChatGPT Plus 订阅混算。',
 limitTitle:'云端与额度',limit:'云端功能仅面向符合资格的套餐或工作区；任务复杂度、模型与运行方式影响可用额度。',
 linkLabel:'使用 Codex',guideLabel:'Codex 官方使用说明'
 },
 en:{title:'Codex · AI coding agent',intro:'Read repositories, build apps and APIs, fix bugs, run tests, review code and prepare pull requests.',tasks:['Explore repositories and architecture','Build sites, apps, APIs and automations','Debug and refactor code','Run commands, builds and tests','Review changes and pull requests','Use desktop, CLI, IDE or eligible cloud tasks'],waysTitle:'Where to use',ways:'Desktop, CLI and IDE; cloud tasks for eligible accounts.',planTitle:'Plans and billing',plan:'Uses the Codex allowance included with eligible ChatGPT accounts. Free and paid limits differ. Your own API key is billed separately at API rates.',limitTitle:'Cloud and limits',limit:'Cloud access depends on plan or workspace eligibility; task complexity, model and environment affect usage.',linkLabel:'Open Codex',guideLabel:'Official Codex guide'},
 ja:{title:'Codex · AI開発エージェント',intro:'コード全体を理解し、サイト・API開発、バグ修正、テスト、PRレビューまで支援。',tasks:['リポジトリと構成を把握','サイト・API・アプリ開発','バグ修正とリファクタリング','コマンドとテストの実行','変更・PRのレビュー','デスクトップ・CLI・IDE・対象クラウド'],waysTitle:'利用方法',ways:'デスクトップ、CLI、IDE。対象プランではクラウド作業も利用可能。',planTitle:'プランと費用',plan:'ChatGPTアカウントのCodex利用枠を使用。プラン別の上限があり、独自APIキーは別料金。',limitTitle:'クラウドと利用上限',limit:'クラウドは対象プラン・組織で利用可能。タスクやモデルによって消費量が変わります。',linkLabel:'Codexを開く',guideLabel:'公式ガイド'},
 ko:{title:'Codex · AI 코딩 에이전트',intro:'코드베이스 분석, 웹·API 개발, 버그 수정, 테스트 실행, PR 검토까지 지원합니다.',tasks:['저장소 구조 분석','웹·앱·API 개발','버그 수정과 리팩터링','명령어·빌드·테스트 실행','변경사항과 PR 검토','데스크톱·CLI·IDE·지원 클라우드'],waysTitle:'사용 방법',ways:'데스크톱, CLI, IDE 및 적격 계정의 클라우드 작업.',planTitle:'요금제 및 과금',plan:'ChatGPT 계정의 Codex 사용 한도를 이용합니다. 독립 API 키는 별도로 청구됩니다.',limitTitle:'클라우드 및 한도',limit:'클라우드 이용은 계정과 조직에 따라 다르며 모델과 작업의 복잡도에 따라 사용량이 달라집니다.',linkLabel:'Codex 열기',guideLabel:'공식 사용 안내'},
 fr:{title:'Codex · Agent de programmation IA',intro:'Analyse de dépôts, création de sites et API, correction de bugs, tests et revue de pull requests.',tasks:['Explorer dépôts et architecture','Créer sites, apps et API','Déboguer et refactoriser','Exécuter commandes et tests','Relire changements et PR','Desktop, CLI, IDE et cloud admissible'],waysTitle:'Accès',ways:'Desktop, terminal et IDE; tâches cloud selon éligibilité.',planTitle:'Offres et tarifs',plan:'Utilise le quota Codex de votre compte ChatGPT; les limites varient selon l’offre. Une clé API personnelle est facturée séparément.',limitTitle:'Cloud et quotas',limit:'Accès cloud selon forfait et espace de travail; la complexité et le modèle affectent l’usage.',linkLabel:'Ouvrir Codex',guideLabel:'Guide officiel'},
 de:{title:'Codex · KI-Programmieragent',intro:'Repositories verstehen, Web-Apps und APIs erstellen, Fehler beheben, Tests ausführen und PRs prüfen.',tasks:['Repos und Architektur prüfen','Webseiten, Apps und APIs bauen','Bugs finden und Code überarbeiten','Befehle, Builds und Tests ausführen','Änderungen und PRs prüfen','Desktop, CLI, IDE und ggf. Cloud'],waysTitle:'Zugang',ways:'Desktop, CLI und IDE; Cloud-Aufgaben bei berechtigten Konten.',planTitle:'Tarife',plan:'Nutzt das im ChatGPT-Konto verfügbare Codex-Kontingent. Eigene API-Schlüssel werden gesondert berechnet.',limitTitle:'Cloud und Limits',limit:'Cloud-Nutzung hängt von Tarif und Workspace ab; Aufwand und Modell beeinflussen den Verbrauch.',linkLabel:'Codex öffnen',guideLabel:'Offizielle Anleitung'},
 es:{title:'Codex · Agente de programación IA',intro:'Analiza repositorios, crea sitios y API, corrige errores, ejecuta pruebas y revisa solicitudes de cambios.',tasks:['Entender repositorios y arquitectura','Crear sitios, apps y API','Depurar y refactorizar','Ejecutar comandos y pruebas','Revisar cambios y PR','Escritorio, CLI, IDE y nube elegible'],waysTitle:'Acceso',ways:'Escritorio, CLI e IDE; tareas en nube según el plan.',planTitle:'Planes y precios',plan:'Utiliza la cuota de Codex de tu cuenta ChatGPT. La clave API propia se factura aparte.',limitTitle:'Nube y límites',limit:'El acceso depende del plan o equipo; complejidad y modelo afectan el consumo.',linkLabel:'Abrir Codex',guideLabel:'Guía oficial'},
 pt:{title:'Codex · Agente de programação IA',intro:'Analisa repositórios, cria sites e APIs, corrige bugs, executa testes e revisa alterações e PRs.',tasks:['Entender repositórios e arquitetura','Criar sites, apps e APIs','Corrigir bugs e refatorar','Executar comandos e testes','Revisar alterações e PRs','Desktop, CLI, IDE e nuvem elegível'],waysTitle:'Como usar',ways:'Desktop, CLI e IDE; tarefas em nuvem conforme elegibilidade.',planTitle:'Planos e valores',plan:'Usa a franquia Codex da conta ChatGPT. Sua própria chave de API é cobrada separadamente.',limitTitle:'Nuvem e limites',limit:'Acesso à nuvem depende do plano; modelo e complexidade afetam o consumo.',linkLabel:'Abrir Codex',guideLabel:'Guia oficial'},
 ar:{title:'Codex · وكيل برمجة بالذكاء الاصطناعي',intro:'يفهم المستودعات، ويبني المواقع وواجهات API، ويصلح الأخطاء، ويشغّل الاختبارات، ويراجع طلبات الدمج.',tasks:['تحليل المستودعات وبنية المشروع','بناء المواقع والتطبيقات وواجهات API','تصحيح الأخطاء وإعادة هيكلة الكود','تشغيل الأوامر والبناء والاختبارات','مراجعة التغييرات وطلبات الدمج','سطح المكتب وCLI وIDE والسحابة المؤهلة'],waysTitle:'طرق الاستخدام',ways:'سطح المكتب وCLI وIDE، مع مهام سحابية للحسابات المؤهلة.',planTitle:'الباقات والتكلفة',plan:'يستخدم رصيد Codex المتاح ضمن حساب ChatGPT؛ تختلف الحدود حسب الباقة. استخدام مفتاح API مستقل يُحاسب بشكل منفصل.',limitTitle:'السحابة والحدود',limit:'يتوقف الوصول السحابي على الباقة وإعدادات مساحة العمل؛ يؤثر النموذج وتعقيد المهمة على الاستهلاك.',linkLabel:'افتح Codex',guideLabel:'الدليل الرسمي'}
};
export function codexFor(language:Language){return CODEX_COPY[language];}
