import type {LingxiLang} from '@/lib/lingxi-i18n';
const imageLabels:Record<LingxiLang,string>={zh:'AI图片生成',en:'AI image generation',ja:'AI画像生成',ko:'AI 이미지 생성',fr:'Génération d’images IA',de:'KI-Bilder erstellen',es:'Generación de imágenes IA',pt:'Geração de imagens IA',ar:'إنشاء صور بالذكاء الاصطناعي'};
export function imageCreationLabel(lang:LingxiLang){return imageLabels[lang];}
export function seriesProgressLabel(lang:LingxiLang,ready:number,total:number){
 const labels:Record<LingxiLang,string>={zh:`分镜已准备 ${ready}/${total} 集，进度会自动保存。`,en:`Storyboards ready: ${ready}/${total} episodes. Progress is saved.`,ja:`絵コンテ ${ready}/${total} 話。進行は保存されます。`,ko:`스토리보드 ${ready}/${total}화. 진행 상황이 저장됩니다.`,fr:`Storyboards prêts : ${ready}/${total} épisodes. Progression enregistrée.`,de:`Storyboards fertig: ${ready}/${total} Folgen. Fortschritt gespeichert.`,es:`Guiones gráficos listos: ${ready}/${total} episodios. Progreso guardado.`,pt:`Storyboards prontos: ${ready}/${total} episódios. Progresso salvo.`,ar:`لوحات المشاهد الجاهزة: ${ready}/${total} حلقة. يتم حفظ التقدم.`};return labels[lang];
}
