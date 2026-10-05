import fs from "node:fs";

function read(file){return fs.readFileSync(file,"utf8")}
function write(file,text){fs.writeFileSync(file,text,"utf8")}

function replaceObjectEntry(source,key,replacement){
  const needles=[`'${key}':{`,`"${key}":{`,`${key}:{`];
  let start=-1;
  for(const n of needles){start=source.indexOf(n);if(start>=0)break}
  if(start<0)throw new Error(`SEO_ENTRY_NOT_FOUND:${key}`);

  const brace=source.indexOf("{",start);
  if(brace<0)throw new Error(`SEO_ENTRY_BRACE_NOT_FOUND:${key}`);

  let depth=0,quote=null,escape=false,end=-1;
  for(let i=brace;i<source.length;i++){
    const ch=source[i];
    if(quote){
      if(escape){escape=false;continue}
      if(ch==="\\"){escape=true;continue}
      if(ch===quote)quote=null;
      continue;
    }
    if(ch==="'"||ch==='"'||ch==="`"){quote=ch;continue}
    if(ch==="{"){depth++;continue}
    if(ch==="}"){
      depth--;
      if(depth===0){
        end=i+1;
        break;
      }
    }
  }
  if(end<0)throw new Error(`SEO_ENTRY_UNBALANCED:${key}`);

  return source.slice(0,start)+replacement+source.slice(end);
}

function ensureServiceFacts(){
  const file="lib/seo/service-facts.ts";
  let src=read(file);

  const dramaDone=src.includes("把故事、角色、参考图和已有素材放进 SASI，建立短剧项目并继续生成剧本、分镜和视频。");
  const websiteDone=src.includes("告诉 SASI 你想做的网站，加入品牌资料、图片、文档或代码，就能先生成可预览的网站起稿");

  const drama=`'ai-short-drama-generator':{target:'/sasi/drama',description:L(
"把故事、角色、参考图和已有素材放进 SASI，建立短剧项目并继续生成剧本、分镜和视频。真正生成前会显示可用路线与费用；需要智能生成时可连接自己的智能服务。",
"Bring a story, characters, references and existing assets into SASI to build a short-drama project, then continue with scripts, storyboards and video. Available routes and prices are shown before generation; connect your own intelligence service when generation needs it.",
"物語・キャラクター・参考画像・既存素材をSASIに入れて短編ドラマのプロジェクトを作成し、脚本・絵コンテ・動画制作へ進めます。生成前に利用可能なルートと料金を表示し、必要に応じて自分のAIサービスを接続できます。",
"이야기, 캐릭터, 참고 이미지와 기존 자료를 SASI에 넣어 숏드라마 프로젝트를 만들고 대본·스토리보드·영상 제작을 이어갈 수 있습니다. 생성 전에 가능한 경로와 요금을 확인하며 필요한 경우 자신의 지능형 서비스를 연결합니다.",
"Ajoutez histoire, personnages, références et médias existants à SASI pour créer un projet de mini-série, puis poursuivre avec scénario, storyboard et vidéo. Les voies disponibles et les tarifs sont indiqués avant génération ; connectez votre propre service d’IA si nécessaire.",
"Füge Geschichte, Figuren, Referenzen und vorhandene Medien in SASI ein, erstelle ein Kurzdrama-Projekt und arbeite an Skript, Storyboard und Video weiter. Verfügbare Wege und Preise werden vor der Generierung angezeigt; bei Bedarf verbindest du deinen eigenen KI-Dienst.",
"Añade historia, personajes, referencias y material existente a SASI para crear un proyecto de minidrama y continuar con guion, storyboard y vídeo. Antes de generar se muestran las rutas disponibles y el precio; cuando haga falta puedes conectar tu propio servicio de IA.",
"Adicione história, personagens, referências e materiais existentes ao SASI para criar um projeto de minidrama e continuar com roteiro, storyboard e vídeo. As rotas disponíveis e os preços aparecem antes da geração; quando necessário, conecte seu próprio serviço de IA.",
"أضف القصة والشخصيات والمراجع والمواد الحالية إلى SASI لإنشاء مشروع دراما قصيرة ومتابعة النص واللوحات القصصية والفيديو. تظهر المسارات المتاحة والأسعار قبل التوليد، ويمكن ربط خدمة الذكاء الخاصة بك عند الحاجة."
)}`;

  const website=`'ai-website-builder':{target:'/sasi/build',description:L(
"告诉 SASI 你想做的网站，加入品牌资料、图片、文档或代码，就能先生成可预览的网站起稿，并继续完善页面与内容。使用智能生成前会显示可用路线与费用，也可以连接自己的智能服务继续构建。",
"Tell SASI what website you want and add brand assets, images, documents or code. It can produce a previewable website draft and continue refining pages and content. Available routes and prices are shown before intelligent generation, and you can connect your own intelligence service to keep building.",
"作りたいサイトをSASIに伝え、ブランド資料・画像・文書・コードを追加すると、プレビュー可能な下書きを作成し、ページや内容を継続して整えられます。智能生成前に利用可能なルートと料金を表示し、自分のAIサービスを接続して続けることもできます。",
"원하는 웹사이트와 브랜드 자료, 이미지, 문서 또는 코드를 SASI에 넣으면 미리 볼 수 있는 사이트 초안을 만들고 페이지와 콘텐츠를 계속 다듬을 수 있습니다. 지능형 생성 전에 사용 가능한 경로와 요금을 표시하며 자신의 지능형 서비스를 연결해 계속 구축할 수 있습니다.",
"Décrivez le site souhaité à SASI et ajoutez éléments de marque, images, documents ou code. SASI crée une ébauche prévisualisable puis permet d’affiner pages et contenus. Les voies disponibles et les tarifs sont indiqués avant la génération intelligente, avec la possibilité de connecter votre propre service d’IA.",
"Beschreibe SASI die gewünschte Website und füge Markenmaterial, Bilder, Dokumente oder Code hinzu. SASI erstellt einen Vorschau-Entwurf und hilft beim weiteren Ausbau von Seiten und Inhalten. Verfügbare Wege und Preise werden vor der intelligenten Generierung angezeigt; dein eigener KI-Dienst kann verbunden werden.",
"Dile a SASI qué sitio quieres y añade materiales de marca, imágenes, documentos o código. SASI crea un borrador previsualizable y permite seguir perfeccionando páginas y contenido. Antes de la generación inteligente se muestran las rutas y el precio, y puedes conectar tu propio servicio de IA.",
"Diga ao SASI qual site deseja e adicione materiais de marca, imagens, documentos ou código. O SASI cria um rascunho visualizável e permite continuar aprimorando páginas e conteúdo. As rotas disponíveis e os preços aparecem antes da geração inteligente, e você pode conectar seu próprio serviço de IA.",
"أخبر SASI بالموقع الذي تريد إنشاءه وأضف مواد العلامة التجارية والصور والمستندات أو الشيفرة. ينشئ SASI مسودة قابلة للمعاينة ويمكن متابعة تحسين الصفحات والمحتوى. تظهر المسارات المتاحة والأسعار قبل التوليد الذكي، ويمكنك ربط خدمة الذكاء الخاصة بك للمتابعة."
)}`;

  let changed=false;
  if(!dramaDone){src=replaceObjectEntry(src,"ai-short-drama-generator",drama);changed=true}
  if(!websiteDone){src=replaceObjectEntry(src,"ai-website-builder",website);changed=true}

  if(!src.includes("把故事、角色、参考图和已有素材放进 SASI"))throw new Error("SEO_DRAMA_FACT_NOT_ESTABLISHED");
  if(!src.includes("告诉 SASI 你想做的网站"))throw new Error("SEO_WEBSITE_FACT_NOT_ESTABLISHED");

  if(changed){write(file,src);console.log("SEO_UPDATED="+file)}
  else console.log("SEO_ALREADY_CURRENT="+file);
}

