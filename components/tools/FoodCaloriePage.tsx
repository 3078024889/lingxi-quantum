"use client";
import Link from 'next/link';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import FoodCalorieWorkbench from './FoodCalorieWorkbench';
const copy={
 zh:['卡路里识别','看懂这一餐，轻松安排下一餐。拍照或输入食物，确认份量后查看营养与搭配建议。','用于日常饮食记录参考，不作为医疗或营养诊断。','全部工具'],
 en:['Food & calories','Understand this meal and plan the next. Add photos or foods, confirm portions, then explore nutrition and meal ideas.','For everyday food records, not medical or nutritional diagnosis.','All tools'],
 ja:['食事とカロリー','この食事を知り、次の食事を考える。写真や食品を追加し、量を確認すると栄養と献立のヒントが見られます。','日々の食事記録用です。医療・栄養診断ではありません。','すべてのツール'],
 ko:['음식과 칼로리','이번 식사를 이해하고 다음 식사를 준비하세요. 사진이나 음식을 추가하고 양을 확인하면 영양과 식사 제안을 볼 수 있습니다.','일상 식사 기록용이며 의료·영양 진단이 아닙니다.','모든 도구'],
 fr:['Aliments et calories','Comprenez ce repas et préparez le prochain. Ajoutez des photos ou des aliments, confirmez les portions et découvrez les apports et idées de repas.','Pour le suivi alimentaire quotidien, sans diagnostic médical ou nutritionnel.','Tous les outils'],
 de:['Essen und Kalorien','Diese Mahlzeit verstehen und die nächste planen. Fotos oder Lebensmittel hinzufügen, Portionen bestätigen und Nährwerte und Essensideen ansehen.','Für alltägliche Ernährungsaufzeichnungen, keine medizinische oder Ernährungsdiagnose.','Alle Werkzeuge'],
 es:['Alimentos y calorías','Conoce esta comida y prepara la siguiente. Añade fotos o alimentos, confirma las porciones y descubre nutrientes e ideas para comer.','Para el registro diario, no para diagnósticos médicos o nutricionales.','Todas las herramientas'],
 pt:['Alimentos e calorias','Entenda esta refeição e planeje a próxima. Adicione fotos ou alimentos, confirme as porções e veja nutrientes e ideias de refeições.','Para registros diários, não para diagnóstico médico ou nutricional.','Todas as ferramentas'],
 ar:['الطعام والسعرات','افهم وجبتك وخطط للتالية. أضف الصور أو الأطعمة وأكد الكميات ثم اطلع على العناصر الغذائية وأفكار الوجبات.','للتسجيل الغذائي اليومي وليس للتشخيص الطبي أو الغذائي.','كل الأدوات'],
};
export default function FoodCaloriePage(){const {lang}=useLingxiLang();const c=copy[lang];return <main dir={lang==='ar'?'rtl':'ltr'} className="min-h-screen bg-[var(--lx-bg)] pt-16 text-[var(--lx-ink)] lg:ml-[260px] lg:pt-0"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"><Link href="/tools" className="text-sm text-[var(--lx-muted)]">← {c[3]}</Link><h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{c[0]}</h1><p className="mt-3 max-w-3xl leading-7 text-[var(--lx-muted)]">{c[1]}</p><p className="mt-2 text-xs leading-6 text-[var(--lx-muted)]">{c[2]}</p><div className="mt-7 rounded-[28px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-6"><FoodCalorieWorkbench/></div></div></main>}
