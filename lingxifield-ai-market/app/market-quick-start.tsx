'use client';
import {useState} from 'react';
import {Search,Globe2,Scale,MessageCircle,ChevronDown,ChevronUp} from 'lucide-react';
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
type Step='search'|'region'|'compare'|'feedback';
export default function MarketQuickStart({language,onCompare}:{language:Language;onCompare:()=>void}){
 const [expanded,setExpanded]=useState(true);
 const t=COPY[language];
 function move(step:Step){
  if(step==='compare'){onCompare();return;}
  if(step==='search'){
    const input=document.querySelector<HTMLInputElement>('.searchBar input');
    input?.scrollIntoView({behavior:'smooth',block:'center'});input?.focus({preventScroll:true});return;
  }
  const target=document.querySelector(step==='region'?'.marketRegionSelect select':'#visitor-feedback');
  target?.scrollIntoView({behavior:'smooth',block:'center'});
  if(step==='region')(target as HTMLSelectElement|null)?.focus({preventScroll:true});
 }
 return <section id="market-guide" className="marketQuickStart" dir={language==='ar'?'rtl':'ltr'} aria-label={t.title}>
  <div className="marketQuickStartHeading"><div><h2>{t.title}</h2>{expanded&&<p>{t.intro}</p>}</div>
   <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>
    {expanded?t.hide:t.show} {expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
   </button></div>
  {expanded&&<div className="marketQuickSteps">
   <button type="button" onClick={()=>move('search')}><Search size={19}/><strong>{t.search}</strong><span>{t.searchNote}</span></button>
   <button type="button" onClick={()=>move('region')}><Globe2 size={19}/><strong>{t.region}</strong><span>{t.regionNote}</span></button>
   <button type="button" onClick={()=>move('compare')}><Scale size={19}/><strong>{t.compare}</strong><span>{t.compareNote}</span></button>
   <button type="button" onClick={()=>move('feedback')}><MessageCircle size={19}/><strong>{t.feedback}</strong><span>{t.feedbackNote}</span></button>
  </div>}
 </section>;
}