function ensureTextFile(file,replacements,required){
  let src=read(file),before=src;
  for(const [a,b] of replacements)src=src.split(a).join(b);
  for(const marker of required)if(!src.includes(marker))throw new Error(`SEO_REQUIRED_TEXT_MISSING:${file}:${marker}`);
  if(src!==before){write(file,src);console.log("SEO_UPDATED="+file)}
  else console.log("SEO_ALREADY_CURRENT="+file);
}

ensureServiceFacts();

ensureTextFile("lib/seo/global-seo.ts",[
 ["SASI 按使用收费，确认费用后再开始。短剧和网站生成暂未开放。","SASI 可以用于短剧、网站、书本、学习和科研创作。需要付费的步骤会在真正执行前显示费用；需要智能生成时可连接自己的智能服务。"],
 ["SASI charges by usage after you confirm the price. Short drama and website generation are not available yet.","SASI supports drama, website, book, learning and research workflows. Paid steps show the price before execution; connect your own intelligence service when intelligent generation is needed."],
 ["SASIは料金の確認後、利用分に応じて課金されます。短編ドラマとサイトの生成は現在利用できません。","SASIは短編ドラマ、Webサイト、本、学習、研究に利用できます。有料の工程は実行前に料金を表示し、智能生成が必要な場合は自分のAIサービスを接続できます。"],
 ["SASI는 요금을 확인한 뒤 사용량에 따라 청구됩니다. 숏폼 드라마와 웹사이트 생성은 아직 이용할 수 없습니다.","SASI는 숏드라마, 웹사이트, 책, 학습, 연구 작업에 사용할 수 있습니다. 유료 단계는 실행 전에 요금을 표시하며 지능형 생성이 필요할 때 자신의 서비스를 연결할 수 있습니다."],
 ["SASI facture selon l’utilisation après confirmation du prix. La génération de mini-séries et de sites n’est pas encore disponible.","SASI prend en charge les flux de mini-séries, sites, livres, apprentissage et recherche. Les étapes payantes affichent le tarif avant exécution ; connectez votre service d’IA lorsque la génération intelligente est nécessaire."],
 ["SASI wird nach Nutzung abgerechnet, nachdem du den Preis bestätigt hast. Kurzdrama- und Website-Generierung sind noch nicht verfügbar.","SASI unterstützt Kurzdrama-, Website-, Buch-, Lern- und Forschungsabläufe. Kostenpflichtige Schritte zeigen den Preis vor der Ausführung; bei Bedarf kannst du deinen eigenen KI-Dienst verbinden."],
 ["SASI cobra por uso tras confirmar el precio. La generación de minidramas y sitios aún no está disponible.","SASI admite flujos de minidramas, sitios web, libros, aprendizaje e investigación. Los pasos de pago muestran el precio antes de ejecutarse; conecta tu propio servicio de IA cuando haga falta generación inteligente."],
 ["O SASI cobra pelo uso após a confirmação do preço. A geração de minidramas e sites ainda não está disponível.","O SASI oferece fluxos de minidramas, sites, livros, estudo e pesquisa. Etapas pagas mostram o preço antes da execução; conecte seu próprio serviço de IA quando a geração inteligente for necessária."],
 ["يحاسب SASI حسب الاستخدام بعد تأكيد السعر. إنشاء الدراما القصيرة والمواقع غير متاح حالياً.","يدعم SASI مسارات الدراما القصيرة والمواقع والكتب والتعلم والبحث. تعرض الخطوات المدفوعة السعر قبل التنفيذ، ويمكن ربط خدمة الذكاء الخاصة بك عند الحاجة إلى التوليد الذكي."]
],[
 "SASI 可以用于短剧、网站、书本、学习和科研创作。",
 "SASI supports drama, website, book, learning and research workflows."
]);

