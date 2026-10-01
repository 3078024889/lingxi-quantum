import type {Metadata} from "next";
import FoodCaloriePage from "@/components/tools/FoodCaloriePage";
export const metadata:Metadata={title:"卡路里识别｜灵犀场",description:"上传食物图片，识别食物并查看热量与营养成分。",alternates:{canonical:"/tools/food-calorie"}};
export default function Page(){return <FoodCaloriePage/>}
