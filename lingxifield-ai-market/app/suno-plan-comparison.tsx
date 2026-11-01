import type {Language} from '../lib/v2';
import {SUNO_PLANS} from '../lib/market-suno-pricing';

type Copy={
 monthly:string;annual:string;annualEquivalentLabel:string;credits:string;downloads:string;models:string;generation:string;upload:string;stems:string;
 freeDaily:string;freeDownload:string;freeTrial:string;freeCommercial:string;paidCommercial:string;studio:string;
 reset:string;rights:string;official:string;modelSource:string;terms:string;downloadsSource:string;remixSource:string;save:string;
};

const COPY:Record<Language,Copy>={
 zh:{
  monthly:"月付",annual:"年付",annualEquivalentLabel:"折合每月",credits:"积分/月",downloads:"下载歌曲/月",models:"模型",generation:"单次生成最长 8 分钟",upload:"付费套餐音频上传最长 30 分钟",stems:"音轨分离",
  freeDaily:"每日 50 积分 · v6-mini",freeDownload:"没有固定月度歌曲下载名额",freeTrial:"2026-09-03 前注册的部分账户最多有 7 次终身试用下载；之后注册的账户可能偶尔获得试用下载",freeCommercial:"免费作品仅限个人非商业使用",paidCommercial:"付费订阅期间创作并按套餐下载规则取得的作品可商用",studio:"Premier 包含 Suno Studio：MIDI、效果器、自动化与插件",
  reset:"Pro/Premier 下载额度按账单日每月重置，未使用额度不结转；同一首歌的多种格式下载只计一次，音轨下载计入歌曲下载额度；额外下载按官方规则购买。",rights:"商用许可不等于保证作品一定取得版权；上传歌词、音频、图片及声音素材前，必须拥有相应权利。",
  official:"官方套餐与价格",modelSource:"官方模型说明",terms:"商用与服务条款",downloadsSource:"下载规则",remixSource:"Remix 规则",save:"节省"
 },
 en:{
  monthly:"Monthly",annual:"Annual",annualEquivalentLabel:"per month equivalent",credits:"credits/month",downloads:"song downloads/month",models:"Models",generation:"Up to 8 minutes per generation",upload:"Audio uploads up to 30 minutes on paid plans",stems:"stem separation",
  freeDaily:"50 daily credits · v6-mini",freeDownload:"No fixed monthly song-download allocation",freeTrial:"Some accounts created before 3 Sep 2026 have up to 7 lifetime trial downloads; later accounts may occasionally receive trial downloads",freeCommercial:"Free outputs are for personal, non-commercial use only",paidCommercial:"Eligible songs created while subscribed and downloaded under the plan may be used commercially",studio:"Premier includes Suno Studio: MIDI, effects, automation and plugins",
  reset:"Pro/Premier downloads reset on the monthly billing date; unused downloads do not roll over. Multiple formats of the same song count once. Stems count toward song-download allowances; extra downloads follow Suno's published rules.",rights:"Commercial-use permission does not guarantee copyright protection. You must have rights to uploaded lyrics, audio, images and voice material.",
  official:"Official plans and prices",modelSource:"Official model guide",terms:"Commercial-use terms",downloadsSource:"Download rules",remixSource:"Remix rules",save:"saved"
 },
 ja:{
  monthly:"月払い",annual:"年払い",annualEquivalentLabel:"月額換算",credits:"クレジット/月",downloads:"曲のダウンロード/月",models:"モデル",generation:"1回の生成は最大8分",upload:"有料プランの音声アップロードは最大30分",stems:"ステム分離",
  freeDaily:"毎日50クレジット · v6-mini",freeDownload:"月間の固定ダウンロード枠なし",freeTrial:"2026年9月3日より前の一部アカウントは生涯最大7回の試用ダウンロード。以降のアカウントには不定期で提供される場合があります",freeCommercial:"無料作品は個人・非商用のみ",paidCommercial:"有料期間中に作成し、プラン条件に従ってダウンロードした曲は商用利用可能",studio:"PremierにはSuno Studio（MIDI、エフェクト、自動化、プラグイン）が含まれます",
  reset:"Pro/Premierのダウンロード枠は請求日に毎月リセットされ、未使用分は繰り越されません。同じ曲の複数形式は1回として計算され、ステムも曲のダウンロード枠に含まれます。",rights:"商用利用許可は著作権保護を保証しません。アップロード素材の権利を確認してください。",
  official:"公式プランと価格",modelSource:"公式モデル説明",terms:"商用利用規約",downloadsSource:"ダウンロード規則",remixSource:"Remix規則",save:"節約"
 },
 ko:{
  monthly:"월간",annual:"연간",annualEquivalentLabel:"월 환산",credits:"크레딧/월",downloads:"곡 다운로드/월",models:"모델",generation:"1회 생성 최대 8분",upload:"유료 요금제 오디오 업로드 최대 30분",stems:"스템 분리",
  freeDaily:"매일 50 크레딧 · v6-mini",freeDownload:"고정 월간 다운로드 한도 없음",freeTrial:"2026년 9월 3일 이전 가입한 일부 계정은 평생 최대 7회 체험 다운로드를 보유합니다. 이후 계정은 가끔 체험 다운로드를 받을 수 있습니다",freeCommercial:"무료 작품은 개인·비상업적 용도만 가능",paidCommercial:"유료 구독 중 생성하고 요금제 조건에 따라 다운로드한 곡은 상업적으로 사용 가능",studio:"Premier에는 Suno Studio(MIDI, 효과, 자동화, 플러그인)가 포함됩니다",
  reset:"Pro/Premier 다운로드는 결제일에 매월 초기화되며 미사용분은 이월되지 않습니다. 같은 곡의 여러 형식은 1회로 계산되고 스템은 곡 다운로드 한도에 포함됩니다.",rights:"상업적 이용 허가는 저작권 보호를 보장하지 않습니다. 업로드 자료의 권리를 확인하세요.",
  official:"공식 요금제 및 가격",modelSource:"공식 모델 안내",terms:"상업적 이용 약관",downloadsSource:"다운로드 규칙",remixSource:"Remix 규칙",save:"절약"
 },
 fr:{
  monthly:"Mensuel",annual:"Annuel",annualEquivalentLabel:"par mois avec facturation annuelle",credits:"crédits/mois",downloads:"téléchargements/mois",models:"Modèles",generation:"Jusqu’à 8 minutes par génération",upload:"Audio jusqu’à 30 minutes avec un forfait payant",stems:"séparation des pistes",
  freeDaily:"50 crédits par jour · v6-mini",freeDownload:"Aucun quota mensuel fixe de téléchargement",freeTrial:"Certains comptes créés avant le 3 septembre 2026 ont jusqu’à 7 téléchargements d’essai à vie ; les comptes ultérieurs peuvent en recevoir occasionnellement",freeCommercial:"Les créations gratuites sont réservées à un usage personnel non commercial",paidCommercial:"Les titres créés pendant l’abonnement et téléchargés selon le forfait peuvent être utilisés commercialement",studio:"Premier inclut Suno Studio : MIDI, effets, automatisation et plugins",
  reset:"Les téléchargements Pro/Premier sont réinitialisés à la date de facturation ; les téléchargements inutilisés ne sont pas reportés. Plusieurs formats du même titre comptent une fois ; les pistes séparées sont incluses.",rights:"L’autorisation commerciale ne garantit pas la protection du droit d’auteur. Vérifiez les droits sur les éléments téléversés.",
  official:"Forfaits et tarifs officiels",modelSource:"Guide officiel des modèles",terms:"Conditions commerciales",downloadsSource:"Règles de téléchargement",remixSource:"Règles de remix",save:"économisés"
 },
 de:{
  monthly:"Monatlich",annual:"Jährlich",annualEquivalentLabel:"pro Monat bei Jahreszahlung",credits:"Credits/Monat",downloads:"Downloads/Monat",models:"Modelle",generation:"Bis zu 8 Minuten je Generierung",upload:"Audio-Upload bis zu 30 Minuten bei bezahlten Tarifen",stems:"Stem-Trennung",
  freeDaily:"50 Credits täglich · v6-mini",freeDownload:"Kein festes monatliches Download-Kontingent",freeTrial:"Einige vor dem 3. September 2026 erstellte Konten haben bis zu 7 lebenslange Testdownloads; spätere Konten erhalten gelegentlich Testdownloads",freeCommercial:"Kostenlose Ausgaben sind nur privat und nicht kommerziell nutzbar",paidCommercial:"Während des Abos erstellte und tarifgemäß heruntergeladene Songs dürfen kommerziell genutzt werden",studio:"Premier enthält Suno Studio: MIDI, Effekte, Automatisierung und Plugins",
  reset:"Pro/Premier-Downloads werden am monatlichen Abrechnungstag zurückgesetzt; ungenutzte Downloads verfallen. Mehrere Formate desselben Songs zählen einmal; Stems sind enthalten.",rights:"Die kommerzielle Nutzung garantiert keinen Urheberrechtsschutz. Prüfen Sie die Rechte an hochgeladenem Material.",
  official:"Offizielle Tarife und Preise",modelSource:"Offizielle Modellübersicht",terms:"Bedingungen zur kommerziellen Nutzung",downloadsSource:"Download-Regeln",remixSource:"Remix-Regeln",save:"Ersparnis"
 },
 es:{
  monthly:"Mensual",annual:"Anual",annualEquivalentLabel:"al mes con facturación anual",credits:"créditos/mes",downloads:"descargas/mes",models:"Modelos",generation:"Hasta 8 minutos por generación",upload:"Carga de audio hasta 30 minutos en planes de pago",stems:"separación de pistas",
  freeDaily:"50 créditos diarios · v6-mini",freeDownload:"Sin cuota mensual fija de descargas",freeTrial:"Algunas cuentas creadas antes del 3 de septiembre de 2026 tienen hasta 7 descargas de prueba de por vida; las cuentas posteriores pueden recibir pruebas ocasionales",freeCommercial:"Las creaciones gratuitas son solo para uso personal no comercial",paidCommercial:"Las canciones creadas durante la suscripción y descargadas según el plan pueden usarse comercialmente",studio:"Premier incluye Suno Studio: MIDI, efectos, automatización y plugins",
  reset:"Las descargas Pro/Premier se reinician en la fecha de facturación; las no utilizadas no se acumulan. Varios formatos de una canción cuentan como una descarga; los stems están incluidos.",rights:"El permiso comercial no garantiza protección de derechos de autor. Verifica los derechos del material subido.",
  official:"Planes y precios oficiales",modelSource:"Guía oficial de modelos",terms:"Condiciones de uso comercial",downloadsSource:"Reglas de descarga",remixSource:"Reglas de Remix",save:"ahorro"
 },
 pt:{
  monthly:"Mensal",annual:"Anual",annualEquivalentLabel:"por mês na cobrança anual",credits:"créditos/mês",downloads:"downloads/mês",models:"Modelos",generation:"Até 8 minutos por geração",upload:"Upload de áudio até 30 minutos nos planos pagos",stems:"separação de stems",
  freeDaily:"50 créditos diários · v6-mini",freeDownload:"Sem cota mensal fixa de downloads",freeTrial:"Algumas contas criadas antes de 3 de setembro de 2026 têm até 7 downloads de teste vitalícios; contas posteriores podem receber testes ocasionais",freeCommercial:"Criações gratuitas são apenas para uso pessoal não comercial",paidCommercial:"Músicas criadas durante a assinatura e baixadas conforme o plano podem ser usadas comercialmente",studio:"Premier inclui Suno Studio: MIDI, efeitos, automação e plugins",
  reset:"Os downloads Pro/Premier reiniciam na data de cobrança; os não usados não acumulam. Vários formatos da mesma música contam como um download; stems estão incluídos.",rights:"A permissão comercial não garante proteção de direitos autorais. Confirme os direitos do material enviado.",
  official:"Planos e preços oficiais",modelSource:"Guia oficial de modelos",terms:"Termos de uso comercial",downloadsSource:"Regras de download",remixSource:"Regras de Remix",save:"economia"
 },
 ar:{
  monthly:"شهري",annual:"سنوي",annualEquivalentLabel:"شهرياً عند الدفع السنوي",credits:"رصيد/شهر",downloads:"تنزيلات/شهر",models:"النماذج",generation:"حتى 8 دقائق لكل إنشاء",upload:"رفع صوت حتى 30 دقيقة في الخطط المدفوعة",stems:"فصل المسارات",
  freeDaily:"50 رصيداً يومياً · v6-mini",freeDownload:"لا توجد حصة شهرية ثابتة للتنزيل",freeTrial:"بعض الحسابات المنشأة قبل 3 سبتمبر 2026 لديها حتى 7 تنزيلات تجريبية مدى الحياة؛ وقد تحصل الحسابات الأحدث على تجارب متفرقة",freeCommercial:"المخرجات المجانية للاستخدام الشخصي غير التجاري فقط",paidCommercial:"يمكن استخدام الأغاني المنشأة أثناء الاشتراك والمنزلة وفق الخطة تجارياً",studio:"تتضمن Premier منصة Suno Studio: MIDI والمؤثرات والأتمتة والإضافات",
  reset:"تُعاد تنزيلات Pro/Premier في تاريخ الفوترة الشهري ولا يُرحّل غير المستخدم. تُحسب صيغ الأغنية الواحدة كتنزيل واحد وتشمل المسارات المنفصلة.",rights:"الإذن التجاري لا يضمن حماية حقوق النشر. تحقق من حقوق المواد المرفوعة.",
  official:"الخطط والأسعار الرسمية",modelSource:"دليل النماذج الرسمي",terms:"شروط الاستخدام التجاري",downloadsSource:"قواعد التنزيل",remixSource:"قواعد Remix",save:"توفير"
 }
};

