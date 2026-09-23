import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import FoodCalorieWorkbench from "@/components/tools/FoodCalorieWorkbench";

export default function Page() {
  return (
    <AdvancedToolPage
      title="灵犀场 · 图片卡路里"
      intro="上传一张或多张食物图片，AI 会逐张识别食物、估算份量、热量区间与蛋白质 / 碳水 / 脂肪，并自动汇总本次总热量。"
      note="支持一次批量上传最多 10 张。视觉估算用于日常饮食记录参考，不作为医疗或实验室营养诊断。"
    >
      <FoodCalorieWorkbench />
    </AdvancedToolPage>
  );
}