// site-facts can be in old or already-patched form; replace only if old phrase remains.
{
 const file="lib/seo/site-facts.ts";
 let src=read(file),before=src;
 if(src.includes("短剧和网站生成暂未开放")){
   const old=/const SASI=\[[\s\S]*?\];\nconst BALANCE=/;
   if(!old.test(src))throw new Error("SITE_FACTS_SASI_SHAPE_DRIFT");
   const next=`const SASI=["SASI 可以用于短剧、网站、书本、学习和科研。需要付费的步骤会在执行前显示费用；需要智能生成时可连接自己的智能服务。","SASI supports drama, website, book, learning and research workflows. Paid steps show the price before execution; connect your own intelligence service when intelligent generation is needed.","SASIは短編ドラマ、Webサイト、本、学習、研究に利用できます。有料工程は実行前に料金を表示し、必要に応じて自分のAIサービスを接続できます。","SASI는 숏드라마, 웹사이트, 책, 학습, 연구 작업을 지원합니다. 유료 단계는 실행 전에 요금을 표시하며 필요할 때 자신의 지능형 서비스를 연결할 수 있습니다.","SASI prend en charge mini-séries, sites, livres, apprentissage et recherche. Les étapes payantes affichent le tarif avant exécution ; connectez votre service d’IA si nécessaire.","SASI unterstützt Kurzdrama-, Website-, Buch-, Lern- und Forschungsabläufe. Kostenpflichtige Schritte zeigen den Preis vor der Ausführung; bei Bedarf kannst du deinen KI-Dienst verbinden.","SASI admite minidramas, sitios, libros, aprendizaje e investigación. Los pasos de pago muestran el precio antes de ejecutarse; conecta tu servicio de IA cuando sea necesario.","O SASI oferece minidramas, sites, livros, estudo e pesquisa. Etapas pagas mostram o preço antes da execução; conecte seu serviço de IA quando necessário.","يدعم SASI الدراما القصيرة والمواقع والكتب والتعلم والبحث. تعرض الخطوات المدفوعة السعر قبل التنفيذ ويمكن ربط خدمة الذكاء الخاصة بك عند الحاجة."];\nconst BALANCE=`;
   src=src.replace(old,next);
 }
 if(!src.includes("SASI 可以用于短剧、网站、书本、学习和科研。"))throw new Error("SITE_FACTS_SASI_TARGET_MISSING");
 if(src!==before){write(file,src);console.log("SEO_UPDATED="+file)}
 else console.log("SEO_ALREADY_CURRENT="+file);
}

console.log("SEO_GEO_SASI_FACTS_R8R4=PASS");
