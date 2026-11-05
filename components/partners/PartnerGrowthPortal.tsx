"use client";
import Link from "next/link";
import {useEffect,useMemo,useState,type CSSProperties} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";

const copy:Record<LingxiLang,{eyebrow:string;title:string;intro:string;partners:string;partnerHint:string;siai:string;siaiInfo:string;qr:string;qrInfo:string;copy:string;copied:string;example:string;feed:string;update:string;rules:string;community:string;note:string}>={
 zh:{eyebrow:"全球合作伙伴",title:"把真正好用的工具，带给你的读者",intro:"不需要注册或付费。将小组件放进你的网站，访客可直接查询全球 SIAI 厂商资料或创建公开链接二维码。",partners:"你的合作标识",partnerHint:"英文、数字、下划线或短横线，最多 32 位；只用于统计流量来源",siai:"全球 SIAI 资料组件",siaiInfo:"实时读取已审核的公开厂商资料，新增的已审核平台自动进入列表。未审核资料不会对外分发。",qr:"免费二维码组件",qrInfo:"读者可将公开网址制成二维码，不要求创建账户。",copy:"复制安装代码",copied:"已复制",example:"安装步骤：复制代码，放入网页 HTML 中需要展示的位置。",feed:"订阅已审核资料更新",update:"查看全球 SIAI 排行榜",rules:"过滤可识别的自动化测试流量",community:"更多免费工具",note:"尊重访客隐私；不收集嵌入网站的访问者邮箱或联系方式。"},
 en:{eyebrow:"Global partners",title:"Useful tools for your visitors",intro:"No sign-up or payment required. Embed a live, verified SIAI directory or public-link QR generator on your site.",partners:"Partner label",partnerHint:"Letters, numbers, underscores or hyphens, up to 32 characters; for source attribution only",siai:"Global SIAI directory widget",siaiInfo:"Shows approved public profiles. Newly approved platforms appear automatically when the directory is updated.",qr:"Free QR widget",qrInfo:"Visitors can turn public website links into QR codes without signing up.",copy:"Copy embed code",copied:"Copied",example:"Paste the code into your website HTML wherever you want the widget.",feed:"Subscribe to verified updates",update:"Explore SIAI rankings",rules:"Known automated test traffic is excluded",community:"Explore free tools",note:"No visitor email addresses or contact details are collected by the widget."},
 ja:{eyebrow:"世界のパートナー",title:"読者に便利なツールを提供",intro:"登録も支払いも不要。SIAI企業情報と公開URLのQR作成を埋め込めます。",partners:"パートナー識別子",partnerHint:"英数字・_・-、最大32文字。流入元の識別のみ",siai:"SIAI企業一覧ウィジェット",siaiInfo:"確認済みの公開情報のみ表示。承認後は自動で更新されます。",qr:"無料QRウィジェット",qrInfo:"公開URLからQRを作成できます。",copy:"コードをコピー",copied:"コピー済み",example:"コードをウェブページのHTMLに貼り付けます。",feed:"確認済みの更新を購読",update:"SIAIランキング",rules:"自動テストによるアクセスを可能な範囲で除外",community:"無料ツール",note:"訪問者のメールアドレスは収集しません。"},
 ko:{eyebrow:"글로벌 파트너",title:"방문자에게 유용한 도구 제공",intro:"가입 없이 SIAI 디렉터리와 QR 생성기를 삽입하세요.",partners:"파트너 표시",partnerHint:"영문/숫자/_/-, 최대 32자",siai:"SIAI 디렉터리",siaiInfo:"검증된 공개 정보만 표시하며 승인된 자료가 자동 업데이트됩니다.",qr:"무료 QR 도구",qrInfo:"공개 웹 주소로 QR 코드를 만들 수 있습니다.",copy:"코드 복사",copied:"복사 완료",example:"웹페이지 HTML에 코드를 붙여 넣으세요.",feed:"업데이트 구독",update:"SIAI 순위",rules:"식별 가능한 자동 테스트 방문 제외",community:"무료 도구",note:"방문자의 이메일을 수집하지 않습니다."},
 fr:{eyebrow:"Partenaires mondiaux",title:"Des outils utiles pour vos visiteurs",intro:"Sans inscription : intégrez l'annuaire SIAI et un créateur de QR.",partners:"Identifiant partenaire",partnerHint:"Lettres, chiffres, _ ou -, maximum 32 caractères",siai:"Widget annuaire SIAI",siaiInfo:"Uniquement les fiches vérifiées, mises à jour après validation.",qr:"QR gratuit",qrInfo:"Crée des QR pour des URL publiques.",copy:"Copier le code",copied:"Copié",example:"Collez le code dans le HTML de votre site.",feed:"Suivre les mises à jour",update:"Classement SIAI",rules:"Trafic de test automatisé identifiable exclu",community:"Outils gratuits",note:"Aucune adresse e-mail de visiteur n'est collectée."},
 de:{eyebrow:"Globale Partner",title:"Nützliche Tools für Ihre Besucher",intro:"Ohne Anmeldung: SIAI-Verzeichnis und QR-Generator einbinden.",partners:"Partnerkennung",partnerHint:"Buchstaben, Zahlen, _ oder -, max. 32 Zeichen",siai:"SIAI-Verzeichnis",siaiInfo:"Nur geprüfte öffentliche Datensätze, automatisch aktualisiert.",qr:"Gratis QR-Widget",qrInfo:"QR-Codes für öffentliche URLs.",copy:"Code kopieren",copied:"Kopiert",example:"Code in das HTML Ihrer Website einfügen.",feed:"Updates abonnieren",update:"SIAI-Ranking",rules:"Erkennbare automatisierte Tests ausgeschlossen",community:"Gratis-Tools",note:"Es werden keine Besucher-E-Mail-Adressen erfasst."},
 es:{eyebrow:"Socios globales",title:"Herramientas para tus visitantes",intro:"Sin registro: integra el directorio SIAI y un generador QR.",partners:"Identificador del socio",partnerHint:"Letras, números, _ o -, máximo 32 caracteres",siai:"Directorio SIAI",siaiInfo:"Solo perfiles verificados. Actualización tras aprobación.",qr:"QR gratis",qrInfo:"Códigos QR para enlaces web públicos.",copy:"Copiar código",copied:"Copiado",example:"Pega el código en el HTML de tu sitio.",feed:"Seguir actualizaciones",update:"Ranking SIAI",rules:"Se excluyen pruebas automatizadas detectables",community:"Herramientas gratis",note:"No se recopilan correos de visitantes."},
 pt:{eyebrow:"Parceiros globais",title:"Ferramentas para seus visitantes",intro:"Sem cadastro: incorpore o diretório SIAI e um gerador de QR.",partners:"Identificador do parceiro",partnerHint:"Letras, números, _ ou -, até 32 caracteres",siai:"Diretório SIAI",siaiInfo:"Apenas perfis verificados, atualizados após aprovação.",qr:"QR gratuito",qrInfo:"QR para endereços públicos.",copy:"Copiar código",copied:"Copiado",example:"Cole o código no HTML do seu site.",feed:"Acompanhar atualizações",update:"Ranking SIAI",rules:"Testes automatizados identificáveis são excluídos",community:"Ferramentas grátis",note:"Não coletamos e-mails de visitantes."},
 ar:{eyebrow:"الشركاء حول العالم",title:"أدوات مفيدة لزوار موقعك",intro:"بدون تسجيل: أضف دليل SIAI وصانع QR لموقعك.",partners:"معرّف الشريك",partnerHint:"حروف وأرقام و_ و- بحد أقصى 32",siai:"دليل SIAI",siaiInfo:"البيانات العامة التي تم التحقق منها فقط، وتُحدّث عند الاعتماد.",qr:"مولد QR مجاني",qrInfo:"رموز QR للروابط العامة.",copy:"نسخ الكود",copied:"تم النسخ",example:"الصق الكود في HTML لموقعك.",feed:"الاشتراك في التحديثات",update:"ترتيب SIAI",rules:"تُستبعد زيارات الاختبار الآلي التي يمكن تحديدها",community:"الأدوات المجانية",note:"لا نجمع عناوين البريد الإلكتروني للزوار."}
};
const vendorCopy:Record<LingxiLang,{title:string;info:string;choose:string;claim:string;wordpress:string;wpNote:string}>={
 zh:{title:"单厂商资料卡 · 供厂商分享",info:"只展示已审核的官方资料；适合厂商官网、博客和合作伙伴引用。",choose:"选择已审核厂商",claim:"认领或提交你的 SI/AI 平台（审核后公开）",wordpress:"下载 WordPress 插件（免费）",wpNote:"一键下载安装包，在 WordPress 插件页面上传，然后用短代码展示工具。无需外部脚本。"},
 en:{title:"Verified vendor profile card",info:"A shareable card for one reviewed product on vendor and partner websites.",choose:"Choose reviewed vendor",claim:"Claim or submit your SI/AI platform (review required)",wordpress:"Download WordPress plugin (free)",wpNote:"Download the installer ZIP, upload it in WordPress Plugins, then insert a shortcode. Executable code is bundled locally."},
 ja:{title:"確認済み企業カード",info:"公式確認済みの企業情報を共有できます。",choose:"企業を選択",claim:"SI/AI企業情報を申請・更新（審査あり）",wordpress:"WordPress プラグインを無料ダウンロード",wpNote:"ZIPをWordPressのプラグイン画面からアップロードし、ショートコードを追加してください。"},
 ko:{title:"검증된 기업 카드",info:"검토된 기업 정보만 공유합니다.",choose:"기업 선택",claim:"SI/AI 플랫폼 등록·인증 신청 (검토 필수)",wordpress:"WordPress 플러그인 무료 다운로드",wpNote:"ZIP을 WordPress 플러그인 화면에 업로드한 다음 단축 코드를 사용하세요."},
 fr:{title:"Fiche d'entreprise vérifiée",info:"Fiche publique vérifiée pour les partenaires.",choose:"Choisir une entreprise",claim:"Revendiquer une plateforme SI/IA (après vérification)",wordpress:"Télécharger le plugin WordPress gratuit",wpNote:"Importez le ZIP dans les extensions WordPress, puis insérez un shortcode."},
 de:{title:"Geprüfte Anbieterkarte",info:"Nur bestätigte öffentliche Anbieterinformationen.",choose:"Anbieter wählen",claim:"SI/KI-Plattform beantragen (nach Prüfung)",wordpress:"WordPress-Plugin kostenlos herunterladen",wpNote:"ZIP unter WordPress-Plugins hochladen und einen Shortcode einfügen."},
 es:{title:"Ficha verificada de empresa",info:"Solo información pública verificada.",choose:"Elegir empresa",claim:"Solicitar la ficha de tu plataforma SI/IA (revisión)",wordpress:"Descargar plugin WordPress gratis",wpNote:"Sube el ZIP en Plugins de WordPress y usa un shortcode."},
 pt:{title:"Ficha verificada de empresa",info:"Somente dados públicos verificados.",choose:"Escolher empresa",claim:"Solicitar perfil da sua plataforma SI/IA (análise)",wordpress:"Baixar plugin gratuito para WordPress",wpNote:"Envie o ZIP em Plugins do WordPress e adicione um shortcode."},
 ar:{title:"بطاقة شركة تم التحقق منها",info:"تُعرض البيانات العامة المعتمدة فقط.",choose:"اختر الشركة",claim:"قدّم منصة SI/AI للمراجعة",wordpress:"تنزيل إضافة WordPress مجاناً",wpNote:"ارفع ملف ZIP في إضافات WordPress ثم أضف الرمز المختصر."}
};
export default function PartnerGrowthPortal(){
 const {lang}=useLingxiLang();const t=copy[lang]||copy.en;
 const [partner,setPartner]=useState("community");const [copied,setCopied]=useState<string|null>(null);
 const [vendors,setVendors]=useState<Array<{id:string;name:string}>>([]);
 const [vendor,setVendor]=useState("");
 useEffect(()=>{let active=true;fetch("/api/public/siai-widget",{credentials:"omit"})
  .then(r=>r.ok?r.json():Promise.reject(Error("feed")))
  .then(data=>{if(!active||!Array.isArray(data?.rows))return;
   const choices=data.rows.filter((r:unknown):r is {id:string;name:string}=>Boolean(r&&typeof r==="object"&&typeof (r as {id?:unknown}).id==="string"&&typeof (r as {name?:unknown}).name==="string"))
    .map((r:{id:string;name:string})=>({id:r.id,name:r.name}));
   setVendors(choices);setVendor(v=>v||choices[0]?.id||"");
  }).catch(()=>{});
  return()=>{active=false};
 },[]);
 const vc=vendorCopy[lang]||vendorCopy.en;
 const safe=partner.toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,32)||"community";
 const safeVendor=vendor.toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,64);
 const snippets=useMemo(()=>{
  const source="https://lingxifield.com/widgets/lingxifield-v1.js";
  const standard=(kind:string)=>'<script defer src="'+source+'" data-lx-widget="'+kind+'" data-lang="'+lang+'" data-partner="'+safe+'"></script>';
  return [standard("siai"),standard("tools"),
   '<script defer src="'+source+'" data-lx-widget="siai" data-vendor="'+safeVendor+'" data-lang="'+lang+'" data-partner="'+safe+'"></script>'];
 },[safe,lang,safeVendor]);
 async function copyCode(value:string,key:string){try{await navigator.clipboard.writeText(value);setCopied(key)}catch{setCopied(null)}}
 const box:CSSProperties={padding:22,border:"1px solid #dce4ee",borderRadius:18,background:"#fff",boxShadow:"0 4px 18px rgba(15,23,42,.04)"};
 return <main style={{padding:"44px 20px 70px",background:"#f7f9fe",minHeight:"70vh"}} dir={lang==="ar"?"rtl":"ltr"}>
  <div style={{maxWidth:1120,margin:"0 auto"}}>
   <div style={{color:"#245bd5",fontSize:15,fontWeight:750}}>{t.eyebrow} · LINGXIFIELD</div>
   <h1 style={{fontSize:"clamp(28px,4vw,43px)",lineHeight:1.25,margin:"14px 0",color:"#14213e",fontWeight:800}}>{t.title}</h1>
   <p style={{fontSize:17,lineHeight:1.8,maxWidth:790,color:"#52617b"}}>{t.intro}</p>
   <div style={{...box,margin:"26px 0"}}>
    <label style={{display:"block",fontSize:16,fontWeight:700,marginBottom:10}} htmlFor="partner-label">{t.partners}</label>
    <input id="partner-label" value={partner} maxLength={32} onChange={e=>setPartner(e.target.value)} style={{padding:12,fontSize:16,border:"1px solid #cdd7e6",borderRadius:10,width:"min(100%,400px)"}}/>
    <p style={{fontSize:14,color:"#65728a"}}>{t.partnerHint}</p>
    {vendors.length>0?<div style={{marginTop:18}}><label htmlFor="partner-vendor" style={{display:"block",fontSize:16,fontWeight:700,marginBottom:10}}>{vc.choose}</label>
     <select id="partner-vendor" value={vendor} onChange={e=>setVendor(e.target.value)} style={{padding:12,fontSize:16,border:"1px solid #cdd7e6",borderRadius:10,width:"min(100%,400px)"}}>
      {vendors.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
     </select></div>:null}
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:18}}>
    {[
     {id:"siai",title:t.siai,intro:t.siaiInfo},
     {id:"tools",title:t.qr,intro:t.qrInfo},
     ...(vendors.length?[{id:"vendor",title:vc.title,intro:vc.info}]:[])
    ].map((item,i)=><section key={item.id} style={box}>
     <h2 style={{fontSize:22,color:"#16213e",margin:"0 0 12px"}}>{item.title}</h2>
     <p style={{color:"#52617b",fontSize:15,minHeight:62,lineHeight:1.7}}>{item.intro}</p>
     <textarea readOnly aria-label={t.copy+" — "+item.title} value={snippets[i]} style={{width:"100%",height:120,border:"1px solid #d0d9e7",borderRadius:11,padding:12,fontSize:14,lineHeight:1.5,resize:"vertical",color:"#233354",background:"#f8faff"}}/>
     <button type="button" onClick={()=>void copyCode(snippets[i],item.id)} style={{border:0,borderRadius:10,padding:"12px 18px",marginTop:11,background:"#245bd5",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>{copied===item.id?t.copied:t.copy}</button>
    </section>)}
   </div>
   <section style={{...box,marginTop:22}}>
    <h2 style={{fontSize:21,fontWeight:750,color:"#16213e",margin:"0 0 8px"}}>WordPress</h2>
    <p style={{fontSize:15,lineHeight:1.7,color:"#52617b",margin:"0 0 14px"}}>{vc.wpNote}</p>
    <a href="/downloads/lingxifield-siai-wordpress.zip" download="lingxifield-siai-wordpress.zip"
       style={{display:"inline-block",background:"#245bd5",color:"#fff",borderRadius:10,padding:"12px 18px",fontWeight:700,fontSize:15,textDecoration:"none"}}>{vc.wordpress}</a>
   </section>
   <p style={{fontSize:15,color:"#54647d",marginTop:22}}>{t.example}</p>
   <div style={{display:"flex",gap:20,flexWrap:"wrap",padding:"24px 0"}}>
    <a href="/siai/updates.xml" style={{fontSize:16,color:"#1757be"}}>{t.feed}</a>
    <a href="/siai-openapi.json" style={{fontSize:16,color:"#1757be"}}>API · OpenAPI</a>
    <Link href="/siai" style={{fontSize:16,color:"#1757be"}}>{t.update}</Link>
    <Link href="/tools" style={{fontSize:16,color:"#1757be"}}>{t.community}</Link>
    <Link href={vendor?"/siai/claim?product="+encodeURIComponent(vendor)+"&name="+encodeURIComponent(vendors.find(r=>r.id===vendor)?.name||""):"/siai/claim"} style={{fontSize:16,color:"#1757be",fontWeight:700}}>{vc.claim}</Link>
   </div>
   <p style={{fontSize:14,color:"#65728a"}}>{t.rules} · {t.note}</p>
  </div>
 </main>;
}
