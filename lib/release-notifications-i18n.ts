"use client";
import type {LingxiLang} from "@/lib/lingxi-i18n";
const C:Record<string,Record<LingxiLang,string>>={
 mini47:{
  zh:"灵犀场小程序 4.7 已上线。PDF 编辑、图片上传、免费预览、结果保存、支付与币种体验已继续完善。",
  en:"LINGXIFIELD Mini Program 4.7 is live with improved PDF editing, image upload, preview, saving, payment and currency handling.",
  ja:"LINGXIFIELD ミニプログラム 4.7 が公開され、PDF 編集や保存体験を改善しました。",ko:"LINGXIFIELD 미니프로그램 4.7이 출시되어 PDF 편집과 저장 경험을 개선했습니다.",fr:"Le mini-programme LINGXIFIELD 4.7 est disponible avec une meilleure édition PDF et expérience de sauvegarde.",de:"LINGXIFIELD Mini-Programm 4.7 ist verfügbar, mit verbessertem PDF- und Speichern-Erlebnis.",es:"El mini programa LINGXIFIELD 4.7 ya está disponible con mejoras en PDF y guardado.",pt:"O mini programa LINGXIFIELD 4.7 já está disponível com melhorias em PDF e salvamento.",ar:"تم إطلاق الإصدار 4.7 من برنامج LINGXIFIELD المصغر مع تحسين تحرير PDF والحفظ."
 },
 sasi21:{
  zh:"SASI 正在进入生产闭环：原生算力会在收费前确认可用，支付后的任务支持恢复与重试，资料问答继续保留原文依据。",
  en:"SASI is closing its production loop: native compute is checked before payment, paid jobs can recover and retry, and source answers stay evidence-grounded.",
  ja:"SASI は本番実行の信頼性を強化しています。",ko:"SASI는 실제 실행 안정성을 강화하고 있습니다.",fr:"SASI renforce la fiabilité d’exécution en production.",de:"SASI stärkt die Zuverlässigkeit der Produktionsausführung.",es:"SASI refuerza la fiabilidad de ejecución.",pt:"O SASI está reforçando a confiabilidade de execução.",ar:"يعمل SASI على تعزيز موثوقية التنفيذ الفعلي."
 },
 toolsQuality:{
  zh:"实用工具继续按真实链路回归：上传、编辑、预览、计价、支付、结果与移动端保存都分别检查。",
  en:"Practical tools continue end-to-end regression across upload, edit, preview, pricing, payment, results and mobile saving.",
  ja:"実用ツールをアップロードから保存まで実利用で再検証しています。",ko:"실용 도구를 업로드부터 저장까지 실제 흐름으로 재검증하고 있습니다.",fr:"Les outils sont revérifiés de bout en bout.",de:"Die Werkzeuge werden Ende-zu-Ende geprüft.",es:"Las herramientas se verifican de extremo a extremo.",pt:"As ferramentas são verificadas de ponta a ponta.",ar:"تتم مراجعة الأدوات العملية من البداية إلى النهاية."
 }
};
export function releaseText(lang:LingxiLang,key:string,vars?:Record<string,string|number>){let s=C[key]?.[lang]??C[key]?.en??key;for(const[k,v]of Object.entries(vars||{}))s=s.replaceAll(`{${k}}`,String(v));return s}
