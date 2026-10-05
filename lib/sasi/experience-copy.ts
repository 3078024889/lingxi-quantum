import type{LingxiLang}from"@/lib/lingxi-i18n";
const row=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Record<LingxiLang,string>=>({zh,en,ja,ko,fr,de,es,pt,ar});
const COPY={
 exhausted:row(
  "今天的体验额度已经用完。想继续？连接你的智能服务，我就能接着做。5分钟构建网站、生成短剧、活化一本书的知识，都可以继续完成。",
  "Today's experience is complete. Want to keep going? Connect your intelligence service and I can continue—build a website in about five minutes, create a short drama, or turn a book into knowledge you can work with.",
  "今日の体験分は使い切りました。続けるには、あなたのAIサービスを接続してください。約5分でのサイト構築、ショートドラマ制作、本の知識化まで続けられます。",
  "오늘의 체험 분량을 모두 사용했습니다. 계속하려면 내 지능형 서비스를 연결하세요. 약 5분 웹사이트 구축, 숏드라마 제작, 책 지식화까지 이어갈 수 있습니다.",
  "L’expérience du jour est terminée. Pour continuer, connectez votre service d’IA : création d’un site en environ cinq minutes, production d’un court drama ou transformation d’un livre en connaissances exploitables.",
  "Das heutige Nutzungskontingent ist aufgebraucht. Verbinde deinen KI-Dienst, um weiterzumachen – etwa eine Website in rund fünf Minuten erstellen, ein Kurzdrama produzieren oder ein Buch in nutzbares Wissen verwandeln.",
  "La experiencia de hoy se ha agotado. Para continuar, conecta tu servicio de IA: podrás seguir creando un sitio en unos cinco minutos, producir un drama corto o convertir un libro en conocimiento útil.",
  "A experiência de hoje chegou ao fim. Para continuar, conecte seu serviço de IA: você pode seguir criando um site em cerca de cinco minutos, produzir um drama curto ou transformar um livro em conhecimento utilizável.",
  "انتهت حصة التجربة لليوم. للمتابعة، اربط خدمة الذكاء الخاصة بك، ويمكنني مواصلة العمل: إنشاء موقع خلال نحو خمس دقائق، أو إنتاج دراما قصيرة، أو تحويل كتاب إلى معرفة قابلة للاستخدام."
 ),
 connect:row("连接我的智能服务","Connect my intelligence service","AIサービスを接続","내 지능형 서비스 연결","Connecter mon service d’IA","Meinen KI-Dienst verbinden","Conectar mi servicio de IA","Conectar meu serviço de IA","ربط خدمة الذكاء الخاصة بي"),
 projectSafe:row("当前项目会保留。","Your current project will be kept.","現在のプロジェクトは保存されます。","현재 프로젝트는 그대로 보관됩니다.","Votre projet actuel sera conservé.","Dein aktuelles Projekt bleibt erhalten.","Tu proyecto actual se conservará.","Seu projeto atual será mantido.","سيتم الاحتفاظ بمشروعك الحالي.")
}as const;
export function sasiExperienceText(lang:LingxiLang,key:keyof typeof COPY){return COPY[key][lang]??COPY[key].en}
