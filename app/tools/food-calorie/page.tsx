import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import FoodCalorieWorkbench from "@/components/tools/FoodCalorieWorkbench";

export const metadata:Metadata={
 title:"食物热量计算｜灵犀场",
 description:"输入这一餐的食物和份量，快速计算热量、蛋白质、碳水和脂肪。",
 alternates:{canonical:"/tools/food-calorie"},
};

export default function Page(){
 return <AdvancedToolPage title="灵犀场 · 食物热量" intro="输入这一餐的食物和份量，快速计算热量与主要营养成分。" note="结果用于日常饮食记录参考，不作为医疗或营养诊断。"><FoodCalorieWorkbench/></AdvancedToolPage>;
}
