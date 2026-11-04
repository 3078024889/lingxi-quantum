import {TASK_FACETS,PAYMENT_FACETS,EVIDENCE_FACETS,SORT_OPTIONS,MAX_COMPARISONS,type MarketCriteria} from './siai-home-facets';

export type SiaiShareState=MarketCriteria&{compareIds:string[]};
const DEFAULTS:MarketCriteria={query:'',category:'*',task:'all',payment:'any',evidence:'all',sort:'oldest'};
function choice<T extends string>(value:string|null,allowed:readonly T[],fallback:T):T{
 return value&&allowed.includes(value as T)?value as T:fallback;
}
export function readSiaiShareState(search:string,knownIds:readonly string[],categories:readonly string[]):SiaiShareState{
 const p=new URLSearchParams(search.slice(0,4096));
 return {
  query:(p.get('q')||'').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,160),
  category:choice(p.get('category'),categories,'*'),
  task:choice(p.get('task'),TASK_FACETS,'all'),payment:choice(p.get('payment'),PAYMENT_FACETS,'any'),
  evidence:choice(p.get('evidence'),EVIDENCE_FACETS,'all'),sort:choice(p.get('sort'),SORT_OPTIONS,'oldest'),
  compareIds:[...new Set((p.get('compare')||'').split(','))].filter(id=>knownIds.includes(id)).slice(0,MAX_COMPARISONS),
 };
}
/** Build from public selection only: never forward account tokens, return URLs or campaign input. */
export function siaiSharePath(state:SiaiShareState,lang:string):string{
 const p=new URLSearchParams();
 if(['zh','en','ja','ko','fr','de','es','pt','ar'].includes(lang))p.set('lang',lang);
 if(state.query.trim())p.set('q',state.query.trim().slice(0,160));
 for(const key of ['category','task','payment','evidence','sort'] as const){
  if(state[key]!==DEFAULTS[key])p.set(key,state[key]);
 }
 if(state.compareIds.length)p.set('compare',[...new Set(state.compareIds)].slice(0,MAX_COMPARISONS).join(','));
 return '/siai'+(p.size?'?'+p.toString():'');
}
export const SIAI_SHARE_COPY={
 zh:{share:'分享当前筛选与对比',copied:'链接已复制',fallback:'复制下面的链接分享',link:'分享链接'},
 en:{share:'Share filters and comparison',copied:'Link copied',fallback:'Copy the link below to share',link:'Share link'},
 ja:{share:'絞り込みと比較を共有',copied:'リンクをコピーしました',fallback:'下のリンクをコピーしてください',link:'共有リンク'},
 ko:{share:'필터와 비교 공유',copied:'링크 복사됨',fallback:'아래 링크를 복사하세요',link:'공유 링크'},
 fr:{share:'Partager les filtres et la comparaison',copied:'Lien copié',fallback:'Copiez le lien ci-dessous',link:'Lien de partage'},
 de:{share:'Filter und Vergleich teilen',copied:'Link kopiert',fallback:'Link unten kopieren',link:'Link zum Teilen'},
 es:{share:'Compartir filtros y comparación',copied:'Enlace copiado',fallback:'Copia el enlace de abajo',link:'Enlace para compartir'},
 pt:{share:'Compartilhar filtros e comparação',copied:'Link copiado',fallback:'Copie o link abaixo',link:'Link para compartilhar'},
 ar:{share:'مشاركة الفلاتر والمقارنة',copied:'تم نسخ الرابط',fallback:'انسخ الرابط أدناه للمشاركة',link:'رابط المشاركة'},
} as const;
