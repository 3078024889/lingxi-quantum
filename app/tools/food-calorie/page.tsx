import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import FoodCalorieWorkbench from "@/components/tools/FoodCalorieWorkbench";

export const metadata:Metadata={
 title:"食物热量与营养成分计算｜灵犀场",
 description:"按食物和实际份量计算热量、蛋白质、碳水、脂肪、膳食纤维、糖、钠、矿物质与维生素等营养成分。",
 alternates:{canonical:"/tools/food-calorie"},
};

export default function Page(){
 return <AdvancedToolPage title="灵犀场 · 食物热量与营养" intro="输入这一餐吃了什么和实际份量，查看热量与完整营养成分。" note="结果用于日常饮食记录参考，不作为医疗或营养诊断。"><FoodCalorieWorkbench/></AdvancedToolPage>;
}
