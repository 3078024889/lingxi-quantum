import type {Language} from '../lib/v2';
import {SUNO_PLANS} from '../lib/market-suno-pricing';

type Copy={
 monthly:string;annual:string;annualEquivalentLabel:string;credits:string;downloads:string;models:string;generation:string;upload:string;stems:string;
 freeDaily:string;freeDownload:string;freeTrial:string;freeCommercial:string;paidCommercial:string;studio:string;
 reset:string;rights:string;official:string;modelSource:string;terms:string;downloadsSource:string;remixSource:string;save:string;
};
const COPY:Record<Language,Copy>={
 zh:{monthly:'月付',annual:'年付',annualEquivalentLabel:'折合每月',credits:'积分/月',downloads:'下载歌曲/月',models:'模型',generation:'单次生成最长 8 分钟',upload:'音频上传最长 30 分钟',stems:'音轨分离',freeDaily:'每日 50 积分 · v6-mini',freeDownload:'无固定月度下载名额',freeTrial:'2026-09-03 前注册的部分账户最多有 7 次终身试用下载；之后注册账户可能偶尔获得试用下载',freeCommercial:'仅限个人非商业使用',paidCommercial:'付费期创作并按规则下载的歌曲可商用',studio:'包含 Suno Studio：MIDI、效果器、自动化与插件',reset:'Pro/Premier 下载额度按账单日每月重置，未使用额度不结转；同一首歌的多种格式下载只计一次，音轨下载包含在歌曲下载额度内，可按官方规则购买额外下载；Suno Studio 工作流不受歌曲下载额度限制。',rights:'商用许可不等于保证作品一定取得版权；上传歌词、音频、图片及声音素材前，必须拥有相应权利。',official:'官方套餐与价格',modelSource:'官方模型说明',terms:'商用与服务条款',downloadsSource:'下载规则',remixSource:'Remix 规则',save:'节省'},
 en:{monthly:'Monthly',annual:'Annual',annualEquivalentLabel:'per month equivalent',credits:'credits/month',downloads:'downloads/month',models:'Models',generation:'Up to 8 minutes per generation',upload:'Audio upload up to 30 minutes',stems:'stem separation',freeDaily:'50 daily credits · v6-mini',freeDownload:'No fixed monthly download allocation',freeTrial:'Some accounts created before 3 Sep 2026 have up to 7 lifetime trial downloads; later accounts may occasionally receive trials',freeCommercial:'Personal, non-commercial use only',paidCommercial:'Eligible songs created while subscribed and downloaded under the plan may be used commercially',studio:'Includes Suno Studio: MIDI, effects, automation and plugins',reset:'Pro/Premier downloads reset on the monthly billing date; unused downloads do not roll over. Multiple formats of the same song count once, stems are included, extra downloads may be purchased, and Suno Studio workflows are not subject to these download limits.',rights:'Commercial-use permission does not guarantee copyright protection. You must have rights to uploaded lyrics, audio, images and voice material.',official:'Official plans and prices',modelSource:'Official model guide',terms:'Commercial-use terms',downloadsSource:'Download rules',remixSource:'Remix rules',save:'save'},
 ja:{monthly:'月払い',annual:'年払い',annualEquivalentLabel:'月額換算',credits:'クレジット/月',downloads:'ダウンロード/月',models:'モデル',generation:'1回の生成は最大8分',upload:'音声アップロード最大30分',stems:'ステム分離',freeDaily:'毎日50クレジット · v6-mini',freeDownload:'月間の固定ダウンロード枠なし',freeTrial:'一部の旧アカウントは生涯最大7回。新しいアカウントには不定期で試用が提供される場合があります',freeCommercial:'個人・非商用のみ',paidCommercial:'有料期間中に作成し、プラン条件に従ってダウンロードした曲は商用利用可能',studio:'Suno Studio：MIDI、エフェクト、自動化、プラグイン',reset:'Pro/Premierのダウンロード枠は請求日に毎月リセットされ、未使用分は繰り越されません。同じ曲の複数形式は1回として計算され、ステムは曲のダウンロードに含まれます。',rights:'商用利用許可は著作権保護を保証しません。アップロード素材の権利を確認してください。',official:'公式プランと価格',modelSource:'公式モデル説明',terms:'商用利用規約',downloadsSource:'ダウンロード規則',remixSource:'Remix規則',save:'節約'},
 ko:{monthly:'월간',annual:'연간',annualEquivalentLabel:'월 환산',credits:'크레딧/월',downloads:'다운로드/월',models:'모델',generation:'1회 생성 최대 8분',upload:'오디오 업로드 최대 30분',stems:'스템 분리',freeDaily:'매일 50 크레딧 · v6-mini',freeDownload:'고정 월간 다운로드 한도 없음',freeTrial:'일부 기존 계정은 평생 최대 7회, 신규 계정은 가끔 체험 다운로드 제공 가능',freeCommercial:'개인·비상업적 용도만',paidCommercial:'유료 구독 중 생성하고 요금제 조건에 따라 다운로드한 곡은 상업적으로 사용 가능',studio:'Suno Studio 포함: MIDI, 효과, 자동화, 플러그인',reset:'Pro/Premier 다운로드는 결제일에 매월 초기화되며 미사용분은 이월되지 않습니다. 같은 곡의 여러 형식은 1회로 계산되고 스템은 곡 다운로드에 포함됩니다.',rights:'상업적 이용 허가는 저작권 보호를 보장하지 않습니다. 업로드 자료의 권리를 확인하세요.',official:'공식 요금제 및 가격',modelSource:'공식 모델 안내',terms:'상업적 이용 약관',downloadsSource:'다운로드 규칙',remixSource:'Remix 규칙',save:'절약'},
 fr:{monthly:'Mensuel',annual:'Annuel',annualEquivalentLabel:'équivalent mensuel',credits:'crédits/mois',downloads:'téléchargements/mois',models:'Modèles',generation:'Jusqu’à 8 minutes par génération',upload:'Audio jusqu’à 30 minutes',stems:'séparation des pistes',freeDaily:'50 crédits/jour · v6-mini',freeDownload:'Aucun quota mensuel fixe',freeTrial:'Certains anciens comptes ont jusqu’à 7 essais à vie ; les nouveaux comptes peuvent en recevoir occasionnellement',freeCommercial:'Usage personnel non commercial uniquement',paidCommercial:'Les titres créés pendant l’abonnement et téléchargés selon le forfait peuvent être utilisés commercialement',studio:'Suno Studio : MIDI, effets, automatisation et plugins',reset:'Les téléchargements Pro/Premier sont réinitialisés à la date de facturation ; les téléchargements inutilisés ne sont pas reportés. Plusieurs formats du même titre comptent une fois ; les pistes séparées sont incluses.',rights:'L’autorisation commerciale ne garantit pas la protection du droit d’auteur. Vérifiez les droits sur les éléments téléversés.',official:'Forfaits et tarifs officiels',modelSource:'Guide officiel des modèles',terms:'Conditions commerciales',downloadsSource:'Règles de téléchargement',remixSource:'Règles de remix',save:'économisés'},
 de:{monthly:'Monatlich',annual:'Jährlich',annualEquivalentLabel:'Monatswert',credits:'Credits/Monat',downloads:'Downloads/Monat',models:'Modelle',generation:'Bis zu 8 Minuten je Generierung',upload:'Audio-Upload bis zu 30 Minuten',stems:'Stem-Trennung',freeDaily:'50 Credits täglich · v6-mini',freeDownload:'Kein festes monatliches Download-Kontingent',freeTrial:'Einige vor dem 3. September 2026 erstellte Konten haben bis zu 7 lebenslange Testdownloads; spätere Konten erhalten gelegentlich Testdownloads',freeCommercial:'Nur private, nicht kommerzielle Nutzung',paidCommercial:'Während des Abos erstellte und tarifgemäß heruntergeladene Songs dürfen kommerziell genutzt werden',studio:'Suno Studio: MIDI, Effekte, Automatisierung und Plugins',reset:'Pro/Premier-Downloads werden am monatlichen Abrechnungstag zurückgesetzt; ungenutzte Downloads verfallen. Mehrere Formate desselben Songs zählen einmal; Stems sind enthalten.',rights:'Die kommerzielle Nutzung garantiert keinen Urheberrechtsschutz. Prüfen Sie die Rechte an hochgeladenem Material.',official:'Offizielle Tarife und Preise',modelSource:'Offizielle Modellübersicht',terms:'Bedingungen zur kommerziellen Nutzung',downloadsSource:'Download-Regeln',remixSource:'Remix-Regeln',save:'Ersparnis'},
 es:{monthly:'Mensual',annual:'Anual',annualEquivalentLabel:'equivalente mensual',credits:'créditos/mes',downloads:'descargas/mes',models:'Modelos',generation:'Hasta 8 minutos por generación',upload:'Carga de audio hasta 30 minutos',stems:'separación de pistas',freeDaily:'50 créditos diarios · v6-mini',freeDownload:'Sin cuota mensual fija',freeTrial:'Algunas cuentas antiguas tienen hasta 7 pruebas de por vida; las nuevas pueden recibir pruebas ocasionales',freeCommercial:'Solo uso personal no comercial',paidCommercial:'Las canciones creadas durante la suscripción y descargadas según el plan pueden usarse comercialmente',studio:'Suno Studio: MIDI, efectos, automatización y plugins',reset:'Las descargas Pro/Premier se reinician en la fecha de facturación; las no utilizadas no se acumulan. Varios formatos de una canción cuentan como una descarga; los stems están incluidos.',rights:'El permiso comercial no garantiza protección de derechos de autor. Verifica los derechos del material subido.',official:'Planes y precios oficiales',modelSource:'Guía oficial de modelos',terms:'Condiciones de uso comercial',downloadsSource:'Reglas de descarga',remixSource:'Reglas de Remix',save:'ahorro'},
 pt:{monthly:'Mensal',annual:'Anual',annualEquivalentLabel:'equivalente mensal',credits:'créditos/mês',downloads:'downloads/mês',models:'Modelos',generation:'Até 8 minutos por geração',upload:'Upload de áudio até 30 minutos',stems:'separação de stems',freeDaily:'50 créditos diários · v6-mini',freeDownload:'Sem cota mensal fixa',freeTrial:'Algumas contas antigas têm até 7 testes vitalícios; contas novas podem receber testes ocasionais',freeCommercial:'Apenas uso pessoal não comercial',paidCommercial:'Músicas criadas durante a assinatura e baixadas conforme o plano podem ser usadas comercialmente',studio:'Suno Studio: MIDI, efeitos, automação e plugins',reset:'Os downloads Pro/Premier reiniciam na data de cobrança; os não usados não acumulam. Vários formatos da mesma música contam como um download; stems estão incluídos.',rights:'A permissão comercial não garante proteção de direitos autorais. Confirme os direitos do material enviado.',official:'Planos e preços oficiais',modelSource:'Guia oficial de modelos',terms:'Termos de uso comercial',downloadsSource:'Regras de download',remixSource:'Regras de Remix',save:'economia'},
 ar:{monthly:'شهري',annual:'سنوي',annualEquivalentLabel:'شهرياً',credits:'رصيد/شهر',downloads:'تنزيلات/شهر',models:'النماذج',generation:'حتى 8 دقائق لكل إنشاء',upload:'رفع صوت حتى 30 دقيقة',stems:'فصل المسارات',freeDaily:'50 رصيداً يومياً · v6-mini',freeDownload:'لا توجد حصة شهرية ثابتة',freeTrial:'بعض الحسابات القديمة لديها حتى 7 تجارب مدى الحياة؛ وقد تحصل الحسابات الجديدة على تجارب متفرقة',freeCommercial:'استخدام شخصي غير تجاري فقط',paidCommercial:'يمكن استخدام الأغاني المنشأة أثناء الاشتراك والمنزلة وفق الخطة تجارياً',studio:'Suno Studio: MIDI والمؤثرات والأتمتة والإضافات',reset:'تُعاد تنزيلات Pro/Premier في تاريخ الفوترة الشهري ولا يُرحّل غير المستخدم. تُحسب صيغ الأغنية الواحدة كتنزيل واحد وتشمل المسارات المنفصلة.',rights:'الإذن التجاري لا يضمن حماية حقوق النشر. تحقق من حقوق المواد المرفوعة.',official:'الخطط والأسعار الرسمية',modelSource:'دليل النماذج الرسمي',terms:'شروط الاستخدام التجاري',downloadsSource:'قواعد التنزيل',remixSource:'قواعد Remix',save:'توفير'}
};

