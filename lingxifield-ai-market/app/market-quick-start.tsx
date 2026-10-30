'use client';
import {useEffect,useState} from 'react';
import {Search,Globe2,Scale,MessageCircle,X,ChevronRight,ChevronLeft} from 'lucide-react';
import {MARKET_SCREEN_COPY} from '../lib/market-v36-screening';
import type {Language} from '../lib/v2';

type Copy={title:string,intro:string,hide:string,show:string,search:string,searchNote:string,region:string,regionNote:string,compare:string,compareNote:string,feedback:string,feedbackNote:string};
const COPY:Record<Language,Copy>={
 zh:{title:'第一次来？30 秒学会选对 AI 工具',intro:'不用登录。先说需求，再看地区和费用，最后选两到三家并排比较。',hide:'收起指引',show:'查看新手指引',search:'① 搜索我的需求',searchNote:'输入“免费生成短视频”等真实问题',region:'② 看地区与费用',regionNote:'切换国家，查看官方支持和付款条件',compare:'③ 选工具并排比较',compareNote:'点击工具旁的「对比」，再点顶部按钮',feedback:'④ 留下真实体验',feedbackNote:'匿名评价或报告资料错误，帮助下一位使用者'},
 en:{title:'New here? Find the right AI tool in 30 seconds',intro:'No login needed. Search your task, check availability and costs, then compare 2–3 products.',hide:'Hide guide',show:'Beginner guide',search:'① Describe your task',searchNote:'Try “free AI short video maker”',region:'② Check region & price',regionNote:'Choose a country and verify supported payments',compare:'③ Compare 2–3 tools',compareNote:'Select Compare on products, then open the comparison dock',feedback:'④ Share your experience',feedbackNote:'Anonymous feedback or corrections help other visitors'},
 ja:{title:'初めてですか？30秒でAIツールを選ぶ',intro:'ログイン不要。用途を検索し、地域と料金を確認し、2～3製品を比較します。',hide:'閉じる',show:'初心者向けガイド',search:'① 用途を検索',searchNote:'具体的な作業を入力',region:'② 地域・料金',regionNote:'国を選び決済と利用条件を確認',compare:'③ 並べて比較',compareNote:'製品を2～3個選んで比較',feedback:'④ 体験を共有',feedbackNote:'匿名の体験談と訂正を歓迎'},
 ko:{title:'처음이신가요? 30초 AI 도구 선택 가이드',intro:'로그인 없이 검색하고 지역·요금을 확인한 뒤 2–3개를 비교하세요.',hide:'접기',show:'초보자 안내',search:'① 작업 검색',searchNote:'필요한 작업을 입력하세요',region:'② 지역·요금 확인',regionNote:'국가와 결제 조건 확인',compare:'③ 나란히 비교',compareNote:'제품 2–3개를 비교에 추가',feedback:'④ 경험 공유',feedbackNote:'익명 의견과 오류 수정 제안'},
 fr:{title:'Nouveau ? Choisissez votre IA en 30 secondes',intro:'Sans compte. Décrivez votre besoin, vérifiez les régions et les tarifs, comparez 2–3 outils.',hide:'Réduire',show:'Guide débutant',search:'① Décrivez la tâche',searchNote:'Recherchez votre besoin',region:'② Région et coût',regionNote:'Vérifiez pays et paiements',compare:'③ Comparer 2–3 outils',compareNote:'Ajoutez les produits au comparateur',feedback:'④ Partagez un avis',feedbackNote:'Avis anonymes et corrections'},
 de:{title:'Neu hier? In 30 Sekunden das passende KI-Tool finden',intro:'Ohne Login: Aufgabe suchen, Region und Kosten prüfen, 2–3 Tools vergleichen.',hide:'Schließen',show:'Einsteiger-Anleitung',search:'① Aufgabe suchen',searchNote:'Geben Sie Ihre Aufgabe ein',region:'② Region & Kosten',regionNote:'Land und Zahlungsmethoden prüfen',compare:'③ Tools vergleichen',compareNote:'2–3 Produkte auswählen',feedback:'④ Erfahrung teilen',feedbackNote:'Anonyme Hinweise und Korrekturen'},
 es:{title:'¿Primera vez? Elige tu herramienta IA en 30 segundos',intro:'Sin iniciar sesión. Busca tu tarea, consulta región y precio, compara 2–3 herramientas.',hide:'Ocultar',show:'Guía para empezar',search:'① Busca tu tarea',searchNote:'Describe qué quieres hacer',region:'② Región y precio',regionNote:'Elige país y consulta métodos de pago',compare:'③ Compara herramientas',compareNote:'Elige 2–3 productos',feedback:'④ Comparte tu experiencia',feedbackNote:'Comentarios anónimos y correcciones'},
 pt:{title:'Primeira visita? Encontre sua IA em 30 segundos',intro:'Sem login. Pesquise a tarefa, veja região e custos e compare 2–3 ferramentas.',hide:'Recolher',show:'Guia inicial',search:'① Pesquise sua tarefa',searchNote:'Descreva o que precisa fazer',region:'② Região e preço',regionNote:'Selecione o país e confira pagamentos',compare:'③ Compare ferramentas',compareNote:'Selecione 2–3 produtos',feedback:'④ Conte sua experiência',feedbackNote:'Avaliações anônimas e correções'},
 ar:{title:'زيارتك الأولى؟ اختر أداة الذكاء الاصطناعي خلال 30 ثانية',intro:'من دون تسجيل دخول. ابحث عن مهمتك وتحقق من البلد والتكلفة ثم قارن بين أداتين أو ثلاث.',hide:'إخفاء',show:'دليل المبتدئين',search:'① ابحث عن مهمتك',searchNote:'اكتب ما تريد إنجازه',region:'② البلد والسعر',regionNote:'اختر البلد وتحقق من الدفع',compare:'③ قارن الأدوات',compareNote:'اختر أداتين أو ثلاثاً',feedback:'④ شارك تجربتك',feedbackNote:'ملاحظات وتصحيحات مجهولة الهوية'}
};
type Step='search'|'region'|'filter'|'compare'|'feedback';
const STEPS:Step[]=['search','region','filter','compare','feedback'];
const TOUR_UI:Record<Language,{start:string,close:string,next:string,previous:string,finish:string,step:string,filterHint:string,compareHint:string,done:string}>={
 zh:{start:'鼠标跟着走 · 开始指引',close:'退出',next:'下一步 →',previous:'← 上一步',finish:'完成',step:'第 {n} / 5 步',filterHint:'现在选择短剧、免费、支付方式或其他条件，列表会立即变化。',compareHint:'在工具行点击“加入对比”选择两到三家，再点击顶部并排对比。',done:'留下真实体验，帮助下一位用户。'},
 en:{start:'Start guided tour',close:'Exit',next:'Next →',previous:'← Back',finish:'Done',step:'Step {n} / 5',filterHint:'Filter by task, free tier or payment method; the results update.',compareHint:'Add two or three tools using the row buttons, then open the comparison.',done:'Share an honest experience for the next visitor.'},
 ja:{start:'操作ガイドを開始',close:'終了',next:'次へ →',previous:'← 戻る',finish:'完了',step:'ステップ {n} / 5',filterHint:'用途・無料枠・決済方法で絞り込みます。',compareHint:'2～3製品を「比較」に追加してから比較画面を開きます。',done:'次の利用者のために感想をお寄せください。'},
 ko:{start:'단계별 안내 시작',close:'종료',next:'다음 →',previous:'← 이전',finish:'완료',step:'단계 {n} / 5',filterHint:'작업, 무료 옵션, 결제 수단을 선택하세요.',compareHint:'도구 2~3개를 비교 목록에 추가한 후 비교하세요.',done:'다른 사용자를 위해 경험을 공유하세요.'},
 fr:{start:'Visite guidée',close:'Quitter',next:'Suivant →',previous:'← Retour',finish:'Terminer',step:'Étape {n} / 5',filterHint:'Filtrez par usage, gratuité ou paiement.',compareHint:'Sélectionnez deux ou trois outils puis comparez-les.',done:'Partagez votre expérience.'},
 de:{start:'Geführte Tour starten',close:'Schließen',next:'Weiter →',previous:'← Zurück',finish:'Fertig',step:'Schritt {n} / 5',filterHint:'Nach Aufgabe, Gratis-Angebot oder Zahlung filtern.',compareHint:'Zwei bis drei Tools wählen und vergleichen.',done:'Teilen Sie Ihre Erfahrung.'},
 es:{start:'Iniciar guía interactiva',close:'Salir',next:'Siguiente →',previous:'← Atrás',finish:'Terminar',step:'Paso {n} / 5',filterHint:'Filtra por tarea, opción gratis o forma de pago.',compareHint:'Añade dos o tres herramientas para compararlas.',done:'Comparte tu experiencia.'},
 pt:{start:'Iniciar guia interativo',close:'Sair',next:'Próximo →',previous:'← Voltar',finish:'Concluir',step:'Passo {n} / 5',filterHint:'Filtre por tarefa, opção grátis ou pagamento.',compareHint:'Selecione duas ou três ferramentas para comparar.',done:'Compartilhe sua experiência.'},
 ar:{start:'ابدأ الدليل التفاعلي',close:'خروج',next:'التالي ←',previous:'→ السابق',finish:'إنهاء',step:'الخطوة {n} / 5',filterHint:'صفِّ حسب المهمة أو المجاني أو طريقة الدفع.',compareHint:'اختر أداتين أو ثلاثًا ثم افتح المقارنة.',done:'شارك تجربتك مع الزوار.'}
};
const TARGETS:Record<Step,string>={
 search:'.searchBar input',region:'.marketRegionSelect select',filter:'#market-filters',compare:'.marketOverviewTable',feedback:'#visitor-feedback'
};
export default function MarketQuickStart({language,onCompare}:{language:Language;onCompare:()=>void}){
 const [active,setActive]=useState(false);
 const [step,setStep]=useState(0);
 const t=COPY[language],ui=TOUR_UI[language];
 useEffect(()=>{
  if(!active)return;
  const target=document.querySelector<HTMLElement>(TARGETS[STEPS[step]]);
  if(!target)return;
  target.classList.add('marketTourSpotlight');
  target.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
  if(step<2)target.focus({preventScroll:true});
  return()=>target.classList.remove('marketTourSpotlight');
 },[active,step]);
 function close(){setActive(false);}
 function start(){setStep(0);setActive(true);}
 const name=step===0?t.search:step===1?t.region:step===2?MARKET_SCREEN_COPY[language].filterLabel:step===3?t.compare:t.feedback;
 const hint=step===0?t.searchNote:step===1?t.regionNote:step===2?ui.filterHint:step===3?ui.compareHint:ui.done;
 return <div id="market-guide" className="marketTourRoot" dir={language==='ar'?'rtl':'ltr'}>
  <button type="button" className="marketTourStart" onClick={start}><Search size={16}/>{ui.start}</button>
  {active&&<section className="marketTourPanel" role="dialog" aria-modal="false" aria-label={t.title}>
   <div className="marketTourPanelHead"><strong>{ui.step.replace('{n}',String(step+1))}</strong><button type="button" onClick={close} aria-label={ui.close}><X size={18}/></button></div>
   <div className="marketTourProgress" aria-hidden="true">{STEPS.map((x,i)=><span key={x} className={i<=step?'active':''}/>)}</div>
   <h3>{name}</h3><p>{hint}</p>
   <div className="marketTourPanelFoot"><button type="button" disabled={step===0} onClick={()=>setStep(x=>Math.max(0,x-1))}><ChevronLeft size={15}/>{ui.previous}</button>
    <button type="button" className="marketTourNext" onClick={()=>{if(step===STEPS.length-1)close();else setStep(x=>x+1);}}>{step===STEPS.length-1?ui.finish:ui.next}<ChevronRight size={15}/></button>
   </div>
  </section>}
 </div>;
}
