"use client";
import type {LingxiLang} from "@/lib/lingxi-i18n";
const C:Record<string,Record<LingxiLang,string>>={
 mini46:{
  zh:"灵犀场小程序 4.6 已上线。SASI 创作、资料智库、实用工具、订单与余额入口已经进入同一套小程序体验。",
  en:"LINGXIFIELD Mini Program 4.6 is live, bringing SASI, knowledge, tools, orders and balance into one experience.",
  ja:"LINGXIFIELD ミニプログラム 4.6 が公開されました。",ko:"LINGXIFIELD 미니프로그램 4.6이 출시되었습니다.",fr:"Le mini-programme LINGXIFIELD 4.6 est disponible.",de:"Das LINGXIFIELD Mini-Programm 4.6 ist verfügbar.",es:"El mini programa LINGXIFIELD 4.6 ya está disponible.",pt:"O mini programa LINGXIFIELD 4.6 já está disponível.",ar:"تم إطلاق الإصدار 4.6 من برنامج LINGXIFIELD المصغر."
 },
 sasi20:{
  zh:"SASI 正在升级资料理解、深度推理、图片与视频生成能力。资料问答会更重视综合判断、冲突核对和原文依据。",
  en:"SASI is upgrading source understanding, reasoning, image and video generation, with stronger synthesis and evidence checks.",
  ja:"SASI は資料理解・推論・画像・動画生成を強化中です。",ko:"SASI의 자료 이해, 추론, 이미지·영상 생성 기능을 강화하고 있습니다.",fr:"SASI améliore la compréhension des sources, le raisonnement et la génération.",de:"SASI erweitert Quellenverständnis, Schlussfolgern sowie Bild- und Videogenerierung.",es:"SASI mejora la comprensión de fuentes, el razonamiento y la generación.",pt:"O SASI está melhorando compreensão, raciocínio e geração.",ar:"يجري تطوير SASI لفهم المصادر والاستدلال وتوليد الصور والفيديو."
 },
 toolsQuality:{
  zh:"实用工具正在逐项做真实使用回归：上传、编辑、预览、支付、导出和移动端体验都会按完整链路检查。",
  en:"Practical tools are being checked end to end: upload, edit, preview, payment, export and mobile use.",
  ja:"実用ツールをアップロードから書き出しまで実利用で再検証しています。",ko:"실용 도구를 업로드부터 내보내기까지 실제 사용 흐름으로 재검증하고 있습니다.",fr:"Les outils sont revérifiés de bout en bout, de l’import à l’export.",de:"Die Werkzeuge werden vom Upload bis zum Export vollständig geprüft.",es:"Las herramientas se están verificando de extremo a extremo.",pt:"As ferramentas estão sendo verificadas de ponta a ponta.",ar:"تتم مراجعة الأدوات العملية من الرفع حتى التصدير بشكل كامل."
 }
};
export function releaseText(lang:LingxiLang,key:string,vars?:Record<string,string|number>){let s=C[key]?.[lang]??C[key]?.en??key;for(const[k,v]of Object.entries(vars||{}))s=s.replaceAll(`{${k}}`,String(v));return s}