export default function SunoPlanComparison({language}:{language:Language}){
 const t=COPY[language];
 const pro=SUNO_PLANS.plans[0];
 const premier=SUNO_PLANS.plans[1];
 const cards=[
  {id:"free",name:"Free",monthly:"$0",annual:"—",equivalent:"",saving:"",items:[t.freeDaily,t.freeDownload,t.freeTrial,t.freeCommercial]},
  {id:"pro",name:"Pro",monthly:"$"+pro.monthlyPriceUsd,annual:"$"+pro.annualTotalUsd,equivalent:"$"+pro.monthlyEquivalentUsd,saving:"$"+pro.annualSavingsUsd,items:[
   pro.monthlyCredits.toLocaleString()+" "+t.credits,pro.monthlyDownloads+" "+t.downloads,t.models+": v6 / v6-wild / v6-mini",t.generation,t.upload,pro.stemSeparationTypes+" "+t.stems,t.paidCommercial
  ]},
  {id:"premier",name:"Premier",monthly:"$"+premier.monthlyPriceUsd,annual:"$"+premier.annualTotalUsd,equivalent:"$"+premier.monthlyEquivalentUsd,saving:"$"+premier.annualSavingsUsd,items:[
   premier.monthlyCredits.toLocaleString()+" "+t.credits,premier.monthlyDownloads+" "+t.downloads,t.models+": v6 / v6-wild / v6-mini",t.generation,t.upload,premier.stemSeparationTypes+" "+t.stems,t.studio,t.paidCommercial
  ]}
 ];
 return <div className="sunoPlanCompare" dir={language==="ar"?"rtl":"ltr"}>
  <div className="sunoPlanCards">
   {cards.map(card=><article className={"sunoPlanCard sunoPlan-"+card.id} key={card.id}>
    <div className="sunoPlanTitle">
     <h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small>
    </div>
    {card.id!=="free"?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.equivalent} {t.annualEquivalentLabel} · {t.save} {card.saving}</div>:null}
    <ul>{card.items.map((item,i)=><li key={card.id+"-"+i}>{item}</li>)}</ul>
   </article>)}
  </div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
   <a href={SUNO_PLANS.downloadHelpSource} target="_blank" rel="nofollow noopener noreferrer">{t.downloadsSource} ↗</a>
   <a href={SUNO_PLANS.remixHelpSource} target="_blank" rel="nofollow noopener noreferrer">{t.remixSource} ↗</a>
  </div>
 </div>;
}
