import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import FoodCalorieWorkbench from '@/components/tools/FoodCalorieWorkbench';
export default function Page(){return <AdvancedToolPage title="拍照估算卡路里" intro="上传一餐照片，AI 会给出食物、份量、热量区间与蛋白质/碳水/脂肪估算。" note="照片无法提供实验室级精度；结果用于饮食记录与大致判断，不作为医疗建议。"><FoodCalorieWorkbench/></AdvancedToolPage>}
