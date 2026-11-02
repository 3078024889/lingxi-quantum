"use client";
import Link from 'next/link';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import FoodCalorieWorkbench from './FoodCalorieWorkbench';
import ToolPromoStrip from './ToolPromoStrip';
const FOOD_PROMO_IMAGES=Array.from({length:9},(_,i)=>({
 src:`/images/tool-stories/food-calorie/food-calorie-${String(i+1).padStart(2,"0")}.webp`,
 alt:`灵犀场卡路里与食物热量识别场景 ${i+1}`,
}));
const copy={
 zh:['卡路里识别','看懂这一餐，轻松安排下一餐。拍照或输入食物，确认份量后查看营养与搭配建议。','用于日常饮食记录参考，不作为医疗或营养诊断。','全部工具'],
 en:['Calorie Recognition','Understand this meal and plan the next. Add photos or foods, confirm portions, then explore nutrition and meal ideas.','For everyday food records, not medical or nutritional diagnosis.','All tools'],
 ja:['カロリー認識','この食事を知り、次の食事を考える。写真や食品を追加し、量を確認すると栄養と献立のヒントが見られます。','日々の食事記録用です。医療・栄養診断ではありません。','すべてのツール'],
 ko:['칼로리 인식','이번 식사를 이해하고 다음 식사를 준비하세요. 사진이나 음식을 추가하고 양을 확인하면 영양과 식사 제안을 볼 수 있습니다.','일상 식사 기록용이며 의료·영양 진단이 아닙니다.','모든 도구'],
 fr:['Reconnaissance des calories','Comprenez ce repas et préparez le prochain. Ajoutez des photos ou des aliments, confirmez les portions et découvrez les apports et idées de repas.','Pour le suivi alimentaire quotidien, sans diagnostic médical ou nutritionnel.','Tous les outils'],
 de:['Kalorienerkennung','Diese Mahlzeit verstehen und die nächste planen. Fotos oder Lebensmittel hinzufügen, Portionen bestätigen und Nährwerte und Essensideen ansehen.','Für alltägliche Ernährungsaufzeichnungen, keine medizinische oder Ernährungsdiagnose.','Alle Werkzeuge'],
 es:['Reconocimiento de calorías','Conoce esta comida y prepara la siguiente. Añade fotos o alimentos, confirma las porciones y descubre nutrientes e ideas para comer.','Para el registro diario, no para diagnósticos médicos o nutricionales.','Todas las herramientas'],
 pt:['Reconhecimento de calorias','Entenda esta refeição e planeje a próxima. Adicione fotos ou alimentos, confirme as porções e veja nutrientes e ideias de refeições.','Para registros diários, não para diagnóstico médico ou nutricional.','Todas as ferramentas'],
 ar:['التعرف على السعرات الحرارية','افهم وجبتك وخطط للتالية. أضف الصور أو الأطعمة وأكد الكميات ثم اطلع على العناصر الغذائية وأفكار الوجبات.','للتسجيل الغذائي اليومي وليس للتشخيص الطبي أو الغذائي.','كل الأدوات'],
};
const promotion={
 zh:{title:"拍下这一餐，看懂热量、营养和份量。",intro:"识别食物后确认品种、做法和份量，再查看估算热量与主要营养信息。",alt:"食物卡路里识别示例"},
 en:{title:"Recognize food and estimate its calories and nutrients.",intro:"Identify each food, confirm how it was prepared and the portion, then review estimated nutrition.",alt:"Calorie recognition food example"},
 ja:{title:"食べ物を認識し、カロリーと栄養を推定。",intro:"食材・調理方法・量を確認してから、推定カロリーと栄養情報を確認できます。",alt:"カロリー認識の食事例"},
 ko:{title:"음식을 인식하고 칼로리와 영양소를 추정하세요.",intro:"음식 종류와 조리법, 양을 확인한 뒤 예상 칼로리와 영양 정보를 확인하세요.",alt:"칼로리 인식 음식 예시"},
 fr:{title:"Reconnaissez les aliments et estimez leurs calories.",intro:"Confirmez les aliments, leur préparation et les portions avant de consulter les valeurs nutritionnelles estimées.",alt:"Exemple de reconnaissance des calories"},
 de:{title:"Lebensmittel erkennen und Kalorien schätzen.",intro:"Lebensmittel, Zubereitung und Portionsgröße bestätigen und geschätzte Nährwerte ansehen.",alt:"Beispiel für Kalorienerkennung"},
 es:{title:"Reconoce los alimentos y estima sus calorías.",intro:"Confirma los alimentos, la preparación y las porciones antes de consultar los nutrientes estimados.",alt:"Ejemplo de reconocimiento de calorías"},
 pt:{title:"Reconheça alimentos e estime as calorias.",intro:"Confirme os alimentos, o preparo e as porções antes de consultar os nutrientes estimados.",alt:"Exemplo de reconhecimento de calorias"},
 ar:{title:"تعرّف على الطعام وقدّر السعرات والعناصر الغذائية.",intro:"أكّد نوع الطعام وطريقة تحضيره والكمية قبل عرض القيم الغذائية التقديرية.",alt:"مثال على التعرف على السعرات الحرارية"}
} as const;
export default function FoodCaloriePage(){const {lang}=useLingxiLang();const c=copy[lang];const promo=promotion[lang];return <main dir={lang==='ar'?'rtl':'ltr'} className="min-h-screen bg-[var(--lx-bg)] pt-16 text-[var(--lx-ink)] lg:ml-[260px] lg:pt-0"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"><Link href="/tools" className="text-sm text-[var(--lx-muted)]">← {c[3]}</Link><h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{c[0]}</h1><p className="mt-3 max-w-3xl leading-7 text-[var(--lx-muted)]">{c[1]}</p><p className="mt-2 text-xs leading-6 text-[var(--lx-muted)]">{c[2]}</p><ToolPromoStrip eyebrow="LINGXIFIELD · FOOD" title={promo.title} intro={promo.intro} images={FOOD_PROMO_IMAGES.map((image,i)=>({...image,alt:`${promo.alt} ${i+1}`}))}/><div className="mt-7 rounded-[28px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-6"><FoodCalorieWorkbench/></div></div></main>}
