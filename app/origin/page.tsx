import { redirect } from "next/navigation";

// 创造源内容已并入首页 #origin 板块，此页仅作旧链接跳转兜底。
export default function OriginPage() {
  redirect("/#origin");
}
