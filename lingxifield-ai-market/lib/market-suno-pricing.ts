import type {Language} from './v2';
/** Publisher plan allowances, separated from unmetered API assumptions. */
export const SUNO_PLANS={
 source:'https://suno.com/pricing',
 commercialSource:'https://suno.com/terms',
 checkedAt:'2026-11-01',
 freeDailyCredits:50,
 plans:[
  {id:'pro',name:'Pro',annualTotalUsd:96,monthlyEquivalentUsd:8,monthlyCredits:2500,monthlyDownloads:20},
  {id:'premier',name:'Premier',annualTotalUsd:288,monthlyEquivalentUsd:24,monthlyCredits:10000,monthlyDownloads:60}
 ]
} as const;
const words:Record<Language,{year:string;equiv:string;credits:string;downloads:string;free:string}>={
 zh:{year:'年',equiv:'年付折合',credits:'每月积分',downloads:'每月可下载歌曲',free:'Free $0 · 每日 50 积分 · 免费作品不可商用；下载名额按账户试用规则'},
 en:{year:'year',equiv:'equivalent/month on annual plan',credits:'credits/month',downloads:'song downloads/month',free:'Free $0 · 50 daily credits · non-commercial; trial downloads depend on account'},
 ja:{year:'年',equiv:'年払いの月額換算',credits:'月間クレジット',downloads:'月間ダウンロード数',free:'Free $0 · 毎日50クレジット · 商用不可。試用ダウンロードはアカウント別'},
 ko:{year:'년',equiv:'연간 결제 월 환산',credits:'월간 크레딧',downloads:'월간 다운로드',free:'Free $0 · 매일 50 크레딧 · 상업적 이용 불가, 체험 다운로드는 계정별'},
 fr:{year:'an',equiv:'équivalent mensuel avec paiement annuel',credits:'crédits/mois',downloads:'téléchargements/mois',free:'Free 0 $ · 50 crédits/jour · non commercial ; téléchargements d’essai selon compte'},
 de:{year:'Jahr',equiv:'Monatswert bei Jahreszahlung',credits:'Credits/Monat',downloads:'Downloads/Monat',free:'Free 0 $ · 50 Credits/Tag · nicht kommerziell, Probe-Downloads je Konto'},
 es:{year:'año',equiv:'equivalente mensual con pago anual',credits:'créditos/mes',downloads:'descargas/mes',free:'Free 0 $ · 50 créditos diarios · sin uso comercial; descargas de prueba según cuenta'},
 pt:{year:'ano',equiv:'equivalente mensal com cobrança anual',credits:'créditos/mês',downloads:'downloads/mês',free:'Free US$ 0 · 50 créditos diários · uso não comercial; downloads de teste por conta'},
 ar:{year:'سنة',equiv:'المعادِل الشهري للدفع السنوي',credits:'رصيد/شهر',downloads:'تنزيلات/شهر',free:'Free $0 · 50 رصيد يومياً · غير تجاري؛ تنزيلات التجربة حسب الحساب'}
};
export function sunoSubscription(l:Language){
 const t=words[l];
 return SUNO_PLANS.plans.map(p=>`${p.name} $${p.annualTotalUsd}/${t.year} ($${p.monthlyEquivalentUsd} ${t.equiv}; ${p.monthlyCredits} ${t.credits}; ${p.monthlyDownloads} ${t.downloads})`).join(' · ');
}
export function sunoFree(l:Language){return words[l].free}
