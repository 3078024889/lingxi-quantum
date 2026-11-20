(function(){
 "use strict";
 var script=document.currentScript;
 if(!script||!script.parentNode)return;
 var source;
 // Standalone embeds load this file from LINGXIFIELD. WordPress ships the same
 // JS locally and provides only a fixed HTTPS API origin, never executable code.
 try{source=new URL(script.getAttribute("data-api-origin")||script.src);}catch(_){return;}
 if(source.protocol!=="https:"||source.port||source.username||source.password||!/^(?:www\.)?lingxifield\.(?:com|cn)$/.test(source.hostname))return;
 var base=source.origin;
 var requestedType=script.getAttribute("data-lx-widget");
 var type=requestedType==="tools"?"tools":requestedType==="free-tools"?"free-tools":"siai";
 var vendor=(script.getAttribute("data-vendor")||"").toLowerCase();
 if(vendor&&!/^[a-z0-9][a-z0-9-]{0,63}$/.test(vendor))vendor="";
 var partner=(script.getAttribute("data-partner")||"community").toLowerCase();
 if(!/^[a-z0-9][a-z0-9_-]{0,31}$/.test(partner))partner="community";
 var browserLang=(script.getAttribute("data-lang")||document.documentElement.lang||navigator.language||"en").slice(0,2).toLowerCase();
 var locale=/^(zh|en|ja|ko|fr|de|es|pt|ar)$/.test(browserLang)?browserLang:"en";
 var translations={
  zh:["全球 SIAI 厂商资料","官方资料核验后更新","搜索厂商或功能","查看完整全球排行榜","官方资料","已核验","免费二维码生成","输入公开网页链接","生成二维码","查看完整工具","仅用于公开链接，请勿输入私人资料","资料暂时不可用","资料核验日期","价格","免费额度","使用须知：二维码链接会提交至 LINGXIFIELD 生成","没有找到匹配的已审核平台"],
  en:["Global SIAI directory","Updated after source verification","Search providers or tasks","Explore full rankings","Official website","Reviewed","Free QR generator","Enter a public website URL","Make QR code","Open full tool","Public links only. Do not enter sensitive data","Directory temporarily unavailable","Reviewed","Price","Free tier","The URL is sent to LINGXIFIELD to create the QR image","No matching approved platforms"],
  ja:["世界の SIAI 企業一覧","公式情報を確認後に更新","企業または機能を検索","ランキング全体を見る","公式サイト","確認済み","無料 QR 作成","公開 URL を入力","QR 作成","ツールを開く","個人情報を入力しないでください","一時的に利用不可","確認日","価格","無料枠","URL は QR 画像作成のために送信されます","一致する確認済み企業がありません"],
  ko:["글로벌 SIAI 디렉터리","공식 출처 확인 후 업데이트","업체 또는 기능 검색","전체 순위 보기","공식 사이트","검토 완료","무료 QR 생성","공개 URL 입력","QR 만들기","전체 도구","민감한 정보를 입력하지 마세요","일시적으로 이용할 수 없음","검토 날짜","가격","무료 한도","QR 생성을 위해 URL이 전송됩니다","일치하는 검증된 플랫폼이 없습니다"],
  fr:["Annuaire mondial SIAI","Mis à jour après vérification","Rechercher un fournisseur","Voir le classement complet","Site officiel","Vérifiés","Créer un QR gratuit","URL publique","Créer le QR","Ouvrir l’outil","Ne saisissez pas de données privées","Indisponible temporairement","Vérifié le","Prix","Offre gratuite","L’URL est transmise à LINGXIFIELD pour créer le QR","Aucune plateforme vérifiée correspondante"],
  de:["Globales SIAI-Verzeichnis","Aktualisiert nach Quellenprüfung","Anbieter suchen","Gesamtes Ranking","Offizielle Website","Geprüft","Gratis QR-Code","Öffentliche URL eingeben","QR erstellen","Zum Tool","Keine vertraulichen Daten eingeben","Vorübergehend nicht verfügbar","Geprüft","Preis","Gratis-Kontingent","Die URL wird zur QR-Erstellung übermittelt","Keine passenden geprüften Anbieter"],
  es:["Directorio global SIAI","Actualizado tras verificar fuentes","Buscar proveedores","Ver ranking completo","Sitio oficial","Verificados","Generador QR gratis","URL pública","Crear QR","Abrir herramienta","No introduzcas datos privados","Temporalmente no disponible","Verificado","Precio","Plan gratis","La URL se envía a LINGXIFIELD para generar el QR","Sin plataformas verificadas coincidentes"],
  pt:["Diretório global SIAI","Atualizado após checagem das fontes","Buscar plataformas","Ver ranking completo","Site oficial","Verificados","Gerar QR grátis","URL pública","Criar QR","Abrir ferramenta","Não insira dados privados","Indisponível no momento","Verificado","Preço","Plano gratuito","O URL é enviado para gerar o QR","Nenhuma plataforma verificada encontrada"],
  ar:["دليل SIAI العالمي","يُحدَّث بعد التحقق من المصادر","ابحث عن منصة","عرض الترتيب الكامل","الموقع الرسمي","تم التحقق","إنشاء QR مجاني","رابط موقع عام","إنشاء الرمز","فتح الأداة","لا تدخل بيانات حساسة","غير متاح مؤقتاً","تاريخ المراجعة","السعر","المجاني","يُرسل الرابط لإنشاء رمز QR","لا توجد منصات معتمدة مطابقة"]
 };
 var freeToolsTranslations={
  zh:{title:"免费本地工具目录",subtitle:"无需登录 · 浏览器本地处理",search:"搜索工具名称或用途",category:"工具类别",open:"打开工具",empty:"没有找到匹配的免费工具",loading:"免费工具目录暂时不可用",local:"免费本地工具",categories:{all:"全部",pdf:"PDF",image:"图片",media:"视频与音频",subtitle:"字幕",table:"表格",privacy:"隐私",recognition:"识别",text:"文本",file:"文件",other:"其他"}},
  en:{title:"Free local tools directory",subtitle:"No sign-up · Local browser processing",search:"Search tools or tasks",category:"Tool category",open:"Open tool",empty:"No matching free tools found",loading:"Free tools directory unavailable",local:"Free local tools",categories:{all:"All",pdf:"PDF",image:"Image",media:"Video & audio",subtitle:"Subtitles",table:"Tables",privacy:"Privacy",recognition:"Recognition",text:"Text",file:"Files",other:"Other"}},
  ja:{title:"無料ローカルツール一覧",subtitle:"登録不要 · ブラウザー内で処理",search:"ツール名や用途を検索",category:"カテゴリ",open:"ツールを開く",empty:"一致する無料ツールがありません",loading:"一時的に利用できません",local:"無料ローカルツール",categories:{all:"すべて",pdf:"PDF",image:"画像",media:"動画・音声",subtitle:"字幕",table:"表計算",privacy:"プライバシー",recognition:"認識",text:"テキスト",file:"ファイル",other:"その他"}},
  ko:{title:"무료 로컬 도구 디렉터리",subtitle:"가입 불필요 · 브라우저에서 처리",search:"도구 또는 작업 검색",category:"도구 카테고리",open:"도구 열기",empty:"일치하는 무료 도구가 없습니다",loading:"무료 도구 목록을 사용할 수 없습니다",local:"무료 로컬 도구",categories:{all:"전체",pdf:"PDF",image:"이미지",media:"영상·오디오",subtitle:"자막",table:"표",privacy:"개인정보",recognition:"인식",text:"텍스트",file:"파일",other:"기타"}},
  fr:{title:"Répertoire d’outils locaux gratuits",subtitle:"Sans inscription · Traitement dans le navigateur",search:"Rechercher un outil ou une tâche",category:"Catégorie",open:"Ouvrir l’outil",empty:"Aucun outil gratuit correspondant",loading:"Répertoire temporairement indisponible",local:"Outils locaux gratuits",categories:{all:"Tout",pdf:"PDF",image:"Image",media:"Vidéo et audio",subtitle:"Sous-titres",table:"Tableaux",privacy:"Confidentialité",recognition:"Reconnaissance",text:"Texte",file:"Fichiers",other:"Autre"}},
  de:{title:"Verzeichnis kostenloser lokaler Tools",subtitle:"Ohne Anmeldung · Verarbeitung im Browser",search:"Tools oder Aufgaben suchen",category:"Kategorie",open:"Tool öffnen",empty:"Keine passenden kostenlosen Tools",loading:"Verzeichnis vorübergehend nicht verfügbar",local:"Kostenlose lokale Tools",categories:{all:"Alle",pdf:"PDF",image:"Bilder",media:"Video und Audio",subtitle:"Untertitel",table:"Tabellen",privacy:"Datenschutz",recognition:"Erkennung",text:"Text",file:"Dateien",other:"Sonstiges"}},
  es:{title:"Directorio de herramientas locales gratuitas",subtitle:"Sin registro · Procesamiento en el navegador",search:"Buscar herramientas o tareas",category:"Categoría",open:"Abrir herramienta",empty:"No hay herramientas gratuitas coincidentes",loading:"Directorio no disponible temporalmente",local:"Herramientas locales gratuitas",categories:{all:"Todas",pdf:"PDF",image:"Imagen",media:"Vídeo y audio",subtitle:"Subtítulos",table:"Tablas",privacy:"Privacidad",recognition:"Reconocimiento",text:"Texto",file:"Archivos",other:"Otros"}},
  pt:{title:"Diretório de ferramentas locais gratuitas",subtitle:"Sem cadastro · Processamento no navegador",search:"Buscar ferramentas ou tarefas",category:"Categoria",open:"Abrir ferramenta",empty:"Nenhuma ferramenta gratuita correspondente",loading:"Diretório temporariamente indisponível",local:"Ferramentas locais gratuitas",categories:{all:"Todas",pdf:"PDF",image:"Imagem",media:"Vídeo e áudio",subtitle:"Legendas",table:"Tabelas",privacy:"Privacidade",recognition:"Reconhecimento",text:"Texto",file:"Arquivos",other:"Outros"}},
  ar:{title:"دليل الأدوات المحلية المجانية",subtitle:"بدون تسجيل · المعالجة داخل المتصفح",search:"ابحث عن أداة أو مهمة",category:"فئة الأداة",open:"فتح الأداة",empty:"لا توجد أدوات مجانية مطابقة",loading:"الدليل غير متاح مؤقتاً",local:"أدوات محلية مجانية",categories:{all:"الكل",pdf:"PDF",image:"الصور",media:"الفيديو والصوت",subtitle:"الترجمة النصية",table:"الجداول",privacy:"الخصوصية",recognition:"التعرّف",text:"النص",file:"الملفات",other:"أخرى"}}
 };
 var t=translations[locale];
 var ft=freeToolsTranslations[locale];
 var destination=base+(type==="siai"?"/siai":type==="free-tools"?"/tools":"/tools/qr-code-generator");
 var campaign=type==="siai"?"siai_directory":type==="free-tools"?"free_tools_directory":"qr_widget";
 var link=destination+"?utm_source=partner_widget&utm_campaign="+campaign+"&utm_content="+encodeURIComponent(partner);
 var wrap=document.createElement("div");
 wrap.setAttribute("data-lingxifield-embed",type);
 script.parentNode.insertBefore(wrap,script);
 var root=wrap.attachShadow({mode:"open"});
 var css=document.createElement("style");
 css.textContent=":host{all:initial;font:15px/1.5 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f2937;direction:"+ (locale==="ar"?"rtl":"ltr") +"}*{box-sizing:border-box}.shell{border:1px solid #dbe3ef;border-radius:17px;background:#fff;padding:18px;max-width:640px;box-shadow:0 4px 22px rgba(15,23,42,.06)}.head{display:flex;align-items:center;justify-content:space-between;gap:12px}.name{font-size:19px;font-weight:750;color:#151b2a}.tag{font-size:12px;background:#eef3ff;color:#2452a5;border-radius:20px;padding:4px 9px;white-space:nowrap}.sub{margin:4px 0 14px;color:#64748b;font-size:13px}input{width:100%;font:inherit;border:1px solid #ccd5e3;border-radius:10px;padding:10px 12px;color:#151b2a;background:#fff}input:focus{outline:2px solid #c8dcff}.list{display:grid;gap:8px;max-height:330px;overflow:auto;margin:12px 0}.item{border:1px solid #e8ecf4;border-radius:10px;padding:10px}.item-title{font-weight:700;font-size:15px}.item-info{color:#64748b;font-size:13px;margin-top:3px;overflow-wrap:anywhere}.item a{display:inline-block;margin-top:5px;font-size:13px;color:#174fba;text-decoration:underline}.footer{margin-top:13px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}a.cta,button.cta{background:#245bd5;color:#fff;text-decoration:none;border:0;border-radius:10px;padding:10px 14px;font:600 14px system-ui;cursor:pointer}.note{font-size:12px;color:#64748b}.qr{display:block;width:200px;height:200px;margin:15px auto;max-width:100%;border:1px solid #e8ecf4}.error{font-size:13px;color:#b42318;margin-top:8px}.row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}.row input{flex:1;min-width:180px}.row button{flex:0 0 auto}.filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.filters input{flex:1;min-width:180px}.filters select{flex:0 0 160px;max-width:100%;font:inherit;border:1px solid #ccd5e3;border-radius:10px;padding:10px;color:#151b2a;background:#fff}";
 root.appendChild(css);
 function elem(tag,cl,txt){
  var e=document.createElement(tag);
  if(cl)e.className=cl;
  if(txt!==undefined)e.textContent=String(txt);
  return e;
 }
 var shell=elem("section","shell");root.appendChild(shell);
 var heading=elem("div","head");shell.appendChild(heading);
 heading.appendChild(elem("div","name",type==="siai"?t[0]:type==="free-tools"?ft.title:t[6]));
 var tag=elem("span","tag",type==="siai"?"SIAI":type==="free-tools"?"FREE TOOLS":"LINGXIFIELD");heading.appendChild(tag);
 shell.appendChild(elem("p","sub",type==="siai"?t[1]:type==="free-tools"?ft.subtitle:"LINGXIFIELD · Free online tools"));
 function cta(text){
  var a=elem("a","cta",text);a.href=link;a.target="_blank";a.rel="noopener noreferrer";return a;
 }
 if(type==="tools"){
  var note=elem("div","note",t[15]);shell.appendChild(note);
  var controls=elem("div","row");shell.appendChild(controls);
  var input=elem("input");input.placeholder=t[7];input.type="url";input.maxLength=256;input.setAttribute("aria-label",t[7]);controls.appendChild(input);
  var button=elem("button","cta",t[8]);button.type="button";controls.appendChild(button);
  var error=elem("p","error");error.setAttribute("role","status");
  var img=elem("img","qr");img.alt="QR";img.hidden=true;shell.appendChild(img);shell.appendChild(error);
  button.addEventListener("click",function(){
   var address;
   try{address=new URL(input.value.trim());}catch(_){address=null;}
   if(!address||!/^https?:$/.test(address.protocol)||address.username||address.password||address.search||address.hash||address.href.length>256){
    error.textContent=t[10];img.hidden=true;return;
   }
   error.textContent="";
   img.src=base+"/api/public/qr-code?text="+encodeURIComponent(address.href);
   img.hidden=false;
  });
  img.addEventListener("error",function(){error.textContent=t[11];img.hidden=true;});
  var foot=elem("div","footer");foot.appendChild(cta(t[9]));shell.appendChild(foot);
 }else if(type==="free-tools"){
  var filters=elem("div","filters");shell.appendChild(filters);
  var search=elem("input");search.type="search";search.placeholder=ft.search;search.setAttribute("aria-label",ft.search);filters.appendChild(search);
  var category=elem("select");category.setAttribute("aria-label",ft.category);filters.appendChild(category);
  ["all","pdf","image","media","subtitle","table","privacy","recognition","text","file","other"].forEach(function(key){
   var option=elem("option",null,ft.categories[key]);option.value=key;category.appendChild(option);
  });
  var list=elem("div","list");list.setAttribute("aria-live","polite");shell.appendChild(list);
  var foot=elem("div","footer");foot.appendChild(cta(t[9]));shell.appendChild(foot);
  var rows=[];
  function drawFreeTools(){
   list.replaceChildren();
   var term=search.value.trim().toLowerCase(),selected=category.value;
   var found=rows.filter(function(r){
    var title=locale==="zh"?String(r.titleZh||""):String(r.titleEn||r.titleZh||"");
    var desc=locale==="zh"?String(r.descZh||""):String(r.descEn||r.descZh||"");
    return (selected==="all"||r.category===selected)&&
     (title+" "+desc+" "+String(r.slug)).toLowerCase().includes(term);
   }).slice(0,40);
   found.forEach(function(r){
    var item=elem("article","item");
    var title=locale==="zh"?r.titleZh:(r.titleEn||r.titleZh);
    var desc=locale==="zh"?r.descZh:(r.descEn||r.descZh);
    item.appendChild(elem("div","item-title",title));
    item.appendChild(elem("div","item-info",ft.categories[r.category]||r.category));
    if(desc)item.appendChild(elem("div","item-info",desc));
    var a=elem("a",null,ft.open);
    a.href=base+"/tools/"+r.slug+"?utm_source=partner_widget&utm_campaign=free_tools_directory&utm_content="+encodeURIComponent(partner);
    a.target="_blank";a.rel="noopener noreferrer nofollow";item.appendChild(a);
    list.appendChild(item);
   });
   if(!found.length)list.appendChild(elem("div","note",rows.length?ft.empty:ft.loading));
  }
  search.addEventListener("input",drawFreeTools);
  category.addEventListener("change",drawFreeTools);
  fetch(base+"/api/public/free-tools-widget",{credentials:"omit",mode:"cors"})
   .then(function(r){if(!r.ok)throw Error("feed");return r.json();})
   .then(function(data){
    if(!data||!Array.isArray(data.rows))throw Error("invalid");
    rows=data.rows.filter(function(r){return r&&typeof r.slug==="string"&&/^[a-z0-9-]{1,80}$/.test(r.slug)&&r.access==="anonymous"&&r.execution==="local";});
    tag.textContent=ft.local+" · "+rows.length;
    drawFreeTools();
   }).catch(function(){list.replaceChildren(elem("p","note",ft.loading));});
}else{
  var search=elem("input");search.type="search";search.placeholder=t[2];search.setAttribute("aria-label",t[2]);shell.appendChild(search);
  var list=elem("div","list");list.setAttribute("aria-live","polite");shell.appendChild(list);
  var foot2=elem("div","footer");var more=cta(t[3]);foot2.appendChild(more);shell.appendChild(foot2);
  var rows=[];
  function draw(){
   list.replaceChildren();
   var term=search.value.trim().toLowerCase(),found=rows.filter(function(r){
    return (String(r.name)+" "+String(r.category)+" "+String(r.id)).toLowerCase().includes(term);
   }).slice(0,term?30:6);
   found.forEach(function(r){
    var item=elem("article","item");
    item.appendChild(elem("div","item-title",r.name));
    var info=[r.category,r.price?t[13]+": "+r.price:"",r.free?t[14]+": "+r.free:"",r.reviewedAt?t[12]+": "+String(r.reviewedAt).slice(0,10):""].filter(Boolean);
    item.appendChild(elem("div","item-info",info.join(" · ")));
    if(r.website){
     var a=elem("a",null,t[4]);a.href=r.website;a.rel="noopener noreferrer nofollow";a.target="_blank";item.appendChild(a);
    }
    list.appendChild(item);
   });
   if(!found.length)list.appendChild(elem("div","note",rows.length?t[16]:t[11]));
  }
  search.addEventListener("input",draw);
  fetch(base+"/api/public/siai-widget",{credentials:"omit",mode:"cors"})
   .then(function(r){if(!r.ok)throw Error("feed");return r.json();})
   .then(function(data){if(!data||!Array.isArray(data.rows))throw Error("invalid");rows=vendor?data.rows.filter(function(r){return r.id===vendor;}):data.rows;tag.textContent=t[5]+" "+(vendor?rows.length:data.total);if(vendor&&rows.length)more.href=destination+"?q="+encodeURIComponent(rows[0].name)+"&utm_source=partner_widget&utm_campaign="+campaign+"&utm_content="+encodeURIComponent(partner);draw();})
   .catch(function(){list.replaceChildren(elem("p","note",t[11]));});
 }
})();
