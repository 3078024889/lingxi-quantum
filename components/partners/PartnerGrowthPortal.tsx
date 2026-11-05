"use client";
import {useMemo,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";

const copy:Record<LingxiLang,{eyebrow:string;title:string;intro:string;partners:string;partnerHint:string;siai:string;siaiInfo:string;qr:string;qrInfo:string;copy:string;copied:string;example:string;feed:string;update:string;rules:string;community:string;note:string}>={
 zh:{eyebrow:"全球合作伙伴",title:"把真正好用的工具，带给你的读者",intro:"不需要注册或付费。将小组件放进你的网站，访客可直接查询全球 SIAI 厂商资料或创建公开链接二维码。",partners:"你的合作标识",partnerHint:"英文、数字、下划线或短横线，最多 32 位；只用于统计流量来源",siai:"全球 SIAI 资料组件",siaiInfo:"实时读取已审核的公开厂商资料，新增的已审核平台自动进入列表。未审核资料不会对外分发。",qr:"免费二维码组件",qrInfo:"读者可将公开网址制成二维码，不要求创建账户。",copy:"复制安装代码",copied:"已复制",example:"安装步骤：复制代码，放入网页 HTML 中需要展示的位置。",feed:"订阅已审核资料更新",update:"查看全球 SIAI 排行榜",rules:"只统计真实访客",community:"更多免费工具",note:"尊重访客隐私；不收集嵌入网站的访问者邮箱或联系方式。"},
 en:{eyebrow:"Global partners",title:"Useful tools for your visitors",intro:"No sign-up or payment required. Embed a live, verified SIAI directory or public-link QR generator on your site.",partners:"Partner label",partnerHint:"Letters, numbers, underscores or hyphens, up to 32 characters; for source attribution only",siai:"Global SIAI directory widget",siaiInfo:"Shows approved public profiles. Newly approved platforms appear automatically when the directory is updated.",qr:"Free QR widget",qrInfo:"Visitors can turn public website links into QR codes without signing up.",copy:"Copy embed code",copied:"Copied",example:"Paste the code into your website HTML wherever you want the widget.",feed:"Subscribe to verified updates",update:"Explore SIAI rankings",rules:"Real visitors only",community:"Explore free tools",note:"No visitor email addresses or contact details are collected by the widget."},
 ja:{eyebrow:"世界のパートナー",title:"読者に便利なツールを提供",intro:"登録も支払いも不要。SIAI企業情報と公開URLのQR作成を埋め込めます。",partners:"パートナー識別子",partnerHint:"英数字・_・-、最大32文字。流入元の識別のみ",siai:"SIAI企業一覧ウィジェット",siaiInfo:"確認済みの公開情報のみ表示。承認後は自動で更新されます。",qr:"無料QRウィジェット",qrInfo:"公開URLからQRを作成できます。",copy:"コードをコピー",copied:"コピー済み",example:"コードをウェブページのHTMLに貼り付けます。",feed:"確認済みの更新を購読",update:"SIAIランキング",rules:"実際の訪問者のみ",community:"無料ツール",note:"訪問者のメールアドレスは収集しません。"},
 ko:{eyebrow:"글로벌 파트너",title:"방문자에게 유용한 도구 제공",intro:"가입 없이 SIAI 디렉터리와 QR 생성기를 삽입하세요.",partners:"파트너 표시",partnerHint:"영문/숫자/_/-, 최대 32자",siai:"SIAI 디렉터리",siaiInfo:"검증된 공개 정보만 표시하며 승인된 자료가 자동 업데이트됩니다.",qr:"무료 QR 도구",qrInfo:"공개 웹 주소로 QR 코드를 만들 수 있습니다.",copy:"코드 복사",copied:"복사 완료",example:"웹페이지 HTML에 코드를 붙여 넣으세요.",feed:"업데이트 구독",update:"SIAI 순위",rules:"실제 방문만 집계",community:"무료 도구",note:"방문자의 이메일을 수집하지 않습니다."},
 fr:{eyebrow:"Partenaires mondiaux",title:"Des outils utiles pour vos visiteurs",intro:"Sans inscription : intégrez l'annuaire SIAI et un créateur de QR.",partners:"Identifiant partenaire",partnerHint:"Lettres, chiffres, _ ou -, maximum 32 caractères",siai:"Widget annuaire SIAI",siaiInfo:"Uniquement les fiches vérifiées, mises à jour après validation.",qr:"QR gratuit",qrInfo:"Crée des QR pour des URL publiques.",copy:"Copier le code",copied:"Copié",example:"Collez le code dans le HTML de votre site.",feed:"Suivre les mises à jour",update:"Classement SIAI",rules:"Trafic réel uniquement",community:"Outils gratuits",note:"Aucune adresse e-mail de visiteur n'est collectée."},
 de:{eyebrow:"Globale Partner",title:"Nützliche Tools für Ihre Besucher",intro:"Ohne Anmeldung: SIAI-Verzeichnis und QR-Generator einbinden.",partners:"Partnerkennung",partnerHint:"Buchstaben, Zahlen, _ oder -, max. 32 Zeichen",siai:"SIAI-Verzeichnis",siaiInfo:"Nur geprüfte öffentliche Datensätze, automatisch aktualisiert.",qr:"Gratis QR-Widget",qrInfo:"QR-Codes für öffentliche URLs.",copy:"Code kopieren",copied:"Kopiert",example:"Code in das HTML Ihrer Website einfügen.",feed:"Updates abonnieren",update:"SIAI-Ranking",rules:"Nur echte Besuche",community:"Gratis-Tools",note:"Es werden keine Besucher-E-Mail-Adressen erfasst."},
 es:{eyebrow:"Socios globales",title:"Herramientas para tus visitantes",intro:"Sin registro: integra el directorio SIAI y un generador QR.",partners:"Identificador del socio",partnerHint:"Letras, números, _ o -, máximo 32 caracteres",siai:"Directorio SIAI",siaiInfo:"Solo perfiles verificados. Actualización tras aprobación.",qr:"QR gratis",qrInfo:"Códigos QR para enlaces web públicos.",copy:"Copiar código",copied:"Copiado",example:"Pega el código en el HTML de tu sitio.",feed:"Seguir actualizaciones",update:"Ranking SIAI",rules:"Solo tráfico real",community:"Herramientas gratis",note:"No se recopilan correos de visitantes."},
 pt:{eyebrow:"Parceiros globais",title:"Ferramentas para seus visitantes",intro:"Sem cadastro: incorpore o diretório SIAI e um gerador de QR.",partners:"Identificador do parceiro",partnerHint:"Letras, números, _ ou -, até 32 caracteres",siai:"Diretório SIAI",siaiInfo:"Apenas perfis verificados, atualizados após aprovação.",qr:"QR gratuito",qrInfo:"QR para endereços públicos.",copy:"Copiar código",copied:"Copiado",example:"Cole o código no HTML do seu site.",feed:"Acompanhar atualizações",update:"Ranking SIAI",rules:"Apenas visitas reais",community:"Ferramentas grátis",note:"Não coletamos e-mails de visitantes."},
 ar:{eyebrow:"الشركاء حول العالم",title:"أدوات مفيدة لزوار موقعك",intro:"بدون تسجيل: أضف دليل SIAI وصانع QR لموقعك.",partners:"معرّف الشريك",partnerHint:"حروف وأرقام و_ و- بحد أقصى 32",siai:"دليل SIAI",siaiInfo:"البيانات العامة التي تم التحقق منها فقط، وتُحدّث عند الاعتماد.",qr:"مولد QR مجاني",qrInfo:"رموز QR للروابط العامة.",copy:"نسخ الكود",copied:"تم النسخ",example:"الصق الكود في HTML لموقعك.",feed:"الاشتراك في التحديثات",update:"ترتيب SIAI",rules:"الزيارات الحقيقية فقط",community:"الأدوات المجانية",note:"لا نجمع عناوين البريد الإلكتروني للزوار."}
};
export default function PartnerGrowthPortal(){
 const {lang}=useLingxiLang();const t=copy[lang]||copy.en;
 const [partner,setPartner]=useState("community");const [copied,setCopied]=useState<string|null>(null);
 const safe=partner.toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,32)||"community";
 const snippets=useMemo(()=>["siai","tools"].map(kind=>'<script defer src="https://lingxifield.com/widgets/lingxifield-v1.js" data-lx-widget="'+kind+'" data-lang="'+lang+'" data-partner="'+safe+'"></script>'),[safe,lang]);
 async function copyCode(value:string,key:string){try{await navigator.clipboard.writeText(value);setCopied(key)}catch{setCopied(null)}}
 const box:React.CSSProperties={padding:22,border:"1px solid #dce4ee",borderRadius:18,background:"#fff",boxShadow:"0 4px 18px rgba(15,23,42,.04)"};
 return <main style={{padding:"44px 20px 70px",background:"#f7f9fe",minHeight:"70vh"}} dir={lang==="ar"?"rtl":"ltr"}>
  <div style={{maxWidth:1120,margin:"0 auto"}}>
   <div style={{color:"#245bd5",fontSize:15,fontWeight:750}}>{t.eyebrow} · LINGXIFIELD</div>
   <h1 style={{fontSize:"clamp(28px,4vw,43px)",lineHeight:1.25,margin:"14px 0",color:"#14213e",fontWeight:800}}>{t.title}</h1>
   <p style={{fontSize:17,lineHeight:1.8,maxWidth:790,color:"#52617b"}}>{t.intro}</p>
   <div style={{...box,margin:"26px 0"}}>
    <label style={{display:"block",fontSize:16,fontWeight:700,marginBottom:10}} htmlFor="partner-label">{t.partners}</label>
    <input id="partner-label" value={partner} maxLength={32} onChange={e=>setPartner(e.target.value)} style={{padding:12,fontSize:16,border:"1px solid #cdd7e6",borderRadius:10,width:"min(100%,400px)"}}/>
    <p style={{fontSize:14,color:"#65728a"}}>{t.partnerHint}</p>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:18}}>
    {([{id:"siai",title:t.siai,intro:t.siaiInfo},{id:"tools",title:t.qr,intro:t.qrInfo}] as const).map((item,i)=><section key={item.id} style={box}>
     <h2 style={{fontSize:22,color:"#16213e",margin:"0 0 12px"}}>{item.title}</h2>
     <p style={{color:"#52617b",fontSize:15,minHeight:62,lineHeight:1.7}}>{item.intro}</p>
     <textarea readOnly aria-label={t.copy+" — "+item.title} value={snippets[i]} style={{width:"100%",height:120,border:"1px solid #d0d9e7",borderRadius:11,padding:12,fontSize:14,lineHeight:1.5,resize:"vertical",color:"#233354",background:"#f8faff"}}/>
     <button type="button" onClick={()=>void copyCode(snippets[i],item.id)} style={{border:0,borderRadius:10,padding:"12px 18px",marginTop:11,background:"#245bd5",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>{copied===item.id?t.copied:t.copy}</button>
    </section>)}
   </div>
   <p style={{fontSize:15,color:"#54647d",marginTop:22}}>{t.example}</p>
   <div style={{display:"flex",gap:20,flexWrap:"wrap",padding:"24px 0"}}>
    <a href="/siai/updates.xml" style={{fontSize:16,color:"#1757be"}}>{t.feed}</a>
    <a href="/siai" style={{fontSize:16,color:"#1757be"}}>{t.update}</a>
    <a href="/tools" style={{fontSize:16,color:"#1757be"}}>{t.community}</a>
   </div>
   <p style={{fontSize:14,color:"#65728a"}}>{t.rules} · {t.note}</p>
  </div>
 </main>;
}
