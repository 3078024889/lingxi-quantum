import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import FoodCalorieWorkbench from "@/components/tools/FoodCalorieWorkbench";
export const metadata:Metadata={title:"卡路里识别｜灵犀场",description:"上传食物图片，识别食物并查看热量与营养成分。",alternates:{canonical:"/tools/food-calorie"}};
export default function Page(){return <AdvancedToolPage hidePriceHint title="灵犀场 · 卡路里识别" intro="上传一张食物图片，确认识别内容后查看热量与营养成分。" note="结果用于日常饮食记录参考，不作为医疗或营养诊断。"><FoodCalorieWorkbench/></AdvancedToolPage>}
