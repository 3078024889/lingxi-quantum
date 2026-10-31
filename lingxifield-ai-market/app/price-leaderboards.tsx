'use client';
import {useState} from 'react';
import {priceBoards} from '../lib/offer-guide';
import type {Language} from '../lib/v2';
import {localizedProductSummary} from '../lib/market-product-locale';
const COPY:Record<Language,string[]>={"zh":["入门价格比较","按官方公布的可比较入门套餐","按月付费","年付折合","官网价格","此类别暂无可比较的公开套餐价格。","这是套餐价格比较，不是热度或质量排名；积分、限制和商用权另计。","月","按月订阅","年付折合，不代表可逐月购买","全部产品","视频制作","图片创作","AI 音乐","语音配音","网站编程","研究搜索"],"en":["Entry price comparison","Compare published entry-level plans, not quality ranks","Monthly billing","Annual equivalent","Official price","No comparable published plan in this category.","Plan price comparison only; credits, limits and commercial rights differ.","month","Monthly subscription","Billed annually; not a monthly purchase","All products","Video","Images","AI music","Voice","Web & code","Research"],"ja":["入門価格の比較","公表された料金プランを比較","月払い","年払い換算","公式料金","比較可能な料金がありません。","価格比較であり品質ランキングではありません。枠や商用条件は異なります。","月","月額サブスク","年払い換算・毎月払い不可","すべて","動画","画像","音楽","音声","Webとコード","研究"],"ko":["시작 요금 비교","공식 공개된 요금제 비교","월별 결제","연간 환산","공식 가격","비교 가능한 공식 요금이 없습니다.","가격 비교이며 품질 순위가 아닙니다. 한도·상업 조건은 다릅니다.","월","월 구독","연간 결제 환산","전체","영상","이미지","음악","음성","웹·코드","연구"],"fr":["Comparaison des prix de départ","Offres publiées comparables, pas un classement qualité","Mensuel","Équivalent annuel","Tarif officiel","Pas de tarif comparable pour cette catégorie.","Comparaison de prix, non de qualité ; crédits et droits diffèrent.","mois","Abonnement mensuel","Facturé annuellement","Tous","Vidéo","Images","Musique","Voix","Web et code","Recherche"],"de":["Einstiegspreise im Vergleich","Offizielle Pläne, kein Qualitätsranking","Monatlich","Jährlich umgerechnet","Offizieller Preis","Keine vergleichbaren Pläne erfasst.","Preisvergleich, kein Qualitätsrang; Limits und Rechte variieren.","Monat","Monatsabo","Jährlich bezahlt","Alle","Video","Bilder","Musik","Stimme","Web und Code","Recherche"],"es":["Comparación de precios iniciales","Planes oficiales comparables, no ranking de calidad","Pago mensual","Equivalente anual","Precio oficial","Sin planes comparables de esta categoría.","Solo compara precios; cuotas y derechos comerciales varían.","mes","Suscripción mensual","Cobro anual","Todos","Vídeo","Imágenes","Música","Voz","Web y código","Investigación"],"pt":["Comparação de preços iniciais","Planos oficiais comparáveis, não ranking de qualidade","Mensal","Equivalente anual","Preço oficial","Sem plano comparável nessa categoria.","Só compara preços; limites e direitos variam.","mês","Assinatura mensal","Cobrança anual","Todos","Vídeo","Imagens","Música","Voz","Web e código","Pesquisa"],"ar":["مقارنة أسعار البداية","خطط منشورة قابلة للمقارنة وليست ترتيب جودة","دفع شهري","مكافئ سنوي","السعر الرسمي","لا توجد خطة منشورة قابلة للمقارنة لهذه الفئة.","مقارنة أسعار فقط؛ الحدود وحقوق الاستخدام تختلف.","شهر","اشتراك شهري","تدفع سنوياً","الكل","فيديو","صور","موسيقى","صوت","ويب وبرمجة","بحث"]};
const names:Record<string,string>={runway:'Runway',suno:'Suno',elevenlabs:'ElevenLabs',lovable:'Lovable',chatgpt:'ChatGPT',claude:'Claude',perplexity:'Perplexity',replit:'Replit'};
export default function PriceLeaderboards({compact=false,language='zh'}:{compact?:boolean;language?:Language}){
 const t=COPY[language]||COPY.zh;
 const [bill,setBill]=useState<'monthly'|'annual_equivalent'>('monthly');
 const [task,setTask]=useState<'all'|'video'|'images'|'music'|'voice'|'web'|'research'>('all');
 const choices=[{value:'all',label:t[10],pattern:/.*/},{value:'video',label:t[11],pattern:/视频|短剧/},{value:'images',label:t[12],pattern:/图像|图片/},{value:'music',label:t[13],pattern:/音乐|歌曲|配乐/},{value:'voice',label:t[14],pattern:/语音|配音|旁白/},{value:'web',label:t[15],pattern:/编程|建网站|网站|应用/},{value:'research',label:t[16],pattern:/研究|搜索/}] as const;
 const selected=choices.find(x=>x.value===task)!;
 const board=priceBoards().find(x=>x.billing===bill)!;
 return <section className="panel consumerBoard" aria-label={t[0]}>
  <div className="rankHead"><h2>{t[0]}</h2><span>{t[1]}</span></div>
  <div className="consumerBoardTabs">
   <button className={bill==='monthly'?'active':''} onClick={()=>setBill('monthly')}>{t[2]}</button>
   <button className={bill==='annual_equivalent'?'active':''} onClick={()=>setBill('annual_equivalent')}>{t[3]}</button>
  </div>
  <div className="consumerBoardTabs categoryTabs">{choices.map(x=><button key={x.value} className={task===x.value?'active':''} onClick={()=>setTask(x.value)}>{x.label}</button>)}</div>
  <div className="consumerBoardRows">{board.items.filter(x=>selected.pattern.test(x.tasks.join(' '))).map((r,i)=>{
   return <div className="consumerBoardRow" key={r.id}>
    <span className="boardRank">{i+1}</span>
    <div><a className="boardName" href={'/platform/'+r.id}>{names[r.id]||r.id}</a>
     <small>{language==='zh'?r.tasks.slice(0,2).join(' · '):localizedProductSummary(r.id,language)||r.id}</small></div>
    <div className="boardPrice"><strong>${r.monthlyUsd}/{t[7]}</strong><small>{bill==='monthly'?t[8]:t[9]}</small></div>
    <a href={r.source} target="_blank" rel="noopener noreferrer" className="boardSource">{t[4]} ↗</a>
   </div>;
  })}</div>
  {!board.items.some(x=>selected.pattern.test(x.tasks.join(' ')))&&<p className="consumerBoardFoot">{t[5]}</p>}
  <p className="consumerBoardFoot">{t[6]} · 2026-10-30</p>
 </section>;
}