export default function SunoPlanComparison({language}:{language:Language}){
 const t=COPY[language],pro=SUNO_PLANS.plans[0],premier=SUNO_PLANS.plans[1];
 const cards=[
  {id:'free',name:'Free',monthly:'$0',annual:'$0',items:[t.freeDaily,t.generation,t.freeDownload,t.freeTrial,t.freeCommercial]},
  {id:'pro',name:'Pro',monthly:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.annualEquivalent} {t.annualEquivalentLabel} · {t.save} {card.saving}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
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
+pro.monthlyPriceUsd,annual:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualTotalUsd,annualEquivalent:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyEquivalentUsd,saving:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualSavingsUsd,items:[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+premier.monthlyPriceUsd,annual:'[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyPriceUsd,annual:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualTotalUsd,annualEquivalent:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyEquivalentUsd,saving:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualSavingsUsd,items:[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+premier.annualTotalUsd,annualEquivalent:'[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyPriceUsd,annual:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualTotalUsd,annualEquivalent:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyEquivalentUsd,saving:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualSavingsUsd,items:[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+premier.monthlyEquivalentUsd,saving:'[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyPriceUsd,annual:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualTotalUsd,annualEquivalent:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyEquivalentUsd,saving:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualSavingsUsd,items:[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+premier.annualSavingsUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyPriceUsd,annual:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualTotalUsd,annualEquivalent:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.monthlyEquivalentUsd,saving:'[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
+pro.annualSavingsUsd,items:[pro.monthlyCredits.toLocaleString()+' '+t.credits,pro.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini',t.generation,t.upload,pro.stemSeparationTypes+' '+t.stems,t.paidCommercial]},
  {id:'premier',name:'Premier',monthly:'$'+premier.monthlyPriceUsd,annual:'$'+premier.annualTotalUsd,items:[premier.monthlyCredits.toLocaleString()+' '+t.credits,premier.monthlyDownloads+' '+t.downloads,t.models+': v6 / v6-wild / v6-mini,t.generation,t.upload,premier.stemSeparationTypes+' '+t.stems,t.studio,t.paidCommercial]}
 ];
 return <div className="sunoPlanCompare" dir={language==='ar'?'rtl':'ltr'}>
  <div className="sunoPlanCards">{cards.map(card=><article className={'sunoPlanCard sunoPlan-'+card.id} key={card.id}>
   <div className="sunoPlanTitle"><h3>{card.name}</h3><strong>{card.monthly}</strong><small>{t.monthly}</small></div>
   {card.id!=='free'?<div className="sunoPlanAnnual">{t.annual} {card.annual} · {card.id==='pro'?'$8':'$24'} {t.annual==='年付'?'折合每月':t.annual==='Annual'?'per month equivalent':t.annual==='年払い'?'月額換算':t.annual==='연간'?'월 환산':t.annual==='Annuel'?'équivalent mensuel':t.annual==='Jährlich'?'Monatswert':t.annual==='Anual'?'equivalente mensual':t.annual==='سنوي'?'شهرياً':''}</div>:null}
   <ul>{card.items.map(item=><li key={item}>{item}</li>)}</ul>
  </article>)}</div>
  <p className="sunoPlanNote">{t.reset}</p>
  <p className="sunoPlanNote">{t.rights}</p>
  <div className="sunoPlanSources">
   <a href={SUNO_PLANS.source} target="_blank" rel="nofollow noopener noreferrer">{t.official} ↗</a>
   <a href={SUNO_PLANS.modelsSource} target="_blank" rel="nofollow noopener noreferrer">{t.modelSource} ↗</a>
   <a href={SUNO_PLANS.commercialSource} target="_blank" rel="nofollow noopener noreferrer">{t.terms} ↗</a>
  </div>
 </div>;
}
