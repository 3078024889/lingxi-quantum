import {languageAlternates} from "@/lib/seo/global-seo";
import type {Metadata} from "next";
import FoodCaloriePage from "@/components/tools/FoodCaloriePage";
const meta={
 zh:["卡路里识别","上传食物图片或输入食物，确认份量后查看估算热量与营养成分。"],
 en:["Calorie Recognition","Recognize food from a photo or search foods, confirm portions, and review estimated calories and nutrition."],
 ja:["カロリー認識","写真や食品検索から食べ物を確認し、量を確かめて推定カロリーと栄養を表示します。"],
 ko:["칼로리 인식","사진이나 음식 검색으로 음식을 확인하고 양을 선택한 뒤 예상 칼로리와 영양 정보를 살펴보세요."],
 fr:["Reconnaissance des calories","Reconnaissez les aliments, confirmez les portions et consultez les calories et nutriments estimés."],
 de:["Kalorienerkennung","Lebensmittel erkennen, Portionen bestätigen und geschätzte Kalorien und Nährwerte ansehen."],
 es:["Reconocimiento de calorías","Reconoce alimentos, confirma las porciones y consulta las calorías y nutrientes estimados."],
 pt:["Reconhecimento de calorias","Reconheça alimentos, confirme porções e consulte calorias e nutrientes estimados."],
 ar:["التعرف على السعرات الحرارية","تعرّف على الأطعمة وأكّد الكميات واطّلع على السعرات والعناصر الغذائية التقديرية."]
} as const;
type Locale=keyof typeof meta;
type Props={searchParams:Promise<{lang?:string|string[]}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const params=await searchParams;
 const lang=typeof params.lang==="string"&&Object.prototype.hasOwnProperty.call(meta,params.lang)?params.lang as Locale:"zh";
 const [title,description]=meta[lang];
 return {title:`${title}｜LINGXIFIELD`,description,alternates:{canonical:"/tools/food-calorie",languages:languageAlternates("/tools/food-calorie")}};
}
export default function Page(){return <FoodCaloriePage/>}
